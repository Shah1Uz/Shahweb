import { Router } from 'express';
import {
  getProjects,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Public / with optional auth
router.get('/', getProjects);
router.get('/:slug', getProjectBySlug);

// Admin protected
router.post('/', authenticate, requireAdmin, createProject);
router.put('/:id', authenticate, requireAdmin, updateProject);
router.delete('/:id', authenticate, requireAdmin, deleteProject);

export default router;
