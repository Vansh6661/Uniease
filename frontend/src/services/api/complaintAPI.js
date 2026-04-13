import apiClient from './authAPI';

/**
 * Fetch all complaints with optional filters
 * @param {Object} filters - { status, category, priority, assigned_to, limit, offset }
 * @returns {Promise} - { success, data }
 */
export const fetchComplaints = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (filters.status) queryParams.append('status', filters.status);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.priority) queryParams.append('priority', filters.priority);
    if (filters.assigned_to) queryParams.append('assigned_to', filters.assigned_to);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.offset) queryParams.append('offset', filters.offset);

    const response = await apiClient.get(`/complaints?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch complaints',
    };
  }
};

/**
 * Fetch single complaint by ID
 * @param {string} id - Complaint ID
 * @returns {Promise} - { success, data }
 */
export const fetchComplaintById = async (id) => {
  try {
    const response = await apiClient.get(`/complaints/${id}`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch complaint',
    };
  }
};

/**
 * Update complaint status
 * @param {string} id - Complaint ID
 * @param {string} status - New status
 * @param {string} reason - Reason for status change (optional)
 * @returns {Promise} - { success, data }
 */
export const updateComplaintStatus = async (id, status, reason = '') => {
  try {
    const response = await apiClient.patch(`/complaints/${id}/status`, {
      status,
      reason,
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to update complaint status',
    };
  }
};

/**
 * Assign complaint to staff member
 * @param {string} id - Complaint ID
 * @param {string} staffId - Staff member ID
 * @returns {Promise} - { success, data }
 */
export const assignComplaint = async (id, staffId) => {
  try {
    const response = await apiClient.patch(`/complaints/${id}/assign`, {
      staff_id: staffId,
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to assign complaint',
    };
  }
};

/**
 * Create new complaint
 * @param {Object} data - { title, description, category, priority }
 * @returns {Promise} - { success, data }
 */
export const createComplaint = async (data) => {
  try {
    const response = await apiClient.post('/complaints', data);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to create complaint',
    };
  }
};
