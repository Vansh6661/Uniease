/**
 * Food Service
 * Handles food menu management and order operations
 */

const pool = require('../../config/database');

// In-memory store (in production, this would be database)
const foodDatabase = {
  quench: [
    { id: "q1", name: "Iced Coffee", price: 120, emoji: "🧋", restaurant: "quench", category: "cold" },
    { id: "q2", name: "Mango Lassi", price: 80, emoji: "🥭", restaurant: "quench", category: "cold" },
    { id: "q3", name: "Cold Cola", price: 60, emoji: "🥤", restaurant: "quench", category: "cold" },
    { id: "q4", name: "Lemonade", price: 50, emoji: "🍋", restaurant: "quench", category: "cold" },
    { id: "q5", name: "Hot Coffee", price: 40, emoji: "☕", restaurant: "quench", category: "hot" },
    { id: "q6", name: "Hot Tea", price: 30, emoji: "🍵", restaurant: "quench", category: "hot" },
    { id: "q7", name: "Hot Chocolate", price: 60, emoji: "🍫", restaurant: "quench", category: "hot" },
  ],
  "southern-stories": [
    { id: "ss1", name: "Hyderabadi Biryani", price: 150, emoji: "🍛", restaurant: "southern-stories", category: "lunch" },
    { id: "ss2", name: "Masala Dosa", price: 100, emoji: "🥗", restaurant: "southern-stories", category: "lunch" },
    { id: "ss3", name: "Sambar Rice", price: 80, emoji: "🍚", restaurant: "southern-stories", category: "lunch" },
    { id: "ss4", name: "Idli Vada", price: 60, emoji: "🍢", restaurant: "southern-stories", category: "lunch" },
    { id: "ss5", name: "Andhra Cottage Biryani", price: 180, emoji: "🍛", restaurant: "southern-stories", category: "dinner" },
    { id: "ss6", name: "Fish Curry Rice", price: 140, emoji: "🐟", restaurant: "southern-stories", category: "dinner" },
  ],
  nescafe: [
    { id: "n1", name: "Espresso", price: 100, emoji: "☕", restaurant: "nescafe", category: "coffee" },
    { id: "n2", name: "Cappuccino", price: 120, emoji: "🥛", restaurant: "nescafe", category: "coffee" },
    { id: "n3", name: "Latte", price: 130, emoji: "🍶", restaurant: "nescafe", category: "coffee" },
    { id: "n4", name: "Mocha", price: 140, emoji: "🍫", restaurant: "nescafe", category: "coffee" },
    { id: "n5", name: "Croissant", price: 80, emoji: "🥐", restaurant: "nescafe", category: "pastry" },
    { id: "n6", name: "Chocolate Cake", price: 120, emoji: "🎂", restaurant: "nescafe", category: "pastry" },
  ],
  dominos: [
    { id: "d1", name: "Margherita Pizza", price: 300, emoji: "🍕", restaurant: "dominos", category: "pizza" },
    { id: "d2", name: "Pepperoni Pizza", price: 350, emoji: "🍕", restaurant: "dominos", category: "pizza" },
    { id: "d3", name: "Deluxe Veggie", price: 320, emoji: "🍕", restaurant: "dominos", category: "pizza" },
    { id: "d4", name: "Chicken Fiesta", price: 380, emoji: "🍗", restaurant: "dominos", category: "pizza" },
    { id: "d5", name: "Garlic Bread", price: 100, emoji: "🍞", restaurant: "dominos", category: "sides" },
    { id: "d6", name: "Mozzarella Sticks", price: 120, emoji: "🧀", restaurant: "dominos", category: "sides" },
  ],
  subway: [
    { id: "sub1", name: "Italian BMT", price: 250, emoji: "🥪", restaurant: "subway", category: "subs" },
    { id: "sub2", name: "Spicy Italian", price: 240, emoji: "🌶️", restaurant: "subway", category: "subs" },
    { id: "sub3", name: "Veggie Delite", price: 180, emoji: "🥒", restaurant: "subway", category: "subs" },
    { id: "sub4", name: "Chicken Teriyaki", price: 280, emoji: "🍗", restaurant: "subway", category: "subs" },
    { id: "sub5", name: "Mediterranean Salad", price: 150, emoji: "🥗", restaurant: "subway", category: "salads" },
    { id: "sub6", name: "Chicken Salad", price: 180, emoji: "🥗", restaurant: "subway", category: "salads" },
  ],
  sneapeats: [
    { id: "sn1", name: "Chilli Garlic Noodles", price: 150, emoji: "🍜", restaurant: "sneapeats", category: "starters" },
    { id: "sn2", name: "Paneer Tikka", price: 200, emoji: "🍖", restaurant: "sneapeats", category: "starters" },
    { id: "sn3", name: "Spring Rolls", price: 120, emoji: "🥟", restaurant: "sneapeats", category: "starters" },
    { id: "sn4", name: "Butter Garlic Noodles", price: 180, emoji: "🍝", restaurant: "sneapeats", category: "mains" },
    { id: "sn5", name: "Schezwan Rice", price: 160, emoji: "🍚", restaurant: "sneapeats", category: "mains" },
  ],
  infinity: [
    { id: "inf1", name: "Premium Thali", price: 250, emoji: "🍱", restaurant: "infinity", category: "premium" },
    { id: "inf2", name: "Biryanis Deluxe", price: 280, emoji: "🍛", restaurant: "infinity", category: "premium" },
    { id: "inf3", name: "North Indian Veg", price: 220, emoji: "🥘", restaurant: "infinity", category: "premium" },
    { id: "inf4", name: "Chef's Special Curry", price: 300, emoji: "🍛", restaurant: "infinity", category: "specials" },
    { id: "inf5", name: "Mixed Grill Platter", price: 350, emoji: "🍖", restaurant: "infinity", category: "specials" },
  ],
};

class FoodService {
  /**
   * Get menu for a specific restaurant
   */
  static getRestaurantMenu(restaurant) {
    if (!foodDatabase[restaurant]) {
      return null;
    }
    return foodDatabase[restaurant];
  }

  /**
   * Get a specific food item
   */
  static getFoodItem(itemId) {
    for (const items of Object.values(foodDatabase)) {
      const item = items.find(i => i.id === itemId);
      if (item) return item;
    }
    return null;
  }

  /**
   * Get all restaurants
   */
  static getAllRestaurants() {
    return Object.keys(foodDatabase).map(key => ({
      id: key,
      name: key.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    }));
  }

  /**
   * Create food order in PostgreSQL
   */
  static async createOrder({ userId, restaurant, items, totalAmount }) {
    const client = await pool.connect();

    try {
      console.log('[FoodService.createOrder] Starting DB transaction', {
        userId,
        restaurant,
        itemCount: items.length,
        totalAmount,
      });

      await client.query('BEGIN');

      const orderInsertQuery = `
        INSERT INTO food_orders (user_id, restaurant, total_amount, status, created_at, updated_at)
        VALUES ($1, $2, $3, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id, user_id, restaurant, status, total_amount, created_at
      `;

      const orderResult = await client.query(orderInsertQuery, [
        userId,
        restaurant,
        totalAmount,
      ]);

      const order = orderResult.rows[0];

      const orderItemInsertQuery = `
        INSERT INTO food_order_items (order_id, item_id, item_name, price, quantity, created_at)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      `;

      for (const item of items) {
        await client.query(orderItemInsertQuery, [
          order.id,
          item.itemId,
          item.itemName,
          item.price,
          item.quantity,
        ]);
      }

      await client.query('COMMIT');

      console.log('[FoodService.createOrder] DB insert successful', {
        orderId: order.id,
        itemCount: items.length,
      });

      return {
        success: true,
        data: {
          id: order.id,
          userId: order.user_id,
          restaurant: order.restaurant,
          status: order.status,
          totalAmount: order.total_amount,
          items,
          createdAt: order.created_at,
        },
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('[FoodService.createOrder] DB insert failed', error);
      return {
        success: false,
        error: error.message,
      };
    } finally {
      client.release();
    }
  }

  /**
   * Get all orders for a restaurant
   * @param {string} restaurant - Restaurant ID
   * @param {Array<string>} statuses - Optional: filter by statuses (e.g., ['pending', 'accepted'])
   */
  static async getOrdersByRestaurant(restaurant, statuses = null) {
    try {
      console.log('[FoodService.getOrdersByRestaurant] Fetching orders', { restaurant, statuses });

      let query = `
        SELECT
          fo.id,
          fo.status,
          fo.total_amount,
          fo.created_at,
          u.name AS customer,
          COALESCE(
            json_agg(
              json_build_object(
                'itemName', foi.item_name,
                'quantity', foi.quantity
              )
              ORDER BY foi.created_at
            ) FILTER (WHERE foi.id IS NOT NULL),
            '[]'::json
          ) AS items
        FROM food_orders fo
        JOIN users u ON u.id = fo.user_id
        LEFT JOIN food_order_items foi ON foi.order_id = fo.id
        WHERE fo.restaurant = $1
      `;

      let params = [restaurant];

      // Optional: Filter by status
      if (statuses && Array.isArray(statuses) && statuses.length > 0) {
        const placeholders = statuses.map((_, i) => `$${i + 2}`).join(',');
        query += ` AND fo.status IN (${placeholders})`;
        params = [...params, ...statuses];
      }

      query += `
        GROUP BY fo.id, u.name
        ORDER BY fo.created_at DESC
      `;

      const result = await pool.query(query, params);

      const orders = result.rows.map((row) => ({
        id: row.id,
        status: row.status,
        customer: row.customer,
        total: row.total_amount,
        createdAt: row.created_at,
        items: (row.items || []).map((item) => `${item.itemName} x${item.quantity}`),
      }));

      console.log('[FoodService.getOrdersByRestaurant] Orders fetched', {
        restaurant,
        count: orders.length,
        statuses,
      });

      return { success: true, data: orders };
    } catch (error) {
      console.error('[FoodService.getOrdersByRestaurant] Failed to fetch orders', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(orderId, newStatus) {
    const client = await pool.connect();

    try {
      console.log('[FoodService.updateOrderStatus] Updating status', {
        orderId,
        newStatus,
      });

      const validStatuses = ['pending', 'accepted', 'in_progress', 'completed', 'rejected'];
      if (!validStatuses.includes(newStatus)) {
        return {
          success: false,
          error: `Invalid status. Allowed statuses: ${validStatuses.join(', ')}`,
        };
      }

      const completedAtClause = newStatus === 'completed' ? ', completed_at = CURRENT_TIMESTAMP' : '';

      const query = `
        UPDATE food_orders
        SET status = $1, updated_at = CURRENT_TIMESTAMP${completedAtClause}
        WHERE id = $2
        RETURNING id, status, updated_at, completed_at
      `;

      const result = await client.query(query, [newStatus, orderId]);

      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'Order not found',
        };
      }

      const order = result.rows[0];

      console.log('[FoodService.updateOrderStatus] Status updated successfully', {
        orderId,
        newStatus,
      });

      return {
        success: true,
        data: {
          id: order.id,
          status: order.status,
          updatedAt: order.updated_at,
          completedAt: order.completed_at,
        },
      };
    } catch (error) {
      console.error('[FoodService.updateOrderStatus] Failed to update status', error);
      return {
        success: false,
        error: error.message,
      };
    } finally {
      client.release();
    }
  }

  /**
   * Get all orders for a user (student)
   */
  static async getUserOrders(userId) {
    try {
      console.log('[FoodService.getUserOrders] Fetching orders', { userId });

      const query = `
        SELECT
          fo.id,
          fo.status,
          fo.total_amount,
          fo.created_at,
          fo.updated_at,
          fo.completed_at,
          fo.restaurant,
          COALESCE(
            json_agg(
              json_build_object(
                'itemName', foi.item_name,
                'quantity', foi.quantity,
                'price', foi.price
              )
              ORDER BY foi.created_at
            ) FILTER (WHERE foi.id IS NOT NULL),
            '[]'::json
          ) AS items
        FROM food_orders fo
        LEFT JOIN food_order_items foi ON foi.order_id = fo.id
        WHERE fo.user_id = $1
        GROUP BY fo.id
        ORDER BY fo.created_at DESC
      `;

      const result = await pool.query(query, [userId]);

      const orders = result.rows.map((row) => ({
        id: row.id,
        status: row.status,
        restaurant: row.restaurant,
        total: row.total_amount,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        completedAt: row.completed_at,
        items: (row.items || []).map((item) => ({
          name: item.itemName,
          quantity: item.quantity,
          price: item.price,
        })),
      }));

      console.log('[FoodService.getUserOrders] Orders fetched', {
        userId,
        count: orders.length,
      });

      return { success: true, data: orders };
    } catch (error) {
      console.error('[FoodService.getUserOrders] Failed to fetch orders', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = FoodService;
