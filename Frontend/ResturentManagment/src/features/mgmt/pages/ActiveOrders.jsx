import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mgmtService } from '../../../services/mgmtService';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import OrderCard from '../components/OrderCard';
import Spinner from '../../../components/common/Spinner';

const ActiveOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveOrders = async () => {
    try {
      const data = await mgmtService.getActiveOrders();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveOrders();
    // Background polling synchronization engine keeps kitchen operations accurate
    const interval = setInterval(fetchActiveOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdatedInState = (orderId, nextStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order._id === orderId ? { ...order, orderStatus: nextStatus } : order
      )
    );
  };

  // --- Framer Motion Layout Stagger Variants ---
  const gridContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.063 // Elegant micro-delay sequence between mounting objects
      }
    }
  };

  const cardTransitionVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: 'spring', stiffness: 300, damping: 25 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      transition: { duration: 0.2 } 
    }
  };

  return (
    <DashboardLayout title="Live Kitchen & Active Orders">
      <div style={{ width: '100%', boxSizing: 'border-box' }}>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading-spinner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ padding: '8rem 0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              <Spinner size="large" />
            </motion.div>
          ) : orders.length === 0 ? (
            <motion.div 
              key="empty-queue-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ 
                textAlign: 'center', 
                padding: '4rem 2rem', 
                background: 'rgba(17, 24, 39, 0.35)', 
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: '1rem',
                border: '1px dashed rgba(255, 255, 255, 0.08)',
                maxWidth: '600px',
                margin: '2rem auto'
              }}
            >
              <p style={{ color: '#6B7280', fontSize: '1.05rem', margin: 0, fontWeight: '500' }}>
                🛎️ No active orders in the queue right now.
              </p>
            </motion.div>
          ) : (
            <motion.div 
              key="active-orders-grid"
              variants={gridContainerVariants}
              initial="hidden"
              animate="show"
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
                gap: '1.5rem' 
              }}
            >
              <AnimatePresence mode="popLayout">
                {orders.map((order) => (
                  <motion.div 
                    key={order._id}
                    variants={cardTransitionVariants}
                    layout // Allows surrounding cards to re-arrange smoothly when an item unmounts
                  >
                    <OrderCard
                      order={order}
                      onStatusUpdated={handleStatusUpdatedInState}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default ActiveOrders;