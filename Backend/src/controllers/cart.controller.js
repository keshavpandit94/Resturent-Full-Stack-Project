import Cart from '../models/Cart.model.js';
import Menu from '../models/Menu.model.js';

/**
 * @desc    Get current user's cart
 * @route   GET /api/user/cart
 */
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ customer: req.user.id }).populate('items.menuItem');
    
    if (!cart) {
      // Return a complete empty structure mirroring your Cart.model.js layout to prevent front-end exceptions
      return res.json({ 
        items: [], 
        billDetails: { 
          totalItemPrice: 0,
          tax: 0,
          deliveryFee: 0,
          grandTotal: 0 
        } 
      });
    }

    res.json(cart);
  } catch (err) {
    res.status(500).json({ success: false, msg: "Error fetching cart", error: err.message });
  }
};

/**
 * @desc    Add item to cart or update quantity
 * @route   POST /api/user/cart/add
 */
export const addToCart = async (req, res) => {
  try {
    const { menuItem, quantity } = req.body;
    const userId = req.user.id;

    // 1. Verify item exists in Menu
    const dish = await Menu.findById(menuItem);
    if (!dish) return res.status(404).json({ success: false, msg: "Dish not found" });
    if (!dish.isAvailable) return res.status(400).json({ success: false, msg: "Dish is currently out of stock" });

    // 2. Find or Create Cart
    let cart = await Cart.findOne({ customer: userId });

    if (cart) {
      // Check if item already exists in the cart
      const itemIndex = cart.items.findIndex(item => item.menuItem.toString() === menuItem);

      if (itemIndex > -1) {
        // Update existing item quantity
        cart.items[itemIndex].quantity += (quantity || 1);
      } else {
        // Add new item to existing cart
        cart.items.push({
          menuItem,
          name: dish.name,
          image: dish.image,
          price: dish.price,
          quantity: quantity || 1
        });
      }
      await cart.save(); // The pre-save hook in your Cart.model.js re-calculates all billDetails automatically
    } else {
      // Create a brand new cart for the user
      cart = new Cart({
        customer: userId,
        items: [{
          menuItem,
          name: dish.name,
          image: dish.image,
          price: dish.price,
          quantity: quantity || 1
        }]
      });
      await cart.save();
    }

    res.status(200).json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Failed to add to cart", error: err.message });
  }
};

/**
 * @desc    Remove specific item from cart
 * @route   DELETE /api/user/cart/item/:id
 */
export const removeItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.user.id });
    if (!cart) return res.status(404).json({ success: false, msg: "Cart not found" });

    // Filter out the item to be removed
    cart.items = cart.items.filter(item => item._id.toString() !== req.params.id);
    
    // Saving triggers the pre-save hook to re-evaluate the pricing matrices
    await cart.save();
    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Remove item failed", error: err.message });
  }
};

/**
 * @desc    Clear entire cart (Used after Order placement)
 * @route   DELETE /api/user/cart/clear
 */
export const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ customer: req.user.id });
    res.json({ 
      success: true, 
      msg: "Cart cleared", 
      items: [],
      billDetails: { totalItemPrice: 0, tax: 0, deliveryFee: 0, grandTotal: 0 }
    });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Clear cart failed", error: err.message });
  }
};