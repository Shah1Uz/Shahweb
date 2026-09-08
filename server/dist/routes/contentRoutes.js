"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contentController_1 = require("../controllers/contentController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Profile
router.get('/profile', contentController_1.getProfile);
router.put('/profile', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, contentController_1.updateProfile);
// Skills
router.get('/skills', contentController_1.getSkills);
router.post('/skills', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, contentController_1.createSkill);
router.put('/skills/:id', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, contentController_1.updateSkill);
router.delete('/skills/:id', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, contentController_1.deleteSkill);
// Experiences & Education
router.get('/experiences', contentController_1.getExperiences);
router.post('/experiences', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, contentController_1.createExperience);
router.put('/experiences/:id', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, contentController_1.updateExperience);
router.delete('/experiences/:id', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, contentController_1.deleteExperience);
// Services
router.get('/services', contentController_1.getServices);
router.post('/services', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, contentController_1.createService);
router.put('/services/:id', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, contentController_1.updateService);
router.delete('/services/:id', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, contentController_1.deleteService);
// Testimonials
router.get('/testimonials', contentController_1.getTestimonials);
router.post('/testimonials', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, contentController_1.createTestimonial);
router.put('/testimonials/:id', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, contentController_1.updateTestimonial);
router.delete('/testimonials/:id', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, contentController_1.deleteTestimonial);
// Navigation
router.get('/navigation', contentController_1.getNavigation);
router.put('/navigation', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, contentController_1.updateNavigation);
router.delete('/navigation/:id', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, contentController_1.deleteNavigationItem);
// Settings (Site & SEO)
router.get('/settings', contentController_1.getSettings);
router.put('/settings', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, contentController_1.updateSettings);
// Dashboard stats
router.get('/dashboard/stats', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, contentController_1.getDashboardStats);
exports.default = router;
