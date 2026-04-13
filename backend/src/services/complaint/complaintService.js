const pool = require('../../config/database');
const AuditLog = require('../../models/mongodb/AuditLog');
const { COMPLAINT_STATUSES } = require('../../config/constants');

/**
 * ComplaintService - Handles all complaint business logic
 * Manages database operations, audit logging, and validation
 */
class ComplaintService {
  /**
   * Generate unique complaint number (CMP-001, CMP-002, etc.)
   * @returns {Promise<String>}
   */
  static async generateComplaintNumber() {
    try {
      const result = await pool.query(
        'SELECT COUNT(*) as count FROM complaints WHERE deleted_at IS NULL'
      );
      const count = parseInt(result.rows[0].count) + 1;
      return `CMP-${String(count).padStart(3, '0')}`;
    } catch (error) {
      console.error('Error generating complaint number:', error);
      throw error;
    }
  }

  /**
   * Create a new complaint
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  static async createComplaint(data) {
    const {
      studentId,
      title,
      description,
      category,
      priority = 'medium',
      userName,
    } = data;

    try {
      // Validate inputs
      if (!studentId || !title || !description || !category) {
        return {
          success: false,
          error: 'Missing required fields: studentId, title, description, category',
        };
      }

      if (title.length < 5) {
        return { success: false, error: 'Title must be at least 5 characters' };
      }

      if (description.length < 10) {
        return {
          success: false,
          error: 'Description must be at least 10 characters',
        };
      }

      // Generate complaint number
      const complaintNumber = await this.generateComplaintNumber();

      // Insert into database
      const query = `
        INSERT INTO complaints (
          complaint_number, student_id, title, description, category,
          status, priority, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id, complaint_number, student_id, title, description,
                  category, status, priority, created_at, updated_at
      `;

      const result = await pool.query(query, [
        complaintNumber,
        studentId,
        title,
        description,
        category,
        COMPLAINT_STATUSES.OPEN,
        priority,
      ]);

      const complaint = result.rows[0];

      // Log to audit trail
      await AuditLog.logAction({
        action: 'complaint_created',
        userId: studentId,
        userName: userName || 'Unknown',
        userRole: 'student',
        complaintId: complaint.id,
        complaintNumber: complaint.complaint_number,
        newValue: complaint,
        reason: 'Complaint filed by student',
      });

      return { success: true, data: complaint };
    } catch (error) {
      console.error('Error creating complaint:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get complaints by student (only their own)
   * @param {String} studentId
   * @returns {Promise<Object>}
   */
  static async getComplaintsByStudent(studentId) {
    try {
      const query = `
        SELECT
          c.id, c.complaint_number, c.student_id, c.title,
          c.description, c.category, c.status, c.priority,
          c.assigned_to, c.created_at, c.updated_at,
          c.resolved_at,
          json_build_object('id', u.id, 'name', u.name, 'email', u.email) as assigned_user
        FROM complaints c
        LEFT JOIN users u ON c.assigned_to = u.id
        WHERE c.student_id = $1 AND c.deleted_at IS NULL
        ORDER BY c.created_at DESC
      `;

      const result = await pool.query(query, [studentId]);
      return { success: true, data: result.rows };
    } catch (error) {
      console.error('Error fetching student complaints:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all complaints (admin view)
   * @param {Object} filters
   * @returns {Promise<Object>}
   */
  static async getAllComplaints(filters = {}) {
    try {
      let query = `
        SELECT
          c.id, c.complaint_number, c.student_id, c.title,
          c.description, c.category, c.status, c.priority,
          c.assigned_to, c.created_at, c.updated_at, c.resolved_at,
          json_build_object('id', s.id, 'name', s.name, 'email', s.email) as student,
          json_build_object('id', u.id, 'name', u.name, 'email', u.email) as assigned_user
        FROM complaints c
        JOIN users s ON c.student_id = s.id
        LEFT JOIN users u ON c.assigned_to = u.id
        WHERE c.deleted_at IS NULL
      `;

      const queryParams = [];
      let paramCount = 1;

      if (filters.status) {
        query += ` AND c.status = $${paramCount}`;
        queryParams.push(filters.status);
        paramCount++;
      }

      if (filters.category) {
        query += ` AND c.category = $${paramCount}`;
        queryParams.push(filters.category);
        paramCount++;
      }

      if (filters.priority) {
        query += ` AND c.priority = $${paramCount}`;
        queryParams.push(filters.priority);
        paramCount++;
      }

      if (filters.assignedTo) {
        query += ` AND c.assigned_to = $${paramCount}`;
        queryParams.push(filters.assignedTo);
        paramCount++;
      }

      query += ' ORDER BY c.created_at DESC';

      // Add pagination if provided
      if (filters.limit) {
        query += ` LIMIT $${paramCount}`;
        queryParams.push(filters.limit);
        paramCount++;

        if (filters.offset) {
          query += ` OFFSET $${paramCount}`;
          queryParams.push(filters.offset);
        }
      }

      const result = await pool.query(query, queryParams);
      return { success: true, data: result.rows };
    } catch (error) {
      console.error('Error fetching all complaints:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get single complaint by ID
   * @param {String} complaintId
   * @returns {Promise<Object>}
   */
  static async getComplaintById(complaintId) {
    try {
      const query = `
        SELECT
          c.id, c.complaint_number, c.student_id, c.title,
          c.description, c.category, c.status, c.priority,
          c.assigned_to, c.created_at, c.updated_at, c.resolved_at,
          json_build_object('id', s.id, 'name', s.name, 'email', s.email) as student,
          json_build_object('id', u.id, 'name', u.name, 'email', u.email) as assigned_user
        FROM complaints c
        JOIN users s ON c.student_id = s.id
        LEFT JOIN users u ON c.assigned_to = u.id
        WHERE c.id = $1 AND c.deleted_at IS NULL
      `;

      const result = await pool.query(query, [complaintId]);

      if (result.rows.length === 0) {
        return { success: false, error: 'Complaint not found' };
      }

      return { success: true, data: result.rows[0] };
    } catch (error) {
      console.error('Error fetching complaint by ID:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update complaint status with audit trail
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  static async updateComplaintStatus(data) {
    const { complaintId, newStatus, changedByUserId, reason, userName, userRole } =
      data;

    try {
      // Get current complaint
      const currentResult = await pool.query(
        'SELECT status, complaint_number FROM complaints WHERE id = $1 AND deleted_at IS NULL',
        [complaintId]
      );

      if (currentResult.rows.length === 0) {
        return { success: false, error: 'Complaint not found' };
      }

      const oldStatus = currentResult.rows[0].status;
      const complaintNumber = currentResult.rows[0].complaint_number;

      // Validate status transition
      const validTransitions = {
        open: [
          COMPLAINT_STATUSES.ASSIGNED,
          COMPLAINT_STATUSES.REOPENED,
          COMPLAINT_STATUSES.CLOSED,
        ],
        assigned: [
          COMPLAINT_STATUSES.IN_PROGRESS,
          COMPLAINT_STATUSES.REOPENED,
          COMPLAINT_STATUSES.OPEN,
        ],
        in_progress: [
          COMPLAINT_STATUSES.RESOLVED,
          COMPLAINT_STATUSES.REOPENED,
          COMPLAINT_STATUSES.ASSIGNED,
        ],
        resolved: [
          COMPLAINT_STATUSES.CLOSED,
          COMPLAINT_STATUSES.REOPENED,
        ],
        closed: [COMPLAINT_STATUSES.REOPENED],
        reopened: [
          COMPLAINT_STATUSES.OPEN,
          COMPLAINT_STATUSES.ASSIGNED,
          COMPLAINT_STATUSES.IN_PROGRESS,
        ],
      };

      if (!validTransitions[oldStatus]?.includes(newStatus)) {
        return {
          success: false,
          error: `Invalid status transition from ${oldStatus} to ${newStatus}`,
        };
      }

      // Update both status and updated_at
      const resolvedAt = newStatus === COMPLAINT_STATUSES.CLOSED ? new Date() : null;

      const updateQuery = `
        UPDATE complaints
        SET status = $1, updated_at = CURRENT_TIMESTAMP, resolved_at = $2
        WHERE id = $3
        RETURNING id, complaint_number, status, updated_at
      `;

      const updateResult = await pool.query(updateQuery, [
        newStatus,
        resolvedAt,
        complaintId,
      ]);

      const updatedComplaint = updateResult.rows[0];

      // Log status change
      await AuditLog.logAction({
        action: 'status_changed',
        userId: changedByUserId,
        userName: userName || 'Unknown',
        userRole: userRole || 'admin',
        complaintId,
        complaintNumber,
        oldValue: { status: oldStatus },
        newValue: { status: newStatus },
        reason: reason || 'No reason provided',
      });

      // Also log to complaint_status_logs table for quick reference
      await pool.query(
        `INSERT INTO complaint_status_logs
         (complaint_id, old_status, new_status, changed_by, reason)
         VALUES ($1, $2, $3, $4, $5)`,
        [complaintId, oldStatus, newStatus, changedByUserId, reason]
      );

      return { success: true, data: updatedComplaint };
    } catch (error) {
      console.error('Error updating complaint status:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Assign complaint to staff member
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  static async assignComplaintToStaff(data) {
    const { complaintId, staffId, assignedByUserId, userName, userRole } = data;

    try {
      // Get current complaint
      const currentResult = await pool.query(
        'SELECT assigned_to, complaint_number FROM complaints WHERE id = $1 AND deleted_at IS NULL',
        [complaintId]
      );

      if (currentResult.rows.length === 0) {
        return { success: false, error: 'Complaint not found' };
      }

      const oldAssignedTo = currentResult.rows[0].assigned_to;
      const complaintNumber = currentResult.rows[0].complaint_number;

      // Assign to staff
      const updateQuery = `
        UPDATE complaints
        SET assigned_to = $1, status = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING id, assigned_to, status, complaint_number
      `;

      const updateResult = await pool.query(updateQuery, [
        staffId,
        COMPLAINT_STATUSES.ASSIGNED,
        complaintId,
      ]);

      const updatedComplaint = updateResult.rows[0];

      // Log assignment
      await AuditLog.logAction({
        action: 'assigned',
        userId: assignedByUserId,
        userName: userName || 'Unknown',
        userRole: userRole || 'admin',
        complaintId,
        complaintNumber,
        oldValue: { assigned_to: oldAssignedTo },
        newValue: { assigned_to: staffId },
        reason: 'Assigned to staff member',
      });

      return { success: true, data: updatedComplaint };
    } catch (error) {
      console.error('Error assigning complaint:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get complaint audit history (from MongoDB)
   * @param {String} complaintId
   * @returns {Promise<Object>}
   */
  static async getComplaintHistory(complaintId) {
    try {
      const history = await AuditLog.getComplaintHistory(complaintId);
      return history;
    } catch (error) {
      console.error('Error fetching complaint history:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = ComplaintService;
