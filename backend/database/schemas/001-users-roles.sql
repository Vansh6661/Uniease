-- Role: store available roles in the system
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Department: organization structure
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  head_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User: authentication and profile
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255),
  role_id INTEGER NOT NULL REFERENCES roles(id),
  department_id UUID REFERENCES departments(id),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
  ('super_admin', 'Super Administrator - Full system access',
    '["manage_users", "manage_departments", "manage_roles", "view_all_complaints", "manage_all_complaints", "manage_sla_rules", "view_analytics", "view_audit_logs", "manage_system_settings"]'::jsonb),
  ('admin', 'Department Administrator',
    '["manage_department_users", "view_department_complaints", "manage_department_complaints", "view_analytics", "manage_department_sla_rules", "create_complaint_notes"]'::jsonb),
  ('restaurant', 'Restaurant Operations User',
    '["view_restaurant_orders", "manage_restaurant_orders"]'::jsonb),
  ('laundry', 'Laundry Operations User',
    '["view_laundry_orders", "manage_laundry_orders"]'::jsonb),
  ('staff', 'Support Staff',
    '["view_assigned_complaints", "update_assigned_complaints", "add_complaint_notes", "view_complaint_chat"]'::jsonb),
  ('student', 'Student User',
    '["create_complaint", "view_own_complaints", "update_own_complaint", "view_complaint_chat"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_department_id ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_departments_head_id ON departments(head_id);

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
