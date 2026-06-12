import api from './api';

export const authService = {
  /**
   * Submit credentials to obtain a session token
   * @route POST /api/auth/login
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    
    // Auto-cache session context locally upon a successful database validation response
    if (response.data?.success && response.data?.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user || {}));
    }
    
    return response.data; // Expected output envelope context: { success, token, user }
  },

  /**
   * Register a new public customer user profile account
   * @route POST /api/auth/register
   */
  register: async (registrationPayload) => {
    const response = await api.post('/auth/register', registrationPayload);
    
    // Auto-login and establish the session tracking if registration issues a valid token
    if (response.data?.success && response.data?.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user || {}));
    }
    
    return response.data;
  },

  /**
   * Verify session token and retrieve current user context profile data
   * @route GET /api/user/me
   */
  getCurrentProfile: async () => {
    const response = await api.get('/user/me');
    // Returns the unboxed user account profile body data cleanly
    return response.data;
  },

  /**
   * Terminate active token credentials from local storage arrays
   * FIX: Wiped out window.location hard refreshes to prevent UI blinking,
   * leaving your React state lifecycle layer to transition instantly.
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Cleanup complete. Handing over state clearing and route redirection 
    // seamlessly to your reactive context and router hooks.
  }
};