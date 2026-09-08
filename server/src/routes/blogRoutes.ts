import { Router } from 'express';
import {
  getBlogPosts,
  getBlogPostBySlug,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from '../controllers/blogController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Public
router.get('/', getBlogPosts);
router.get('/:slug', getBlogPostBySlug);

// Admin
router.post('/', authenticate, requireAdmin, createBlogPost);
router.put('/:id', authenticate, requireAdmin, updateBlogPost);
router.delete('/:id', authenticate, requireAdmin, deleteBlogPost);

export default router;
