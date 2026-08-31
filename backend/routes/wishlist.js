const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth: authMiddleware } = require('../middleware/auth');

// @route   GET /api/wishlist
// @desc    Get current logged in user's database wishlist
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const query = `
      SELECT w.id AS wishlist_id, w.product_id, w.created_at,
             p.name, p.slug, p.description, p.images, p.category_id,
             c.name AS category_name,
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', pv.id,
                   'weight_or_volume', pv.weight_or_volume,
                   'price', pv.price,
                   'stock', pv.stock,
                   'sku', pv.sku
                 ) ORDER BY pv.price ASC
               ) FILTER (WHERE pv.id IS NOT NULL),
               '[]'
             ) AS variants
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_variants pv ON p.id = pv.product_id AND pv.active = true
      WHERE w.user_id = $1 AND p.active = true
      GROUP BY w.id, w.product_id, w.created_at, p.id, c.name
      ORDER BY w.created_at DESC
    `;

    const result = await db.query(query, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch wishlist error:', err.message);
    res.status(500).json({ message: 'Server error retrieving wishlist' });
  }
});

// @route   POST /api/wishlist/toggle
// @desc    Add or remove a product from database wishlist
// @access  Private
router.post('/toggle', authMiddleware, async (req, res) => {
  const { product_id } = req.body;

  if (!product_id) {
    return res.status(400).json({ message: 'product_id is required' });
  }

  try {
    const checkQuery = 'SELECT id FROM wishlist WHERE user_id = $1 AND product_id = $2';
    const checkResult = await db.query(checkQuery, [req.user.id, product_id]);

    if (checkResult.rows.length > 0) {
      // Remove from wishlist
      await db.query('DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2', [req.user.id, product_id]);
      return res.json({ inWishlist: false, message: 'Removed from wishlist' });
    } else {
      // Add to wishlist
      await db.query('INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2)', [req.user.id, product_id]);
      return res.json({ inWishlist: true, message: 'Added to wishlist' });
    }
  } catch (err) {
    console.error('Toggle wishlist error:', err.message);
    res.status(500).json({ message: 'Server error updating wishlist' });
  }
});

// @route   POST /api/wishlist/sync
// @desc    Merge guest local wishlist items into user DB wishlist on login
// @access  Private
router.post('/sync', authMiddleware, async (req, res) => {
  const { productIds } = req.body; // Expecting array of product IDs

  if (!Array.isArray(productIds) || productIds.length === 0) {
    return res.json({ success: true, message: 'No items to sync' });
  }

  try {
    for (const pid of productIds) {
      await db.query(
        'INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2) ON CONFLICT (user_id, product_id) DO NOTHING',
        [req.user.id, pid]
      );
    }
    res.json({ success: true, message: 'Wishlist synced successfully' });
  } catch (err) {
    console.error('Sync wishlist error:', err.message);
    res.status(500).json({ message: 'Server error syncing wishlist' });
  }
});

module.exports = router;
