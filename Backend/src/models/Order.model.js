import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  // 1. Customer Reference
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // 2. Items Ordered (Array of objects)
  items: [{
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Menu',
      required: true
    },
    name: String, 
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity cannot be less than 1"] //
    },
    price: {
      type: Number,
      required: true
    } 
  }],

  // 3. Financials
  totalAmount: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    default: 0
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  grandTotal: { // Explicitly added to complement structural parameters from Cart.model.js
    type: Number,
    default: 0
  },

  // 4. Delivery Details
  deliveryAddress: {
    addressLine: String,
    city: String,
    pincode: String,
    landmark: String
  },

  // 5. Payment Info
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'], //
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['UPI', 'Card', 'Cash', 'Wallet', 'Razorpay'], //
    required: true
  },
  
  // High-level transaction ID for quick lookup
  transactionId: { type: String }, 

  // Detailed Payment Metadata
  paymentDetails: {
    razorpay_order_id: { type: String },
    razorpay_payment_id: { type: String },
    razorpay_signature: { type: String },
  },

  // 6. Order Tracking (Synchronized with frontend OrderCard.jsx terminal statuses)
  orderStatus: {
    type: String,
    enum: ['placed', 'preparing', 'ready', 'delivered', 'cancelled'], // Changed 'out-for-delivery' to 'ready'
    default: 'placed'
  },

  // 7. Staff Assignment
  assignedStaff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' 
  },

  estimatedTime: {
    type: String,
    default: '30-40 mins' //
  }
}, { 
  timestamps: true 
});

/**
 * MIDDLEWARE: Data Integrity & Financial Validation Guard
 * Runs automatically prior to document write tasks to guarantee pricing parameter calculations.
 */
OrderSchema.pre('save', function(next) {
  // If totalAmount is omitted or the items array changed, calculate the base items sum
  if (this.isModified('items') || !this.totalAmount) {
    let baseSum = 0;
    this.items.forEach(item => {
      baseSum += item.price * item.quantity;
    });
    this.totalAmount = baseSum;
  }

  // Self-calculate billing rules identical to Cart.model.js properties
  this.tax = this.totalAmount * 0.05; // 5% GST tax parameter standard
  this.deliveryFee = this.totalAmount > 500 ? 0 : 40; // Free delivery threshold over ₹500
  this.grandTotal = this.totalAmount + this.tax + this.deliveryFee;

  next();
});

const Order = mongoose.model('Order', OrderSchema);
export default Order;