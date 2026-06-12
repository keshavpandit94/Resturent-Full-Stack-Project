import mongoose from 'mongoose';

const Schema = mongoose.Schema; //

const PaymentSchema = new mongoose.Schema({
  // 1. Core Structural References
  order: { 
    type: Schema.Types.ObjectId, 
    ref: 'Order', 
    required: true,
    unique: true // One payment record per order
  },
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true //
  },
  
  // 2. Financial Metrics
  amount: {
    type: Number,
    required: true,
    min: [0.01, "Amount cannot be zero or negative"]
  },
  paymentMethod: { 
    type: String,
    required: true,
    trim: true,
    enum: ['UPI', 'Card', 'Cash', 'Wallet', 'Razorpay'] // Synchronized with Order.model.js options
  },
  transactionId: { 
    type: String,
    required: true, 
    unique: true //
  },

  // 3. Status Tracking Parity (Lowercased to match OrderSchema state machines perfectly)
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'], // Aligned with Order.model.js paymentStatus fields
    default: 'pending'
  },
  
  // 4. Razorpay Specific Metadata Mirroring (Optional fallback log buffer)
  razorpayDetails: {
    razorpay_order_id: { type: String },
    razorpay_signature: { type: String }
  },

  paidAt: {
    type: Date,
    default: Date.now //
  }
}, { 
  timestamps: true //
});

// Export using clean, project-standard ES6 default style
const Payment = mongoose.model('Payment', PaymentSchema);
export default Payment;