import { Router } from 'express';
import { createRazorpayPaymentOrder, verifyRazorpayPayment } from '../controllers/paymentController';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

router.post('/create-order', authenticateJwt, createRazorpayPaymentOrder);
router.post('/verify', authenticateJwt, verifyRazorpayPayment);

export default router;
