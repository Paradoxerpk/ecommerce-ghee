const db = require('../db');

async function testConn() {
  console.log('Testing connection configuration...');
  console.log('DATABASE_URL starts with:', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) + '...' : 'undefined');
  console.log('ssl configuration:', db.pool.options.ssl);

  try {
    const res = await db.query('SELECT NOW()');
    console.log('✅ Connection test successful!');
    console.log('Database time:', res.rows[0].now);

    const userCount = await db.query('SELECT COUNT(*) FROM users');
    console.log('Total users in database:', userCount.rows[0].count);
  } catch (err) {
    console.error('❌ Connection test failed!');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
  } finally {
    await db.pool.end();
  }
}

testConn();
