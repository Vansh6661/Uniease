const express = require('express');
const router = express.Router();
const { verifyJWT, requireRole } = require('../middleware/auth');
const { LaundryService, LAUNDRY_STATUSES } = require('../services/laundry/laundryService');

/**
 * POST /api/laundry/orders
 * Create laundry order (student/user)
 */
router.post('/orders', verifyJWT, async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user.userId;

    const result = await LaundryService.createOrder({ userId, items });
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json({
      success: true,
      message: 'Laundry order placed successfully',
      data: result.data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to create laundry order',
    });
  }
});

/**
 * GET /api/laundry/orders/my
 * Fetch my laundry orders
 */
router.get('/orders/my', verifyJWT, async (req, res) => {
  const result = await LaundryService.getOrdersByUser(req.user.userId);
  if (!result.success) {
    return res.status(500).json(result);
  }

  return res.json({ success: true, data: result.data });
});

/**
 * GET /api/laundry/orders/staff
 * Laundry staff dashboard list
 */
router.get('/orders/staff', verifyJWT, requireRole(['laundry', 'admin', 'super_admin']), async (req, res) => {
  const result = await LaundryService.getAllOrders();
  if (!result.success) {
    return res.status(500).json(result);
  }

  return res.json({ success: true, data: result.data });
});

/**
 * PATCH /api/laundry/orders/:id/status
 * Update laundry order status by staff
 */
router.patch('/orders/:id/status', verifyJWT, requireRole(['laundry', 'admin', 'super_admin']), async (req, res) => {
  const { id } = req.params;
  const { status, reason, deliveryToken } = req.body;

  if (!Object.values(LAUNDRY_STATUSES).includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid laundry status' });
  }

  const result = await LaundryService.updateOrderStatus({
    orderId: id,
    status,
    reason,
    deliveryToken,
  });

  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.json({ success: true, data: result.data });
});

module.exports = router;
