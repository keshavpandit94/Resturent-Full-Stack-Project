import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import MenuTable from '../components/MenuTable';
import AddMenuItemForm from '../components/AddMenuItemForm'; 
import Spinner from '../../../components/common/Spinner';
import Button from '../../../components/common/Button';
import api from '../../../services/api'; 
import { mgmtService } from '../../../services/mgmtService';
import { useAuth } from '../../../hooks/useAuth';

const MenuManagement = () => {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal Top-Up Drawer Toggle States
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null); 

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const response = await api.get('/user/menu');
      setMenuItems(response.data?.menuItems || response.data || []);
    } catch (err) {
      console.error('Error fetching menu records:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleMenuRowMutation = (id, updatedFields) => {
    setMenuItems((prevItems) =>
      prevItems.map((item) => (item._id === id ? { ...item, ...updatedFields } : item))
    );
  };

  const handleMenuRowDeletion = async (id, dishName) => {
    if (!window.confirm(`Are you absolutely sure you want to remove "${dishName}" from the permanent catalog?`)) {
      return;
    }

    try {
      const response = await api.delete(`/mgmt/menu/${id}`);
      if (response.data?.success) {
        setMenuItems((prevItems) => prevItems.filter((item) => item._id !== id));
        if (editingItem?._id === id) {
          setEditingItem(null);
        }
      }
    } catch (err) {
      console.error('Deletion failure:', err.message);
    }
  };

  const handleInitiateEdit = (item) => {
    setShowAddForm(false); 
    setEditingItem(item);  
  };

  return (
    <DashboardLayout title="Menu Management">
      
      {/* Upper Control Ribbon */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2.5rem', 
        gap: '1.25rem', 
        flexWrap: 'wrap' 
      }}>
        <p style={{ margin: 0, color: '#9CA3AF', fontSize: '0.95rem', maxWidth: '600px', lineHeight: '1.5' }}>
          Toggle live inventory availability parameters, audit pricing indexes, or modify master menu listings.
        </p>
        <Button 
          variant="primary" 
          onClick={() => {
            setEditingItem(null); 
            setShowAddForm(true);
          }}
        >
          ➕ Provision New Dish
        </Button>
      </div>

      {/* Main Grid View Base Sheet */}
      <div style={{ width: '100%' }}>
        {loading ? (
          <div style={{ padding: '8rem 0', display: 'flex', justifyContent: 'center' }}>
            <Spinner size="large" />
          </div>
        ) : (
          <MenuTable 
            menuItems={menuItems} 
            onMenuUpdated={handleMenuRowMutation} 
            onEditClicked={handleInitiateEdit}          
            onDeleteClicked={handleMenuRowDeletion}      
            isAdmin={user?.role === 'admin'}             
          />
        )}
      </div>

      {/* 🚀 FIXED TOP-UP DRAWER SHEET: ADD FORM */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={modalOverlayStyle}
            onClick={() => setShowAddForm(false)}
          >
            <motion.div 
              initial={{ y: 50, scale: 0.95, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 50, scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 26 }}
              style={drawerCardStyle}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={drawerHeaderStyle}>
                <h3 style={drawerTitleStyle}>Onboard New Recipe Card</h3>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => setShowAddForm(false)} style={closeBtnStyle}>✕</motion.button>
              </div>
              <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
                <AddMenuItemForm onDishAdded={() => {
                  fetchMenu(); 
                  setShowAddForm(false); 
                }} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🚀 FIXED TOP-UP DRAWER SHEET: EDIT FORM */}
      <AnimatePresence>
        {editingItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={modalOverlayStyle}
            onClick={() => setEditingItem(null)}
          >
            <motion.div 
              initial={{ y: 50, scale: 0.95, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 50, scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 26 }}
              style={drawerCardStyle}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={drawerHeaderStyle}>
                <h3 style={drawerTitleStyle}>Modify Entry Parameters</h3>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => setEditingItem(null)} style={closeBtnStyle}>✕</motion.button>
              </div>
              <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
                <EditMenuItemWrapper 
                  item={editingItem} 
                  onCancel={() => setEditingItem(null)}
                  onDishUpdated={() => {
                    fetchMenu(); 
                    setEditingItem(null);
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
};

/**
 * --- INLINE SUB-COMPONENT HELPER: EDIT MENU ITEM WRAPPER ---
 */
const EditMenuItemWrapper = ({ item, onCancel, onDishUpdated }) => {
  const [fields, setFields] = useState({
    name: item.name || '',
    description: item.description || '',
    price: item.price || '',
    category: item.category || '',
    prepTime: item.prepTime || ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(item.image || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = ['Starter', 'Main Course', 'Dessert', 'Beverage', 'Sides'];

  const handleTextChange = (e) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file must not exceed 5MB boundaries.');
        return;
      }
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const updatePayload = new FormData();
    updatePayload.append('name', fields.name);
    updatePayload.append('description', fields.description);
    updatePayload.append('price', fields.price);
    updatePayload.append('category', fields.category);
    updatePayload.append('prepTime', fields.prepTime);
    
    if (imageFile) {
      updatePayload.append('image', imageFile); 
    }

    try {
      await mgmtService.updateDish(item._id, updatePayload);
      onDishUpdated();
    } catch (err) {
      setError(err.message || 'Database update verification failure occurred.');
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.85rem',
    fontWeight: '600',
    letterSpacing: '0.03em',
    color: '#9CA3AF',
    textTransform: 'uppercase'
  };

  return (
    <div style={{ width: '100%' }}>
      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ padding: '0.85rem 1.15rem', marginBottom: '1.5rem', borderRadius: '0.625rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.85rem', fontWeight: '500' }}
          >
            ⚠️ {error}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleFormSubmit}>
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={labelStyle}>Dish Title</label>
          <motion.div whileFocusWithin={{ scale: 1.015 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
            <input type="text" name="name" value={fields.name} onChange={handleTextChange} required style={rawInputStyle} onFocus={(e) => (e.target.style.borderColor = '#6366F1')} onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)')} />
          </motion.div>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={labelStyle}>Description</label>
          <motion.div whileFocusWithin={{ scale: 1.015 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
            <textarea name="description" value={fields.description} onChange={handleTextChange} required rows="2" style={{ ...rawInputStyle, resize: 'vertical', fontFamily: 'inherit' }} onFocus={(e) => (e.target.style.borderColor = '#6366F1')} onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)')} />
          </motion.div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
          <div>
            <label style={labelStyle}>Price (₹)</label>
            <motion.div whileFocusWithin={{ scale: 1.015 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
              <input type="number" name="price" value={fields.price} onChange={handleTextChange} required min="0" style={rawInputStyle} onFocus={(e) => (e.target.style.borderColor = '#6366F1')} onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)')} />
            </motion.div>
          </div>
          <div>
            <label style={labelStyle}>Prep Time (m)</label>
            <motion.div whileFocusWithin={{ scale: 1.015 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
              <input type="number" name="prepTime" value={fields.prepTime} onChange={handleTextChange} required min="1" style={rawInputStyle} onFocus={(e) => (e.target.style.borderColor = '#6366F1')} onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)')} />
            </motion.div>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>Category Mapping</label>
          <motion.div whileFocusWithin={{ scale: 1.015 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
            <select name="category" value={fields.category} onChange={handleTextChange} required style={rawInputStyle} onFocus={(e) => (e.target.style.borderColor = '#6366F1')} onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)')}>
              {categories.map((cat) => (<option key={cat} value={cat} style={{ backgroundColor: '#0B0F19', color: '#FFF' }}>{cat}</option>))}
            </select>
          </motion.div>
        </div>

        <motion.div whileHover={{ borderColor: 'rgba(99, 102, 241, 0.3)' }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2.5rem', padding: '1rem', border: '1px dashed rgba(255, 255, 255, 0.12)', borderRadius: '0.625rem', backgroundColor: 'rgba(255, 255, 255, 0.01)' }}>
          <label style={{ cursor: 'pointer', fontSize: '0.8rem', backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: '8px 12px', borderRadius: '0.375rem', fontWeight: '600', color: '#E5E7EB', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            📸 Swap File Asset
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
          </label>
          {preview && <img src={preview} alt="Lookup mini preview" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.1)' }} />}
        </motion.div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button type="button" variant="secondary" onClick={onCancel} width="100%" disabled={loading}>Discard</Button>
          <Button type="submit" variant="primary" loading={loading} width="100%">Save Changes</Button>
        </div>
      </form>
    </div>
  );
};

// --- SHARED SPECIFICATION SYSTEM REUSABLE STYLES ---
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(3, 7, 18, 0.65)', 
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1100, 
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)'
};

const drawerCardStyle = {
  position: 'relative',
  background: 'rgba(11, 15, 25, 0.9)',
  borderRadius: '1.5rem',
  width: '92%',
  maxWidth: '540px',
  maxHeight: '88vh', 
  border: '1px solid rgba(255, 255, 255, 0.08)',
  boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.7), 0 0 50px 0 rgba(99, 102, 241, 0.05)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
};

const drawerHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1.25rem 2rem',
  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  backgroundColor: 'rgba(255, 255, 255, 0.01)'
};

const drawerTitleStyle = { margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.01em' };

const closeBtnStyle = {
  border: 'none',
  backgroundColor: 'transparent',
  fontSize: '1rem',
  color: '#9CA3AF',
  cursor: 'pointer',
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  outline: 'none'
};

const rawInputStyle = {
  width: '100%',
  padding: '0.8rem 1rem',
  borderRadius: '0.625rem',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  backgroundColor: 'rgba(255, 255, 255, 0.04)',
  fontSize: '0.95rem',
  color: '#FFFFFF',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'all 0.2s ease'
};

export default MenuManagement;