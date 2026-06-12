import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../features/auth/pages/LoginPage';
import ActiveOrders from '../features/mgmt/pages/ActiveOrders';
import MenuManagement from '../features/mgmt/pages/MenuManagement';
import AccountManagement from '../features/mgmt/pages/AccountManagement'; 
import Payments from '../features/mgmt/pages/Payments';
import Analytics from '../features/mgmt/pages/Analytics';

const AppRoutes = () => {
  // Captures current pathname tracking location so AnimatePresence knows exactly when routes mutate
  const location = useLocation();

  return (
    // mode="wait" forces the exiting view to fully disappear before the incoming view mounts
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        
        {/* Public Gateways */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* -----------------------------------------------------------
            TIER 1: SHARED ACCESS (Staff, Managers, and Admins)
            ----------------------------------------------------------- */}
        <Route element={<ProtectedRoute allowedRoles={['staff', 'manager', 'admin']} />}>
          <Route path="/mgmt/orders" element={
            <PageTransitionWrapper>
              <ActiveOrders />
            </PageTransitionWrapper>
          } />
        </Route>

        {/* -----------------------------------------------------------
            TIER 2: ELEVATED OPERATIONAL ACCESS (Managers and Admins)
            ----------------------------------------------------------- */}
        <Route element={<ProtectedRoute allowedRoles={['manager', 'admin']} />}>
          <Route path="/mgmt/menu" element={
            <PageTransitionWrapper>
              <MenuManagement />
            </PageTransitionWrapper>
          } />
          <Route path="/mgmt/payments" element={
            <PageTransitionWrapper>
              <Payments />
            </PageTransitionWrapper>
          } />
          <Route path="/mgmt/account/create" element={
            <PageTransitionWrapper>
              <AccountManagement />
            </PageTransitionWrapper>
          } />
        </Route>

        {/* -----------------------------------------------------------
            TIER 3: SYSTEM SUPERUSER ACCESS (Admins Only)
            ----------------------------------------------------------- */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/mgmt/analytics" element={
            <PageTransitionWrapper>
              <Analytics />
            </PageTransitionWrapper>
          } />
        </Route>

        {/* Root Path Management Logic */}
        <Route path="/" element={<Navigate to="/mgmt/orders" replace />} />

        {/* Wildcard Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

/**
 * --- INLINE SUB-COMPONENT HELPER: CINEMATIC PAGE TRANSITION WRAPPER ---
 * Supplies a hardware-accelerated slide-and-fade animation orchestration block.
 */
const PageTransitionWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.99 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.16, 1, 0.3, 1] // High-end luxury ease-out curve 
      }}
      style={{ 
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        flex: 1
      }}
    >
      {children}
    </motion.div>
  );
};

export default AppRoutes;