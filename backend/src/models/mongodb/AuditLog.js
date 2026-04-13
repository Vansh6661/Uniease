const mongoose = require('mongoose');

/**
 * AuditLog Schema - Tracks all complaint system actions
 * Stored in MongoDB for flexible schema and efficient querying
 */
const auditLogSchema = new mongoose.Schema(
  {
    // Action type
    action: {
      type: String,
      required: true,
      enum: [
        'complaint_created',
        'complaint_updated',
        'status_changed',
        'assigned',
        'note_added',
        'complaint_reopened',
      ],
    },

    // User who performed action
    user_id: {
      type: String, // UUID string
      required: true,
    },

    user_name: {
      type: String,
      required: true,
    },

    user_role: {
      type: String,
      enum: ['student', 'staff', 'admin', 'super_admin'],
    },

    // Complaint reference
    complaint_id: {
      type: String, // UUID string
      required: true,
    },

    complaint_number: {
      type: String, // CMP-001, CMP-002, etc.
      required: true,
    },

    // Old and new values for tracking changes
    old_value: mongoose.Schema.Types.Mixed,
    new_value: mongoose.Schema.Types.Mixed,

    // Additional context
    metadata: {
      reason: String, // Why status changed
      ip_address: String, // Optional
      user_agent: String, // Optional
      notes: String, // Additional context
    },

    // Timestamp - automatically set
    timestamp: {
      type: Date,
      default: Date.now,
      index: true, // Index for efficient queries
    },

    // For soft deletes
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  {
    collection: 'audit_logs',
    timestamps: false, // We handle timestamps manually
  }
);

// Indexes for efficient querying
auditLogSchema.index({ complaint_id: 1, timestamp: -1 });
auditLogSchema.index({ user_id: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 }); // For recent logs

/**
 * AuditLog Model Class
 */
class AuditLog {
  /**
   * Log a complaint action
   * @param {Object} logData
   * @returns {Promise<Object>} - Created log entry
   */
  static async logAction(logData) {
    try {
      const AuditLogModel = mongoose.model('AuditLog', auditLogSchema);

      const log = new AuditLogModel({
        action: logData.action,
        user_id: logData.userId,
        user_name: logData.userName,
        user_role: logData.userRole,
        complaint_id: logData.complaintId,
        complaint_number: logData.complaintNumber,
        old_value: logData.oldValue,
        new_value: logData.newValue,
        metadata: {
          reason: logData.reason,
          ip_address: logData.ipAddress,
          user_agent: logData.userAgent,
          notes: logData.notes,
        },
        timestamp: new Date(),
      });

      await log.save();
      return { success: true, data: log };
    } catch (error) {
      console.error('Error logging audit action:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all logs for a specific complaint
   * @param {String} complaintId
   * @returns {Promise<Array>}
   */
  static async getComplaintHistory(complaintId) {
    try {
      const AuditLogModel = mongoose.model('AuditLog', auditLogSchema);

      const logs = await AuditLogModel.find({
        complaint_id: complaintId,
        deleted_at: null,
      })
        .sort({ timestamp: -1 })
        .lean()
        .exec();

      return { success: true, data: logs };
    } catch (error) {
      console.error('Error fetching complaint history:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all actions by a user
   * @param {String} userId
   * @param {Number} daysBack - Optional: only get actions from last N days
   * @returns {Promise<Array>}
   */
  static async getUserActions(userId, daysBack = null) {
    try {
      const AuditLogModel = mongoose.model('AuditLog', auditLogSchema);

      let query = {
        user_id: userId,
        deleted_at: null,
      };

      if (daysBack) {
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - daysBack);
        query.timestamp = { $gte: dateThreshold };
      }

      const logs = await AuditLogModel.find(query)
        .sort({ timestamp: -1 })
        .lean()
        .exec();

      return { success: true, data: logs };
    } catch (error) {
      console.error('Error fetching user actions:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get audit logs by action type
   * @param {String} action
   * @param {Number} limit
   * @returns {Promise<Array>}
   */
  static async getLogsByAction(action, limit = 100) {
    try {
      const AuditLogModel = mongoose.model('AuditLog', auditLogSchema);

      const logs = await AuditLogModel.find({
        action,
        deleted_at: null,
      })
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean()
        .exec();

      return { success: true, data: logs };
    } catch (error) {
      console.error('Error fetching logs by action:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get recent audit logs
   * @param {Number} limit
   * @returns {Promise<Array>}
   */
  static async getRecentLogs(limit = 50) {
    try {
      const AuditLogModel = mongoose.model('AuditLog', auditLogSchema);

      const logs = await AuditLogModel.find({ deleted_at: null })
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean()
        .exec();

      return { success: true, data: logs };
    } catch (error) {
      console.error('Error fetching recent logs:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = AuditLog;
