-- Laundry Orders Table
-- Item-based laundry ordering with secure delivery token

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

CREATE INDEX IF NOT EXISTS idx_laundry_orders_user_id ON laundry_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_laundry_orders_status ON laundry_orders(status);
CREATE INDEX IF NOT EXISTS idx_laundry_orders_order_token ON laundry_orders(order_token);
