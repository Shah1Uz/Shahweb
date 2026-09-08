import { Router } from 'express';
import { login, logout, getMe, updatePassword } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.put('/password', authenticate, updatePassword);

export default router;
