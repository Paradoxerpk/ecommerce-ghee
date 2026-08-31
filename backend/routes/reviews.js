const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const adminAuth = require('../middleware/admin');

const { optionalAuth } = require('../middleware/auth');

// @route   POST /api/reviews/product/:productId
// @desc    Submit a review for a product (Supports Authenticated & Guest Users)
// @access  Public
router.post('/product/:productId', optionalAuth, async (req, res) => {
  const { productId } = req.params;
  const { rating, comment, reviewer_name } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5 stars' });
  }

  try {
    let userId = req.user ? req.user.id : null;
    
    // If guest and no user_id, pick default admin user as placeholder if foreign key demands it
    if (!userId) {
      const uRes = await db.query('SELECT id FROM users LIMIT 1');
      if (uRes.rows.length > 0) {
        userId = uRes.rows[0].id;
      }
    }

    const result = await db.query(
      `INSERT INTO reviews (product_id, user_id, rating, comment, status)
       VALUES ($1, $2, $3, $4, 'approved')
       RETURNING *`,
      [productId, userId, parseInt(rating, 10), comment || 'Great product!']
    );

    const newReview = result.rows[0];
    newReview.user_name = req.user ? req.user.name : (reviewer_name || 'Verified Customer');

    res.status(201).json(newReview);
  } catch (err) {
    console.error('Submit review error:', err.message);
    res.status(500).json({ message: `Failed to submit review: ${err.message}` });
  }
});

// @route   GET /api/reviews/admin/all
// @desc    Get all reviews for admin moderation
// @access  Private (Admin/Staff)
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const query = `
      SELECT r.id, r.rating, r.comment, r.status, r.created_at,
             p.name AS product_name, p.slug AS product_slug,
             COALESCE(u.name, 'Customer') AS user_name,
             COALESCE(u.email, 'guest@saikrishnaghee.com') AS user_email
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch admin reviews error:', err.message);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});

// @route   PUT /api/reviews/admin/:id/status
// @desc    Update review status (approved / hidden / pending)
// @access  Private (Admin/Staff)
router.put('/admin/:id/status', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['approved', 'pending', 'hidden'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const result = await db.query(
      `UPDATE reviews SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update review status error:', err.message);
    res.status(500).json({ message: 'Failed to update review status' });
  }
});

// @route   DELETE /api/reviews/admin/:id
// @desc    Delete a review
// @access  Private (Admin/Staff)
router.delete('/admin/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM reviews WHERE id = $1', [id]);
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Delete review error:', err.message);
    res.status(500).json({ message: 'Failed to delete review' });
  }
});

module.exports = router;
