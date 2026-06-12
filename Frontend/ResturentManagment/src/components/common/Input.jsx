import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error = '',
  ...props
}) => {
  return (
    <div style={{ marginBottom: '1.25rem', width: '100%' }}>
      {/* Label Layer with Deep Space Text Colors */}
      {label && (
        <label 
          htmlFor={name}
          style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontSize: '0.85rem', 
            fontWeight: '600',
            letterSpacing: '0.03em',
            color: '#9CA3AF', // Muted slate gray
            textTransform: 'uppercase'
          }}
        >
          {label} {required && <span style={{ color: '#EF4444', marginLeft: '2px' }}>*</span>}
        </label>
      )}

      {/* Interactive Translucent Core Input Frame */}
      <motion.div
        animate={{
          borderColor: error 
            ? 'rgba(239, 68, 68, 0.5)' 
            : 'rgba(255, 255, 255, 0.08)',
          boxShadow: error 
            ? '0 0 15px rgba(239, 68, 68, 0.15)' 
            : '0 4px 10px rgba(0, 0, 0, 0.2)'
        }}
        whileFocusWithin={{
          scale: 1.015,
          borderColor: error ? 'rgba(239, 68, 68, 0.8)' : '#6366F1',
          boxShadow: error 
            ? '0 0 20px rgba(239, 68, 68, 0.25)' 
            : '0 0 20px rgba(99, 102, 241, 0.25), inset 0 0 10px rgba(99, 102, 241, 0.1)',
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        style={{
          width: '100%',
          borderRadius: '0.625rem',
          border: '1px solid',
          background: disabled ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          overflow: 'hidden'
        }}
      >
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          style={{
            width: '100%',
            padding: '0.8rem 1rem',
            fontSize: '0.95rem',
            color: disabled ? '#4B5563' : '#FFFFFF', // Clean high-contrast white text entry
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            boxSizing: 'border-box',
            cursor: disabled ? 'not-allowed' : 'text',
          }}
          {...props}
        />
      </motion.div>

      {/* Animated Micro-Validation Warning Layout */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{ 
              fontSize: '0.8rem', 
              color: '#EF4444', 
              margin: '0.5rem 0 0 0.25rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            ⚠️ {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Input;