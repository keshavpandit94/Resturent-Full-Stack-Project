import express from 'express';
const router = express.Router();

// --- Standardized Security Middlewares ---
import { protect, authorize } from '../middleware/auth.middleware.js'; // Synchronized from core auth utilities

// --- Import Unified Core Payment Logic ---
import { 
  getPaymentHistory, 
  getPaymentDetails 
} from '../controllers/payment.controller.js'; // Points directly to the expanded ledger controllers

/**
 * --- STANDALONE FINANCIAL LEDGER API ---
 * Base Path Mounted in server.js: /api/payments
 * Note: All routes below are strictly private and require valid Authorization Bearer tokens.
 */

/**
 * @route   GET /api/payments/history
 * @desc    Get customer's transaction history or a full system ledger for management roles
 * @access  Private (Customer, Manager, Admin)
 */
router.get(
  '/history', 
  protect, 
  authorize(['customer', 'manager', 'admin']), // Standardized role permission scopes
  getPaymentHistory
);

/**
 * @route   GET /api/payments/:id
 * @desc    Get complete itemized lookup logs of a single payment transaction record
 * @access  Private (Customer, Manager, Admin)
 */
router.get(
  '/:id', 
  protect, 
  authorize(['customer', 'manager', 'admin']), // Standardized role permission scopes
  getPaymentDetails
);

export default router;