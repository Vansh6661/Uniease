module.exports = {
  // Roles and Permissions
  ROLES: {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    RESTAURANT: 'restaurant',
    LAUNDRY: 'laundry',
    STAFF: 'staff',
    STUDENT: 'student',
  },

  ROLE_PERMISSIONS: {
    super_admin: [
      'manage_users',
      'manage_departments',
      'manage_roles',
      'view_all_complaints',
      'manage_all_complaints',
      'manage_sla_rules',
      'view_analytics',
      'view_audit_logs',
      'manage_system_settings',
    ],
    admin: [
      'manage_department_users',
      'view_department_complaints',
      'manage_department_complaints',
      'view_analytics',
      'manage_department_sla_rules',
      'create_complaint_notes',
    ],
    restaurant: [
      'view_restaurant_orders',
      'manage_restaurant_orders',
    ],
    laundry: [
      'view_laundry_orders',
      'manage_laundry_orders',
    ],
    staff: [
      'view_assigned_complaints',
      'update_assigned_complaints',
      'add_complaint_notes',
      'view_complaint_chat',
    ],
    student: [
      'create_complaint',
      'view_own_complaints',
      'update_own_complaint',
      'view_complaint_chat',
    ],
  },

  // Complaint Statuses
  COMPLAINT_STATUSES: {
    OPEN: 'open',
    ASSIGNED: 'assigned',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
    CLOSED: 'closed',
    REOPENED: 'reopened',
  },

  // Complaint Categories
  COMPLAINT_CATEGORIES: [
    'Hostel & Accommodation',
    'Academic',
    'Canteen / Food',
    'Transport',
    'Infrastructure',
    'IT / Wi-Fi',
    'Medical',
    'Safety & Security',
    'Other',
  ],

  // Priority Levels
  PRIORITY_LEVELS: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
  },

  // SLA Status
  SLA_STATUS: {
    ON_TRACK: 'on_track',
    WARNING: 'warning',
    BREACHED: 'breached',
  },

  // User Status
  USER_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
  },

  // API Response Codes
  RESPONSE_CODES: {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_ERROR: 500,
  },
};
