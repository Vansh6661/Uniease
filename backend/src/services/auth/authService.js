const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const pool = require('../../config/database');
const { ROLES } = require('../../config/constants');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_refresh_secret_key';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '15m';
const REFRESH_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';
const RESTAURANT_IDS = [
  'quench',
  'southern-stories',
  'nescafe',
  'dominos',
  'subway',
  'sneapeats',
  'infinity',
];

const APP_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  RESTAURANT: 'RESTAURANT',
  LAUNDRY: 'LAUNDRY',
};

const resolveDbRoleName = (role) => {
  if (!role) return ROLES.STUDENT;

  const normalized = String(role).trim().toUpperCase();
  if (normalized === APP_ROLES.USER) return ROLES.STUDENT;
  if (normalized === APP_ROLES.ADMIN) return ROLES.ADMIN;
  if (normalized === APP_ROLES.RESTAURANT) return ROLES.RESTAURANT;
  if (normalized === APP_ROLES.LAUNDRY) return ROLES.LAUNDRY;

  return String(role).toLowerCase();
};

const resolveAppRole = (roleName) => {
  if (!roleName) return APP_ROLES.USER;

  if (roleName === ROLES.ADMIN || roleName === ROLES.SUPER_ADMIN || roleName === ROLES.STAFF) {
    return APP_ROLES.ADMIN;
  }

  if (roleName === ROLES.RESTAURANT) {
    return APP_ROLES.RESTAURANT;
  }

  if (roleName === ROLES.LAUNDRY) {
    return APP_ROLES.LAUNDRY;
  }

  return APP_ROLES.USER;
};

const extractRestaurantId = (email, explicitRestaurantId = null) => {
  if (explicitRestaurantId && RESTAURANT_IDS.includes(explicitRestaurantId)) {
    return explicitRestaurantId;
  }

  if (!email) return null;
  const localPart = String(email).split('@')[0].trim().toLowerCase();
  return RESTAURANT_IDS.includes(localPart) ? localPart : null;
};

class AuthService {
  /**
   * Register a new user (primarily for students)
   */
  static async register(email, name, password, role = ROLES.STUDENT, restaurantId = null) {
    try {
      // Validate input
      if (!email || !name || !password) {
        throw new Error('Email, name, and password are required');
      }

      if (password.length < 4) {
        throw new Error('Password must be at least 4 characters');
      }

      // Check if user already exists
      const existingUser = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('User with this email already exists');
      }

      const dbRoleName = resolveDbRoleName(role);

      // Get role ID
      let roleResult = await pool.query(
        'SELECT id FROM roles WHERE name = $1',
        [dbRoleName]
      );

      if (roleResult.rows.length === 0 && (dbRoleName === ROLES.RESTAURANT || dbRoleName === ROLES.LAUNDRY)) {
        const permissions = dbRoleName === ROLES.RESTAURANT
          ? ['view_restaurant_orders', 'manage_restaurant_orders']
          : ['view_laundry_orders', 'manage_laundry_orders'];

        await pool.query(
          `INSERT INTO roles (name, description, permissions)
           VALUES ($1, $2, $3::jsonb)
           ON CONFLICT (name) DO NOTHING`,
          [
            dbRoleName,
            dbRoleName === ROLES.RESTAURANT ? 'Restaurant Operations User' : 'Laundry Operations User',
            JSON.stringify(permissions),
          ]
        );

        roleResult = await pool.query(
          'SELECT id FROM roles WHERE name = $1',
          [dbRoleName]
        );
      }

      if (roleResult.rows.length === 0) {
        throw new Error('Invalid role specified');
      }

      const roleId = roleResult.rows[0].id;

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const appRole = resolveAppRole(dbRoleName);
      const resolvedRestaurantId = appRole === APP_ROLES.RESTAURANT
        ? extractRestaurantId(email, restaurantId)
        : null;

      if (appRole === APP_ROLES.RESTAURANT && !resolvedRestaurantId) {
        throw new Error('Restaurant login requires a valid restaurantId');
      }

      // Create user
      const userId = uuidv4();
      const result = await pool.query(
        `INSERT INTO users (id, email, name, password_hash, role_id, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, email, name, role_id`,
        [userId, email, name, passwordHash, roleId, 'active']
      );

      return {
        success: true,
        user: {
          ...result.rows[0],
          roleName: dbRoleName,
          appRole,
          restaurantId: resolvedRestaurantId,
        },
        message: 'User registered successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Login user with email and password
   */
  static async login(email, password) {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Fetch user with role info
      const result = await pool.query(
        `SELECT u.id, u.email, u.name, u.password_hash, u.role_id, u.status, r.name as role_name
         FROM users u
         JOIN roles r ON u.role_id = r.id
         WHERE u.email = $1 AND u.deleted_at IS NULL`,
        [email]
      );

      if (result.rows.length === 0) {
        throw new Error('Invalid email or password');
      }

      const user = result.rows[0];
      const appRole = resolveAppRole(user.role_name);
      const restaurantId = appRole === APP_ROLES.RESTAURANT
        ? extractRestaurantId(user.email)
        : null;

      // Check if user is active
      if (user.status !== 'active') {
        throw new Error('User account is not active');
      }

      if (appRole === APP_ROLES.RESTAURANT && !restaurantId) {
        throw new Error('Restaurant account must use a valid restaurant email');
      }

      // Compare passwords
      const passwordMatch = await bcrypt.compare(password, user.password_hash);

      if (!passwordMatch) {
        throw new Error('Invalid email or password');
      }

      // Generate tokens
      const accessToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          roleId: user.role_id,
          roleName: user.role_name,
          appRole,
          restaurantId,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        REFRESH_SECRET,
        { expiresIn: REFRESH_EXPIRY }
      );

      // Update last login
      await pool.query(
        'UPDATE users SET last_login = NOW() WHERE id = $1',
        [user.id]
      );

      return {
        success: true,
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          roleId: user.role_id,
          roleName: user.role_name,
          appRole,
          restaurantId,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(refreshToken) {
    try {
      if (!refreshToken) {
        throw new Error('Refresh token is required');
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

      // Fetch fresh user data
      const result = await pool.query(
        `SELECT u.id, u.email, u.name, u.role_id, r.name as role_name
         FROM users u
         JOIN roles r ON u.role_id = r.id
         WHERE u.id = $1 AND u.status = 'active'`,
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found or inactive');
      }

      const user = result.rows[0];
      const appRole = resolveAppRole(user.role_name);
      const restaurantId = appRole === APP_ROLES.RESTAURANT
        ? extractRestaurantId(user.email)
        : null;

      // Generate new access token
      const newAccessToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          roleId: user.role_id,
          roleName: user.role_name,
          appRole,
          restaurantId,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
      );

      return {
        success: true,
        accessToken: newAccessToken,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return {
        valid: true,
        decoded,
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
      };
    }
  }

  /**
   * Get user details by ID
   */
  static async getUserById(userId) {
    try {
      const result = await pool.query(
        `SELECT u.id, u.email, u.name, u.role_id, r.name as role_name, u.department_id, u.status
         FROM users u
         JOIN roles r ON u.role_id = r.id
         WHERE u.id = $1 AND u.deleted_at IS NULL`,
        [userId]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = result.rows[0];
      const appRole = resolveAppRole(user.role_name);
      const restaurantId = appRole === APP_ROLES.RESTAURANT
        ? extractRestaurantId(user.email)
        : null;

      return {
        success: true,
        user: {
          ...user,
          appRole,
          restaurantId,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = AuthService;
