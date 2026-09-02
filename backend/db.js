const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: (process.env.DATABASE_URL && (
    process.env.DATABASE_URL.includes('supabase') ||
    process.env.DATABASE_URL.includes('railway') ||
    process.env.DATABASE_URL.includes('neon') ||
    process.env.DATABASE_URL.includes('render') ||
    process.env.DATABASE_URL.includes('pooler') ||
    isProduction
  )) ? { rejectUnauthorized: false } : false
};

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client:', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
