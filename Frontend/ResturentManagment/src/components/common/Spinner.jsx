import React from 'react';
import { motion } from 'framer-motion';

const Spinner = ({ size = 'medium', fullPage = false }) => {
  
  const getSizeDimensions = () => {
    switch (size) {
      case 'small': return { dimension: '1.75rem', stroke: '2.5px' };
      case 'large': return { dimension: '4rem', stroke: '5px' };
      case 'medium':
      default: return { dimension: '2.75rem', stroke: '4px' };
    }
  };

  const { dimension, stroke } = getSizeDimensions();

  const spinnerElement = (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      gap: '1rem',
      transform: 'translateZ(50px)' // Elevates the loader visually on the Z-axis
    }}>
      <div style={{ position: 'relative', width: dimension, height: dimension }}>
        
        {/* Background Track - Subtle Frosted Neon Rim */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          border: `${stroke} solid rgba(99, 102, 241, 0.1)`,
          boxSizing: 'border-box'
        }} />

        {/* Active Animated Spinner Head with Ambient Outer Glow */}
        <motion.div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: `${stroke} solid transparent`,
            borderTop: `${stroke} solid #6366F1`, // Premium Cyber Indigo Accent
            boxSizing: 'border-box',
            filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.6))'
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      </div>
    </div>
  );

  if (fullPage) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(6, 8, 20, 0.75)', // Deep space backdrop coat
          backdropFilter: 'blur(12px)',            // Luxury Frosted Glass effect
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999, // Overrides all other admin panel elements
          perspective: '1000px'
        }}
      >
        {spinnerElement}
      </motion.div>
    );
  }

  return (
    <div style={{ 
      padding: '2.5rem 0', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      width: '100%' 
    }}>
      {spinnerElement}
    </div>
  );
};

export default Spinner;