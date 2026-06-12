import Order from '../models/Order.model.js';
import Menu from '../models/Menu.model.js';
import User from '../models/Users.model.js';
import Cart from '../models/Cart.model.js'; 

/**
 * @desc    Place a new order (Customer)
 * @route   POST /api/user/orders
 */
export const placeOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod, transactionId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, msg: "Cart cannot be empty" });
    }

    let calculatedTotal = 0;
    const processedItems = [];

    // 1. Validate items and calculate total from Database prices (Security Layer)
    for (const item of items) {
      const dish = await Menu.findById(item.menuItem);
      
      if (!dish) {
        return res.status(404).json({ success: false, msg: `Item not found in menu` });
      }
      
      if (!dish.isAvailable) {
        return res.status(400).json({ success: false, msg: `${dish.name} is currently out of stock` });
      }
      
      const itemTotal = dish.price * item.quantity;
      calculatedTotal += itemTotal;

      processedItems.push({
        menuItem: dish._id,
        name: dish.name,
        quantity: item.quantity,
        price: dish.price
      });
    }

    // 2. Create the Order
    const newOrder = new Order({
      customer: req.user.id,
      items: processedItems,
      totalAmount: calculatedTotal, // The pre-save hook in Order.model.js will automatically handle computing tax, delivery fees, and grandTotal!
      deliveryAddress,
      paymentMethod,
      transactionId,
      paymentStatus: paymentMethod === 'Cash' ? 'pending' : 'paid', //
      orderStatus: 'placed' //
    });

    await newOrder.save();

    // 3. AUTO-CLEAR CART: Remove the user's cart items after successful order placement
    await Cart.findOneAndDelete({ customer: req.user.id });

    res.status(201).json({ 
      success: true, 
      msg: "Order placed successfully! Your cart has been cleared.", 
      order: newOrder 
    });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Order placement failed", error: err.message });
  }
};

/**
 * @desc    Get Order History (Customer)
 * @route   GET /api/user/my-orders
 */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .sort({ createdAt: -1 })
      .populate('items.menuItem', 'image'); 
    
    res.status(200).json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Failed to fetch orders", error: err.message });
  }
};

/**
 * @desc    Get All Active Orders (Staff/Kitchen View)
 * @route   GET /api/mgmt/orders/active
 */
export const getActiveOrders = async (req, res) => {
  try {
    // Aligned to look for 'ready' status matching the updated status options in Order.model.js
    const activeOrders = await Order.find({ 
      orderStatus: { $in: ['placed', 'preparing', 'ready'] } 
    })
    .sort({ createdAt: 1 }) // First In, First Out (FIFO) queue display mapping
    .populate('customer', 'name mobile');

    res.status(200).json(activeOrders);
  } catch (err) {
    res.status(500).json({ success: false, msg: "Kitchen feed error", error: err.message });
  }
};

/**
 * @desc    Update Order Status (Staff/Kitchen Terminal)
 * @route   PUT /api/mgmt/orders/:id/status
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, assignedStaff } = req.body;
    const { id } = req.params;

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { 
        $set: { 
          orderStatus: status,
          ...(assignedStaff && { assignedStaff }) //
        } 
      },
      { new: true, runValidators: true } // Added runValidators check
    );

    if (!updatedOrder) return res.status(404).json({ success: false, msg: "Order not found" });

    res.status(200).json({ success: true, order: updatedOrder });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Update failed", error: err.message });
  }
};