import mongoose from 'mongoose';

const MenuSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Dish name is required"], 
    trim: true 
  },
  description: { 
    type: String, 
    required: [true, "Description is required"] 
  },
  price: { 
    type: Number, 
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"]
  },
  category: { 
    type: String, 
    required: [true, "Category is required"],
    // 🛡️ ALIGNMENT FIX: Extended enum tokens to gracefully catch both singular and plural forms 
    // dispatched by frontend drop-down option forms without throwing validation failures.
    enum: [
      'Starter', 'Starters', 
      'Main Course', 
      'Dessert', 'Desserts', 
      'Beverage', 'Beverages', 
      'Sides', 'Side Dish'
    ],
    default: 'Main Course'
  },
  // Cloudinary Image URL secure asset string pointer mapping
  image: { 
    type: String, 
    default: 'https://placehold.co/600x400?text=No+Dish+Image' 
  },
  // Availability Toggle parameters
  isAvailable: { 
    type: Boolean, 
    default: true 
  },
  // Nutritional / Diet Info flags
  isVegetarian: { 
    type: Boolean, 
    default: false 
  },
  spicyLevel: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'], 
    default: 'Medium' 
  },
  // Performance tracking metric telemetry records
  rating: { 
    type: Number, 
    default: 4.5,
    min: 0,
    max: 5
  },
  // Unified Optimization: Numerical format matching frontend duration meters perfectly
  prepTime: { 
    type: Number, 
    default: 20 // Measured explicitly in integer minutes
  }
}, { 
  timestamps: true // Tracks exactly when a dish was originally instantiated or modified
});

// Compound indexing configuration optimizations for super-fast text searching
MenuSchema.index({ name: 'text', category: 'text' });

const Menu = mongoose.model('Menu', MenuSchema);
export default Menu;