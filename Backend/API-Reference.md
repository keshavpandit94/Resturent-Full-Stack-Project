# FeastFlow Backend API Reference

## Base URL
- Local development: `http://localhost:5000`

## Common headers
- `Content-Type: application/json`
- `Authorization: Bearer <token>` for protected routes

## Authentication

### POST /api/auth/login
Login with customer or default admin credentials.

Request body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Success response:
```json
{
  "success": true,
  "token": "<jwt_token>",
  "user": {
    "id": "...",
    "name": "...",
    "email": "...",
    "role": "customer",
    "profileImage": "..."
  }
}
```

JS fetch example:
```js
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const data = await response.json();
```

### POST /api/auth/register
Register a new customer.

Request body:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "mobile": "9876543210",
  "password": "securePass!23",
  "gender": "female"
}
```

Success response:
```json
{
  "success": true,
  "token": "<jwt_token>",
  "user": {
    "id": "...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "customer"
  }
}
```

---

## User Routes (`/api/user`)

### GET /api/user/me
Get the logged-in user profile.

Headers:
- `Authorization: Bearer <token>`

Success response:
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "mobile": "9876543210",
    "role": "customer",
    "profileImage": "...",
    "addresses": [],
    "paymentMethods": []
  }
}
```

### PUT /api/user/profile
Update user profile. Supports optional image upload with Cloudinary.

Headers:
- `Authorization: Bearer <token>`
- For JSON: `Content-Type: application/json`

Request body:
```json
{
  "name": "Jane D.",
  "mobile": "9876543210"
}
```

If uploading an image, use `multipart/form-data` and send `image` file field.

Success response:
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "name": "Jane D.",
    "email": "jane@example.com",
    "profileImage": "<cloudinary-url>"
  }
}
```

### POST /api/user/address
Add a delivery address.

Headers:
- `Authorization: Bearer <token>`

Request body:
```json
{
  "title": "Home",
  "addressLine": "123 Main Street",
  "city": "Mumbai",
  "pincode": "400001",
  "landmark": "Near central park",
  "isDefault": true
}
```

Success response:
```json
{
  "success": true,
  "addresses": [ ... ]
}
```

### POST /api/user/payment
Save a payment method to the user profile.

Headers:
- `Authorization: Bearer <token>`

Request body:
```json
{
  "cardHolder": "Jane Doe",
  "cardNumber": "4111111111111111",
  "expiryMonth": "12",
  "expiryYear": "2027",
  "cvv": "123",
  "isDefault": true
}
```

Response:
```json
{
  "success": true,
  "paymentMethods": [ ... ]
}
```

### GET /api/user/menu
Fetch available menu items.

Success response:
```json
{
  "success": true,
  "count": 5,
  "menuItems": [
    {
      "_id": "...",
      "name": "Paneer Butter Masala",
      "price": 250,
      "category": "Main Course",
      "isAvailable": true,
      "image": "..."
    }
  ]
}
```

### GET /api/user/cart
Get the current cart for the authenticated user.

Headers:
- `Authorization: Bearer <token>`

Success response when cart exists:
```json
{
  "_id": "...",
  "customer": "...",
  "items": [ ... ],
  "billDetails": {
    "totalItemPrice": 500,
    "tax": 45,
    "deliveryFee": 30,
    "grandTotal": 575
  }
}
```

If empty:
```json
{
  "items": [],
  "billDetails": {
    "totalItemPrice": 0,
    "tax": 0,
    "deliveryFee": 0,
    "grandTotal": 0
  }
}
```

### POST /api/user/cart/add
Add an item to the cart or update quantity.

Headers:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

Request body:
```json
{
  "menuItem": "<menu_item_id>",
  "quantity": 2
}
```

Success response:
```json
{
  "success": true,
  "cart": { ... }
}
```

### DELETE /api/user/cart/item/:id
Remove a cart item by its cart item ID.

Headers:
- `Authorization: Bearer <token>`

Success response:
```json
{
  "success": true,
  "cart": { ... }
}
```

### DELETE /api/user/cart/clear
Clear the entire cart.

Headers:
- `Authorization: Bearer <token>`

Response:
```json
{
  "success": true,
  "msg": "Cart cleared",
  "items": [],
  "billDetails": {
    "totalItemPrice": 0,
    "tax": 0,
    "deliveryFee": 0,
    "grandTotal": 0
  }
}
```

### POST /api/user/orders
Place a new order.

Headers:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

Request body:
```json
{
  "items": [
    { "menuItem": "<menu_item_id>", "quantity": 1 }
  ],
  "deliveryAddress": {
    "title": "Home",
    "addressLine": "123 Main Street",
    "city": "Mumbai",
    "pincode": "400001"
  },
  "paymentMethod": "Cash"
}
```

Success response:
```json
{
  "success": true,
  "msg": "Order placed successfully! Your cart has been cleared.",
  "order": { ... }
}
```

### GET /api/user/my-orders
Get order history for the logged-in customer.

Headers:
- `Authorization: Bearer <token>`

Response:
```json
{
  "success": true,
  "orders": [ ... ]
}
```

### POST /api/user/checkout/razorpay-order
Create a Razorpay payment order.

Headers:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

Request body:
```json
{
  "amount": 599,
  "currency": "INR"
}
```

Success response:
```json
{
  "success": true,
  "id": "order_ABC123",
  "entity": "order",
  "amount": 59900,
  "currency": "INR",
  "status": "created"
}
```

### POST /api/user/checkout/verify-signature
Verify Razorpay payment signature.

Headers:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

Request body:
```json
{
  "razorpay_order_id": "order_ABC123",
  "razorpay_payment_id": "pay_ABC123",
  "razorpay_signature": "<signature>",
  "db_order_id": "<order_id_in_db>"
}
```

Success response:
```json
{
  "success": true,
  "msg": "Payment verified and recorded successfully",
  "order": { ... }
}
```

---

## Management Routes (`/api/mgmt`)
These routes require `Authorization: Bearer <token>` and role authorization.

### GET /api/mgmt/orders/active
Get active kitchen orders.

Success response:
```json
[
  {
    "_id": "...",
    "customer": { "name": "Jane Doe", "mobile": "9876543210" },
    "items": [ ... ],
    "orderStatus": "placed"
  }
]
```

### PUT /api/mgmt/orders/:id/status
Update order status.

Headers:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

Request body:
```json
{
  "status": "preparing",
  "assignedStaff": "Rahul"
}
```

Success response:
```json
{
  "success": true,
  "order": { ... }
}
```

### POST /api/mgmt/account/create
Create a staff or manager account.

Headers:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

Request body for manager creation by admin:
```json
{
  "name": "Sam Manager",
  "email": "sam.manager@example.com",
  "mobile": "9988776655",
  "password": "ManagerPass123",
  "role": "manager",
  "gender": "male"
}
```

Request body for staff creation by manager:
```json
{
  "name": "Rita Staff",
  "email": "rita.staff@example.com",
  "mobile": "9123456780",
  "password": "StaffPass456",
  "role": "staff"
}
```

Success response:
```json
{
  "success": true,
  "msg": "Account successfully created for staff",
  "user": { ... }
}
```

### GET /api/mgmt/staff/all
Return staff and manager list based on user role.

Success response:
```json
{
  "success": true,
  "count": 3,
  "staff": [ ... ]
}
```

### PUT /api/mgmt/users/:id
Update a staff or manager profile.

Headers:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

Request body:
```json
{
  "name": "Rita S.",
  "role": "staff",
  "mobile": "9123456781"
}
```

Success response:
```json
{
  "success": true,
  "msg": "Workspace profile settings updated successfully for Rita S.",
  "user": { ... }
}
```

### DELETE /api/mgmt/users/:id
Deactivate a user account.

Headers:
- `Authorization: Bearer <token>`

Success response:
```json
{
  "success": true,
  "msg": "User account for ... successfully deactivated.",
  "user": {
    "id": "...",
    "name": "...",
    "isActive": false
  }
}
```

### PUT /api/mgmt/staff/:id/change-manager
Change a staff member's manager (admin only).

Headers:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

Request body:
```json
{
  "managerId": "<manager_user_id>"
}
```

Success response:
```json
{
  "success": true,
  "msg": "Employee organizational reporting manager updated successfully.",
  "user": { ... }
}
```

### GET /api/mgmt/analytics/revenue
Get revenue and active staff analytics.

Success response:
```json
{
  "success": true,
  "totalRevenue": 12500,
  "activeStaffCount": 4,
  "currency": "INR"
}
```

### POST /api/mgmt/menu/add
Add a menu item with image upload.

Headers:
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

Fields:
- `name`
- `description`
- `price`
- `category`
- `isVegetarian`
- `spicyLevel`
- `prepTime`
- `image` file

Success response:
```json
{
  "success": true,
  "msg": "Dish added successfully",
  "dish": { ... }
}
```

### PUT /api/mgmt/menu/:id
Update a menu item. Use JSON or multipart form data for image update.

Headers:
- `Authorization: Bearer <token>`

Request body example:
```json
{
  "price": 299,
  "isVegetarian": true
}
```

Success response:
```json
{
  "success": true,
  "dish": { ... }
}
```

### PATCH /api/mgmt/menu/:id/toggle
Toggle menu item availability.

Headers:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

Request body:
```json
{
  "isAvailable": true
}
```

Success response:
```json
{
  "success": true,
  "msg": "<Dish> availability updated to true",
  "item": { ... }
}
```

### DELETE /api/mgmt/menu/:id
Delete a menu item.

Headers:
- `Authorization: Bearer <token>`

Success response:
```json
{
  "success": true,
  "msg": "Dish removed from menu"
}
```

---

## Sample frontend helper

Use this helper to attach the auth token:

```js
const API = 'http://localhost:5000';

const authFetch = async (path, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const response = await fetch(`${API}${path}`, {
    ...options,
    headers,
  });
  return response.json();
};
```

Use:
```js
const menu = await authFetch('/api/user/menu', { method: 'GET' });
```
