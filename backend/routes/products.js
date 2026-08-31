const express = require('express');
const router = express.Router();
const db = require('../db');
const adminAuth = require('../middleware/admin');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Setup upload directories
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const frontendUploadDir = path.join(__dirname, '../../frontend/public/uploads');
if (!fs.existsSync(frontendUploadDir)) {
  fs.mkdirSync(frontendUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const filename = `product-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Helper to generate URL-safe slugs
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// @route   POST /api/products/upload
// @desc    Upload product image file
// @access  Private (Admin/Staff)
router.post('/upload', adminAuth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file uploaded' });
  }

  const filename = req.file.filename;

  try {
    const srcPath = path.join(uploadDir, filename);
    const destPath = path.join(frontendUploadDir, filename);
    fs.copyFileSync(srcPath, destPath);
  } catch (err) {
    console.warn('Could not copy file to frontend/public/uploads:', err.message);
  }

  const imageUrl = `/uploads/${filename}`;
  res.json({ imageUrl });
});

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

// @route   GET /api/products/admin/all
// @desc    Get all products (including inactive ones) with all variants for Admin management
// @access  Private (Admin/Staff)
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const queryText = `
      SELECT p.id, p.category_id, p.name, p.slug, p.description, p.images, p.active, p.created_at,
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
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      GROUP BY p.id, c.name, c.slug
      ORDER BY p.created_at DESC
    `;
    const result = await db.query(queryText);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch admin products error:', err.message);
    res.status(500).json({ message: 'Server error retrieving admin product list' });
  }
});

// @route   POST /api/products/admin
// @desc    Create a new product with initial variants
// @access  Private (Admin/Staff)
router.post('/admin', adminAuth, async (req, res) => {
  const { name, category_id, description, images, active, variants } = req.body;

  if (!name || !description) {
    return res.status(400).json({ message: 'Product name and description are required' });
  }

  let baseSlug = slugify(name);
  let slug = baseSlug;

  try {
    // Ensure slug uniqueness
    const slugCheck = await db.query('SELECT id FROM products WHERE slug = $1', [slug]);
    if (slugCheck.rows.length > 0) {
      slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    }

    const imagesArray = Array.isArray(images) && images.length > 0 
      ? images 
      : ['/images/cow_ghee_front.webp'];

    const productRes = await db.query(
      `INSERT INTO products (category_id, name, slug, description, images, active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [category_id || 1, name, slug, description, imagesArray, active !== undefined ? active : true]
    );

    const newProduct = productRes.rows[0];

    // Insert variants if provided
    let createdVariants = [];
    if (Array.isArray(variants) && variants.length > 0) {
      for (const v of variants) {
        const variantSku = v.sku || `SKG-${newProduct.id}-${slugify(v.weight_or_volume || 'DEFAULT')}-${Date.now().toString().slice(-3)}`;
        const vRes = await db.query(
          `INSERT INTO product_variants (product_id, weight_or_volume, price, stock, sku, active)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [
            newProduct.id,
            v.weight_or_volume || '500g Jar',
            parseFloat(v.price) || 0.00,
            parseInt(v.stock) || 0,
            variantSku,
            v.active !== undefined ? v.active : true
          ]
        );
        createdVariants.push(vRes.rows[0]);
      }
    } else {
      // Create a default variant if none provided
      const defaultSku = `SKG-PROD-${newProduct.id}-500G`;
      const vRes = await db.query(
        `INSERT INTO product_variants (product_id, weight_or_volume, price, stock, sku, active)
         VALUES ($1, $2, $3, $4, $5, true)
         RETURNING *`,
        [newProduct.id, '500g Jar', 350.00, 50, defaultSku]
      );
      createdVariants.push(vRes.rows[0]);
    }

    newProduct.variants = createdVariants;
    res.status(201).json(newProduct);

  } catch (err) {
    console.error('Create product error:', err.message);
    res.status(500).json({ message: `Failed to create product: ${err.message}` });
  }
});

// @route   PUT /api/products/admin/:id
// @desc    Update product details and manage variants
// @access  Private (Admin/Staff)
router.put('/admin/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { name, category_id, description, images, active, variants } = req.body;

  try {
    const existing = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let slug = existing.rows[0].slug;
    if (name && name !== existing.rows[0].name) {
      const baseSlug = slugify(name);
      const slugCheck = await db.query('SELECT id FROM products WHERE slug = $1 AND id != $2', [baseSlug, id]);
      slug = slugCheck.rows.length > 0 ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;
    }

    const updatedImages = Array.isArray(images) ? images : existing.rows[0].images;

    const updateRes = await db.query(
      `UPDATE products 
       SET name = COALESCE($1, name),
           category_id = COALESCE($2, category_id),
           slug = $3,
           description = COALESCE($4, description),
           images = $5,
           active = COALESCE($6, active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [name, category_id, slug, description, updatedImages, active, id]
    );

    const updatedProduct = updateRes.rows[0];

    // Manage variants if supplied
    if (Array.isArray(variants)) {
      for (const v of variants) {
        if (v.id) {
          // Update existing variant
          await db.query(
            `UPDATE product_variants
             SET weight_or_volume = COALESCE($1, weight_or_volume),
                 price = COALESCE($2, price),
                 stock = COALESCE($3, stock),
                 sku = COALESCE($4, sku),
                 active = COALESCE($5, active)
             WHERE id = $6 AND product_id = $7`,
            [v.weight_or_volume, v.price, v.stock, v.sku, v.active, v.id, id]
          );
        } else {
          // Insert new variant
          const sku = v.sku || `SKG-${id}-${slugify(v.weight_or_volume)}-${Date.now().toString().slice(-3)}`;
          await db.query(
            `INSERT INTO product_variants (product_id, weight_or_volume, price, stock, sku, active)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [id, v.weight_or_volume || '500g Jar', v.price || 0, v.stock || 0, sku, v.active !== undefined ? v.active : true]
          );
        }
      }
    }

    // Fetch full updated product with all variants
    const fullRes = await db.query(
      `SELECT p.*, COALESCE(json_agg(pv.*) FILTER (WHERE pv.id IS NOT NULL), '[]') AS variants
       FROM products p
       LEFT JOIN product_variants pv ON p.id = pv.product_id
       WHERE p.id = $1
       GROUP BY p.id`,
      [id]
    );

    res.json(fullRes.rows[0]);

  } catch (err) {
    console.error('Update product error:', err.message);
    res.status(500).json({ message: `Failed to update product: ${err.message}` });
  }
});

// @route   DELETE /api/products/admin/:id
// @desc    Delete a product (or soft-delete if foreign keys exist)
// @access  Private (Admin/Staff)
router.delete('/admin/:id', adminAuth, async (req, res) => {
  const { id } = req.params;

  try {
    // Attempt hard deletion
    await db.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    // If foreign key constraint error (e.g. references in order_items)
    if (err.code === '23503') {
      await db.query('UPDATE products SET active = false WHERE id = $1', [id]);
      await db.query('UPDATE product_variants SET active = false WHERE product_id = $1', [id]);
      return res.json({ message: 'Product is linked to historic customer orders. Soft-deleted (Deactivated) successfully.' });
    }
    console.error('Delete product error:', err.message);
    res.status(500).json({ message: `Failed to delete product: ${err.message}` });
  }
});

// @route   PUT /api/products/admin/variants/:variantId
// @desc    Quick update single variant price/stock
// @access  Private (Admin/Staff)
router.put('/admin/variants/:variantId', adminAuth, async (req, res) => {
  const { variantId } = req.params;
  const { price, stock, active } = req.body;

  try {
    const result = await db.query(
      `UPDATE product_variants
       SET price = COALESCE($1, price),
           stock = COALESCE($2, stock),
           active = COALESCE($3, active)
       WHERE id = $4
       RETURNING *`,
      [price, stock, active, variantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Variant not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update variant error:', err.message);
    res.status(500).json({ message: 'Server error updating variant' });
  }
});

// @route   DELETE /api/products/admin/variants/:variantId
// @desc    Delete a variant
// @access  Private (Admin/Staff)
router.delete('/admin/variants/:variantId', adminAuth, async (req, res) => {
  const { variantId } = req.params;
  try {
    await db.query('DELETE FROM product_variants WHERE id = $1', [variantId]);
    res.json({ message: 'Variant deleted successfully' });
  } catch (err) {
    if (err.code === '23503') {
      await db.query('UPDATE product_variants SET active = false WHERE id = $1', [variantId]);
      return res.json({ message: 'Variant has order references; soft-deactivated instead.' });
    }
    res.status(500).json({ message: 'Error deleting variant' });
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

    if (category) {
      queryText += ` AND c.slug = $${paramCounter}`;
      queryParams.push(category);
      paramCounter++;
    }

    if (search) {
      queryText += ` AND (p.name ILIKE $${paramCounter} OR p.description ILIKE $${paramCounter})`;
      queryParams.push(`%${search}%`);
      paramCounter++;
    }

    queryText += ` GROUP BY p.id, c.name, c.slug`;

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
// @desc    Get detailed product by slug (includes approved reviews)
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

    // Fetch product reviews (approved)
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
