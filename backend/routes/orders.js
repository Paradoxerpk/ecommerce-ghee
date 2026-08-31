const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth: authMiddleware, optionalAuth } = require('../middleware/auth');

// @route   POST /api/orders/create
// @desc    Create a new order (pending payment)
// @access  Public (supports Guest Checkout)
router.post('/create', optionalAuth, async (req, res) => {
  const {
    items, // Array of { product_id, variant_id, quantity }
    shipping_address,
    contact_number,
    delivery_preference,
    payment_method, // 'upi' or 'cod'
    // Guest details if not logged in
    guest_name,
    guest_email,
    guest_phone
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'No items in the order' });
  }
  if (!shipping_address || !contact_number) {
    return res.status(400).json({ message: 'Shipping address and contact number are required' });
  }

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    let totalAmount = 0;
    const validatedItems = [];

    // 1. Validate items and calculate total cost
    for (const item of items) {
      const { product_id, variant_id, quantity } = item;

      if (!product_id || !variant_id || !quantity || quantity <= 0) {
        throw new Error('Invalid item fields in request');
      }

      // Check product and variant exist, active, and have stock
      const variantRes = await client.query(
        `SELECT pv.price, pv.stock, pv.active, p.name 
         FROM product_variants pv
         JOIN products p ON pv.product_id = p.id
         WHERE pv.id = $1 AND pv.product_id = $2 AND pv.active = true AND p.active = true`,
        [variant_id, product_id]
      );

      if (variantRes.rows.length === 0) {
        throw new Error(`Product or Variant not found or inactive`);
      }

      const variantInfo = variantRes.rows[0];
      if (variantInfo.stock < quantity) {
        throw new Error(`Insufficient stock for "${variantInfo.name}". Only ${variantInfo.stock} units remaining.`);
      }

      const itemCost = parseFloat(variantInfo.price) * quantity;
      totalAmount += itemCost;

      validatedItems.push({
        product_id,
        variant_id,
        quantity,
        price_per_unit: variantInfo.price
      });
    }

    // 2. Insert order
    const userId = req.user ? req.user.id : null;
    const gName = userId ? null : (guest_name || 'Guest Customer');
    const gEmail = userId ? null : (guest_email || 'guest@saikrishnaghee.com');
    const gPhone = userId ? null : (guest_phone || contact_number);

    const initialStatus = payment_method === 'cod' ? 'processing' : 'pending';
    const initialPaymentStatus = payment_method === 'cod' ? 'pending' : 'pending';

    const orderQuery = `
      INSERT INTO orders (
        user_id, guest_name, guest_email, guest_phone,
        status, total_amount, shipping_address, contact_number,
        delivery_preference, payment_method, payment_status, payment_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, status, total_amount, payment_method, payment_status, created_at
    `;

    // Generate a mock payment ID for sandbox transaction representation
    const mockPaymentId = payment_method === 'upi' 
      ? `pay_mock_${Math.random().toString(36).substring(2, 15)}`
      : null;

    const orderRes = await client.query(orderQuery, [
      userId, gName, gEmail, gPhone,
      initialStatus, totalAmount, shipping_address, contact_number,
      delivery_preference || null, payment_method, initialPaymentStatus, mockPaymentId
    ]);

    const newOrder = orderRes.rows[0];

    // 3. Insert order items
    for (const item of validatedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, variant_id, quantity, price_per_unit)
         VALUES ($1, $2, $3, $4, $5)`,
        [newOrder.id, item.product_id, item.variant_id, item.quantity, item.price_per_unit]
      );
    }

    // If COD, deduct stock immediately since payment is deferred
    if (payment_method === 'cod') {
      for (const item of validatedItems) {
        await client.query(
          `UPDATE product_variants 
           SET stock = stock - $1 
           WHERE id = $2`,
          [item.quantity, item.variant_id]
        );
      }
    }

    await client.query('COMMIT');

    // Return the response
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: newOrder.id,
        status: newOrder.status,
        total_amount: newOrder.total_amount,
        payment_method: newOrder.payment_method,
        payment_status: newOrder.payment_status,
        payment_id: mockPaymentId, // Client will send this back in /verify
        created_at: newOrder.created_at
      }
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Order creation error:', err.message);
    res.status(400).json({ message: err.message || 'Error processing your checkout' });
  } finally {
    client.release();
  }
});

// @route   POST /api/orders/verify
// @desc    Verify UPI/Razorpay mock payment & update stock
// @access  Public (secure signature validation mock)
router.post('/verify', async (req, res) => {
  const { order_id, payment_id, status } = req.body; // status is 'success' or 'failed'

  if (!order_id || !payment_id) {
    return res.status(400).json({ message: 'Order ID and Payment ID are required' });
  }

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Fetch order details, lock for update
    const orderRes = await client.query(
      'SELECT id, status, total_amount, payment_status, payment_method FROM orders WHERE id = $1 FOR UPDATE',
      [order_id]
    );

    if (orderRes.rows.length === 0) {
      throw new Error('Order not found');
    }

    const order = orderRes.rows[0];

    if (order.payment_status === 'completed' || order.status === 'paid') {
      // Already processed successfully
      await client.query('COMMIT');
      return res.json({ success: true, message: 'Payment already verified previously' });
    }

    if (status === 'failed') {
      await client.query(
        `UPDATE orders SET payment_status = 'failed', status = 'cancelled' WHERE id = $1`,
        [order_id]
      );
      await client.query('COMMIT');
      return res.json({ success: false, message: 'Payment reported as failed' });
    }

    // 2. Fetch order items
    const itemsRes = await client.query(
      'SELECT variant_id, quantity FROM order_items WHERE order_id = $1',
      [order_id]
    );

    const items = itemsRes.rows;

    // 3. Lock product variants to check and update stock levels (preventing race conditions)
    for (const item of items) {
      const variantRes = await client.query(
        'SELECT stock, sku FROM product_variants WHERE id = $1 FOR UPDATE',
        [item.variant_id]
      );

      if (variantRes.rows.length === 0) {
        throw new Error(`Product variant sku details no longer available`);
      }

      const variant = variantRes.rows[0];
      if (variant.stock < item.quantity) {
        throw new Error(`Stock exhausted during transaction for item SKU: ${variant.sku}. Order failed.`);
      }

      // Deduct Stock
      await client.query(
        'UPDATE product_variants SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.variant_id]
      );
    }

    // 4. Update order details
    await client.query(
      `UPDATE orders 
       SET payment_status = 'completed', status = 'paid', payment_id = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [payment_id, order_id]
    );

    await client.query('COMMIT');
    res.json({ success: true, message: 'Payment verified and stock updated successfully' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Payment verification failed:', err.message);
    res.status(400).json({ message: err.message || 'Payment verification failed' });
  } finally {
    client.release();
  }
});

// @route   GET /api/orders/history
// @desc    Get order history for logged-in user
// @access  Private
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const query = `
      SELECT o.id, o.status, o.total_amount, o.payment_method, o.payment_status, o.created_at,
             json_agg(
               json_build_object(
                 'name', p.name,
                 'weight_or_volume', pv.weight_or_volume,
                 'quantity', oi.quantity,
                 'price_per_unit', oi.price_per_unit
               )
             ) AS items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN product_variants pv ON oi.variant_id = pv.id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;

    const result = await db.query(query, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch order history error:', err.message);
    res.status(500).json({ message: 'Server error retrieving order history' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order details by order ID (UUID ensures safe public tracking for checkout confirmations)
// @access  Public
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const orderQuery = `
      SELECT o.id, o.guest_name, o.guest_email, o.guest_phone, o.status, o.total_amount,
             o.shipping_address, o.contact_number, o.delivery_preference, o.payment_method,
             o.payment_status, o.payment_id, o.created_at, o.user_id,
             u.name as registered_name, u.email as registered_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = $1
    `;

    const orderRes = await db.query(orderQuery, [id]);

    if (orderRes.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orderRes.rows[0];

    // Fetch items
    const itemsQuery = `
      SELECT oi.id, oi.quantity, oi.price_per_unit, p.name, p.slug, p.images, pv.weight_or_volume
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN product_variants pv ON oi.variant_id = pv.id
      WHERE oi.order_id = $1
    `;
    const itemsRes = await db.query(itemsQuery, [id]);
    order.items = itemsRes.rows;

    res.json(order);

  } catch (err) {
    console.error('Fetch order details error:', err.message);
    res.status(500).json({ message: 'Server error retrieving order details' });
  }
});

// Admin routes (included in orders for modularity)

// @route   GET /api/orders/admin/queue
// @desc    Get all orders for admin view (Live queue)
// @access  Private (role CHECK admin/staff)
router.get('/admin/queue', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    return res.status(403).json({ message: 'Forbidden. Admin access required' });
  }

  const { status } = req.query;

  try {
    let query = `
      SELECT o.id, o.guest_name, o.guest_email, o.guest_phone, o.status, o.total_amount,
             o.shipping_address, o.contact_number, o.payment_method, o.payment_status, o.created_at,
             u.name as registered_name, u.email as registered_email,
             json_agg(
               json_build_object(
                 'name', p.name,
                 'weight_or_volume', pv.weight_or_volume,
                 'quantity', oi.quantity,
                 'price_per_unit', oi.price_per_unit
               )
             ) AS items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN product_variants pv ON oi.variant_id = pv.id
    `;

    const queryParams = [];
    if (status && status !== 'all') {
      query += ` WHERE o.status = $1`;
      queryParams.push(status);
    }

    query += ` GROUP BY o.id, u.name, u.email ORDER BY o.created_at DESC`;

    const result = await db.query(query, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch admin orders error:', err.message);
    res.status(500).json({ message: 'Server error retrieving admin orders queue' });
  }
});

// @route   PUT /api/orders/admin/:id/status
// @desc    Update order status manually by admin
// @access  Private (role CHECK admin/staff)
router.put('/admin/:id/status', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    return res.status(403).json({ message: 'Forbidden. Admin access required' });
  }

  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'paid', 'processing', 'dispatched', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status update code' });
  }

  try {
    const result = await db.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, status, updated_at',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ success: true, order: result.rows[0] });
  } catch (err) {
    console.error('Update order status error:', err.message);
    res.status(500).json({ message: 'Server error updating order status' });
  }
});

module.exports = router;
