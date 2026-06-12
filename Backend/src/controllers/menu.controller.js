import Menu from '../models/Menu.model.js';

/**
 * @desc    Get all available menu items (Public)
 * @route   GET /api/user/menu
 */
export const getMenu = async (req, res) => {
  try {
    // Fetches all menu items currently marked active in stock
    const menuItems = await Menu.find({ isAvailable: true }).sort({ category: 1 });
    
    res.status(200).json({
      success: true,
      count: menuItems.length,
      menuItems
    });
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Server Error', error: err.message });
  }
};

/**
 * @desc    Add a new dish (Admin/Manager Only)
 * @route   POST /api/mgmt/menu/add
 */
export const addDish = async (req, res) => {
  try {
    const { 
      name, description, price, category, 
      isVegetarian, spicyLevel, prepTime 
    } = req.body;

    // 🛡️ ENUM MAP NORMALIZATION: Ensures both singular and plural categories match model parameters cleanly
    let normalizedCategory = category;
    if (category === 'Starter') normalizedCategory = 'Starters';
    if (category === 'Dessert') normalizedCategory = 'Desserts';
    if (category === 'Beverage') normalizedCategory = 'Beverages';

    const dishData = {
      name: name?.trim(),
      description: description?.trim(),
      price: price ? Number(price) : 0, 
      category: normalizedCategory,
      isVegetarian: String(isVegetarian) === 'true', 
      spicyLevel: spicyLevel && spicyLevel.trim() !== "" ? spicyLevel : "Medium", 
      prepTime: prepTime ? Number(prepTime) : 20 
    };

    if (req.file) {
      dishData.image = req.file.path; // Cloudinary secure storage mapping
    }

    const newDish = new Menu(dishData);
    await newDish.save();

    res.status(201).json({ 
      success: true, 
      msg: 'Dish added successfully', 
      dish: newDish 
    });
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Failed to add dish', error: err.message });
  }
};

/**
 * @desc    Update dish details (Admin/Manager Only)
 * @route   PUT /api/mgmt/menu/:id
 */
export const updateDish = async (req, res) => {
  try {
    const { name, description, price, category, isVegetarian, spicyLevel, prepTime } = req.body;
    let updates = {};

    // 🛡️ MULTI-PART PAYLOAD SANITIZER: Build the dataset cleanly.
    // This stops incoming serialization strings ("") from stomping out existing database properties.
    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description.trim();
    if (price !== undefined && price !== "") updates.price = Number(price);
    if (isVegetarian !== undefined) updates.isVegetarian = String(isVegetarian) === 'true';
    if (spicyLevel !== undefined && spicyLevel.trim() !== "") updates.spicyLevel = spicyLevel;
    if (prepTime !== undefined && prepTime !== "") updates.prepTime = Number(prepTime);

    if (category !== undefined && category !== "") {
      let normalizedCategory = category;
      if (category === 'Starter') normalizedCategory = 'Starters';
      if (category === 'Dessert') normalizedCategory = 'Desserts';
      if (category === 'Beverage') normalizedCategory = 'Beverages';
      updates.category = normalizedCategory;
    }

    if (req.file) {
      updates.image = req.file.path; // Updates file asset strings natively
    }

    const updatedDish = await Menu.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedDish) {
      return res.status(404).json({ success: false, msg: 'Dish not found' });
    }

    res.json({ success: true, dish: updatedDish });
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Update failed', error: err.message });
  }
};

/**
 * @desc    Toggle Menu Item Availability (Manager/Admin)
 * @route   PATCH /api/mgmt/menu/:id/toggle
 */
export const updateMenuAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const { id } = req.params;

    const targetStatus = typeof isAvailable === 'boolean' ? isAvailable : String(isAvailable) === 'true';

    const item = await Menu.findByIdAndUpdate(
      id, 
      { isAvailable: targetStatus }, 
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({ success: false, msg: 'Menu item not found' });
    }

    res.json({ 
      success: true, 
      msg: `${item.name} is now ${item.isAvailable ? 'Available' : 'Unavailable'}`,
      item 
    });
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Error toggling availability', error: err.message });
  }
};

/**
 * @desc    Delete a dish (Admin Only)
 * @route   DELETE /api/mgmt/menu/:id
 */
export const deleteDish = async (req, res) => {
  try {
    const dish = await Menu.findByIdAndDelete(req.params.id);
    if (!dish) {
      return res.status(404).json({ success: false, msg: 'Dish not found' });
    }

    res.json({ success: true, msg: 'Dish removed from menu' });
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Delete failed', error: err.message });
  }
};