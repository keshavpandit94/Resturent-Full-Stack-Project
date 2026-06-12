import crypto from 'crypto';
import razorpayInstance from '../config/razorpay.config.js';
import Order from '../models/Order.model.js';
import Payment from '../models/Payment.model.js'; // Imported to seamlessly sync the optional financial audit ledger

/**
 * @desc    Create Razorpay Order (Handshake with Razorpay API)
 * @route   POST /api/user/payment/create-order
 */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = "INR" } = req.body;

    const options = {
      amount: Math.round(amount * 100), // Secure conversion from decimal floats to integer paise values
      currency,
      receipt: `receipt_${Date.now()}`, //
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    if (!razorpayOrder) {
      return res.status(500).json({ success: false, msg: "Razorpay order creation failed" });
    }

    res.status(200).json({ success: true, ...razorpayOrder });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Server Error", error: err.message });
  }
};

/**
 * @desc    Verify Razorpay Signature & Save to Database
 * @route   POST /api/user/payment/verify
 */
export const verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      db_order_id 
    } = req.body;

    // 1. Recreate signature using Secret Key for verification
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    // 2. Compare signatures
    if (razorpay_signature === expectedSign) {
      
      // ✅ SUCCESS: Update the primary Order in MongoDB with full metadata
      const updatedOrder = await Order.findByIdAndUpdate(
        db_order_id, 
        {
          $set: {
            paymentStatus: 'paid', //
            paymentMethod: 'Razorpay', //
            transactionId: razorpay_payment_id, // For high-level quick lookups
            paymentDetails: { //
              razorpay_order_id,
              razorpay_payment_id,
              razorpay_signature
            }
          }
        }, 
        { new: true }
      );

      if (!updatedOrder) {
        return res.status(404).json({ success: false, msg: "Order not found in database" });
      }

      // 3. OPTIONAL LEDGER SYNC: Log record in standalone Payment collection if keeping both models
      try {
        await Payment.create({
          order: updatedOrder._id,
          user: req.user.id, // Pulled safely from protect middleware context
          amount: updatedOrder.grandTotal || (updatedOrder.totalAmount + updatedOrder.tax + updatedOrder.deliveryFee),
          paymentMethod: 'Razorpay',
          transactionId: razorpay_payment_id,
          status: 'paid'
        });
      } catch (ledgerErr) {
        // Log locally but don't fail the execution if the redundant ledger tracking errors out
        console.warn(`⚠️ Standalone payment ledger entry skipped or duplicated: ${ledgerErr.message}`);
      }

      return res.status(200).json({ 
        success: true, 
        msg: "Payment verified and recorded successfully", 
        order: updatedOrder 
      });

    } else {
      // ❌ FAILED: Signature mismatch
      return res.status(400).json({ success: false, msg: "Invalid signature, payment authenticity failed" });
    }
  } catch (err) {
    res.status(500).json({ success: false, msg: "Verification process failed", error: err.message });
  }
};