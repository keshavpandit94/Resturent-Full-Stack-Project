import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { mgmtService } from '../../../services/mgmtService'; 
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';

const AccountCreateForm = ({ onAccountCreated, editData = null }) => {
  const { user } = useAuth();
  const currentUserRole = user?.role?.toLowerCase();
  const isEditMode = !!editData;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    gender: 'Male', 
    role: currentUserRole === 'manager' ? 'staff' : '',
    managerId: '' 
  });

  const [managers, setManagers] = useState([]);
  const [status, setStatus] = useState({ success: null, message: '' });
  const [submitting, setSubmitting] = useState(false);

  // --- Hydration Engine Layer ---
  useEffect(() => {
    if (isEditMode && editData) {
      setFormData({
        name: editData.name || '',
        email: editData.email || '',
        password: '', 
        mobile: editData.mobile || '',
        gender: editData.gender || 'Male',
        role: editData.role?.toLowerCase() || 'staff',
        managerId: editData.managerId?._id || editData.managerId || ''
      });
    }
  }, [editData, isEditMode]);

  // --- Hierarchy Load Layer ---
  useEffect(() => {
    if (currentUserRole === 'admin') {
      const loadAvailableManagers = async () => {
        try {
          const corporatePersonnel = await mgmtService.getStaffList();
          const filteredManagers = corporatePersonnel.filter(
            (acc) => acc.role?.toLowerCase() === 'manager' && acc.isActive && acc._id !== editData?._id
          );
          setManagers(filteredManagers);
        } catch (err) {
          console.error('Failed to parse active manager directory structures:', err.message);
        }
      };
      loadAvailableManagers();
    }
  }, [currentUserRole, editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'role' && value !== 'staff') {
        updated.managerId = '';
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ success: null, message: '' });

    const submissionPayload = {
      ...formData,
      role: formData.role.toLowerCase()
    };

    if (isEditMode && !submissionPayload.password.trim()) {
      delete submissionPayload.password; 
    }

    if (!submissionPayload.managerId || submissionPayload.role !== 'staff') {
      submissionPayload.managerId = '';
    }

    try {
      let data;
      if (isEditMode) {
        data = await mgmtService.updateAccount(editData._id, submissionPayload);
      } else {
        data = await mgmtService.createAccount(submissionPayload);
      }
      
      setStatus({
        success: true,
        message: data?.msg || (isEditMode ? 'Profile data modified successfully!' : 'Workspace account initialized successfully!')
      });

      if (!isEditMode) {
        setFormData({
          name: '',
          email: '',
          password: '',
          mobile: '',
          gender: 'Male',
          role: currentUserRole === 'manager' ? 'staff' : '',
          managerId: ''
        });
      }

      if (typeof onAccountCreated === 'function') {
        setTimeout(() => {
          onAccountCreated();
        }, 1000);
      }
    } catch (err) {
      setStatus({
        success: false,
        message: err.message || 'Failed to sync modifications across system access clearance profiles.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Shared responsive input/selection select framework theme mapping
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
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ 
        width: '100%',
        maxWidth: '480px', 
        margin: '0 auto', 
        padding: '2.5rem', 
        background: 'rgba(17, 24, 39, 0.45)', // Translucent core card background
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '1.25rem',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5)'
      }}
    >
      {/* Active Session Identity Status Banner */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.04)',
        padding: '0.75rem 1rem',
        borderRadius: '0.625rem',
        marginBottom: '2rem'
      }}>
        <p style={{ color: '#9CA3AF', fontSize: '0.825rem', margin: 0, letterSpacing: '0.01em' }}>
          Logon Node Operator: <strong style={{ color: '#FFFFFF' }}>{user?.name || 'Identity Log'}</strong> <span style={{ color: '#6366F1', fontWeight: '700' }}>({user?.role?.toUpperCase() || 'GUEST'})</span>
        </p>
      </div>

      {/* Animated Validation Alert Stage */}
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

      <form onSubmit={handleSubmit}>
        <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
        <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} required />
        <Input label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleChange} required />
        
        <Input 
          label={isEditMode ? "Change Security Password (Leave blank to keep current)" : "Secure Password Key"} 
          type="password" 
          name="password" 
          value={formData.password} 
          onChange={handleChange} 
          required={!isEditMode} 
        />

        {/* Gender Selection Parameter Fields */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>Gender Identification</label>
          <motion.div whileFocusWithin={{ scale: 1.015 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
            <select 
              name="gender" 
              value={formData.gender} 
              onChange={handleChange} 
              required
              style={selectStyle}
              onFocus={(e) => (e.target.style.borderColor = '#6366F1')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
            >
              <option value="Male" style={{ backgroundColor: '#0B0F19', color: '#FFF' }}>Male</option>
              <option value="Female" style={{ backgroundColor: '#0B0F19', color: '#FFF' }}>Female</option>
              <option value="Other" style={{ backgroundColor: '#0B0F19', color: '#FFF' }}>Other</option>
            </select>
          </motion.div>
        </div>

        {/* Role Matrix Picker Controls Allocation Segment */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>Assign System Role Clearance</label>
          {currentUserRole === 'manager' || (isEditMode && editData?.role?.toLowerCase() === 'admin') ? (
            <input 
              type="text" 
              value={formData.role.toUpperCase()} 
              disabled 
              style={{ 
                ...selectStyle, 
                backgroundColor: 'rgba(255, 255, 255, 0.02)', 
                color: '#6B7280', 
                border: '1px solid rgba(255, 255, 255, 0.04)',
                cursor: 'not-allowed', 
                fontWeight: '600' 
              }}
            />
          ) : (
            <motion.div whileFocusWithin={{ scale: 1.015 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
              <select 
                name="role" 
                value={formData.role} 
                onChange={handleChange} 
                required
                style={selectStyle}
                onFocus={(e) => (e.target.style.borderColor = '#6366F1')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
              >
                <option value="" style={{ backgroundColor: '#0B0F19', color: '#6B7280' }}>-- Select Target Clearance Role --</option>
                <option value="admin" style={{ backgroundColor: '#0B0F19', color: '#FFF' }}>System Administrator</option>
                <option value="manager" style={{ backgroundColor: '#0B0F19', color: '#FFF' }}>Restaurant Manager</option>
                <option value="staff" style={{ backgroundColor: '#0B0F19', color: '#FFF' }}>Kitchen & Delivery Staff</option>
                <option value="customer" style={{ backgroundColor: '#0B0F19', color: '#FFF' }}>Direct Consumer</option>
              </select>
            </motion.div>
          )}
        </div>

        {/* ⛓️ DYNAMIC HIERARCHY SELECTOR */}
        <AnimatePresence>
          {currentUserRole === 'admin' && formData.role === 'staff' && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              style={{ 
                marginBottom: '2rem', 
                padding: '1.25rem', 
                backgroundColor: 'rgba(99, 102, 241, 0.02)', 
                borderRadius: '0.75rem', 
                border: '1px dashed rgba(99, 102, 241, 0.3)',
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.03)',
                overflow: 'hidden'
              }}
            >
              <label style={{ ...labelStyle, color: '#818CF8' }}>
                ⛓️ Link Reporting Supervisor Node
              </label>
              <select 
                name="managerId" 
                value={formData.managerId} 
                onChange={handleChange}
                style={{ 
                  ...selectStyle, 
                  borderColor: 'rgba(99, 102, 241, 0.25)',
                  backgroundColor: 'rgba(11, 15, 25, 0.6)' 
                }}
                onFocus={(e) => (e.target.style.borderColor = '#6366F1')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(99, 102, 241, 0.25)')}
              >
                <option value="" style={{ backgroundColor: '#0B0F19', color: '#9CA3AF' }}>Leave Unassigned (Independent Staff)</option>
                {managers.map((mng) => (
                  <option key={mng._id} value={mng._id} style={{ backgroundColor: '#0B0F19', color: '#FFF' }}>
                    {mng.name} ({mng.email})
                  </option>
                ))}
              </select>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ marginTop: '2.5rem' }}>
          <Button type="submit" loading={submitting} width="100%">
            {isEditMode ? '💾 Save Account Parameters' : '🔒 Provision Access Credentials'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default AccountCreateForm;