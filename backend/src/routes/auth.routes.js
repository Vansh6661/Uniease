const express = require('express');
const AuthService = require('../services/auth/authService');
const { verifyJWT } = require('../middleware/auth');

const router = express.Router();
const isProduction = process.env.NODE_ENV === 'production';

const getRefreshCookieOptions = (includeMaxAge = true) => {
  const options = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  };

  if (includeMaxAge) {
    options.maxAge = 7 * 24 * 60 * 60 * 1000;
  }

  return options;
};

/**
 * POST /api/auth/register
 * Register a new user (students, admin registration typically handled separately)
 */
router.post('/register', async (req, res) => {
  try {
    const { email, name, password, role, restaurantId } = req.body;

    // Validation
    if (!email || !name || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email, name, and password are required',
      });
    }

    // Register user
    const result = await AuthService.register(email, name, password, role, restaurantId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: result.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Registration failed',
    });
  }
});

/**
 * POST /api/auth/login
 * Login with email and password, returns JWT tokens
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    // Attempt login
    const result = await AuthService.login(email, password);

    if (!result.success) {
      return res.status(401).json(result);
    }

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, getRefreshCookieOptions(true));

    res.json({
      success: true,
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Login failed',
    });
  }
});

/**
 * POST /api/auth/refresh-token
 * Refresh access token using refresh token from cookie
 */
router.post('/refresh-token', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required',
      });
    }

    const result = await AuthService.refreshToken(refreshToken);

    if (!result.success) {
      return res.status(401).json(result);
    }

    res.json({
      success: true,
      accessToken: result.accessToken,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Token refresh failed',
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (clear refresh token cookie)
 */
router.post('/logout', (req, res) => {
  try {
    res.clearCookie('refreshToken', {
      ...getRefreshCookieOptions(false),
    });

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Logout failed',
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user info (requires JWT)
 */
router.get('/me', verifyJWT, async (req, res) => {
  try {
    const result = await AuthService.getUserById(req.user.userId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json({
      success: true,
      user: result.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user info',
    });
  }
});

module.exports = router;
