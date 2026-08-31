const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function seedReviews() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL missing');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('supabase.co') || connectionString.includes('railway') 
      ? { rejectUnauthorized: false } 
      : false
  });

  try {
    // Fetch products
    const prods = await pool.query('SELECT id, name, slug FROM products');
    if (prods.rows.length === 0) {
      console.log('No products found to attach reviews.');
      return;
    }

    // Get Admin user ID for linking sample reviews
    const userRes = await pool.query("SELECT id FROM users LIMIT 1");
    const userId = userRes.rows.length > 0 ? userRes.rows[0].id : null;

    const sampleReviews = [
      {
        slug: 'sai-krishna-pure-cow-ghee',
        reviews: [
          { rating: 5, comment: 'Authentic divine aroma! The granular texture is top notch and reminds me of homemade ghee.', status: 'approved' },
          { rating: 5, comment: 'We use this daily for cooking and for hot rotis. Excellent quality and packaging.', status: 'approved' },
          { rating: 4, comment: 'Pure golden color and rich taste. Fast delivery to Hyderabad.', status: 'approved' }
        ]
      },
      {
        slug: 'sai-krishna-premium-buffalo-ghee',
        reviews: [
          { rating: 5, comment: 'Rich white granular texture, ideal for making traditional sweet delicacies like Halwa and Mysurpa!', status: 'approved' },
          { rating: 5, comment: 'Superb aroma and high smoke point for deep frying.', status: 'approved' }
        ]
      },
      {
        slug: 'sai-krishna-vedic-a2-cow-ghee',
        reviews: [
          { rating: 5, comment: 'Pure Bilona method A2 Cow Ghee! Great for health, digestion, and Ayurvedic remedies.', status: 'approved' },
          { rating: 5, comment: 'Unmatched quality! Worth every rupee for genuine A2 Bilona ghee.', status: 'approved' },
          { rating: 5, comment: 'Loved the glass jar packaging and aromatic flavor.', status: 'approved' }
        ]
      }
    ];

    for (const item of sampleReviews) {
      const prodMatch = prods.rows.find(p => p.slug === item.slug);
      if (prodMatch) {
        for (const rev of item.reviews) {
          // Check if review comment already exists
          const existing = await pool.query(
            'SELECT id FROM reviews WHERE product_id = $1 AND comment = $2',
            [prodMatch.id, rev.comment]
          );

          if (existing.rows.length === 0) {
            await pool.query(
              `INSERT INTO reviews (product_id, user_id, rating, comment, status)
               VALUES ($1, $2, $3, $4, $5)`,
              [prodMatch.id, userId, rev.rating, rev.comment, rev.status]
            );
            console.log(`✅ Seeded review for product: ${prodMatch.name}`);
          }
        }
      }
    }

    console.log('🎉 Reviews seeding completed successfully!');
  } catch (err) {
    console.error('Error seeding reviews:', err.message);
  } finally {
    await pool.end();
  }
}

seedReviews();
