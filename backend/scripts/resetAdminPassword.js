const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Load local env first for dev convenience, then default .env if present.
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const pool = require('../src/config/database');

async function ensureAdminRole() {
  let roleResult = await pool.query('SELECT id FROM roles WHERE name = $1', ['admin']);

  if (roleResult.rows.length > 0) {
    return roleResult.rows[0].id;
  }

  await pool.query(
    `INSERT INTO roles (name, description, permissions)
     VALUES ($1, $2, $3::jsonb)
     ON CONFLICT (name) DO NOTHING`,
    [
      'admin',
      'Department Administrator',
      JSON.stringify([
        'manage_department_users',
        'view_department_complaints',
        'manage_department_complaints',
        'view_analytics',
        'manage_department_sla_rules',
        'create_complaint_notes',
      ]),
    ]
  );

  roleResult = await pool.query('SELECT id FROM roles WHERE name = $1', ['admin']);
  if (roleResult.rows.length === 0) {
    throw new Error('Failed to ensure admin role');
  }

  return roleResult.rows[0].id;
}

async function resetAdminPassword() {
  const email = process.argv[2] || 'admin@bennett.edu.in';
  const password = process.argv[3] || 'admin1234';

  if (!email.includes('@')) {
    throw new Error('Provide a valid email. Example: admin@bennett.edu.in');
  }

  if (password.length < 4) {
    throw new Error('Password must be at least 4 characters');
  }

  const adminRoleId = await ensureAdminRole();
  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (existing.rows.length > 0) {
    await pool.query(
      `UPDATE users
       SET password_hash = $1, role_id = $2, status = 'active', deleted_at = NULL, updated_at = NOW()
       WHERE email = $3`,
      [passwordHash, adminRoleId, email]
    );

    console.log(`Updated admin user: ${email}`);
  } else {
    const name = email.split('@')[0] || 'admin';
    await pool.query(
      `INSERT INTO users (id, email, name, password_hash, role_id, status)
       VALUES ($1, $2, $3, $4, $5, 'active')`,
      [uuidv4(), email, name, passwordHash, adminRoleId]
    );

    console.log(`Created admin user: ${email}`);
  }

  console.log('Admin credentials are ready.');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

resetAdminPassword()
  .catch((error) => {
    console.error('Failed to reset admin password:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
