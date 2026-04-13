const express = require('express');
const router = express.Router();
const ComplaintService = require('../services/complaint/complaintService');
const { verifyJWT, requireRole } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

/**
 * Complaint Routes
 * All endpoints require JWT authentication (verifyJWT middleware)
 */

// ============ STUDENT ENDPOINTS ============

/**
 * POST /api/complaints
 * Create a new complaint
 * Required: JWT, student role implied
 */
router.post('/complaints', verifyJWT, async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;
    const studentId = req.user.userId;  // Use userId from JWT
    const userName = req.user.email;

    // Validate inputs
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, description, category',
      });
    }

    // Create complaint
    const result = await ComplaintService.createComplaint({
      studentId,
      title,
      description,
      category,
      priority: priority || 'medium',
      userName,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json({
      success: true,
      message: 'Complaint created successfully',
      data: result.data,
    });
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/complaints
 * Get complaints
 * - Student: sees only their own complaints
 * - Admin: sees all complaints with optional filters
 */
router.get('/complaints', verifyJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.roleName;
    const { status, category, priority, assigned_to, limit, offset } = req.query;

    // Students see only their own complaints
    if (userRole === ROLES.STUDENT) {
      const result = await ComplaintService.getComplaintsByStudent(userId);

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.json({
        success: true,
        data: result.data,
      });
    }

    // Admins see all complaints with filters
    if (
      userRole === ROLES.ADMIN ||
      userRole === ROLES.SUPER_ADMIN ||
      userRole === ROLES.STAFF
    ) {
      const filters = {
        status: status || null,
        category: category || null,
        priority: priority || null,
        assignedTo: assigned_to || null,
        limit: limit ? parseInt(limit) : 20,
        offset: offset ? parseInt(offset) : 0,
      };

      const result = await ComplaintService.getAllComplaints(filters);

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.json({
        success: true,
        data: result.data,
      });
    }

    res.status(403).json({
      success: false,
      error: 'Insufficient permissions',
    });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/complaints/:id
 * Get single complaint detail
 * - Student: can only see their own
 * - Admin/Staff: can see any
 */
router.get('/complaints/:id', verifyJWT, async (req, res) => {
  try {
    const complaintId = req.params.id;
    const userId = req.user.userId;
    const userRole = req.user.roleName;

    const result = await ComplaintService.getComplaintById(complaintId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    const complaint = result.data;

    // Permission check: students can only see their own
    if (
      userRole === ROLES.STUDENT &&
      complaint.student_id !== userId
    ) {
      return res.status(403).json({
        success: false,
        error: 'You can only view your own complaints',
      });
    }

    // Get audit history
    const historyResult = await ComplaintService.getComplaintHistory(complaintId);

    res.json({
      success: true,
      data: {
        complaint: complaint,
        history: historyResult.success ? historyResult.data : [],
      },
    });
  } catch (error) {
    console.error('Error fetching complaint detail:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// ============ ADMIN/STAFF ENDPOINTS ============

/**
 * PATCH /api/complaints/:id/status
 * Update complaint status
 * Required: Admin, staff, or super_admin role
 */
router.patch(
  '/complaints/:id/status',
  verifyJWT,
  requireRole([ROLES.ADMIN, ROLES.STAFF, ROLES.SUPER_ADMIN]),
  async (req, res) => {
    try {
      const complaintId = req.params.id;
      const { status, reason } = req.body;
      const changedByUserId = req.user.userId;
      const userName = req.user.email;
      const userRole = req.user.roleName;

      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'Status is required',
        });
      }

      const result = await ComplaintService.updateComplaintStatus({
        complaintId,
        newStatus: status,
        changedByUserId,
        reason,
        userName,
        userRole,
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        message: 'Complaint status updated successfully',
        data: result.data,
      });
    } catch (error) {
      console.error('Error updating complaint status:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
);

/**
 * PATCH /api/complaints/:id/assign
 * Assign complaint to staff member
 * Required: Admin or super_admin role
 */
router.patch(
  '/complaints/:id/assign',
  verifyJWT,
  requireRole([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  async (req, res) => {
    try {
      const complaintId = req.params.id;
      const { staff_id } = req.body;
      const assignedByUserId = req.user.userId;
      const userName = req.user.email;
      const userRole = req.user.roleName;

      if (!staff_id) {
        return res.status(400).json({
          success: false,
          error: 'staff_id is required',
        });
      }

      const result = await ComplaintService.assignComplaintToStaff({
        complaintId,
        staffId: staff_id,
        assignedByUserId,
        userName,
        userRole,
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        message: 'Complaint assigned successfully',
        data: result.data,
      });
    } catch (error) {
      console.error('Error assigning complaint:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
);

module.exports = router;
