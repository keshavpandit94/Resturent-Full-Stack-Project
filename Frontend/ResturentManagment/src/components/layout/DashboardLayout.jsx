import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = ({ children, title }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Dynamic window breakpoint monitoring
  useEffect(() => {
    const handleResize = () => {
      const mobileView = window.innerWidth <= 1024;
      setIsMobile(mobileView);
      // Auto-collapse sidebar by default on mobile viewports
      if (mobileView) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize(); // Initialize check on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#060814', // Immersive premium dark canvas
      display: 'flex',
      flexDirection: 'row',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      overflowX: 'hidden',
      position: 'relative'
    }}>
      
      {/* 1. MOBILE BACKDROP MASK PANEL */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)} // Tap outside area to collapse sidebar frame
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(3, 7, 18, 0.6)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 40,
            }}
          />
        )}
      </AnimatePresence>

      {/* 2. RESPONSIVE NAVIGATION CONTROL PANEL */}
      <div style={{ 
        position: isMobile ? 'fixed' : 'relative',
        zIndex: 50,
        height: '100vh'
      }}>
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} isMobile={isMobile} />
      </div>

      {/* 3. MAIN WORKSPACE CONTENT CANVAS */}
      <motion.div 
        animate={{ 
          paddingLeft: isMobile ? '0px' : (isSidebarOpen ? '260px' : '80px') 
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ 
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minWidth: 0,
          minHeight: '100vh'
        }}
      >
        {/* Contextual Fixed Header Bar with state controller injection */}
        <Navbar 
          pageTitle={title} 
          toggleSidebar={toggleSidebar} 
          isSidebarOpen={isSidebarOpen} 
          isMobile={isMobile} 
        />

        {/* Dynamic Nested Content Stage */}
        <motion.main 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{ 
            padding: isMobile ? '1.25rem' : '2rem', 
            marginTop: '64px', // Clears the fixed top navigation header height
            boxSizing: 'border-box',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            color: '#F9FAFB' // Premium light-gray text targeting readability on dark backgrounds
          }}
        >
          {children}
        </motion.main>
      </motion.div>
    </div>
  );
};

export default DashboardLayout;