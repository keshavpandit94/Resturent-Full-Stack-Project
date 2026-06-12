import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import Button from '../../../components/common/Button';

const OrderCard = ({ order, onStatusUpdated }) => {
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const statuses = ['placed', 'preparing', 'ready', 'delivered', 'cancelled'];
  
  const handleStatusChange = async (nextStatus) => {
    setLoading(true);
    try {
      const response = await axios.put(`${API_URL}/mgmt/orders/${order._id}/status`, {
        status: nextStatus
      });
      if (response.data.success) {
        onStatusUpdated(order._id, nextStatus);
      }
    } catch (err) {
      console.error('Order mutation error:', err.response?.data?.msg || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Maps live operational states cleanly to premium neon glow tokens
  const getStatusTheme = (status) => {
    switch (status) {
      case 'placed': 
        return { color: '#6366F1', glow: 'rgba(99, 102, 241, 0.4)' }; // Neon Indigo
      case 'preparing': 
        return { color: '#F59E0B', glow: 'rgba(245, 158, 11, 0.4)' }; // Tech Amber
      case 'ready': 
        return { color: '#10B981', glow: 'rgba(16, 185, 129, 0.4)' }; // Emerald Pulse
      case 'delivered': 
        return { color: '#10B981', glow: 'rgba(16, 185, 129, 0.2)' }; // Solid Green
      case 'cancelled': 
        return { color: '#EF4444', glow: 'rgba(239, 68, 68, 0.4)' }; // Crimson Core
      default: 
        return { color: '#6B7280', glow: 'rgba(107, 114, 128, 0.2)' };
    }
  };

  const currentTheme = getStatusTheme(order.orderStatus);
  const isPaid = order.paymentStatus === 'paid';

  return (
    <motion.div
      whileHover={{ 
        y: -4, 
        scale: 1.01,
        boxShadow: `0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 0 20px ${currentTheme.glow}`
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      style={{
        background: 'rgba(17, 24, 39, 0.45)', // Translucent obsidian framework card
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderLeft: `5px solid ${currentTheme.color}`, // Dynamic status accent spine
        borderRadius: '1rem',
        padding: '1.5rem',
        marginBottom: '1.25rem',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}
    >
      {/* CARD TOPPER BLOCK: ORDER HASH & TRANSACTION INDICATOR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ 
          margin: 0, 
          color: '#FFFFFF', 
          fontSize: '1.05rem', 
          fontWeight: '700', 
          letterSpacing: '-0.01em' 
        }}>
          Order #{order._id?.slice(-6).toUpperCase()}
        </h4>
        <span style={{
          fontSize: '0.7rem',
          fontWeight: '700',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          padding: '3px 8px',
          borderRadius: '0.375rem',
          backgroundColor: isPaid ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
          color: isPaid ? '#34D399' : '#FCA5A5',
          border: `1px solid ${isPaid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`
        }}>
          {order.paymentStatus}
        </span>
      </div>

      {/* CUSTOMER META INFO LINE */}
      <p style={{ margin: 0, fontSize: '0.85rem', color: '#9CA3AF', lineHeight: '1.4' }}>
        <strong style={{ color: '#E5E7EB' }}>Customer:</strong> {order.customer?.name || 'Guest User'}{' '}
        <span style={{ color: '#4B5563', fontSize: '0.8rem' }}>({order.customer?.email})</span>
      </p>

      {/* DISH RECEIPTS TRAYS MAPPING */}
      <div style={{ 
        borderTop: '1px dashed rgba(255, 255, 255, 0.08)', 
        borderBottom: '1px dashed rgba(255, 255, 255, 0.08)', 
        padding: '0.75rem 0', 
        margin: '0.25rem 0' 
      }}>
        {order.items?.map((item, idx) => (
          <div key={idx} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            fontSize: '0.875rem', 
            marginBottom: idx !== order.items.length - 1 ? '0.5rem' : 0 
          }}>
            <span style={{ color: '#E5E7EB' }}>
              {item.dish?.name || 'Unknown Item'}{' '}
              <strong style={{ color: '#6366F1', fontSize: '0.8rem', marginLeft: '4px' }}>
                ×{item.quantity}
              </strong>
            </span>
            <span style={{ color: '#9CA3AF', fontWeight: '500' }}>
              ₹{item.price * item.quantity}
            </span>
          </div>
        ))}
      </div>

      {/* FOOTER ACTIONS AND BALANCE METRICS PANEL */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
        <div>
          <span style={{ fontSize: '0.725rem', color: '#4B5563', display: 'block', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.02em' }}>
            Total Amount
          </span>
          <strong style={{ fontSize: '1.25rem', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            <span style={{ fontSize: '0.95rem', color: '#6366F1', marginRight: '2px' }}>₹</span>
            {order.totalAmount}
          </strong>
        </div>

        {/* DRIVER DROPDOWN COMPONENT CAPSULED HOUSING */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select
            disabled={loading}
            value={order.orderStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            style={{ 
              padding: '0.5rem 1.75rem 0.5rem 0.75rem', 
              borderRadius: '0.5rem', 
              border: '1px solid rgba(255, 255, 255, 0.08)', 
              backgroundColor: 'rgba(255, 255, 255, 0.04)', 
              color: '#FFFFFF',
              fontSize: '0.825rem',
              fontWeight: '600',
              outline: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => (e.target.style.borderColor = '#6366F1')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
          >
            {statuses.map((status) => (
              <option key={status} value={status} style={{ backgroundColor: '#0B0F19', color: '#FFFFFF' }}>
                {status.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderCard;