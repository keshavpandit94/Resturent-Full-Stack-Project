import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path'; // Imported to execute safe file-extension checking fallback routines
import dotenv from 'dotenv';

dotenv.config();

// --- 1. Cloudinary Configuration ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- 2. Define Cloudinary Storage Engine ---
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'feastflow_uploads', // Standardized cloud folder sandbox directory
    allowed_formats: ['jpeg', 'png', 'jpg', 'webp', 'jfif'], // Enforced whitelist file restrictions
    // Automatic format conversion and sizing limits keep bandwidth footprints compact
    transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' }] 
  },
});

// --- 3. Multer Instance & File Filter Guard ---
const parser = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB structural security barrier limit
  fileFilter: (req, file, cb) => {
    // 🛡️ ALIGNMENT FIX: Handle missing/generic MIME type mapping exceptions for specialized formats like JFIF
    const isStandardImageMime = file.mimetype.startsWith('image/');
    
    // Fallback: Validate extension signature strictly against the whitelisted tokens array
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const isWhitelistedExtension = ['.jpeg', '.jpg', '.png', '.webp', '.jfif'].includes(fileExtension);

    if (isStandardImageMime || isWhitelistedExtension) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only image uploads are permitted!'), false);
    }
  }
});

// --- 4. Exported Middleware Interface Wrapper ---
// Intercepts payload transmission exceptions smoothly to prevent Express process crashes
const upload = {
  single: (fieldName) => {
    const uploadMiddleware = parser.single(fieldName);
    
    return (req, res, next) => {
      uploadMiddleware(req, res, (err) => {
        if (err) {
          return res.status(400).json({ 
            success: false, 
            msg: err.message || 'Image upload transaction failed' 
          });
        }
        next();
      });
    };
  }
};

export default upload;