import { Router } from 'express';
import { createRazorpayPaymentOrder, verifyRazorpayPayment } from '../controllers/paymentController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.post('/create-order', optionalAuth, createRazorpayPaymentOrder);
router.post('/verify', optionalAuth, verifyRazorpayPayment);

export default router;
