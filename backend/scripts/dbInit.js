const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function initDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL not found in backend/.env file.');
    process.exit(1);
  }

  console.log('🔄 Connecting to PostgreSQL database...');
  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('supabase.co') || connectionString.includes('railway') 
      ? { rejectUnauthorized: false } 
      : false
  });

  try {
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    console.log(`📖 Reading schema file from ${schemaPath}...`);
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('⏳ Running database migrations and seeding data...');
    // Execute the SQL queries
    await pool.query(sql);

    console.log('✅ Database setup completed successfully!');
    console.log('🎉 Seeded Cow Ghee, Buffalo Ghee, A2 Ghee and Admin user account.');
  } catch (err) {
    console.error('❌ Error initializing database:', err.message);
  } finally {
    await pool.end();
  }
}

initDb();
