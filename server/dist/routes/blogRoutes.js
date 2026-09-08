"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blogController_1 = require("../controllers/blogController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public
router.get('/', blogController_1.getBlogPosts);
router.get('/:slug', blogController_1.getBlogPostBySlug);
// Admin
router.post('/', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, blogController_1.createBlogPost);
router.put('/:id', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, blogController_1.updateBlogPost);
router.delete('/:id', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, blogController_1.deleteBlogPost);
exports.default = router;
