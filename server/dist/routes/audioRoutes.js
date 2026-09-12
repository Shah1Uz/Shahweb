"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const audioController_1 = require("../controllers/audioController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Audio Settings (Mode: normal/preview30, Autoplay, Duration, Action)
router.get('/settings', audioController_1.getAudioSettings);
router.put('/settings', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, audioController_1.updateAudioSettings);
// Tracks
router.get('/', audioController_1.getAudioTracks);
router.post('/', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, audioController_1.createAudioTrack);
router.put('/:id', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, audioController_1.updateAudioTrack);
router.delete('/:id', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, audioController_1.deleteAudioTrack);
exports.default = router;
