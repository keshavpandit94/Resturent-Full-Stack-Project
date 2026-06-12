import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mgmtService } from '../../../services/mgmtService';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import Spinner from '../../../components/common/Spinner';

const Payments = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await mgmtService.getAllPayments();
        if (data.success) {
          setTransactions(data.transactions || []);
        }
      } catch (err) {
        console.error('Failed to read payments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  // --- Framer Motion Orchestration Variants ---
  const tableContainerVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.04 // Smooth rapid staggering line by line
      }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -5 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } }
  };

  return (
    <DashboardLayout title="Financial & Payment Audit Trail">
      <div style={{ width: '100%', boxSizing: 'border-box' }}>
        
        {/* Sub-Header Narrative Meta Line */}
        <p style={{ margin: '0 0 2rem 0', color: '#9CA3AF', fontSize: '0.95rem', lineHeight: '1.5' }}>
          Reviewing unified incoming <span style={{ color: '#6366F1', fontWeight: '600' }}>Razorpay</span> payment capture pipelines and micro-transaction telemetry.
        </p>

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
          ) : transactions.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ 
                textAlign: 'center', 
                padding: '4rem 2rem', 
                background: 'rgba(17, 24, 39, 0.35)', 
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: '1rem',
                border: '1px dashed rgba(255, 255, 255, 0.08)',
                color: '#6B7280'
              }}
            >
              <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>🗄️ No logged transaction items found in this ledger scope.</p>
            </motion.div>
          ) : (
            /* RESPONSIVE SCROLL-CONTAINED DATA TABLE CANVAS */
            <motion.div 
              key="table-canvas"
              variants={tableContainerVariants}
              initial="hidden"
              animate="show"
              style={{ 
                overflowX: 'auto', 
                background: 'rgba(17, 24, 39, 0.45)', // Translucent core card background
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderRadius: '1.25rem', 
                border: '1px solid rgba(255, 255, 255, 0.06)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                <thead>
                  <tr style={{ 
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    background: 'rgba(255, 255, 255, 0.01)'
                  }}>
                    <th style={{ padding: '1.15rem 1.5rem', color: '#9CA3AF', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer</th>
                    <th style={{ padding: '1.15rem 1.5rem', color: '#9CA3AF', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Method</th>
                    <th style={{ padding: '1.15rem 1.5rem', color: '#9CA3AF', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                    <th style={{ padding: '1.15rem 1.5rem', color: '#9CA3AF', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                    <th style={{ padding: '1.15rem 1.5rem', color: '#9CA3AF', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    const isPaid = tx.paymentStatus?.toLowerCase() === 'paid';
                    return (
                      <motion.tr 
                        key={tx._id} 
                        variants={rowVariants}
                        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                        style={{ 
                          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                          transition: 'background-color 0.2s ease'
                        }}
                      >
                        {/* CUSTOMER PROFILE FIELD */}
                        <td style={{ padding: '1.15rem 1.5rem' }}>
                          <div style={{ fontWeight: '700', color: '#FFFFFF', fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
                            {tx.customer?.name || 'Guest User'}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#4B5563', marginTop: '2px' }}>
                            {tx.customer?.email}
                          </div>
                        </td>

                        {/* ROUTING PATH METHOD FIELD */}
                        <td style={{ padding: '1.15rem 1.5rem' }}>
                          <span style={{ 
                            color: '#E5E7EB', 
                            textTransform: 'uppercase', 
                            fontSize: '0.825rem',
                            fontWeight: '600',
                            letterSpacing: '0.02em',
                            backgroundColor: 'rgba(255,255,255,0.04)',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(255,255,255,0.02)'
                          }}>
                            ⚡ {tx.paymentMethod || 'N/A'}
                          </span>
                        </td>

                        {/* STATUS MATRIX CHIP */}
                        <td style={{ padding: '1.15rem 1.5rem' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 8px', 
                            fontSize: '0.7rem', 
                            fontWeight: '700', 
                            borderRadius: '4px',
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            backgroundColor: isPaid ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                            color: isPaid ? '#34D399' : '#FCA5A5',
                            border: `1px solid ${isPaid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`
                          }}>
                            {tx.paymentStatus}
                          </span>
                        </td>

                        {/* DATE STAMP CAPTURE */}
                        <td style={{ padding: '1.15rem 1.5rem', color: '#9CA3AF', fontSize: '0.875rem', fontWeight: '500' }}>
                          {new Date(tx.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </td>

                        {/* LEDGER VALUATION CALCULATION */}
                        <td style={{ 
                          padding: '1.15rem 1.5rem', 
                          textAlign: 'right', 
                          fontWeight: '800', 
                          color: '#FFFFFF', 
                          fontSize: '1.1rem',
                          letterSpacing: '-0.01em'
                        }}>
                          <span style={{ fontSize: '0.85rem', color: '#6366F1', marginRight: '2px', fontWeight: '700' }}>₹</span>
                          {tx.totalAmount?.toLocaleString() || '0'}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default Payments;