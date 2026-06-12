import { createContext, useState, useEffect } from 'react';
import api from '../services/api'; // Synchronized central Axios client infrastructure
import { authService } from '../services/authService'; // Fixed import path matching your .service.js file suffix

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Check for an existing token on app initialization
   * Safeguarded against network unhandled rejections and session race conditions
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // 🛡️ CRITICAL GUARD 1: Prevent empty, null, undefined, or zombie string values 
        // from making a network call to the backend.
        if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
          // Explicitly cleanup disk storage and memory without hitting the network
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setLoading(false);
          return;
        }

        // Fetch current profile data from backend to verify token validity using our unified service layer
        const profileData = await authService.getCurrentProfile();
        
        // 🛡️ ENVELOPE SAFETY GUARD: Extracts nested user object if wrapped in an API success state response
        const resolvedProfile = profileData?.user || profileData?.data || profileData;
        
        if (resolvedProfile) {
          setUser(resolvedProfile); // Unboxed user context data containing: { id, name, email, role }
        } else {
          // Fallback if the token is present but user profile payload resolves corrupted/empty
          logout();
        }
      } catch (err) {
        console.error('Authentication initialization caught a network/validation error:', err.message);
        
        // 🛡️ CRITICAL GUARD 2: Force-clear state parameters *locally* in-memory 
        // even if the server throws a 500 error, breaks down, or goes completely offline.
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setError(err.message || 'Session expired.');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Listen for automated 401 response interceptor expiration triggers globally
   */
  useEffect(() => {
    const handleSessionExpiredEvent = () => {
      console.warn("Session token validation collapsed dynamically. Routing context cleanly out.");
      logout(); // Triggers instant local state wipe -> Protected routes flip instantly without reloads
    };

    window.addEventListener('auth-session-expired', handleSessionExpiredEvent);
    return () => {
      window.removeEventListener('auth-session-expired', handleSessionExpiredEvent);
    };
  }, []);

  /**
   * Handle user login operations across all system authorization domains
   */
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      // Handshake executed natively via the centralized storage service layer
      const responseData = await authService.login(email, password);
      
      const resolvedUser = responseData?.user || responseData?.data || responseData;
      setUser(resolvedUser);
      
      return resolvedUser; // Returns clean user properties so components can navigate on the fly depending on role flags
    } catch (err) {
      // Global error interceptor unboxes deep validation structures smoothly onto err.message
      const errorMsg = err.message || 'Login failed. Please check credentials.';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle public customer self-registration requests
   */
  const register = async (registrationPayload) => {
    setLoading(true);
    setError(null);
    try {
      const responseData = await authService.register(registrationPayload);
      
      const resolvedUser = responseData?.user || responseData?.data || responseData;
      setUser(resolvedUser);
      
      return resolvedUser;
    } catch (err) {
      const errorMsg = err.message || 'Registration process failed.';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle application-wide logout and security sweep operations
   * FIX: Resets states immediately inside React memory to trigger an instantaneous UI re-render
   */
  const logout = () => {
    authService.logout(); // Invokes disk storage cleanup wrapper (removes token and user cache keys)
    
    // 🔥 IMMEDIATE STATE FLUSH: Prevents "zombie session" components from staying mounted
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register, // Exposed context function for your front-end onboarding forms
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role?.toLowerCase() === 'admin',
    isManager: user?.role?.toLowerCase() === 'manager',
    isStaff: user?.role?.toLowerCase() === 'staff',
    isCustomer: user?.role?.toLowerCase() === 'customer'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};