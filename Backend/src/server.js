import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Import Database & Config ---
import connectDB from './config/db.js'; // DB connection with built-in retry logic

// --- Import Routes ---
import authRoutes from './routes/auth.routes.js';       // Handles Public Login and Customer Self-Registration
import userRoutes from './routes/user.routes.js';       // Unified Customer Profiles, Carts, Orders, and Razorpay Actions
import mgmtRoutes from './routes/mgmt.routes.js';       // Role-Restricted Kitchen Feed, Staff, Menu CRUD, and Analytics

dotenv.config();

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 1. Initialize Express App & DB ---
const app = express();
connectDB(); // Establishes MongoDB connection safely

// --- 2. Global Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files as a structural fallback if Cloudinary credentials are empty
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 3. Mount Routes ---

// Authentication Pipeline (Public Login & Public Customer Registration)
app.use('/api/auth', authRoutes);

// Customer Application Services Layer (Protected Carts, Profiles, Checkout, Payments)
app.use('/api/user', userRoutes);

// Management Operations Layer (Restricted: Kitchen Terminal, Staff Management, Admin Analytics)
app.use('/api/mgmt', mgmtRoutes);

// --- 4. Root Route & Error Handling ---
app.get('/', (req, res) => {
  res.send('🍽️ FeastFlow API is live and running!');
});

// Global Error Handler (Catch-all middleware to prevent node process crashes)
app.use((err, req, res, next) => {
  console.error(`🔥 ERROR: ${err.message}`);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    msg: err.message || 'Internal Server Error'
  });
});

// --- 5. Start Server ---
const PORT = process.env.PORT || 5000; // Defaults cleanly to port 5000

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/`);
});