import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu',
    required: true
  },
  name: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity cannot be less than 1"],
    default: 1
  }
});

const CartSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One cart per user
  },
  items: [CartItemSchema],
  billDetails: {
    totalItemPrice: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 }
  }
}, { 
  timestamps: true 
});

/**
 * MIDDLEWARE: Financial Telemetry Automations
 * Re-runs calculations dynamically whenever items are appended or mutated.
 */
CartSchema.pre('save', function(next) {
  // Edge Case Optimization: If the cart array is completely empty, zero out everything cleanly
  if (!this.items || this.items.length === 0) {
    this.billDetails.totalItemPrice = 0;
    this.billDetails.tax = 0;
    this.billDetails.deliveryFee = 0;
    this.billDetails.grandTotal = 0;
    return next();
  }

  let total = 0;
  this.items.forEach(item => {
    total += item.price * item.quantity; //
  });

  this.billDetails.totalItemPrice = total;
  this.billDetails.tax = total * 0.05; // 5% GST tax parameter standard
  this.billDetails.deliveryFee = total > 500 ? 0 : 40; // Free delivery milestone tier over ₹500
  this.billDetails.grandTotal = this.billDetails.totalItemPrice + this.billDetails.tax + this.billDetails.deliveryFee;

  next();
});

const Cart = mongoose.model('Cart', CartSchema);
export default Cart;