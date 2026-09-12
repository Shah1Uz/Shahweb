import { Router } from 'express';
import {
  getProjects,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
  reactToProject,
  updateProjectStats,
} from '../controllers/projectController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Public / with optional auth
router.get('/', getProjects);
router.get('/:slug', getProjectBySlug);
router.post('/:id/react', reactToProject);

// Admin protected
router.post('/', authenticate, requireAdmin, createProject);
router.put('/:id', authenticate, requireAdmin, updateProject);
router.patch('/:id/stats', authenticate, requireAdmin, updateProjectStats);
router.delete('/:id', authenticate, requireAdmin, deleteProject);

export default router;
