import { Router } from 'express';
import {
  getAudioTracks,
  createAudioTrack,
  updateAudioTrack,
  deleteAudioTrack,
  getAudioSettings,
  updateAudioSettings,
} from '../controllers/audioController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Audio Settings (Mode: normal/preview30, Autoplay, Duration, Action)
router.get('/settings', getAudioSettings);
router.put('/settings', authenticate, requireAdmin, updateAudioSettings);

// Tracks
router.get('/', getAudioTracks);
router.post('/', authenticate, requireAdmin, createAudioTrack);
router.put('/:id', authenticate, requireAdmin, updateAudioTrack);
router.delete('/:id', authenticate, requireAdmin, deleteAudioTrack);

export default router;
