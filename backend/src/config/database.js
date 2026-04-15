const { Pool } = require('pg');
require('dotenv').config();

const basePoolOptions = {
  min: 2,
  max: 20,
};

const poolConfig = process.env.DATABASE_URL
  ? {
      ...basePoolOptions,
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
    }
  : {
      ...basePoolOptions,
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'uniease',
      user: process.env.DB_USER || 'uniease_user',
      password: process.env.DB_PASSWORD || '',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL pool created successfully');
});

module.exports = pool;
