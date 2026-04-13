const jwt = require('jsonwebtoken');
const AuthService = require('../services/auth/authService');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

/**
 * Middleware: Verify JWT token and attach user to request
 */
const verifyJWT = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Authorization header missing',
      });
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    const verification = AuthService.verifyToken(token);

    if (!verification.valid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }

    // Attach user info to request
    req.user = verification.decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
    });
  }
};

/**
 * Middleware: Check if user has required role(s)
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
      }

      const userRole = req.user.roleName;

      // Handle both string and array of roles
      const rolesArray = Array.isArray(allowedRoles)
        ? allowedRoles
        : [allowedRoles];

      if (!rolesArray.includes(userRole)) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
        });
      }

      next();
    } catch (error) {
      res.status(403).json({
        success: false,
        error: 'Permission check failed',
      });
    }
  };
};

module.exports = {
  verifyJWT,
  requireRole,
};
