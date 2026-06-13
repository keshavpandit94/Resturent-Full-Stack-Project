import User from '../models/Users.model.js';
import Order from '../models/Order.model.js';
import Menu from '../models/Menu.model.js';
import bcrypt from 'bcryptjs'; // Synchronized import package with other system controllers

/**
 * @desc    Create User Account (Hierarchical Enforcement Sync + Fallback Admin Fix)
 * @route   POST /api/mgmt/account/create
 * @access  Private (Admin / Manager)
 */
export const createAccount = async (req, res) => {
  try {
    const { name, email, password, mobile, role, gender, managerId } = req.body;
    const creatorRole = req.user.role?.toLowerCase(); // Attached from JWT auth middleware
    const creatorId = req.user._id || req.user.id;

    let finalRole = role ? role.toLowerCase() : 'staff';
    let finalManagerId = null;

    // 1. 🛡️ Hierarchical Role Authorization & Link Verification Check
    if (creatorRole === 'manager') {
      // SECURITY SAFEGUARD: Managers can ONLY create 'staff' profiles implicitly locked to themselves
      if (finalRole !== 'staff') {
        return res.status(403).json({ 
          success: false, 
          msg: 'Access Denied: Managers are only authorized to provision Staff accounts.' 
        });
      }
      finalManagerId = creatorId; 
    } else if (creatorRole === 'admin') {
      // Admins bypass standard guard blocks to select any system role hierarchy
      if (finalRole === 'admin' && creatorId !== 'admin_default' && req.user.role?.toLowerCase() !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          msg: 'Access Denied: Only existing Admins can create other Admin accounts.' 
        });
      }
      // Admins can link staff members to a manager if optional ID parameters are supplied
      // 🛡️ BSON GUARD: Prevent passing 'admin_default' string literal as a MongoDB ObjectId
      if (finalRole === 'staff' && managerId && managerId !== 'admin_default') {
        finalManagerId = managerId;
      }
    } else {
      return res.status(403).json({ success: false, msg: 'Access Denied: Unauthorized account provisioner.' });
    }

    // 2. Conflict Duplication Checks
    const userExists = await User.findOne({ $or: [{ email }, { mobile }] });
    if (userExists) {
      return res.status(400).json({ success: false, msg: 'User email or mobile number is already registered' });
    }

    // 3. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 🔥 FIX: Check if creator is the hardcoded fallback admin profile string literal.
    // If true, pass null to 'createdBy' since "admin_default" fails the schema's explicit ObjectId validation.
    const cleanCreatedBy = creatorId === 'admin_default' ? null : creatorId;

    // 4. Create the new user account with structural tracking parameters
    const newUser = await User.create({
      name,
      email,
      mobile,
      password: hashedPassword,
      role: finalRole,
      gender,
      isActive: true,
      createdBy: cleanCreatedBy,   // Safely avoids schema casting errors for hardcoded Super Admin
      managerId: finalManagerId 
    });

    res.status(201).json({
      success: true,
      msg: `Account successfully created for ${finalRole}`,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        managerId: newUser.managerId
      }
    });

  } catch (err) {
    console.error("ACCOUNT CREATION REJECTION INTERCEPTED:", err.message);
    res.status(500).json({ success: false, msg: 'Account creation failed', error: err.message });
  }
};

/**
 * @desc    Get staff & managers with scoping boundaries mapped cleanly
 * @route   GET /api/mgmt/staff/all
 * @access  Private (Admin / Manager)
 */
export const getStaffList = async (req, res) => {
  try {
    const creatorRole = req.user.role?.toLowerCase();
    const creatorId = req.user._id || req.user.id;
    let queryFilter = {};

    // 🛡️ WORKFORCE BOUNDARY SEGMENTATION:
    if (creatorRole === 'manager') {
      // Managers can only see staff assigned directly to their operational node
      queryFilter = { 
        role: 'staff', 
        managerId: creatorId 
      };
    } else if (creatorRole === 'admin') {
      // Administrators see the full organizational workforce hierarchy array
      queryFilter = { 
        role: { $in: ['staff', 'manager', 'admin'] } 
      };
    } else {
      return res.status(403).json({ success: false, msg: 'Access Denied: Insufficient workspace clearances.' });
    }

    const staff = await User.find(queryFilter)
      .select('-password')
      .populate('managerId', 'name email') // Hydrates the reporting line metadata dynamically
      .sort({ createdAt: -1 });

    res.json({ success: true, count: staff.length, staff });
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Server Error', error: err.message });
  }
};

/**
 * @desc    Update Staff/Manager Account Data dynamically
 * @route   PUT /api/mgmt/users/:id
 * @access  Private (Admin / Manager)
 */
export const updateAccountDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, mobile, password, gender, role, managerId } = req.body;
    const actorRole = req.user.role?.toLowerCase();
    const actorId = req.user._id || req.user.id;

    // 1. Block modifications to the fallback in-memory super admin account
    if (id === 'admin_default') {
      return res.status(403).json({ success: false, msg: "System Admin profile is immutable and read-only." });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, msg: "Workspace profile record not found." });
    }

    // 2. 🛡️ SCOPE BARRIER ENFORCEMENT: Managers can only edit staff bound to them
    if (actorRole === 'manager') {
      if (targetUser.role?.toLowerCase() !== 'staff' || String(targetUser.managerId) !== String(actorId)) {
        return res.status(403).json({ 
          success: false, 
          msg: "Access Denied: Managers are restricted to updating staff profiles under their direct reporting line." 
        });
      }
    }

    // 3. Unique data collision checks (ignoring current record boundaries)
    if (email || mobile) {
      const collisionCheck = await User.findOne({
        _id: { $ne: id },
        $or: [
          ...(email ? [{ email: email.toLowerCase() }] : []),
          ...(mobile ? [{ mobile }] : [])
        ]
      });
      if (collisionCheck) {
        return res.status(400).json({ success: false, msg: "Email or Mobile parameter assignment overlaps an existing system user." });
      }
    }

    // 4. Map modifications safely based on organizational clearances
    if (name) targetUser.name = name;
    if (email) targetUser.email = email.toLowerCase();
    if (mobile) targetUser.mobile = mobile;
    if (gender) targetUser.gender = gender;

    // Optional Password reset handling processing
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      targetUser.password = await bcrypt.hash(password, salt);
    }

    // Admins maintain full discretion to change operational clearance tiers and supervisor nodes
    if (actorRole === 'admin') {
      if (role) targetUser.role = role.toLowerCase();
      
      if (managerId !== undefined) {
        // If an explicit manager id string is passed, map it; otherwise clear reporting structures out
        if (managerId && managerId !== '' && managerId !== 'admin_default') {
          const verifyManager = await User.findById(managerId);
          if (!verifyManager || verifyManager.role?.toLowerCase() !== 'manager') {
            return res.status(400).json({ success: false, msg: "Assigned target supervisor reference must point to an active Manager profile." });
          }
          targetUser.managerId = managerId;
        } else {
          targetUser.managerId = null; // Unassign supervisor node context cleanly
        }
      }
    }

    await targetUser.save();

    res.status(200).json({
      success: true,
      msg: `Workspace profile settings updated successfully for ${targetUser.name}.`,
      user: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        managerId: targetUser.managerId
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Profile update cycle failed.", error: err.message });
  }
};

/**
 * @desc    Modify/Update Staff Reporting Manager Assignments (Admin Only)
 * @route   PUT /api/mgmt/staff/:id/change-manager
 * @access  Private (Admin)
 */
export const changeStaffManager = async (req, res) => {
  try {
    const { managerId } = req.body;
    const { id } = req.params;

    // 1. If shifting managers, ensure the target account is explicitly a registered Manager node
    if (managerId && managerId !== 'admin_default') {
      const targetManager = await User.findById(managerId);
      if (!targetManager || targetManager.role?.toLowerCase() !== 'manager') {
        return res.status(400).json({ success: false, msg: 'Target ID must point to an active Manager account.' });
      }
    }

    const assignedManager = managerId === 'admin_default' || !managerId ? null : managerId;

    // 2. Atomic assignment mutation update
    const updatedStaff = await User.findByIdAndUpdate(
      id,
      { $set: { managerId: assignedManager } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedStaff) {
      return res.status(404).json({ success: false, msg: 'Staff record reference mapping not found.' });
    }

    res.status(200).json({
      success: true,
      msg: 'Employee organizational reporting manager updated successfully.',
      user: updatedStaff
    });
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Reporting manager re-assignment failed.', error: err.message });
  }
};

/**
 * @desc    Get all payment data for Admin/Manager
 * @route   GET /api/mgmt/payments/all
 */
export const getAllPayments = async (req, res) => {
  try {
    const transactions = await Order.find()
      .select('customer totalAmount grandTotal paymentStatus paymentMethod transactionId createdAt')
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Failed to fetch payment data", error: err.message });
  }
};

/**
 * @desc    Toggle Menu Item Availability (Manager/Admin)
 * @route   PATCH /api/mgmt/menu/:id/toggle
 */
export const updateMenuAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const { id } = req.params;

    // Normalization check to process raw booleans or web strings safely
    const targetStatus = typeof isAvailable === 'boolean' ? isAvailable : String(isAvailable) === 'true';

    const item = await Menu.findByIdAndUpdate(
      id, 
      { isAvailable: targetStatus }, 
      { new: true, runValidators: true }
    );

    if (!item) return res.status(404).json({ success: false, msg: 'Menu item not found' });

    res.json({ 
      success: true, 
      msg: `${item.name} availability updated to ${item.isAvailable}`,
      item 
    });
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Error toggling menu item', error: err.message });
  }
};

/**
 * @desc    Get System Analytics (Admin Only)
 * @route   GET /api/mgmt/analytics/revenue
 */
export const getSystemAnalytics = async (req, res) => {
  try {
    // Aligned to sum grandTotal to accurately calculate gross revenue including tax metrics
    const revenueData = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: "$grandTotal" } } }
    ]);

    const activeStaffCount = await User.countDocuments({
      role: { $in: ['staff', 'manager'] }, 
      isActive: true 
    });

    res.json({
      success: true,
      totalRevenue: revenueData[0]?.total || 0,
      activeStaffCount,
      currency: "INR"
    });
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Analytics generation failed', error: err.message });
  }
};