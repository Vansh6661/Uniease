const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Load local env first for dev convenience, then fallback to .env.
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const pool = require('../src/config/database');

const ROLE_CONFIG = {
  admin: {
    description: 'Department Administrator',
    permissions: [
      'manage_department_users',
      'view_department_complaints',
      'manage_department_complaints',
      'view_analytics',
      'manage_department_sla_rules',
      'create_complaint_notes',
    ],
  },
  laundry: {
    description: 'Laundry Operations User',
    permissions: ['view_laundry_orders', 'manage_laundry_orders'],
  },
  restaurant: {
    description: 'Restaurant Operations User',
    permissions: ['view_restaurant_orders', 'manage_restaurant_orders'],
  },
};

const DEMO_ACCOUNTS = [
  { email: 'admin@bennett.edu.in', name: 'Admin', role: 'admin', password: 'admin1234' },
  { email: 'laundry@bennett.edu.in', name: 'Laundry', role: 'laundry', password: 'laundry1234' },
  { email: 'quench@bennett.edu.in', name: 'Quench', role: 'restaurant', password: 'quench1234' },
  { email: 'southern-stories@bennett.edu.in', name: 'Southern Stories', role: 'restaurant', password: 'southern1234' },
  { email: 'nescafe@bennett.edu.in', name: 'Nescafe', role: 'restaurant', password: 'nescafe1234' },
  { email: 'dominos@bennett.edu.in', name: 'Dominos', role: 'restaurant', password: 'dominos1234' },
  { email: 'subway@bennett.edu.in', name: 'Subway', role: 'restaurant', password: 'subway1234' },
  { email: 'sneapeats@bennett.edu.in', name: 'Sneapeats', role: 'restaurant', password: 'sneapeats1234' },
  { email: 'infinity@bennett.edu.in', name: 'Infinity', role: 'restaurant', password: 'infinity1234' },
];

async function ensureRole(roleName) {
  const config = ROLE_CONFIG[roleName];
  if (!config) {
    throw new Error(`Unknown role: ${roleName}`);
  }

  await pool.query(
    `INSERT INTO roles (name, description, permissions)
     VALUES ($1, $2, $3::jsonb)
     ON CONFLICT (name) DO NOTHING`,
    [roleName, config.description, JSON.stringify(config.permissions)]
  );

  const roleResult = await pool.query('SELECT id FROM roles WHERE name = $1', [roleName]);
  if (roleResult.rows.length === 0) {
    throw new Error(`Failed to ensure role: ${roleName}`);
  }

  return roleResult.rows[0].id;
}

async function upsertUser({ email, name, role, password }) {
  const roleId = await ensureRole(role);
  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

  if (existing.rows.length > 0) {
    await pool.query(
      `UPDATE users
       SET name = $1, password_hash = $2, role_id = $3, status = 'active', deleted_at = NULL, updated_at = NOW()
       WHERE email = $4`,
      [name, passwordHash, roleId, email]
    );
    return { email, role, action: 'updated' };
  }

  await pool.query(
    `INSERT INTO users (id, email, name, password_hash, role_id, status)
     VALUES ($1, $2, $3, $4, $5, 'active')`,
    [uuidv4(), email, name, passwordHash, roleId]
  );

  return { email, role, action: 'created' };
}

async function setupDemoAccounts() {
  const results = [];

  for (const account of DEMO_ACCOUNTS) {
    // Sequential setup keeps output deterministic and easier to debug.
    const result = await upsertUser(account);
    results.push(result);
  }

  console.log('Demo accounts ready:');
  for (const r of results) {
    console.log(`- ${r.email} (${r.role}) -> ${r.action}`);
  }
}

setupDemoAccounts()
  .catch((error) => {
    console.error('Failed to setup demo accounts:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
