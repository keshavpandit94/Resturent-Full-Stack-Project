import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';

const LoginForm = () => {
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();
  const cardRef = useRef(null);

  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- Dynamic 3D Mouse Parallax Mechanics ---
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Dynamically converts tracking coordinates to localized rotation degrees
  const rotateX = useTransform(y, [-0.5, 0.5], [12, -12]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-12, 12]);

  const handleMouse = (event) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    
    // Calculates a precise normalized location vector ranging from -0.5 to +0.5
    const relativeX = (event.clientX - rect.left) / rect.width - 0.5;
    const relativeY = (event.clientY - rect.top) / rect.height - 0.5;
    
    x.set(relativeX);
    y.set(relativeY);
  };

  const handleMouseLeave = () => {
    // Smoothly dampens rotations back to flat resting equilibrium
    x.set(0);
    y.set(0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setLocalError('');
  };

  const validateForm = () => {
    let isValid = true;
    const errors = { email: '', password: '' };

    if (!credentials.email) {
      errors.email = 'Email address is required.';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      errors.email = 'Please enter a valid email address.';
      isValid = false;
    }

    if (!credentials.password) {
      errors.password = 'Password is required.';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setLocalError('');

    try {
      const result = await login(credentials.email, credentials.password);
      const resolvedUser = result?.user || result;
      const role = resolvedUser?.role?.toLowerCase();

      if (role === 'admin') {
        navigate('/mgmt/analytics');
      } else if (role === 'manager') {
        navigate('/mgmt/menu');
      } else if (role === 'staff') {
        navigate('/mgmt/orders');
      } else if (role === 'customer') {
        navigate('/');
      } else {
        setLocalError('Unauthorized system profile role assigned to this account.');
      }
    } catch (err) {
      setLocalError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ perspective: '1000px', width: '100%' }}>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouse}
        onMouseLeave={handleMouseLeave}
        style={{
          width: '100%',
          background: 'rgba(17, 24, 39, 0.65)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '1.5rem',
          padding: '2.5rem',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.6), 0 0 50px 0 rgba(99, 102, 241, 0.08)',
          rotateX: rotateX,
          rotateY: rotateY,
          transformStyle: 'preserve-3d',
        }}
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Animated Error Container */}
        <AnimatePresence mode="wait">
          {(localError || authError) && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              style={{ 
                padding: '0.85rem 1.15rem', 
                backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                color: '#EF4444', 
                borderRadius: '0.625rem', 
                marginBottom: '1.5rem', 
                fontSize: '0.875rem',
                fontWeight: '500',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.1)',
                transform: 'translateZ(30px)' 
              }}
            >
              {localError || authError}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} noValidate style={{ transform: 'translateZ(20px)' }}>
          <motion.div 
            style={{ marginBottom: '1.25rem' }}
            whileFocusWithin={{ transform: 'translateZ(10px)', scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="name@feastflow.com"
              required
              disabled={loading}
              error={fieldErrors.email}
            />
          </motion.div>

          <motion.div 
            style={{ marginBottom: '1.25rem' }}
            whileFocusWithin={{ transform: 'translateZ(10px)', scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Input
              label="Password"
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              disabled={loading}
              error={fieldErrors.password}
            />
          </motion.div>

          <motion.div 
            style={{ marginTop: '2.5rem' }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              width="100%"
              style={{
                background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                border: 'none',
                color: '#FFFFFF',
                boxShadow: '0 4px 25px rgba(99, 102, 241, 0.35)',
                cursor: 'pointer',
                fontWeight: '600',
                borderRadius: '0.625rem',
                padding: '0.875rem',
                transition: 'box-shadow 0.2s ease, transform 0.2s ease'
              }}
            >
              Sign In to Dashboard
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginForm;