const pool = require('../../config/database');

const LAUNDRY_STATUSES = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  PROCESSING: 'PROCESSING',
  READY: 'READY',
  DELIVERED: 'DELIVERED',
  REJECTED: 'REJECTED',
};

const VALID_ITEMS = [
  'shirt',
  'pant',
  'tshirt',
  'bedsheet',
  'towel',
  'jeans',
  'kurta',
  'jacket',
];

let schemaInitPromise = null;

const ensureLaundrySchema = async () => {
  if (schemaInitPromise) {
    return schemaInitPromise;
  }

  schemaInitPromise = (async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS laundry_orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_token VARCHAR(30) UNIQUE NOT NULL,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        items JSONB NOT NULL,
        total_items INT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        rejected_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        delivered_at TIMESTAMP,
        CONSTRAINT chk_laundry_status CHECK (
          status IN ('PENDING', 'ACCEPTED', 'PROCESSING', 'READY', 'DELIVERED', 'REJECTED')
        ),
        CONSTRAINT chk_laundry_total_items CHECK (total_items > 0 AND total_items <= 15)
      );
    `);

    await pool.query('CREATE INDEX IF NOT EXISTS idx_laundry_orders_user_id ON laundry_orders(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_laundry_orders_status ON laundry_orders(status)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_laundry_orders_order_token ON laundry_orders(order_token)');
  })();

  return schemaInitPromise;
};

class LaundryService {
  static sanitizeItems(items = {}) {
    const sanitized = {};

    for (const [key, value] of Object.entries(items)) {
      const normalizedKey = String(key).trim().toLowerCase();
      const qty = Number(value);

      if (!VALID_ITEMS.includes(normalizedKey)) {
        continue;
      }

      if (Number.isInteger(qty) && qty > 0) {
        sanitized[normalizedKey] = qty;
      }
    }

    return sanitized;
  }

  static getTotalItems(items = {}) {
    return Object.values(items).reduce((sum, qty) => sum + Number(qty || 0), 0);
  }

  static async generateOrderToken(client) {
    await ensureLaundrySchema();

    for (let i = 0; i < 10; i++) {
      const random = Math.floor(1000 + Math.random() * 9000);
      const token = `LAUNDRY${random}`;
      const existing = await client.query(
        'SELECT id FROM laundry_orders WHERE order_token = $1',
        [token]
      );

      if (existing.rows.length === 0) {
        return token;
      }
    }

    throw new Error('Failed to generate unique laundry order token');
  }

  static async createOrder({ userId, items }) {
    const client = await pool.connect();

    try {
      await ensureLaundrySchema();

      const sanitizedItems = this.sanitizeItems(items);
      const totalItems = this.getTotalItems(sanitizedItems);

      if (totalItems <= 0) {
        return { success: false, error: 'Select at least one laundry item' };
      }

      if (totalItems > 15) {
        return { success: false, error: 'Maximum 15 items allowed per order' };
      }

      await client.query('BEGIN');

      const orderToken = await this.generateOrderToken(client);
      const insertQuery = `
        INSERT INTO laundry_orders (
          order_token, user_id, items, total_items, status, created_at, updated_at
        )
        VALUES ($1, $2, $3::jsonb, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id, order_token, user_id, items, total_items, status, created_at
      `;

      const result = await client.query(insertQuery, [
        orderToken,
        userId,
        JSON.stringify(sanitizedItems),
        totalItems,
        LAUNDRY_STATUSES.PENDING,
      ]);

      await client.query('COMMIT');

      return {
        success: true,
        data: result.rows[0],
      };
    } catch (error) {
      await client.query('ROLLBACK');
      return { success: false, error: error.message };
    } finally {
      client.release();
    }
  }

  static async getOrdersByUser(userId) {
    try {
      await ensureLaundrySchema();

      const query = `
        SELECT id, order_token, items, total_items, status, created_at, updated_at, delivered_at
        FROM laundry_orders
        WHERE user_id = $1
        ORDER BY created_at DESC
      `;

      const result = await pool.query(query, [userId]);
      return { success: true, data: result.rows };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async getAllOrders() {
    try {
      await ensureLaundrySchema();

      const query = `
        SELECT
          lo.id,
          lo.order_token,
          lo.items,
          lo.total_items,
          lo.status,
          lo.created_at,
          lo.updated_at,
          lo.delivered_at,
          u.id as user_id,
          u.name as student_name,
          u.email as student_email
        FROM laundry_orders lo
        JOIN users u ON u.id = lo.user_id
        ORDER BY lo.created_at DESC
      `;

      const result = await pool.query(query);
      return { success: true, data: result.rows };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async updateOrderStatus({ orderId, status, reason = null, deliveryToken = null }) {
    try {
      await ensureLaundrySchema();

      const currentResult = await pool.query(
        'SELECT id, order_token, status FROM laundry_orders WHERE id = $1',
        [orderId]
      );

      if (currentResult.rows.length === 0) {
        return { success: false, error: 'Laundry order not found' };
      }

      const current = currentResult.rows[0];

      if (status === LAUNDRY_STATUSES.DELIVERED) {
        if (!deliveryToken || deliveryToken !== current.order_token) {
          return { success: false, error: 'Invalid order ID for delivery confirmation' };
        }
      }

      const validTransitions = {
        PENDING: ['ACCEPTED', 'REJECTED'],
        ACCEPTED: ['PROCESSING'],
        PROCESSING: ['READY'],
        READY: ['DELIVERED'],
      };

      const allowed = validTransitions[current.status] || [];
      if (!allowed.includes(status)) {
        return {
          success: false,
          error: `Invalid status transition from ${current.status} to ${status}`,
        };
      }

      const query = `
        UPDATE laundry_orders
        SET status = $1::varchar,
            rejected_reason = $2,
            delivered_at = CASE WHEN $1::varchar = 'DELIVERED' THEN CURRENT_TIMESTAMP ELSE delivered_at END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING id, order_token, items, total_items, status, rejected_reason, created_at, updated_at, delivered_at
      `;

      const result = await pool.query(query, [status, reason, orderId]);

      return { success: true, data: result.rows[0] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = {
  LaundryService,
  LAUNDRY_STATUSES,
  VALID_ITEMS,
};
