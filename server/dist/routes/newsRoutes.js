"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const newsController_1 = require("../controllers/newsController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public
router.get('/', newsController_1.getNews);
router.get('/:slug', newsController_1.getNewsBySlug);
// Admin
router.post('/', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, newsController_1.createNews);
router.put('/:id', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, newsController_1.updateNews);
router.delete('/:id', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, newsController_1.deleteNews);
exports.default = router;
