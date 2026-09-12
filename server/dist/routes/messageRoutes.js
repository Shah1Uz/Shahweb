"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const messageController_1 = require("../controllers/messageController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public submission
router.post('/', messageController_1.submitMessage);
// Admin inbox
router.get('/', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, messageController_1.getMessages);
router.patch('/:id/status', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, messageController_1.updateMessageStatus);
router.post('/:id/reply', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, messageController_1.replyToMessage);
router.delete('/:id', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, messageController_1.deleteMessage);
exports.default = router;
