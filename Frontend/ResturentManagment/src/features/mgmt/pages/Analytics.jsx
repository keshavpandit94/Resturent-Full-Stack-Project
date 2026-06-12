import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mgmtService } from '../../../services/mgmtService';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import Spinner from '../../../components/common/Spinner';

const Analytics = () => {
  const [data, setData] = useState({ totalRevenue: 0, activeStaffCount: 0, currency: 'INR' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const responseData = await mgmtService.getSystemAnalytics();
        if (responseData.success) {
          setData({
            totalRevenue: responseData.totalRevenue,
            activeStaffCount: responseData.activeStaffCount,
            currency: responseData.currency || 'INR'
          });
        }
      } catch (err) {
        console.error('Failed to parse analytics payload:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // --- Framer Motion Animation Settings ---
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 15 },
    show: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { type: 'spring', stiffness: 300, damping: 25 } 
    }
  };

  return (
    <DashboardLayout title="Platform Performance & Analytics">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="spinner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ padding: '8rem 0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <Spinner size="large" />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            style={{ width: '100%', boxSizing: 'border-box' }}
          >
            {/* METRICS SECTION GRID */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
              gap: '1.5rem', 
              marginBottom: '2rem' 
            }}>
              
              {/* REVENUE GLASS CARD */}
              <motion.div
                variants={cardVariants}
                whileHover={{ y: -4, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5), 0 0 25px rgba(99, 102, 241, 0.15)' }}
                style={{ 
                  backgroundColor: 'rgba(17, 24, 39, 0.45)', 
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  padding: '1.75rem', 
                  borderRadius: '1.25rem', 
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderTop: '4px solid #6366F1', // Electric Indigo Neon Tag
                  boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.3)'
                }}
              >
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: '#818CF8', 
                  fontWeight: '700', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em' 
                }}>
                  Gross Revenue
                </span>
                <h1 style={{ 
                  margin: '0.5rem 0 0 0', 
                  fontSize: '2.5rem', 
                  color: '#FFFFFF', 
                  fontWeight: '800',
                  letterSpacing: '-0.02em'
                }}>
                  {data.currency === 'INR' ? '₹' : '$'}{data.totalRevenue.toLocaleString()}
                </h1>
              </motion.div>

              {/* CREW GLASS CARD */}
              <motion.div
                variants={cardVariants}
                whileHover={{ y: -4, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5), 0 0 25px rgba(16, 185, 129, 0.15)' }}
                style={{ 
                  backgroundColor: 'rgba(17, 24, 39, 0.45)', 
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  padding: '1.75rem', 
                  borderRadius: '1.25rem', 
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderTop: '4px solid #10B981', // Cyber Emerald Neon Tag
                  boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.3)'
                }}
              >
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: '#34D399', 
                  fontWeight: '700', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em' 
                }}>
                  Kitchen Crew
                </span>
                <h1 style={{ 
                  margin: '0.5rem 0 0 0', 
                  fontSize: '2.5rem', 
                  color: '#FFFFFF', 
                  fontWeight: '800',
                  letterSpacing: '-0.02em'
                }}>
                  {data.activeStaffCount}
                </h1>
              </motion.div>
            </div>

            {/* LOWER OPERATIONAL INSIGHTS SHEET */}
            <motion.div 
              variants={cardVariants}
              style={{ 
                backgroundColor: 'rgba(17, 24, 39, 0.3)', 
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                padding: '2rem', 
                borderRadius: '1.25rem',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                boxShadow: '0 15px 35px -15px rgba(0, 0, 0, 0.2)'
              }}
            >
              <h3 style={{ 
                margin: '0 0 0.75rem 0', 
                color: '#FFFFFF', 
                fontSize: '1.2rem', 
                fontWeight: '700',
                letterSpacing: '-0.01em'
              }}>
                Operational Insight Summary
              </h3>
              <p style={{ 
                margin: 0, 
                color: '#9CA3AF', 
                lineHeight: '1.6',
                fontSize: '0.925rem' 
              }}>
                Data metric indices have been resolved securely straight through your central microservice application architecture layer. Real-time logging telemetry is synchronized.
              </p>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default Analytics;