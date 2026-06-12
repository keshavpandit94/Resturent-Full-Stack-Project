import User from '../models/Users.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Hardcoded Default Admin Credentials Fallbacks
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@feastflow.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// --- AUTHENTICATION ---

/**
 * @desc    Login User & Default Admin
 * @route   POST /api/auth/login
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check for Default Admin
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = jwt.sign(
        { id: 'admin_default', _id: 'admin_default', role: 'admin' }, 
        process.env.JWT_SECRET, 
        { expiresIn: '7d' }
      );
      return res.json({
        success: true,
        token,
        user: { 
          id: 'admin_default', 
          name: 'Super Admin', 
          email: ADMIN_EMAIL, 
          role: 'admin',
          profileImage: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
        }
      });
    }

    // 2. Regular User Login Logic
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, msg: 'Invalid credentials' });

    if (!user.isActive) return res.status(403).json({ success: false, msg: 'Account deactivated' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, msg: 'Invalid credentials' });

    // Update last login timestamp
    user.lastLogin = Date.now();
    await user.save();

    const token = jwt.sign(
      { id: String(user._id), _id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: { 
        id: String(user._id), 
        name: user.name, 
        email: user.email, 
        role: user.role,
        profileImage: user.profileImage
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * @desc    Register a new user (Public Endpoint - Customers Only)
 * @route   POST /api/auth/register
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, mobile, password, role, gender } = req.body;

    // 🛑 PRIVILEGE GUARD: Permanently block public assignment of staff/management access clearance levels
    if (role && ['admin', 'manager', 'staff'].includes(role.toLowerCase())) {
      return res.status(403).json({ 
        success: false, 
        msg: 'Access Denied: Staff, Manager, and Admin accounts cannot be created via public registration.' 
      });
    }

    let userExists = await User.findOne({ $or: [{ email }, { mobile }] });
    if (userExists) return res.status(400).json({ success: false, msg: 'User with this email or mobile already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      mobile,
      password: hashedPassword,
      role: 'customer', // Force fallback security context parameter assignment
      gender
    });

    await user.save();

    const token = jwt.sign(
      { id: String(user._id), _id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    res.status(201).json({ 
      success: true, 
      token, 
      user: { id: String(user._id), name, email, role: user.role } 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * @desc    Get current authenticated user profile session context (Dynamic Core Fix)
 * @route   GET /api/user/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    // 1. Safe validation fallback for extracted request variables
    if (!req.user || (!req.user.id && !req.user._id)) {
      return res.status(401).json({ success: false, msg: 'Session identification reference is missing.' });
    }

    // Short-circuit execution if the session user matches the default hardcoded super admin mapping
    if (req.user.id === 'admin_default') {
      return res.status(200).json({
        success: true,
        user: {
          id: 'admin_default',
          name: 'Super Admin',
          email: ADMIN_EMAIL,
          role: 'admin',
          profileImage: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
        }
      });
    }

    const targetUserId = req.user._id || req.user.id;
    const userProfile = await User.findById(targetUserId).select('-password');

    if (!userProfile) {
      return res.status(401).json({ success: false, msg: 'Active profile identity no longer exists in database registry.' });
    }

    res.status(200).json({
      success: true,
      user: userProfile
    });
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Profile assembly failed.', error: err.message });
  }
};

// --- PROFILE & SETTINGS ---

/**
 * @desc    Update current authenticated user's profile info
 * @route   PUT /api/user/profile
 */
export const updateProfile = async (req, res) => {
  try {
    if (req.user.id === 'admin_default') {
      return res.status(403).json({ success: false, msg: 'System Admin profile is read-only' });
    }

    const targetUserId = req.user._id || req.user.id;
    let updates = { ...req.body };
    if (req.file) updates.profileImage = req.file.path; // Cloudinary CDN link attachment

    const user = await User.findByIdAndUpdate(
      targetUserId, 
      { $set: updates }, 
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ success: false, msg: 'User not found' });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Update failed', error: err.message });
  }
};

/**
 * @desc    Add a delivery address to customer profile document array
 * @route   POST /api/user/address
 */
export const addAddress = async (req, res) => {
  try {
    const { title, addressLine, city, pincode, isDefault, landmark } = req.body;
    const targetUserId = req.user._id || req.user.id;

    const user = await User.findById(targetUserId);
    if (!user) return res.status(404).json({ success: false, msg: 'User not found' });

    // Explicit structural modification properties map assignment ensures subdocument middleware hook fires cleanly
    user.addresses.push({ title, addressLine, city, pincode, isDefault: String(isDefault) === 'true', landmark });
    await user.save();
    
    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Failed to add address', error: err.message });
  }
};

/**
 * @desc    Save billing profile token/preference metadata
 * @route   POST /api/user/payment
 */
export const addPayment = async (req, res) => {
  try {
    const targetUserId = req.user._id || req.user.id;
    const user = await User.findById(targetUserId);
    if (!user) return res.status(404).json({ success: false, msg: 'User not found' });

    let payload = { ...req.body };
    if (payload.isDefault !== undefined) {
      payload.isDefault = String(payload.isDefault) === 'true';
    }

    user.paymentMethods.push(payload);
    await user.save();
    
    res.json({ success: true, paymentMethods: user.paymentMethods });
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Failed to add payment method', error: err.message });
  }
};