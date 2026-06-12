import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * @desc    Connect to MongoDB with a retry mechanism
 * @param   {number} retries - Number of attempts before giving up
 */
const connectDB = async (retries = 5) => {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error("❌ FATAL ERROR: MONGODB_URI is not defined in .env");
    process.exit(1); 
  }

  // Monitor connection after initial success
  mongoose.connection.on('error', (err) => {
    console.error(`(Runtime Error) MongoDB connection lost: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('(Runtime Warning) MongoDB disconnected. Attempting to reconnect...');
  });

  // --- Retry Loop Implementation ---
  while (retries > 0) {
    try {
      console.log(`📡 Attempting to connect to MongoDB... (Attempts left: ${retries})`);
      
      const conn = await mongoose.connect(MONGODB_URI);

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return; // Exit function on success
    } catch (err) {
      retries -= 1;
      console.warn(`⚠️ MongoDB connection failed. Retrying in 5s... Error: ${err.message}`);
      
      if (retries === 0) {
        console.error('🛑 FATAL: Could not connect to MongoDB after all retries.');
        process.exit(1);
      }
      
      // Wait for 5 seconds before the next attempt
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};

export default connectDB;