import { Router } from 'express';
import {
  submitMessage,
  getMessages,
  updateMessageStatus,
  deleteMessage,
  replyToMessage,
} from '../controllers/messageController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Public submission
router.post('/', submitMessage);

// Admin inbox
router.get('/', authenticate, requireAdmin, getMessages);
router.patch('/:id/status', authenticate, requireAdmin, updateMessageStatus);
router.post('/:id/reply', authenticate, requireAdmin, replyToMessage);
router.delete('/:id', authenticate, requireAdmin, deleteMessage);

export default router;
