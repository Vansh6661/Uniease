-- Food Orders Table
-- Stores all food orders from restaurants

CREATE TABLE IF NOT EXISTS food_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS food_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES food_orders(id) ON DELETE CASCADE,
  item_id VARCHAR(100) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_food_orders_user_id ON food_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_food_orders_restaurant ON food_orders(restaurant);
CREATE INDEX IF NOT EXISTS idx_food_orders_status ON food_orders(status);
CREATE INDEX IF NOT EXISTS idx_food_order_items_order_id ON food_order_items(order_id);
