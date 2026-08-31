const express = require('express');
const router = express.Router();
const db = require('../db');

// @route   GET /api/products/categories
// @desc    Get all active categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, slug, description FROM categories WHERE active = true ORDER BY name'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch categories error:', err.message);
    res.status(500).json({ message: 'Server error retrieving categories' });
  }
});

// @route   GET /api/products
// @desc    Get products with filters, search, and variants
// @access  Public
router.get('/', async (req, res) => {
  const { search, category, weight, min_price, max_price } = req.query;

  try {
    let queryText = `
      SELECT p.id, p.name, p.slug, p.description, p.images, p.active, 
             c.name AS category_name, c.slug AS category_slug,
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', pv.id,
                   'weight_or_volume', pv.weight_or_volume,
                   'price', pv.price,
                   'stock', pv.stock,
                   'sku', pv.sku,
                   'active', pv.active
                 ) ORDER BY pv.price ASC
               ) FILTER (WHERE pv.id IS NOT NULL), 
               '[]'
             ) AS variants
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_variants pv ON p.id = pv.product_id AND pv.active = true
      WHERE p.active = true
    `;

    const queryParams = [];
    let paramCounter = 1;

    // Apply category filter
    if (category) {
      queryText += ` AND c.slug = $${paramCounter}`;
      queryParams.push(category);
      paramCounter++;
    }

    // Apply search filter (name or description)
    if (search) {
      queryText += ` AND (p.name ILIKE $${paramCounter} OR p.description ILIKE $${paramCounter})`;
      queryParams.push(`%${search}%`);
      paramCounter++;
    }

    // Close the grouping so that aggregate operations work
    queryText += ` GROUP BY p.id, c.name, c.slug`;

    // Apply aggregate/having filters for weight or price range if specified
    const havingConditions = [];
    if (weight) {
      havingConditions.push(`bool_or(pv.weight_or_volume = $${paramCounter})`);
      queryParams.push(weight);
      paramCounter++;
    }

    if (min_price) {
      havingConditions.push(`min(pv.price) >= $${paramCounter}`);
      queryParams.push(parseFloat(min_price));
      paramCounter++;
    }

    if (max_price) {
      havingConditions.push(`min(pv.price) <= $${paramCounter}`);
      queryParams.push(parseFloat(max_price));
      paramCounter++;
    }

    if (havingConditions.length > 0) {
      queryText += ` HAVING ` + havingConditions.join(' AND ');
    }

    queryText += ` ORDER BY p.name`;

    const result = await db.query(queryText, queryParams);
    res.json(result.rows);

  } catch (err) {
    console.error('Fetch products error:', err.message);
    res.status(500).json({ message: 'Server error retrieving products' });
  }
});

// @route   GET /api/products/:slug
// @desc    Get detailed product by slug (includes reviews in phase 3)
// @access  Public
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;

  try {
    const productQuery = `
      SELECT p.id, p.name, p.slug, p.description, p.images, p.active, 
             c.name AS category_name, c.slug AS category_slug,
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', pv.id,
                   'weight_or_volume', pv.weight_or_volume,
                   'price', pv.price,
                   'stock', pv.stock,
                   'sku', pv.sku,
                   'active', pv.active
                 ) ORDER BY pv.price ASC
               ) FILTER (WHERE pv.id IS NOT NULL), 
               '[]'
             ) AS variants
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_variants pv ON p.id = pv.product_id AND pv.active = true
      WHERE p.slug = $1 AND p.active = true
      GROUP BY p.id, c.name, c.slug
    `;

    const productResult = await db.query(productQuery, [slug]);

    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = productResult.rows[0];

    // Fetch product reviews (if any exist)
    const reviewsQuery = `
      SELECT r.id, r.rating, r.comment, r.created_at, u.name as user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = $1 AND r.status = 'approved'
      ORDER BY r.created_at DESC
    `;
    const reviewsResult = await db.query(reviewsQuery, [product.id]);
    product.reviews = reviewsResult.rows;

    res.json(product);

  } catch (err) {
    console.error('Fetch product by slug error:', err.message);
    res.status(500).json({ message: 'Server error retrieving product details' });
  }
});

module.exports = router;
