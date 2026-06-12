import api from './api';

export const mgmtService = {
  /**
   * Hierarchical User Account Registration
   * @route POST /api/mgmt/account/create
   * @access Private (Admin / Manager)
   */
  createAccount: async (userData) => {
    const response = await api.post('/mgmt/account/create', userData);
    return response.data; 
  },

  /**
   * Fetch Staff and Managers with Scoped Boundary Filters
   * @route GET /api/mgmt/staff/all
   * @access Private (Admin / Manager)
   */
  getStaffList: async () => {
    const response = await api.get('/mgmt/staff/all');
    return response.data?.staff || []; 
  },

  /**
   * Modify Core Demographics, Roles, Passwords, or Supervisor Assignments
   * @route PUT /api/mgmt/users/:id
   * @access Private (Admin / Manager)
   */
  updateAccount: async (userId, updatePayload) => {
    // ✏️ Added dynamic updates mapping to connect with the backend PUT handler seamlessly
    const response = await api.put(`/mgmt/users/${userId}`, updatePayload);
    return response.data;
  },

  /**
   * Mutate Status Parameter / Permanent Deactivation of Employee Accounts
   * @route DELETE /api/mgmt/users/:id
   * @access Private (Admin / Manager)
   */
  deactivateAccount: async (userId) => {
    const response = await api.delete(`/mgmt/users/${userId}`);
    return response.data;
  },

  /**
   * Provision a brand new recipe/dish item with media assets
   * @route   POST /api/mgmt/menu/add
   * @access  Private (Admin / Manager)
   * @param   {FormData} multipartPayload - Form data object containing text and file binary
   */
  addDish: async (multipartPayload) => {
    const response = await api.post('/mgmt/menu/add', multipartPayload, {
      headers: {
        'Content-Type': 'multipart/form-data' // Overrides application/json context configuration for binary tracking
      }
    });
    return response.data;
  },

  /**
   * Modify properties or change the image asset of an existing dish
   * @route   PUT /api/mgmt/menu/:id
   * @access  Private (Admin / Manager)
   * @param   {string} itemId - Target Mongo ObjectId reference
   * @param   {FormData} multipartPayload - Text and file update payload attributes
   */
  updateDish: async (itemId, multipartPayload) => {
    const response = await api.put(`/mgmt/menu/${itemId}`, multipartPayload, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  /**
   * Toggle Stock Inventory Parameters on Active Recipes
   * @route PATCH /api/mgmt/menu/:id/toggle
   * @access Private (Admin / Manager)
   */
  toggleMenuAvailability: async (itemId, isAvailable) => {
    const response = await api.patch(`/mgmt/menu/${itemId}/toggle`, { isAvailable });
    return response.data; 
  },

  /**
   * Fetch Real-Time Kitchen Active Orders Queue
   * @route GET /api/mgmt/orders/active
   * @access Private (Admin / Manager / Staff)
   */
  getActiveOrders: async () => {
    const response = await api.get('/mgmt/orders/active');
    return Array.isArray(response.data) ? response.data : response.data?.orders || [];
  },

  /**
   * Mutate Status Tag Parameters on Active Tickets
   * @route PUT /api/mgmt/orders/:id/status
   * @access Private (Admin / Manager / Staff)
   */
  updateOrderStatus: async (orderId, status) => {
    const response = await api.put(`/mgmt/orders/${orderId}/status`, { status });
    return response.data?.order || response.data; 
  },

  /**
   * Aggregate Historical System Payments Logs
   * @route GET /api/mgmt/payments/all
   * @access Private (Admin / Manager)
   */
  getAllPayments: async () => {
    const response = await api.get('/mgmt/payments/all');
    return response.data?.transactions || [];
  },

  /**
   * Extract Pipeline Telemetry Performance Aggregates (Admin Only)
   * @route GET /api/mgmt/analytics/revenue
   * @access Private (Admin)
   */
  getSystemAnalytics: async () => {
    const response = await api.get('/mgmt/analytics/revenue');
    return {
      totalRevenue: response.data?.totalRevenue || 0,
      activeStaffCount: response.data?.activeStaffCount || 0,
      currency: response.data?.currency || 'INR'
    };
  }
};