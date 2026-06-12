import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/common/Spinner'; // Clean integration with your dark loading track

/**
 * Route protector component that checks authorization state and permissions
 * @param {Array} allowedRoles - Array of roles permitted to view this specific page
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  // --- PREMIUM MASKED LOADING TIMEOUT STAGE ---
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#060814', // Synchronized with global viewport background canvas
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <Spinner size="large" />
        
        {/* Animated Security Verification Feedback Text */}
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            marginTop: '1.5rem',
            fontSize: '0.825rem',
            fontWeight: '600',
            color: '#818CF8', // Electric Indigo Neon Accents
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            textShadow: '0 0 12px rgba(99, 102, 241, 0.3)'
          }}
        >
          Verifying Session Security...
        </motion.p>
      </div>
    );
  }

  // 1. If not authenticated at all, kick them back to login page
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. If authenticated but role doesn't have clearances, redirect to a safe fallback
  if (allowedRoles && !allowedRoles.includes(user.role?.toLowerCase())) {
    const roleFallback = user.role?.toLowerCase();
    
    // Dynamic internal routing fallback parameters tailored directly to role bounds
    let fallbackPath = '/login';
    if (roleFallback === 'admin') {
      fallbackPath = '/mgmt/analytics';
    } else if (roleFallback === 'manager') {
      fallbackPath = '/mgmt/menu';
    } else if (roleFallback === 'staff') {
      fallbackPath = '/mgmt/orders';
    } else if (roleFallback === 'customer') {
      fallbackPath = '/';
    }

    return <Navigate to={fallbackPath} replace />;
  }

  // 3. User passes validation -> Render requested nested layout route child components
  return <Outlet />;
};

export default ProtectedRoute;