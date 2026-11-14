import { Router } from 'express';
import {
  createOrder,
  getCustomerOrders,
  getOrderById,
  adminGetOrders,
  adminUpdateOrderStatus,
  adminAssignDeliveryPartner
} from '../controllers/orderController';
import { authenticateJwt, requireRole } from '../middleware/auth';

const router = Router();

// Customer Order Endpoints
router.post('/', authenticateJwt, createOrder);
router.get('/', authenticateJwt, getCustomerOrders);
router.get('/:id', getOrderById); // can be viewed with ID / tracking link

// Admin Order Endpoints
router.get('/admin/all', authenticateJwt, requireRole(['ADMIN']), adminGetOrders);
router.patch('/admin/:id/status', authenticateJwt, requireRole(['ADMIN']), adminUpdateOrderStatus);
router.post('/admin/:id/assign-partner', authenticateJwt, requireRole(['ADMIN']), adminAssignDeliveryPartner);

export default router;
