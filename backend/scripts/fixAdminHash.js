const db = require('../db');

async function fixHash() {
  console.log('🔄 Updating admin password hash in Supabase...');
  
  const correctHash = '$2a$10$cKe.OKwajTeH8wo.uF9K/uCj94k3jJOqbRZJOvie5qI1Kf9CNcJke';
  const email = 'admin@saikrishnaghee.com';

  try {
    const res = await db.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, name, email',
      [correctHash, email]
    );

    if (res.rows.length === 0) {
      console.log('⚠️ Warning: Admin user was not found. Let us try inserting the admin user...');
      // Insert if not exists
      await db.query(
        "INSERT INTO users (name, email, phone, password_hash, role) VALUES ('Sai Krishna Admin', $1, '+919876543210', $2, 'admin')",
        [email, correctHash]
      );
      console.log('✅ Admin user inserted successfully with correct password hash!');
    } else {
      console.log('✅ Admin password hash updated successfully for:', res.rows[0].email);
    }
  } catch (err) {
    console.error('❌ Error updating admin hash:', err.message);
  } finally {
    await db.pool.end();
  }
}

fixHash();
