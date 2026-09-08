import { Router } from 'express';
import { uploadMedia, getMediaList, deleteMedia, renameMedia, serveMediaFile } from '../controllers/mediaController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

router.get('/', getMediaList);
router.get('/file/:identifier', serveMediaFile);
router.post('/upload', authenticate, requireAdmin, upload.array('files', 20), uploadMedia);
router.delete('/:id', authenticate, requireAdmin, deleteMedia);
router.patch('/:id/rename', authenticate, requireAdmin, renameMedia);

export default router;
