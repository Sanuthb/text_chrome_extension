import express from 'express';
import { generate, getHistory, getChat, deleteChat, downloadChat } from '../controllers/chatController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/generate', verifyToken, generate);
router.get('/history', verifyToken, getHistory);
router.get('/history/:id', verifyToken, getChat);
router.get('/history/:id/download', verifyToken, downloadChat);
router.delete('/history/:id', verifyToken, deleteChat);

export default router;
