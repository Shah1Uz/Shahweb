import { Router } from 'express';
import {
  getBlogPosts,
  getBlogPostBySlug,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  reactToBlogPost,
  updateBlogStats,
} from '../controllers/blogController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Public
router.get('/', getBlogPosts);
router.get('/:slug', getBlogPostBySlug);
router.post('/:id/react', reactToBlogPost);

// Admin
router.post('/', authenticate, requireAdmin, createBlogPost);
router.put('/:id', authenticate, requireAdmin, updateBlogPost);
router.patch('/:id/stats', authenticate, requireAdmin, updateBlogStats);
router.delete('/:id', authenticate, requireAdmin, deleteBlogPost);

export default router;
