import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
  children,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'danger'
  loading = false,
  disabled = false,
  onClick,
  width = 'auto',
  style, // Inherits parent positioning overrides (like 3D shadows) cleanly
  ...props
}) => {
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          background: 'rgba(255, 255, 255, 0.05)',
          color: '#E5E7EB',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
          glowColor: 'rgba(255, 255, 255, 0.15)',
        };
      case 'danger':
        return {
          background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
          color: '#FEE2E2',
          border: '1px solid rgba(220, 38, 38, 0.2)',
          boxShadow: '0 4px 20px rgba(220, 38, 38, 0.25)',
          glowColor: 'rgba(220, 38, 38, 0.45)',
        };
      case 'primary':
      default:
        return {
          background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
          color: '#FFFFFF',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          boxShadow: '0 4px 25px rgba(99, 102, 241, 0.35)',
          glowColor: 'rgba(99, 102, 241, 0.55)',
        };
    }
  };

  const theme = getVariantStyles();
  const isButtonDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      disabled={isButtonDisabled}
      onClick={onClick}
      
      // --- Framer Motion Hardware Accelerated State Micro-Interactions ---
      whileHover={!isButtonDisabled ? { 
        scale: 1.02, 
        y: -1.5,
        boxShadow: `0 8px 30px ${theme.glowColor}, 0 0 10px rgba(255,255,255,0.1)`,
        filter: 'brightness(1.1)'
      } : {}}
      whileTap={!isButtonDisabled ? { 
        scale: 0.98, 
        y: 0 
      } : {}}
      transition={{ 
        type: 'spring', 
        stiffness: 400, 
        damping: 15 
      }}

      style={{
        width: width,
        padding: '0.8rem 1.5rem',
        fontSize: '0.95rem',
        fontWeight: '600',
        letterSpacing: '0.02em',
        background: isButtonDisabled ? 'rgba(255, 255, 255, 0.03)' : theme.background,
        color: isButtonDisabled ? '#4B5563' : theme.color,
        border: isButtonDisabled ? '1px solid rgba(255, 255, 255, 0.03)' : theme.border,
        borderRadius: '0.625rem', // Matched seamlessly with input fields
        boxShadow: isButtonDisabled ? 'none' : theme.boxShadow,
        cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.625rem',
        outline: 'none',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: variant === 'secondary' ? 'blur(8px)' : 'none',
        WebkitBackdropFilter: variant === 'secondary' ? 'blur(8px)' : 'none',
        ...style // Correctly maps deep parent 3D translateZ styling extensions
      }}
      {...props}
    >
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {/* Fluid Modern Micro Spinner */}
          <motion.span
            style={{
              width: '1.15rem',
              height: '1.15rem',
              border: `2.5px solid ${variant === 'secondary' ? 'rgba(229, 231, 235, 0.2)' : 'rgba(255, 255, 255, 0.2)'}`,
              borderTop: `2.5px solid ${variant === 'secondary' ? '#E5E7EB' : '#FFFFFF'}`,
              borderRadius: '50%',
              display: 'inline-block',
              boxSizing: 'border-box'
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 0.75,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
          <span style={{ opacity: 0.85, fontSize: '0.9rem' }}>Verifying Identity...</span>
        </div>
      ) : (
        // Renders content layers cleanly inside the animated button frame
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          {children}
        </span>
      )}
    </motion.button>
  );
};

export default Button;