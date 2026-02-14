import express from 'express';
import { 
    generate, getHistory, getChat, deleteChat, downloadChat, 
    auditChat, getStoreListing, publishChat, getPublicChats 
} from '../controllers/chatController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/generate', verifyToken, generate);
router.get('/history', verifyToken, getHistory);
router.get('/gallery', getPublicChats); // Public route
router.post('/history/:id/publish', verifyToken, publishChat);
router.get('/history/:id', verifyToken, getChat);
router.get('/history/:id/download', verifyToken, downloadChat);
router.get('/history/:id/audit', verifyToken, auditChat);
router.get('/history/:id/store-listing', verifyToken, getStoreListing);
router.delete('/history/:id', verifyToken, deleteChat);

export default router;
