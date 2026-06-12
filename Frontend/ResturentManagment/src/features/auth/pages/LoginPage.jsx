import React from 'react';
import { motion } from 'framer-motion';
import LoginForm from '../components/LoginForm'; // Synchronized directory sub-path path alignment

const LoginPage = () => {
  return (
    <div style={{ 
      position: 'relative',
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      backgroundColor: '#060814',
      overflow: 'hidden',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      
      {/* --- BACKGROUND 3D AMBIENT ANIMATIONS --- */}
      {/* Orb 1: Neon Violet Glow Layer */}
      <motion.div 
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(0,0,0,0) 70%)',
          top: '-10%',
          left: '-5%',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 50, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Orb 2: Cyber Cyan/Blue Secondary Layer */}
      <motion.div 
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, rgba(0,0,0,0) 70%)',
          bottom: '-15%',
          right: '-5%',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
        animate={{
          x: [0, -50, 30, 0],
          y: [0, 40, -30, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* --- MAIN INTERACTIVE CONTAINER --- */}
      <div style={{ 
        position: 'relative',
        zIndex: 2,
        width: '100%', 
        maxWidth: '440px', 
        padding: '1rem',
      }}>
        
        {/* Animated Brand Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', marginBottom: '2rem' }}
        >
          <h1 style={{ 
            margin: '0 0 0.5rem 0', 
            fontSize: '2.25rem', 
            color: '#FFFFFF', 
            fontWeight: '800', 
            letterSpacing: '-0.03em',
            textShadow: '0 0 20px rgba(255,255,255,0.1)'
          }}>
            🍽️ FeastFlow
          </h1>
          <p style={{ 
            margin: 0, 
            fontSize: '0.875rem', 
            color: '#9CA3AF', 
            fontWeight: '500',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            background: 'linear-gradient(90deg, #818CF8, #34D399)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            System Access Gateway
          </p>
        </motion.div>

        {/* Render the unified 3D-tilt enabled multi-role Login Form Component */}
        <LoginForm />
        
        {/* System Onboarding Disclaimer Footer */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.4, duration: 1 }}
          style={{ 
            textAlign: 'center', 
            marginTop: '2rem', 
            fontSize: '0.75rem', 
            color: '#9CA3AF', 
            lineHeight: '1.6',
            padding: '0 1.5rem',
            letterSpacing: '0.01em'
          }}
        >
          Public accounts default securely to customer role profiles. Elevated restaurant staff or manager dashboard access requires internal administrator onboarding.
        </motion.p>
      </div>
    </div>
  );
};

export default LoginPage;