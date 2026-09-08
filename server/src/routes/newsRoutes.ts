import { Router } from 'express';
import {
  getNews,
  getNewsBySlug,
  createNews,
  updateNews,
  deleteNews,
} from '../controllers/newsController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Public
router.get('/', getNews);
router.get('/:slug', getNewsBySlug);

// Admin
router.post('/', authenticate, requireAdmin, createNews);
router.put('/:id', authenticate, requireAdmin, updateNews);
router.delete('/:id', authenticate, requireAdmin, deleteNews);

export default router;
