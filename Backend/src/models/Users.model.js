import mongoose from 'mongoose';

// --- Address Sub-Schema ---
const AddressSchema = new mongoose.Schema({
  title: { 
    type: String, 
    enum: ['Home', 'Work', 'Other'], 
    default: 'Home' 
  },
  addressLine: { type: String, required: true },
  landmark: { type: String }, 
  city: { type: String, required: true },
  pincode: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
});

// --- Payment Sub-Schema ---
const PaymentMethodSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['UPI', 'Card', 'Wallet', 'Cash', 'Razorpay'], // Added 'Razorpay' for full API parity
    required: true 
  },
  provider: { type: String }, // e.g., 'Google Pay', 'Visa', 'Razorpay Gateway'
  mask: { type: String },     // e.g., 'XXXX-1234'
  isDefault: { type: Boolean, default: false }
});

// --- Main User Schema ---
const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Name is required"],
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, "Email is required"], 
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  mobile: { 
    type: String, 
    required: [true, "Mobile number is required"], 
    unique: true 
  },
  password: { 
    type: String, 
    required: [true, "Password is required"],
    minlength: 6
  },
  role: { 
    type: String, 
    enum: ['admin', 'manager', 'staff', 'customer'], 
    default: 'customer' // Enforced system default role
  },
  gender: { 
    type: String, 
    enum: ['Male', 'Female', 'Other'] 
  },
  profileImage: { 
    type: String, 
    default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' 
  },
  
  // ⛓️ HIERARCHY & REPORTING FIELDS ALIGNMENT FIX:
  // Dynamically tracks operational accountability chains and team groupings.
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Self-referential schema link pointing back to the provisioner entity
    default: null
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Links workforce 'staff' accounts directly to their supervising Manager profile
    default: null
  },
  
  // Embedded Sub-Document Arrays
  addresses: [AddressSchema],
  paymentMethods: [PaymentMethodSchema],
  
  // Status & Tracking Metrics
  isActive: { 
    type: Boolean, 
    default: true 
  },
  lastLogin: { type: Date }
}, { 
  timestamps: true 
});

/**
 * MIDDLEWARE: Handle Single Active Default Pointers
 * Automatically cleans and rotates outdated 'isDefault' flags for addresses and payment methods on save.
 * FIX: Removed "next" parameter call to prevent synchronous internal Mongoose execution pipeline failures.
 */
UserSchema.pre('save', function() {
  // 1. Resolve address array single defaults
  if (this.addresses && this.addresses.length > 0) {
    const modifiedAddressDefaultIndex = this.addresses.findIndex(
      (addr) => addr.isDefault && addr.isModified('isDefault')
    );

    if (modifiedAddressDefaultIndex !== -1) {
      this.addresses.forEach((addr, idx) => {
        if (idx !== modifiedAddressDefaultIndex) {
          addr.isDefault = false;
        }
      });
    }
  }

  // 2. Resolve payment method array single defaults
  if (this.paymentMethods && this.paymentMethods.length > 0) {
    const modifiedPaymentDefaultIndex = this.paymentMethods.findIndex(
      (pm) => pm.isDefault && pm.isModified('isDefault')
    );

    if (modifiedPaymentDefaultIndex !== -1) {
      this.paymentMethods.forEach((pm, idx) => {
        if (idx !== modifiedPaymentDefaultIndex) {
          pm.isDefault = false;
        }
      });
    }
  }
  
  // Synchronous pre-save middleware hooks in recent Mongoose runtimes 
  // do not require next() execution to pass context down the stack.
});

// Export using ES6 default export style
const User = mongoose.model('User', UserSchema);
export default User;