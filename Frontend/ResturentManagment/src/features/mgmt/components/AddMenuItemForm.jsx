import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mgmtService } from '../../../services/mgmtService'; 
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';

const AddMenuItemForm = ({ onDishAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    isVegetarian: true,
    prepTime: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [status, setStatus] = useState({ success: null, message: '' });
  const [submitting, setSubmitting] = useState(false);

  const categories = ['Starter', 'Main Course', 'Dessert', 'Beverage', 'Sides'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setStatus({ success: null, message: '' });
  };

  const handleCheckboxChange = () => {
    setFormData((prev) => ({ ...prev, isVegetarian: !prev.isVegetarian }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { 
        setStatus({ success: false, message: 'Image size must be smaller than 5MB.' });
        return;
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file)); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ success: null, message: '' });

    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('description', formData.description);
    payload.append('price', formData.price);
    payload.append('category', formData.category);
    payload.append('isVegetarian', formData.isVegetarian);
    payload.append('prepTime', formData.prepTime);
    
    if (imageFile) {
      payload.append('image', imageFile); 
    }

    try {
      const response = await mgmtService.addDish(payload);

      setStatus({
        success: true,
        message: response?.msg || 'Delicious item appended to active menu successfully!'
      });

      setFormData({ name: '', description: '', price: '', category: '', isVegetarian: true, prepTime: '' });
      setImageFile(null);
      setPreviewUrl('');

      if (typeof onDishAdded === 'function') {
        onDishAdded();
      }
    } catch (err) {
      setStatus({
        success: false,
        message: err.message || 'Server rejected dish parsing validation parameters.'
      });
    } finally {
      setSubmitting(false);
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

  const selectStyle = {
    width: '100%',
    padding: '0.8rem 1rem',
    borderRadius: '0.625rem',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    fontSize: '0.95rem',
    color: '#FFFFFF',
    outline: 'none',
    boxSizing: 'border-box',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ 
        width: '100%',
        maxWidth: '580px', 
        margin: '1.5rem auto', 
        padding: '2.5rem', 
        background: 'rgba(17, 24, 39, 0.45)', 
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '1.5rem',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}
    >
      <h3 style={{ margin: '0 0 0.35rem 0', color: '#FFFFFF', fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
        Add New Culinary Masterpiece
      </h3>
      <p style={{ color: '#9CA3AF', fontSize: '0.875rem', margin: '0 0 2rem 0', lineHeight: '1.5' }}>
        Provision a new dish item with live inventory constraints straight into customer kiosks.
      </p>

      {/* Dynamic Action Alerts */}
      <AnimatePresence mode="wait">
        {status.message && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            style={{ 
              padding: '0.85rem 1.15rem', 
              marginBottom: '1.5rem', 
              borderRadius: '0.625rem',
              backgroundColor: status.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: status.success ? '#34D399' : '#EF4444',
              border: `1px solid ${status.success ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
              boxShadow: `0 0 15px ${status.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}`,
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            {status.success ? '✨' : '⚠️'} {status.message}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <Input label="Dish Title / Name" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., Kadhai Paneer Special" required disabled={submitting} />
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>Item Narrative Description</label>
          <motion.div whileFocusWithin={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleInputChange} 
              placeholder="Delineate rich culinary properties, spice tiers, or allergen alerts..." 
              required 
              disabled={submitting} 
              rows="3"
              style={{ 
                width: '100%', 
                padding: '0.8rem 1rem', 
                borderRadius: '0.625rem', 
                border: '1px solid rgba(255, 255, 255, 0.08)', 
                backgroundColor: 'rgba(255, 255, 255, 0.04)', 
                fontSize: '0.95rem', 
                color: '#FFFFFF', 
                fontFamily: 'inherit', 
                outline: 'none', 
                resize: 'vertical',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => (e.target.style.borderColor = '#6366F1')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
            />
          </motion.div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <Input label="Price (INR ₹)" type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="250" required disabled={submitting} min="0" />
          <Input label="Prep Time (Mins)" type="number" name="prepTime" value={formData.prepTime} onChange={handleInputChange} placeholder="15" required disabled={submitting} min="1" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2rem', alignItems: 'center' }}>
          <div>
            <label style={labelStyle}>Course Category Mapping</label>
            <motion.div whileFocusWithin={{ scale: 1.015 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
              <select 
                name="category" 
                value={formData.category} 
                onChange={handleInputChange} 
                required 
                disabled={submitting}
                style={selectStyle}
                onFocus={(e) => (e.target.style.borderColor = '#6366F1')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
              >
                <option value="" style={{ backgroundColor: '#0B0F19', color: '#6B7280' }}>-- Choose Segment --</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} style={{ backgroundColor: '#0B0F19', color: '#FFF' }}>{cat}</option>
                ))}
              </select>
            </motion.div>
          </div>

          {/* Premium Neon Switch Container */}
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ ...labelStyle, marginBottom: '0.6rem' }}>Dietary Classification</span>
            <div 
              onClick={!submitting ? handleCheckboxChange : undefined}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', userSelect: 'none' }}
            >
              {/* Custom Track Slider */}
              <div style={{
                width: '42px',
                height: '24px',
                borderRadius: '999px',
                backgroundColor: formData.isVegetarian ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${formData.isVegetarian ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: formData.isVegetarian ? 'flex-end' : 'flex-start',
                boxShadow: `0 0 10px ${formData.isVegetarian ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}`,
                transition: 'all 0.2s ease'
              }}>
                <motion.div 
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: formData.isVegetarian ? '#10B981' : '#EF4444',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}
                />
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: '600', color: formData.isVegetarian ? '#34D399' : '#FCA5A5' }}>
                {formData.isVegetarian ? 'Pure Veg' : 'Non-Veg / Egg'}
              </span>
            </div>
          </div>
        </div>

        {/* --- Premium Media Dropzone Bay --- */}
        <motion.div 
          whileHover={!submitting ? { scale: 1.01, borderColor: 'rgba(99, 102, 241, 0.3)' } : {}}
          style={{ 
            marginBottom: '2.5rem', 
            padding: '1.5rem', 
            border: '2px dashed rgba(255, 255, 255, 0.12)', 
            borderRadius: '0.75rem', 
            backgroundColor: 'rgba(255, 255, 255, 0.01)', 
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'border-color 0.2s ease'
          }}
        >
          <label style={{ display: 'block', cursor: 'pointer', margin: 0 }}>
            <span style={{ display: 'block', fontSize: '1.5rem', marginBottom: '0.25rem' }}>📸</span>
            <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#E5E7EB' }}>Upload Food Thumbnail</span>
            <input type="file" accept="image/*" onChange={handleFileChange} disabled={submitting} style={{ display: 'none' }} />
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem' }}>Accepts JPEG, PNG, WEBP (Max 5MB)</span>
          </label>

          <AnimatePresence>
            {previewUrl && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 5 }}
                style={{ marginTop: '1.25rem', position: 'relative', display: 'inline-block' }}
              >
                <img src={previewUrl} alt="Thumbnail preview" style={{ width: '130px', height: '130px', objectFit: 'cover', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.1)' }} />
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button" 
                  onClick={(e) => { e.preventDefault(); setImageFile(null); setPreviewUrl(''); }} 
                  style={{ 
                    position: 'absolute', 
                    top: '-8px', 
                    right: '-8px', 
                    backgroundColor: '#EF4444', 
                    color: '#FFFFFF', 
                    border: 'none', 
                    borderRadius: '50%', 
                    width: '24px', 
                    height: '24px', 
                    fontSize: '12px', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontWeight: 'bold',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}
                >
                  ✕
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <Button type="submit" loading={submitting} variant="primary" width="100%">
          🚀 Inject Item to Live Catalogue
        </Button>
      </form>
    </motion.div>
  );
};

export default AddMenuItemForm;