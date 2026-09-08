import { Router } from 'express';
import {
  getAudioTracks,
  createAudioTrack,
  updateAudioTrack,
  deleteAudioTrack,
} from '../controllers/audioController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getAudioTracks);
router.post('/', authenticate, requireAdmin, createAudioTrack);
router.put('/:id', authenticate, requireAdmin, updateAudioTrack);
router.delete('/:id', authenticate, requireAdmin, deleteAudioTrack);

export default router;
