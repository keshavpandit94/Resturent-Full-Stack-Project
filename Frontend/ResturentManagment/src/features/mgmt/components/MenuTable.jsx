import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../../components/common/Button';
import api from '../../../services/api';

const MenuTable = ({ menuItems, onMenuUpdated, onEditClicked, onDeleteClicked, isAdmin }) => {
  const [togglingId, setTogglingId] = useState(null);

  // --- Envelope Extraction Layer ---
  const safeMenuItems = Array.isArray(menuItems) 
    ? menuItems 
    : menuItems?.menuItems && Array.isArray(menuItems.menuItems)
      ? menuItems.menuItems 
      : [];

  const handleToggleAvailability = async (id, currentStatus) => {
    setTogglingId(id);
    try {
      const response = await api.patch(`/mgmt/menu/${id}/toggle`, {
        isAvailable: !currentStatus
      });
      if (response.data.success) {
        onMenuUpdated(id, { isAvailable: !currentStatus });
      }
    } catch (err) {
      console.error('Status sync rejection:', err.message);
    } finally {
      setTogglingId(null);
    }
  };

  // --- Framer Motion Orchestration Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      <AnimatePresence mode="wait">
        {safeMenuItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              background: 'rgba(17, 24, 39, 0.35)',
              backdropFilter: 'blur(10px)',
              border: '1px dashed rgba(255, 255, 255, 0.08)',
              borderRadius: '1rem',
              color: '#6B7280',
              fontSize: '0.95rem',
              fontWeight: '500'
            }}
          >
            🥣 No culinary masterpieces initialized in this category yet.
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
              gap: '1.25rem' 
            }}
          >
            {safeMenuItems.map((item) => (
              <motion.div
                key={item._id}
                variants={itemVariants}
                whileHover={{ y: -4, boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5), 0 0 25px rgba(99, 102, 241, 0.05)' }}
                style={{
                  background: 'rgba(17, 24, 39, 0.45)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  borderRadius: '1.25rem',
                  padding: '1.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  opacity: item.isAvailable ? 1 : 0.65,
                  transition: 'opacity 0.25s ease'
                }}
              >
                {/* TOP BLOCK: CORE INFO ROW */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      {/* Dietary Verification Indicator Emblem */}
                      <div style={{ 
                        width: '36px', 
                        height: '36px', 
                        backgroundColor: item.isVegetarian ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                        border: `1px solid ${item.isVegetarian ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                        borderRadius: '0.5rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '1rem',
                        boxShadow: `0 0 10px ${item.isVegetarian ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)'}`
                      }}>
                        {item.isVegetarian ? '🌱' : '🥩'}
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                          {item.name}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: '#6B7280', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                          ⏱️ {item.prepTime} mins assembly
                        </span>
                      </div>
                    </div>

                    {/* Stock Availability Badge */}
                    <span style={{
                      padding: '3px 8px',
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      letterSpacing: '0.03em',
                      borderRadius: '0.375rem',
                      textTransform: 'uppercase',
                      backgroundColor: item.isAvailable ? 'rgba(52, 211, 153, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      color: item.isAvailable ? '#34D399' : '#6B7280',
                      border: `1px solid ${item.isAvailable ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255, 255, 255, 0.04)'}`
                    }}>
                      {item.isAvailable ? 'In Stock' : 'Sustained Out'}
                    </span>
                  </div>

                  {/* SUB-META ROW: SPECIFIC CATEGORY TAG */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      color: '#818CF8', 
                      backgroundColor: 'rgba(99, 102, 241, 0.08)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: '600'
                    }}>
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* BOTTOM BLOCK: PRICE METRIC & WORKSPACE ACTION BUTTON TRYS */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)', 
                  paddingTop: '1rem',
                  marginTop: '0.5rem'
                }}>
                  <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                    <span style={{ fontSize: '1rem', color: '#6366F1', marginRight: '2px' }}>₹</span>
                    {item.price}
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    {/* EDIT ACTION BUTTON */}
                    <motion.button 
                      whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.06)' }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => onEditClicked(item)}
                      style={{ 
                        padding: '0.45rem 0.85rem', 
                        backgroundColor: 'rgba(255, 255, 255, 0.02)', 
                        color: '#E5E7EB', 
                        border: '1px solid rgba(255, 255, 255, 0.08)', 
                        borderRadius: '0.5rem', 
                        cursor: 'pointer', 
                        fontSize: '0.775rem', 
                        fontWeight: '600',
                        outline: 'none'
                      }}
                    >
                      ✏️ Edit
                    </motion.button>

                    {/* INVENTORY STATE SWITCH TARGET TOGGLE */}
                    <Button
                      variant={item.isAvailable ? "secondary" : "primary"}
                      loading={togglingId === item._id}
                      onClick={() => handleToggleAvailability(item._id, item.isAvailable)}
                      style={{
                        padding: '0.45rem 0.85rem',
                        fontSize: '0.775rem',
                        borderRadius: '0.5rem',
                        minHeight: 'auto',
                        height: 'auto'
                      }}
                    >
                      {item.isAvailable ? 'Hold Stock' : 'Release'}
                    </Button>

                    {/* PRIVILEGED ADMIN DELETE ACTION */}
                    {isAdmin && (
                      <motion.button 
                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => onDeleteClicked(item._id, item.name)}
                        style={{ 
                          padding: '0.45rem 0.85rem', 
                          backgroundColor: 'transparent', 
                          color: '#FCA5A5', 
                          border: '1px solid rgba(239, 68, 68, 0.25)', 
                          borderRadius: '0.5rem', 
                          cursor: 'pointer', 
                          fontSize: '0.775rem', 
                          fontWeight: '600',
                          outline: 'none'
                        }}
                      >
                        Delete
                      </motion.button>
                    )}
                  </div>
                </div>

              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MenuTable;