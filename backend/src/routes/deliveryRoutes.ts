import { Router } from 'express';
import {
  getDeliveryProfile,
  toggleOnlineStatus,
  getAssignedOrders,
  acceptAssignment,
  rejectAssignment,
  updateDeliveryOrderStatus,
  verifyDeliveryOtp,
  submitCodCollection,
  updateGpsLocation,
  getEarnings
} from '../controllers/deliveryController';
import { authenticateJwt, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateJwt);
router.use(requireRole(['DELIVERY_PARTNER', 'ADMIN']));

router.get('/profile', getDeliveryProfile);
router.patch('/toggle-online', toggleOnlineStatus);
router.get('/assignments', getAssignedOrders);
router.post('/assignments/:id/accept', acceptAssignment);
router.post('/assignments/:id/reject', rejectAssignment);
router.patch('/orders/:id/status', updateDeliveryOrderStatus);
router.post('/orders/:id/collect-cod', submitCodCollection);
router.post('/orders/:id/verify-otp', verifyDeliveryOtp);
router.post('/location', updateGpsLocation);
router.get('/earnings', getEarnings);

export default router;
