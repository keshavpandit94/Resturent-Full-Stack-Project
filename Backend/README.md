# FeastFlow Backend

A Node.js/Express backend for a restaurant ordering system (FeastFlow). Provides user authentication, menu management, cart/order flow, Razorpay payment integration, and role-based management (kitchen/admin/staff).

**Project layout**
- [src/server.js](src/server.js#L1) - App entry
- [src/config/db.js](src/config/db.js#L1) - MongoDB connection with retry logic
- [src/controllers](src/controllers) - Route handlers
- [src/models](src/models) - Mongoose schemas (User, Menu, Cart, Order, Payment)
- [src/middleware](src/middleware) - JWT auth, Cloudinary upload, role checks
- [src/routes](src/routes) - Routed API endpoints
- [uploads](uploads) - Local uploads fallback

**Key Features**
- JWT authentication and role-based authorization (`admin`,`manager`,`staff`,`customer`)
- Cart with auto-calculated billing (tax, delivery fee, grand total)
- Menu CRUD with Cloudinary image uploads
- Order placement and status tracking
- Razorpay integration hooks for payments
- Docker Compose for MongoDB + Mongo Express

## Getting Started

Prerequisites
- Node.js (>=18 recommended)
- npm
- Docker (optional, for DB)

Install dependencies
```bash
npm install
```

Environment
Create a `.env` file in the project root with the following variables (example values):

```
MONGODB_URI=mongodb://localhost:27017/feastflow
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@feastflow.com
ADMIN_PASSWORD=admin123
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_SECRET=your_razorpay_secret
PORT=5000
```

Start the app (development)
```bash
npm run dev
```

Or with nodemon (start script)
```bash
npm start
```

Run DB stack with Docker Compose (optional)
```bash
docker-compose up -d
# MongoDB on localhost:27017, Mongo Express on http://localhost:8081
```

## API Overview
Base URL: `/api`

Authentication
- POST `/api/auth/login` - Login (also supports default hardcoded admin)
- POST `/api/auth/register` - Register new user

Customer (requires `Authorization: Bearer <token>`)
- GET `/api/user/me` - Get current profile
- PUT `/api/user/profile` - Update profile (supports `image` upload)
- POST `/api/user/address` - Add delivery address
- POST `/api/user/payment` - Save payment method
- GET `/api/user/menu` - Fetch menu (public in server.js mounting)

Cart (protected)
- GET `/api/user/cart` - Get cart
- POST `/api/user/cart/add` - Add/update item
- DELETE `/api/user/cart/item/:id` - Remove item
- DELETE `/api/user/cart/clear` - Clear cart

Orders
- POST `/api/user/orders` - Place order
- GET `/api/user/orders/my` - Get my orders

Management (role restricted)
- GET `/api/mgmt/orders/active` - Active orders (staff/manager/admin)
- PUT `/api/mgmt/orders/:id/status` - Update order status (staff/manager/admin)
- GET `/api/mgmt/payments/all` - Get payments (manager/admin)
- POST `/api/mgmt/menu/add` - Add dish (manager/admin)
- PUT `/api/mgmt/menu/:id` - Update dish (manager/admin)
- PATCH `/api/mgmt/menu/:id/toggle` - Toggle availability (manager/admin)
- GET `/api/mgmt/staff/all` - Staff list (admin)

## Data Models (summary)
- User: name, email (unique), mobile, password (bcrypt), role, addresses[], paymentMethods[], isActive, lastLogin
- Menu: name, description, price, category, image (Cloudinary), isAvailable, isVegetarian, spicyLevel, rating, prepTime
- Cart: customer (unique), items[], billDetails (auto-calculated pre-save)
- Order: customer ref, items, totalAmount, tax, deliveryFee, deliveryAddress, paymentStatus, paymentMethod
- Payment: Razorpay transaction logging (controller integration points)

## Important Notes
- Default admin: uses `ADMIN_EMAIL` and `ADMIN_PASSWORD` set in env (defaults to admin@feastflow.com/admin123)
- JWT tokens expire in 7 days by default in the auth code
- Cloudinary is used for image uploads; if not configured, the project uses a placeholder image
- DB connection includes retry logic; server exits if `MONGODB_URI` is not provided or DB fails after retries

## Next Steps / TODOs
- Complete Razorpay payment capture & webhook processing in `src/controllers/payment.controller.js`
- Flesh out analytics endpoints in `src/controllers/mgmt.controllers.js`
- Add tests and Postman collection / OpenAPI spec

## Contributing
- Follow the existing ES Module style (import/export)
- Keep controller logic focused and move shared helpers to `src/utils` when needed

---
If you want, I can:
- Add example Postman requests for each endpoint
- Generate a minimal OpenAPI spec
- Add a CONTRIBUTING.md or set up tests

