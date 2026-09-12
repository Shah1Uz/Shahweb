"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const projectController_1 = require("../controllers/projectController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public / with optional auth
router.get('/', projectController_1.getProjects);
router.get('/:slug', projectController_1.getProjectBySlug);
router.post('/:id/react', projectController_1.reactToProject);
// Admin protected
router.post('/', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, projectController_1.createProject);
router.put('/:id', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, projectController_1.updateProject);
router.patch('/:id/stats', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, projectController_1.updateProjectStats);
router.delete('/:id', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, projectController_1.deleteProject);
exports.default = router;
