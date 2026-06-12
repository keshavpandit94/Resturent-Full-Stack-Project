import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import AccountCreateForm from '../components/AccountCreateForm'; 
import Spinner from '../../../components/common/Spinner';
import Button from '../../../components/common/Button';
import { mgmtService } from '../../../services/mgmtService'; 

const AccountManagement = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null); 
  const [deactivatingId, setDeactivatingId] = useState(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const staffData = await mgmtService.getStaffList();
      setAccounts(staffData);
    } catch (err) {
      console.error('Failed to resolve account logs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // --- Memoized Role Classification Bucketing ---
  const groupedAccounts = useMemo(() => {
    const sorted = { admin: [], manager: [], staff: [], customer: [] };
    accounts.forEach(acc => {
      const role = acc.role?.toLowerCase();
      if (sorted[role]) sorted[role].push(acc);
    });
    return sorted;
  }, [accounts]);

  const handleToggleAccountState = async (id, name, currentStatus) => {
    if (!currentStatus) return;
    
    // Smooth alternative to crude alert walls via clean window updates
    if (!window.confirm(`Are you absolutely sure you want to deactivate the workspace clearance profile for ${name}?`)) {
      return;
    }

    setDeactivatingId(id);
    try {
      await mgmtService.deactivateAccount(id);
      setAccounts(prev => prev.map(acc => acc._id === id ? { ...acc, isActive: false } : acc));
    } catch (err) {
      console.error('Action denied:', err.message);
    } finally {
      setDeactivatingId(null);
    }
  };

  const handleOpenEditModal = (accountRecord) => {
    setSelectedAccount(accountRecord);
    setShowAddForm(true);
  };

  const handleCloseModal = () => {
    setSelectedAccount(null);
    setShowAddForm(false);
  };

  return (
    <DashboardLayout title="Workspace Account Control Panel">
      
      {/* Top Ribbon Meta Actions Area */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2.5rem', 
        gap: '1.25rem', 
        flexWrap: 'wrap' 
      }}>
        <p style={{ margin: 0, color: '#9CA3AF', fontSize: '0.95rem', maxWidth: '600px', lineHeight: '1.5' }}>
          Monitor system user directories, evaluate reporting hierarchies, and provision or edit operational employee access tokens.
        </p>
        <Button 
          variant="primary" 
          onClick={() => { setSelectedAccount(null); setShowAddForm(true); }} 
        >
          ➕ Provision Workspace Key
        </Button>
      </div>

      {/* Main Structural Matrix Content Canvas */}
      <div style={{ width: '100%' }}>
        {loading ? (
          <div style={{ padding: '8rem 0', display: 'flex', justifyContent: 'center' }}>
            <Spinner size="large" />
          </div>
        ) : (
          <div>
            <AccountRoleSection title="👑 System Administrators" users={groupedAccounts.admin} onDeactivate={handleToggleAccountState} onEdit={handleOpenEditModal} disablingId={deactivatingId} />
            <AccountRoleSection title="📋 Restaurant Managers" users={groupedAccounts.manager} onDeactivate={handleToggleAccountState} onEdit={handleOpenEditModal} disablingId={deactivatingId} />
            <AccountRoleSection title="🍳 Kitchen & Delivery Staff" users={groupedAccounts.staff} onDeactivate={handleToggleAccountState} onEdit={handleOpenEditModal} disablingId={deactivatingId} showManagerReporting={true} />
            
            {groupedAccounts.customer.length > 0 && (
              <AccountRoleSection title="🛍️ Enrolled Consumers" users={groupedAccounts.customer} onDeactivate={handleToggleAccountState} onEdit={handleOpenEditModal} disablingId={deactivatingId} />
            )}
          </div>
        )}
      </div>

      {/* 🚀 PREMIUM FIXED MODAL ACCENT SHEET OVERLAY */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
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
            }}
          >
            {/* Modal Glass Box Workspace Sheet Panel */}
            <motion.div 
              initial={{ scale: 0.95, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 30, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 26 }}
              style={{
                position: 'relative',
                background: 'rgba(11, 15, 25, 0.9)',
                borderRadius: '1.5rem',
                width: '92%',
                maxWidth: '520px',
                maxHeight: '88vh', 
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.7), 0 0 50px 0 rgba(99, 102, 241, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden', 
              }}
            >
              {/* Pop-Up Header Bar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.25rem 2rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                backgroundColor: 'rgba(255, 255, 255, 0.01)'
              }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                  {selectedAccount ? `Modify Profile: ${selectedAccount.name}` : 'Onboard Personnel Credentials'}
                </h3>
                <motion.button 
                  whileHover={{ scale: 1.1, color: '#FFFFFF', backgroundColor: 'rgba(255,255,255,0.05)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCloseModal}
                  style={{
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
                  }}
                >
                  ✕
                </motion.button>
              </div>

              {/* Scroll Content Node */}
              <div style={{
                padding: '2rem',
                overflowY: 'auto', 
                flex: 1
              }}>
                <AccountCreateForm 
                  editData={selectedAccount} 
                  onAccountCreated={() => {
                    fetchAccounts(); 
                    handleCloseModal(); 
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
 * --- INLINE SUB-COMPONENT HELPER: RESPONSIVE TILED ROW SECTION ---
 */
const AccountRoleSection = ({ title, users, onDeactivate, onEdit, disablingId, showManagerReporting = false }) => {
  return (
    <div style={{ marginBottom: '3.5rem' }}>
      {/* Category Section Group Headers */}
      <h4 style={{ 
        color: '#FFFFFF', 
        fontSize: '1.15rem', 
        fontWeight: '800', 
        letterSpacing: '-0.01em',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)', 
        paddingBottom: '0.65rem', 
        marginBottom: '1.25rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <span>{title}</span>
        <span style={{ 
          fontSize: '0.75rem', 
          backgroundColor: 'rgba(255, 255, 255, 0.05)', 
          border: '1px solid rgba(255, 255, 255, 0.04)',
          padding: '3px 10px', 
          borderRadius: '999px', 
          color: '#9CA3AF', 
          fontWeight: '700',
          letterSpacing: '0.02em'
        }}>
          {users.length} Enrolled
        </span>
      </h4>

      {users.length === 0 ? (
        <p style={{ color: '#4B5563', fontSize: '0.9rem', fontStyle: 'italic', padding: '0.5rem 0' }}>
          No active clearance profiles provisioned under this structural layer.
        </p>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', 
          gap: '1.25rem' 
        }}>
          {users.map((account) => (
            <motion.div 
              key={account._id} 
              whileHover={{ y: -3, boxShadow: '0 15px 30px -5px rgba(0,0,0,0.4)' }}
              style={{ 
                padding: '1.5rem', 
                background: 'rgba(17, 24, 39, 0.45)', 
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                borderRadius: '1rem', 
                border: '1px solid rgba(255, 255, 255, 0.05)', 
                opacity: account.isActive ? 1 : 0.45, 
                transition: 'opacity 0.2s ease, border-color 0.2s ease, background-color 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                  <img 
                    src={account.profileImage || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} 
                    alt="User Node Avatar" 
                    style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255, 255, 255, 0.08)' }} 
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h5 style={{ margin: 0, color: '#FFFFFF', fontSize: '0.975rem', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {account.name}
                    </h5>
                    <span style={{ 
                      display: 'inline-block',
                      marginTop: '4px',
                      fontSize: '0.7rem', 
                      fontWeight: '700', 
                      letterSpacing: '0.02em',
                      padding: '2px 8px', 
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      backgroundColor: account.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: account.isActive ? '#34D399' : '#EF4444',
                      border: `1px solid ${account.isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`
                    }}>
                      {account.isActive ? 'Clearance Active' : 'Deactivated Terminal'}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#9CA3AF', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span style={{ color: '#4B5563' }}>📧</span> <strong style={{ color: '#D1D5DB' }}>Email:</strong> {account.email}
                  </div>
                  <div>
                    <span style={{ color: '#4B5563' }}>📱</span> <strong style={{ color: '#D1D5DB' }}>Mobile:</strong> +91 {account.mobile}
                  </div>
                  
                  {/* Reporting Hierarchy Connection Tag */}
                  {showManagerReporting && account.managerId && (
                    <div style={{ 
                      marginTop: '0.5rem', 
                      padding: '4px 8px', 
                      backgroundColor: 'rgba(99, 102, 241, 0.04)', 
                      borderRadius: '6px', 
                      display: 'inline-flex', 
                      alignItems: 'center',
                      gap: '0.25rem',
                      border: '1px dashed rgba(99, 102, 241, 0.2)', 
                      fontSize: '0.775rem',
                      color: '#818CF8'
                    }}>
                      <span>👤</span> <strong>Reporting To:</strong> {account.managerId.name || 'Assigned Manager'}
                    </div>
                  )}

                  {account.lastLogin && (
                    <div style={{ color: '#4B5563', fontSize: '0.725rem', marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span>⏱️</span> Last Sync: {new Date(account.lastLogin).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Functional Micro Actions Button Row Tray */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: '0.5rem', 
                borderTop: '1px solid rgba(255, 255, 255, 0.05)', 
                paddingTop: '1rem' 
              }}>
                {account.isActive && (
                  <motion.button
                    whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.06)' }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => onEdit(account)} 
                    style={{
                      padding: '0.45rem 0.95rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      color: '#E5E7EB',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '0.5rem',
                      fontSize: '0.775rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    ✏️ Edit Data
                  </motion.button>
                )}
                {account.isActive && (
                  <motion.button
                    whileHover={{ scale: 1.03, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    disabled={disablingId === account._id}
                    onClick={() => onDeactivate(account._id, account.name, account.isActive)}
                    style={{ 
                      padding: '0.45rem 0.95rem', 
                      backgroundColor: 'transparent', 
                      color: '#FCA5A5', 
                      border: '1px solid rgba(239, 68, 68, 0.25)', 
                      borderRadius: '0.5rem', 
                      fontSize: '#0.775rem', 
                      fontWeight: '600', 
                      cursor: disablingId === account._id ? 'not-allowed' : 'pointer',
                      outline: 'none',
                    }}
                  >
                    {disablingId === account._id ? '...' : 'Deactivate'}
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountManagement;