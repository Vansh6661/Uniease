const express = require('express');
const router = express.Router();
const FoodService = require('../services/food/foodService');
const { verifyJWT } = require('../middleware/auth');

/**
 * Food Routes
 * Endpoints for food ordering system
 */

/**
 * GET /api/food/restaurants
 * Get all available restaurants
 */
router.get('/restaurants', async (req, res) => {
  try {
    const restaurants = FoodService.getAllRestaurants();
    res.json({
      success: true,
      data: restaurants,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch restaurants',
    });
  }
});

/**
 * GET /api/food/menu/:restaurant
 * Get menu for a specific restaurant
 */
router.get('/menu/:restaurant', async (req, res) => {
  try {
    const { restaurant } = req.params;
    const menu = FoodService.getRestaurantMenu(restaurant);

    if (!menu) {
      return res.status(404).json({
        success: false,
        error: 'Restaurant not found',
      });
    }

    res.json({
      success: true,
      restaurant,
      data: menu,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch menu',
    });
  }
});

/**
 * GET /api/food/item/:itemId
 * Get details of a specific food item
 */
router.get('/item/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = FoodService.getFoodItem(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Food item not found',
      });
    }

    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch food item',
    });
  }
});

/**
 * GET /api/food/orders/restaurant/:restaurant
 * Fetch all orders for a restaurant dashboard
 */
router.get('/orders/restaurant/:restaurant', verifyJWT, async (req, res) => {
  try {
    const { restaurant } = req.params;
    const { showCompleted } = req.query; // Optional: ?showCompleted=true

    console.log('[GET /api/food/orders/restaurant/:restaurant] Request received', {
      restaurant,
      userId: req.user.userId,
      showCompleted,
    });

    if (req.user.appRole === 'RESTAURANT' && req.user.restaurantId !== restaurant) {
      return res.status(403).json({
        success: false,
        error: 'Restaurant users can only view their own dashboard data',
      });
    }

    const restaurantMenu = FoodService.getRestaurantMenu(restaurant);
    if (!restaurantMenu) {
      return res.status(400).json({
        success: false,
        error: 'Invalid restaurant',
      });
    }

    // By default, exclude rejected and (optionally) completed orders
    // Use ?showCompleted=true to include completed orders
    const activeStatuses = showCompleted === 'true'
      ? ['pending', 'accepted', 'in_progress', 'completed']
      : ['pending', 'accepted', 'in_progress'];

    const result = await FoodService.getOrdersByRestaurant(restaurant, activeStatuses);
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to fetch orders',
      });
    }

    res.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('[GET /api/food/orders/restaurant/:restaurant] Unexpected error', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders',
    });
  }
});

/**
 * GET /api/food/orders/my-restaurant
 * Fetch orders for logged in restaurant user
 */
router.get('/orders/my-restaurant', verifyJWT, async (req, res) => {
  try {
    if (req.user.appRole !== 'RESTAURANT') {
      return res.status(403).json({
        success: false,
        error: 'Only restaurant users can access this route',
      });
    }

    if (!req.user.restaurantId) {
      return res.status(400).json({
        success: false,
        error: 'Restaurant ID is missing in user session',
      });
    }

    const { showCompleted } = req.query; // Optional: ?showCompleted=true

    // By default, exclude rejected and (optionally) completed orders
    const activeStatuses = showCompleted === 'true'
      ? ['pending', 'accepted', 'in_progress', 'completed']
      : ['pending', 'accepted', 'in_progress'];

    const result = await FoodService.getOrdersByRestaurant(req.user.restaurantId, activeStatuses);
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to fetch restaurant orders',
      });
    }

    res.json({
      success: true,
      restaurantId: req.user.restaurantId,
      data: result.data,
    });
  } catch (error) {
    console.error('[GET /api/food/orders/my-restaurant] Unexpected error', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch restaurant orders',
    });
  }
});

/**
 * POST /api/food/orders
 * Place a food order (requires JWT)
 */
router.post('/orders', verifyJWT, async (req, res) => {
  try {
    const { restaurant, items, totalAmount } = req.body;
    const userId = req.user.userId;

    console.log('[POST /api/food/orders] Request received', {
      userId,
      restaurant,
      itemCount: Array.isArray(items) ? items.length : 0,
      totalAmount,
    });

    if (!restaurant || !items || !totalAmount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: restaurant, items, totalAmount',
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Items must be a non-empty array',
      });
    }

    // Validate menu items belong to selected restaurant
    const restaurantMenu = FoodService.getRestaurantMenu(restaurant);
    if (!restaurantMenu) {
      return res.status(400).json({
        success: false,
        error: 'Invalid restaurant',
      });
    }

    const orderResult = await FoodService.createOrder({
      userId,
      restaurant,
      items,
      totalAmount,
    });

    if (!orderResult.success) {
      return res.status(500).json({
        success: false,
        error: orderResult.error || 'Failed to place order',
      });
    }

    console.log('[POST /api/food/orders] Order placed successfully', {
      orderId: orderResult.data.id,
      userId,
    });

    res.json({
      success: true,
      message: 'Order placed successfully',
      data: orderResult.data,
    });
  } catch (error) {
    console.error('[POST /api/food/orders] Unexpected error', error);
    res.status(500).json({
      success: false,
      error: 'Failed to place order',
    });
  }
});

/**
 * GET /api/food/orders/my-orders
 * Fetch orders for logged-in student user (requires JWT)
 */
router.get('/orders/my-orders', verifyJWT, async (req, res) => {
  try {
    const userId = req.user.userId;

    console.log('[GET /api/food/orders/my-orders] Request received', {
      userId,
    });

    const result = await FoodService.getUserOrders(userId);
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to fetch orders',
      });
    }

    res.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('[GET /api/food/orders/my-orders] Unexpected error', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders',
    });
  }
});

/**
 * POST /api/food/orders/:orderId/status
 * Update order status (requires JWT)
 */
router.post('/orders/:orderId/status', verifyJWT, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    console.log('[POST /api/food/orders/:orderId/status] Request received', {
      orderId,
      status,
      userId: req.user.userId,
    });

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: status',
      });
    }

    const result = await FoodService.updateOrderStatus(orderId, status);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    console.log('[POST /api/food/orders/:orderId/status] Status updated successfully', {
      orderId,
      status,
    });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: result.data,
    });
  } catch (error) {
    console.error('[POST /api/food/orders/:orderId/status] Unexpected error', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order status',
    });
  }
});

module.exports = router;
