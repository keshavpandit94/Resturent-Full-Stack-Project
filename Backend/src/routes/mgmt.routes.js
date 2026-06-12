import express from 'express';
const router = express.Router();

// --- Import Middleware ---
import { protect, authorize } from '../middleware/auth.middleware.js'; // Standardized multi-role auth filters
import upload from '../middleware/cloudinary.middleware.js'; // Fixed path spelling typo to match the module configuration exactly

// --- Import Models ---
import User from '../models/Users.model.js'; // Imported to power the inline account deactivation safety check guards

// --- Import Controller Functions ---
import { 
  createAccount, 
  getStaffList, 
  updateAccountDetails, // ✏️ Added dynamic core demographic and hierarchy updates mapping
  changeStaffManager, // Imported to handle dynamic administrative reporting updates
  getSystemAnalytics,
  getAllPayments 
} from '../controllers/mgmt.controllers.js'; // Fixed plural naming typo string context link (.controller.js)

import { 
  addDish, 
  updateDish, 
  deleteDish, 
  updateMenuAvailability 
} from '../controllers/menu.controller.js'; //

import { 
  getActiveOrders, 
  updateOrderStatus 
} from '../controllers/order.controller.js'; //

/**
 * --- STAFF & KITCHEN ROUTES ---
 * Access Scope Level: staff, manager, admin
 */
router.get('/orders/active', protect, authorize(['admin', 'manager', 'staff']), getActiveOrders); //
router.put('/orders/:id/status', protect, authorize(['admin', 'manager', 'staff']), updateOrderStatus); //

/**
 * --- MANAGER & ADMIN ROUTES ---
 * Access Scope Level: manager, admin
 */
// Account Onboarding: Provisioning parameters handled hierarchically directly inside the controller execution layer
router.post('/account/create', protect, authorize(['admin', 'manager']), createAccount); //

// Operational Workforce Directories: Aligned to grant managers list views of their scoped staff members
router.get('/staff/all', protect, authorize(['admin', 'manager']), getStaffList); //

// Personnel Profile Modifications: Core demographics, custom roles, password swaps, and supervisor node updates
router.put('/users/:id', protect, authorize(['admin', 'manager']), updateAccountDetails); //

// Financial Audit Trail: Razorpay tracking transaction logs database aggregate
router.get('/payments/all', protect, authorize(['admin', 'manager']), getAllPayments); //

// Menu CRUD Engine: Enforced with secure global cloud storage upload middleware options
router.post('/menu/add', protect, authorize(['admin', 'manager']), upload.single('image'), addDish); //
router.put('/menu/:id', protect, authorize(['admin', 'manager']), upload.single('image'), updateDish); //
router.patch('/menu/:id/toggle', protect, authorize(['admin', 'manager']), updateMenuAvailability); //

// User/Account Management: Production hierarchical implementation of account deactivation
router.delete('/users/:id', protect, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const actorRole = req.user.role?.toLowerCase();
    const actorId = req.user._id || req.user.id;

    // 1. Guard against the default super admin account deactivating itself
    if (id === 'admin_default') {
      return res.status(403).json({ success: false, msg: "System Admin account cannot be deactivated." });
    }

    // 2. Fetch target profile record information to check hierarchy bindings
    const targetAccount = await User.findById(id);
    if (!targetAccount) {
      return res.status(404).json({ success: false, msg: "Target user account not found." });
    }

    // 3. 🛡️ MANAGEMENT SCOPE GUARD: Managers can ONLY deactivate staff explicitly bound to them
    if (actorRole === 'manager') {
      if (targetAccount.role?.toLowerCase() !== 'staff' || String(targetAccount.managerId) !== String(actorId)) {
        return res.status(403).json({ 
          success: false, 
          msg: "Access Denied: Managers can only deactivate staff members under their direct operational reporting chain." 
        });
      }
    }

    // 4. Update the account status parameter atomically
    targetAccount.isActive = false;
    await targetAccount.save();

    res.status(200).json({ 
      success: true, 
      msg: `User account for ${targetAccount.name} successfully deactivated.`,
      user: { id: targetAccount._id, name: targetAccount.name, isActive: false }
    });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Deactivation transition failed", error: err.message });
  }
});

/**
 * --- ADMIN ONLY ROUTES ---
 * Access Scope Level: admin
 */
// Reporting Line Hierarchy Mutation: Allows admins to dynamically change reporting links across staff nodes
router.put('/staff/:id/change-manager', protect, authorize(['admin']), changeStaffManager); //

router.get('/analytics/revenue', protect, authorize(['admin']), getSystemAnalytics); //
router.delete('/menu/:id', protect, authorize(['admin']), deleteDish); //

export default router;