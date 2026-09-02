const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/cart
// @desc    Get current user's database cart
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const query = `
      SELECT ci.id, ci.product_id, ci.variant_id, ci.quantity,
             p.name, p.slug, p.images,
             pv.weight_or_volume, pv.price, pv.stock, pv.sku
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      JOIN product_variants pv ON ci.variant_id = pv.id
      WHERE ci.user_id = $1 AND p.active = true AND pv.active = true
      ORDER BY ci.created_at DESC
    `;

    const result = await db.query(query, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch cart error:', err.message);
    res.status(500).json({ message: 'Server error retrieving cart' });
  }
});

// @route   POST /api/cart/updateCart
// @desc    Sync local cart with database (overwrites/merges)
// @access  Private
router.post('/updateCart', authMiddleware, async (req, res) => {
  const { cartItems } = req.body; // Expecting array of { product_id, variant_id, quantity }

  if (!Array.isArray(cartItems)) {
    return res.status(400).json({ message: 'cartItems must be an array' });
  }

  const client = await db.pool.connect();

  try {
    // Start transactional sync for safety
    await client.query('BEGIN');

    // 1. Clear existing cart items
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);

    // 2. Insert new cart items (checking stocks)
    for (const item of cartItems) {
      const { product_id, variant_id, quantity } = item;

      // Verify variant active & stock
      const variantCheck = await client.query(
        'SELECT stock, active FROM product_variants WHERE id = $1 AND product_id = $2',
        [variant_id, product_id]
      );

      if (variantCheck.rows.length === 0 || !variantCheck.rows[0].active) {
        continue; // Skip invalid or inactive variants
      }

      const availableStock = variantCheck.rows[0].stock;
      // Cap quantity at available stock
      const finalQty = Math.min(quantity, availableStock);

      if (finalQty > 0) {
        await client.query(
          'INSERT INTO cart_items (user_id, product_id, variant_id, quantity) VALUES ($1, $2, $3, $4)',
          [req.user.id, product_id, variant_id, finalQty]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ success: true, message: 'Cart synced successfully' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Sync cart error:', err.message);
    res.status(500).json({ message: 'Server error syncing cart' });
  } finally {
    client.release();
  }
});

module.exports = router;
