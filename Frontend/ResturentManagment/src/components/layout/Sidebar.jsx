import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = ({ isOpen, setIsOpen, isMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navigationLinks = [
    { path: '/mgmt/orders', label: 'Active Orders', roles: ['staff', 'manager', 'admin'], icon: '📋' },
    { path: '/mgmt/menu', label: 'Menu Management', roles: ['manager', 'admin'], icon: '🍔' },
    { path: '/mgmt/payments', label: 'Payment Logs', roles: ['manager', 'admin'], icon: '💳' },
    { path: '/mgmt/account/create', label: 'Account Control Panel', roles: ['manager', 'admin'], icon: '👥' },
    { path: '/mgmt/analytics', label: 'System Analytics', roles: ['admin'], icon: '📈' }
  ];

  const currentUserRole = user?.role?.toLowerCase();
  const allowedLinks = navigationLinks.filter(link => 
    link.roles.some(role => role.toLowerCase() === currentUserRole)
  );

  // Dynamic style calculation for navigation anchors
  const getLinkStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    padding: '0.8rem 1rem',
    color: isActive ? '#FFFFFF' : '#9CA3AF',
    background: isActive 
      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(79, 70, 229, 0.1) 100%)' 
      : 'transparent',
    textDecoration: 'none',
    borderRadius: '0.625rem',
    fontWeight: isActive ? '600' : '500',
    fontSize: '0.925rem',
    border: `1px solid ${isActive ? 'rgba(99, 102, 241, 0.3)' : 'transparent'}`,
    boxShadow: isActive ? '0 4px 15px rgba(99, 102, 241, 0.15)' : 'none',
    transition: 'color 0.2s ease, border-color 0.2s ease',
    marginBottom: '0.4rem',
    position: 'relative'
  });

  return (
    <aside style={{
      width: '260px',
      height: '100vh',
      backgroundColor: 'rgba(11, 15, 25, 0.85)', // Cinematic deep-space frost shield
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255, 255, 255, 0.06)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      boxSizing: 'border-box',
      zIndex: 100,
      // Uses the structural states derived from DashboardLayout for off-canvas drawer slides
      transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      
      {/* 1. BRANDING HEADER PANEL */}
      <div style={{
        padding: '1.5rem 1.75rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <span style={{ fontSize: '1.4rem', filter: 'drop-shadow(0 2px 8px rgba(249,115,22,0.3))' }}>🍳</span>
          <h1 style={{ 
            margin: 0, 
            fontSize: '1.25rem', 
            fontWeight: '800', 
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #9CA3AF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            FeastFlow
          </h1>
        </div>
        
        {/* Mobile close toggle button anchor */}
        {isMobile && (
          <button 
            onClick={() => setIsOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#6B7280',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '4px'
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* 2. NAVIGATION LINKS SCROLL AREA */}
      <nav style={{ flex: 1, padding: '1.25rem 1rem', overflowY: 'auto' }}>
        {allowedLinks.map((link) => (
          <NavLink key={link.path} to={link.path} style={({ isActive }) => getLinkStyle(isActive)}>
            {({ isActive }) => (
              <>
                {/* Micro-glow indicator ring behind icons on active route profiles */}
                <span style={{ 
                  fontSize: '1.15rem',
                  filter: isActive ? 'drop-shadow(0 0 8px #6366F1)' : 'none' 
                }}>
                  {link.icon}
                </span>
                <span>{link.label}</span>
                
                {/* Subtly floats a 3D cyan pointer dot onto active pages */}
                {isActive && (
                  <motion.span 
                    layoutId="activeIndicator"
                    style={{
                      position: 'absolute',
                      right: '12px',
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      backgroundColor: '#6366F1',
                      boxShadow: '0 0 10px #6366F1'
                    }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* 3. PROFILE HUB & LOGOUT ACTION TRAY */}
      <div style={{
        padding: '1.25rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        background: 'rgba(255, 255, 255, 0.01)'
      }}>
        <div style={{ marginBottom: '1rem', padding: '0 0.5rem' }}>
          <p style={{ 
            margin: 0, 
            fontSize: '0.9rem', 
            fontWeight: '600', 
            color: '#FFFFFF', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap' 
          }}>
            {user?.name || 'Administrator'}
          </p>
          <p style={{ 
            margin: '0.15rem 0 0 0', 
            fontSize: '0.7rem', 
            color: '#6366F1', 
            textTransform: 'uppercase', 
            letterSpacing: '0.06em', 
            fontWeight: '700' 
          }}>
            System Clearance: {user?.role || 'Guest'}
          </p>
        </div>

        {/* Dynamic Dark Tech Logout Switch Target */}
        <motion.button
          onClick={handleLogout}
          whileHover={{ 
            scale: 1.01, 
            background: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 0.25)',
            color: '#EF4444'
          }}
          whileTap={{ scale: 0.99 }}
          style={{
            width: '100%',
            padding: '0.7rem',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            color: '#9CA3AF',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '0.5rem',
            fontWeight: '600',
            fontSize: '0.85rem',
            letterSpacing: '0.01em',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'color 0.2s ease, border-color 0.2s ease'
          }}
        >
          <span>🚪</span> Logout Session
        </motion.button>
      </div>
    </aside>
  );
};

export default Sidebar;