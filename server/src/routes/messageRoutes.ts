import { Router } from 'express';
import {
  submitMessage,
  getMessages,
  updateMessageStatus,
  deleteMessage,
} from '../controllers/messageController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Public submission
router.post('/', submitMessage);

// Admin inbox
router.get('/', authenticate, requireAdmin, getMessages);
router.patch('/:id/status', authenticate, requireAdmin, updateMessageStatus);
router.delete('/:id', authenticate, requireAdmin, deleteMessage);

export default router;
