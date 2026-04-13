import apiClient from './authAPI';

/**
 * Place a food order
 * @param {Object} payload - { restaurant, items, totalAmount }
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export const placeFoodOrder = async (payload) => {
  try {
    console.log('[foodAPI] Sending place order request', payload);
    const response = await apiClient.post('/food/orders', payload);
    console.log('[foodAPI] Place order response', response.data);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || 'Failed to place order';
    console.error('[foodAPI] Place order failed', message, error.response?.data);
    return {
      success: false,
      error: message,
    };
  }
};

/**
 * Fetch restaurant orders for dashboard
 * @param {string} restaurant
 * @param {boolean} includeCompleted - Whether to include completed orders
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export const fetchRestaurantOrders = async (restaurant, includeCompleted = true) => {
  try {
    const queryParam = includeCompleted ? '?showCompleted=true' : '';
    console.log('[foodAPI] Fetching restaurant orders', { restaurant, includeCompleted });
    const response = await apiClient.get(`/food/orders/restaurant/${restaurant}${queryParam}`);
    console.log('[foodAPI] Restaurant orders response', response.data);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || 'Failed to fetch restaurant orders';
    console.error('[foodAPI] Restaurant orders failed', message, error.response?.data);
    return {
      success: false,
      error: message,
    };
  }
};

/**
 * Fetch logged in restaurant's own orders
 * @param {boolean} includeCompleted - Whether to include completed orders
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export const fetchMyRestaurantOrders = async (includeCompleted = true) => {
  try {
    const queryParam = includeCompleted ? '?showCompleted=true' : '';
    console.log('[foodAPI] Fetching my restaurant orders', { includeCompleted });
    const response = await apiClient.get(`/food/orders/my-restaurant${queryParam}`);
    console.log('[foodAPI] My restaurant orders response', response.data);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || 'Failed to fetch restaurant orders';
    console.error('[foodAPI] My restaurant orders failed', message, error.response?.data);
    return {
      success: false,
      error: message,
    };
  }
};

/**
 * Update order status
 * @param {string} orderId
 * @param {string} status - pending, accepted, in_progress, completed, rejected
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    console.log('[foodAPI] Updating order status', { orderId, status });
    const response = await apiClient.post(`/food/orders/${orderId}/status`, { status });
    console.log('[foodAPI] Order status update response', response.data);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || 'Failed to update order status';
    console.error('[foodAPI] Update order status failed', message, error.response?.data);
    return {
      success: false,
      error: message,
    };
  }
};


/**
 * Fetch logged-in user's orders (student)
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export const fetchMyOrders = async () => {
  try {
    console.log('[foodAPI] Fetching my orders');
    const response = await apiClient.get('/food/orders/my-orders');
    console.log('[foodAPI] My orders response', response.data);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || 'Failed to fetch orders';
    console.error('[foodAPI] Fetch my orders failed', message, error.response?.data);
    return {
      success: false,
      error: message,
    };
  }
};
