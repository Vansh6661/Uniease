const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'uniease',
  user: process.env.DB_USER || 'uniease_user',
  password: process.env.DB_PASSWORD || '',
  min: 2,
  max: 20,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL pool created successfully');
});

module.exports = pool;
