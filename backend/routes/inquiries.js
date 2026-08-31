const express = require('express');
const router = express.Router();
const db = require('../db');

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

module.exports = router;
