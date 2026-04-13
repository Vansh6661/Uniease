import apiClient from './authAPI';

export const createLaundryOrder = async (items) => {
  try {
    const response = await apiClient.post('/laundry/orders', { items });
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to place laundry order',
    };
  }
};

export const fetchMyLaundryOrders = async () => {
  try {
    const response = await apiClient.get('/laundry/orders/my');
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch laundry orders',
    };
  }
};

export const fetchLaundryStaffOrders = async () => {
  try {
    const response = await apiClient.get('/laundry/orders/staff');
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch staff laundry orders',
    };
  }
};

export const updateLaundryOrderStatus = async ({ orderId, status, reason, deliveryToken }) => {
  try {
    const response = await apiClient.patch(`/laundry/orders/${orderId}/status`, {
      status,
      reason,
      deliveryToken,
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to update laundry order status',
    };
  }
};
