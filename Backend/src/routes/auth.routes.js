import express from 'express';
import { loginUser, registerUser } from '../controllers/users.controller.js';

const router = express.Router();

// This will be prefixed by /api/auth in server.js
router.post('/login', loginUser);
router.post('/register', registerUser);

export default router;