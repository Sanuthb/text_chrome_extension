import express from 'express';
import { register, login, logout, getMe, forgotPassword, updatePassword, updateProfile } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/update-password', verifyToken, updatePassword);
router.put('/profile', verifyToken, updateProfile);
router.get('/me', verifyToken, getMe);

export default router;
