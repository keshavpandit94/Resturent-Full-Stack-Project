import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

const Navbar = ({ 
  pageTitle = 'Management Panel', 
  toggleSidebar, 
  isSidebarOpen, 
  isMobile 
}) => {
  const { user } = useAuth();

  const formatRole = (role) => {
    if (!role) return 'User';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  // Maps runtime user access profile roles cleanly to customized neon palettes
  const getRoleTheme = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return {
          bg: 'rgba(99, 102, 241, 0.1)',
          border: 'rgba(99, 102, 241, 0.25)',
          color: '#818CF8',
          avatarGlow: 'rgba(99, 102, 241, 0.4)'
        };
      case 'manager':
        return {
          bg: 'rgba(245, 158, 11, 0.1)',
          border: 'rgba(245, 158, 11, 0.25)',
          color: '#FBBF24',
          avatarGlow: 'rgba(245, 158, 11, 0.4)'
        };
      default:
        return {
          bg: 'rgba(6, 182, 212, 0.1)',
          border: 'rgba(6, 182, 212, 0.25)',
          color: '#22D3EE',
          avatarGlow: 'rgba(6, 182, 212, 0.4)'
        };
    }
  };

  const roleTheme = getRoleTheme(user?.role);

  // Calculates responsive width adjustments based on sidebar configurations
  const getResponsiveLeftPosition = () => {
    if (isMobile) return '0px';
    return isSidebarOpen ? '260px' : '80px';
  };

  return (
    <header style={{
      height: '64px',
      background: 'rgba(11, 15, 25, 0.7)', // Sleek space glass backing sheet
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'fixed',
      top: 0,
      right: 0,
      left: getResponsiveLeftPosition(),
      boxSizing: 'border-box',
      zIndex: 40,
      transition: 'left 0.4s cubic-bezier(0.16, 1, 0.3, 1)' // Matches layout compression calculations
    }}>
      
      {/* LEFT PORTION: RESPONSIVE TOGGLE & TITLE SELECTION CONTAINER */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
        {/* Animated Mobile/Desktop Menu Drawer Switch Trigger Button */}
        <motion.button
          onClick={toggleSidebar}
          whileHover={{ scale: 1.08, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
          whileTap={{ scale: 0.92 }}
          style={{
            background: 'none',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '0.5rem',
            color: '#FFFFFF',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '1rem',
            outline: 'none'
          }}
        >
          {/* Renders hamburger or cross icons natively with simple orientation shifts */}
          <motion.div
            animate={{ rotate: isSidebarOpen && isMobile ? 90 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {isSidebarOpen && isMobile ? '✕' : '☰'}
          </motion.div>
        </motion.button>

        {/* The Page Title Header */}
        <h2 style={{ 
          margin: 0, 
          fontSize: '1.15rem', 
          fontWeight: '700', 
          color: '#FFFFFF',
          letterSpacing: '-0.01em'
        }}>
          {pageTitle}
        </h2>
      </div>

      {/* RIGHT PORTION: USER PERMISSIONS PROFILE IDENTITY CARD BANNER */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        
        {/* Dynamic Contextual Access Permission Level Badge */}
        <div style={{ textAlign: 'right' }}>
          <span style={{
            display: 'inline-block',
            padding: '0.3rem 0.75rem',
            fontSize: '0.7rem',
            fontWeight: '700',
            letterSpacing: '0.05em',
            borderRadius: '0.5rem',
            backgroundColor: roleTheme.bg,
            color: roleTheme.color,
            border: `1px solid ${roleTheme.border}`,
            textTransform: 'uppercase'
          }}>
            {formatRole(user?.role)}
          </span>
        </div>
        
        {/* Graphical Profile Node Floating Badge (3D Interaction Space) */}
        <motion.div
          whileHover={{ 
            scale: 1.05, 
            y: -1,
            boxShadow: `0 0 20px ${roleTheme.avatarGlow}` 
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${roleTheme.color} 0%, #060814 150%)`,
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '0.95rem',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            cursor: 'pointer',
            boxShadow: `0 4px 10px rgba(0, 0, 0, 0.3)`,
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)'
          }}
        >
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </motion.div>
      </div>
    </header>
  );
};

export default Navbar;