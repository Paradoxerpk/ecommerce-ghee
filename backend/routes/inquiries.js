const express = require('express');
const router = express.Router();
const db = require('../db');
const adminAuth = require('../middleware/admin');

// @route   POST /api/inquiries
// @desc    Submit a new contact/inquiry form entry
// @access  Public
router.post('/', async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Please enter all required fields (name, email, message)' });
  }

  try {
    const query = `
      INSERT INTO inquiries (name, email, phone, message)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, phone, message, status, created_at
    `;

    const result = await db.query(query, [
      name.trim(),
      email.toLowerCase().trim(),
      phone ? phone.trim() : null,
      message.trim()
    ]);

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully. We will get back to you shortly!',
      inquiry: result.rows[0]
    });

  } catch (err) {
    console.error('Inquiry submission error:', err.message);
    res.status(500).json({ message: 'Server error saving inquiry details' });
  }
});

// @route   GET /api/inquiries/admin/all
// @desc    Fetch all inquiries for admin dashboard
// @access  Private (Admin/Staff)
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM inquiries ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch inquiries error:', err.message);
    res.status(500).json({ message: 'Failed to fetch customer inquiries' });
  }
});

// @route   PUT /api/inquiries/admin/:id/status
// @desc    Update inquiry status (unread / read)
// @access  Private (Admin/Staff)
router.put('/admin/:id/status', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await db.query(
      'UPDATE inquiries SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status' });
  }
});

module.exports = router;
