import axios from 'axios';

// 1. Establish the base API endpoint configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Request Interceptor: Automatically attach JWT to outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // 🛡️ SECURITY GUARD: Filter out zombie literal strings to prevent server-side casting crashes
    if (token && token !== 'undefined' && token !== 'null' && token.trim() !== '') {
      config.headers.Authorization = `Bearer ${token}`; // Matches backend token expectations perfectly
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Response Interceptor: Catch global errors & token expiration
api.interceptors.response.use(
  (response) => response, // Pass successful responses straight through
  (error) => {
    // 🛡️ Handshake Error Normalization
    // Unboxes customized backend validation strings so services can catch error message variations cleanly
    if (error.response && error.response.data) {
      error.message = error.response.data.msg || error.response.data.message || error.response.data.error || error.message;
    }

    // 🛑 Session Expiration Guard (Handles unexpected 401 Unauthorizations reactively)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token'); // Clear corrupted/expired session credentials safely
      localStorage.removeItem('user');  // Clear user profile context simultaneously
      
      // 🛡️ CORRECTION: Wiped out window.location.href. 
      // Letting your client application state handle session expiration reactively 
      // prevents unhandled context exceptions during state transitions.
      
      // Optional: Dispatch a custom window event if you want your AuthContext 
      // to listen and instantly trigger setUser(null) from anywhere outside components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-session-expired'));
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;