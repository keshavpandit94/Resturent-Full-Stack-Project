import express from 'express';
const router = express.Router();

// --- Import Middlewares ---
import { protect } from '../middleware/auth.middleware.js'; // Standardized request session validation check
import upload from '../middleware/cloudinary.middleware.js'; // Secure cloud asset stream uploader

// --- Import Controller Functions ---
import { 
  updateProfile, 
  addAddress, 
  addPayment 
} from '../controllers/users.controller.js'; //

import { getMenu } from '../controllers/menu.controller.js'; //

import { 
  getCart, 
  addToCart, 
  removeItem, 
  clearCart 
} from '../controllers/cart.controller.js'; //

import { 
  placeOrder, 
  getMyOrders 
} from '../controllers/order.controller.js'; //

import { 
  createRazorpayOrder, 
  verifyPayment 
} from '../controllers/payment.controller.js'; // Interfacing client-side handshakes smoothly

// --- Import Model ---
import User from '../models/Users.model.js'; //

/**
 * --- CUSTOMER / USER API SYSTEM ---
 * Base Path (Prefixed in server.js): /api/user
 * Note: Handles client interface arrays including profiles, ordering pipelines, and live checkouts.
 */

// --- 1. PROFILE & ACCOUNT MANAGEMENT ---
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); //
    if (!user) return res.status(404).json({ success: false, msg: "User account context not found" });
    res.json(user); //
  } catch (err) {
    res.status(500).json({ success: false, msg: "Server Error", error: err.message }); // Standardized response properties
  }
});

router.put('/profile', protect, upload.single('image'), updateProfile); //
router.post('/address', protect, addAddress); //
router.post('/payment', protect, addPayment); //

// --- 2. MENU BROWSING ---
router.get('/menu', getMenu); // Open publicly so visitors can explore items before checking out

// --- 3. SHOPPING CART METRICS ---
router.get('/cart', protect, getCart);
router.post('/cart/add', protect, addToCart);
router.delete('/cart/item/:id', protect, removeItem);
router.delete('/cart/clear', protect, clearCart);

// --- 4. ORDER MANAGEMENT & LIVE CHECKOUTS ---
router.post('/orders', protect, placeOrder);
router.get('/my-orders', protect, getMyOrders);

// --- 5. RAZORPAY GATEWAY CHECKOUT HANDSHAKES ---
// Secure transaction creation hook initializing payment flow pipelines
router.post('/checkout/razorpay-order', protect, createRazorpayOrder); 
// Instant token processing check validating transaction authenticity steps
router.post('/checkout/verify-signature', protect, verifyPayment); 

export default router;