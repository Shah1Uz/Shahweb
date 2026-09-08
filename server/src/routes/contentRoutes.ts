import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  getExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
  getServices,
  createService,
  updateService,
  deleteService,
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getNavigation,
  updateNavigation,
  deleteNavigationItem,
  getSettings,
  updateSettings,
  getDashboardStats,
} from '../controllers/contentController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Profile
router.get('/profile', getProfile);
router.put('/profile', authenticate, requireAdmin, updateProfile);

// Skills
router.get('/skills', getSkills);
router.post('/skills', authenticate, requireAdmin, createSkill);
router.put('/skills/:id', authenticate, requireAdmin, updateSkill);
router.delete('/skills/:id', authenticate, requireAdmin, deleteSkill);

// Experiences & Education
router.get('/experiences', getExperiences);
router.post('/experiences', authenticate, requireAdmin, createExperience);
router.put('/experiences/:id', authenticate, requireAdmin, updateExperience);
router.delete('/experiences/:id', authenticate, requireAdmin, deleteExperience);

// Services
router.get('/services', getServices);
router.post('/services', authenticate, requireAdmin, createService);
router.put('/services/:id', authenticate, requireAdmin, updateService);
router.delete('/services/:id', authenticate, requireAdmin, deleteService);

// Testimonials
router.get('/testimonials', getTestimonials);
router.post('/testimonials', authenticate, requireAdmin, createTestimonial);
router.put('/testimonials/:id', authenticate, requireAdmin, updateTestimonial);
router.delete('/testimonials/:id', authenticate, requireAdmin, deleteTestimonial);

// Navigation
router.get('/navigation', getNavigation);
router.put('/navigation', authenticate, requireAdmin, updateNavigation);
router.delete('/navigation/:id', authenticate, requireAdmin, deleteNavigationItem);

// Settings (Site & SEO)
router.get('/settings', getSettings);
router.put('/settings', authenticate, requireAdmin, updateSettings);

// Dashboard stats
router.get('/dashboard/stats', authenticate, requireAdmin, getDashboardStats);

export default router;
