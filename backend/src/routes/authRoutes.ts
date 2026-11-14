import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateJwt, getMe);
router.post('/logout', (req, res) => res.json({ success: true, message: 'Logged out successfully' }));

export default router;
