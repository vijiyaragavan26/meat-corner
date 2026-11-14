import { Router } from 'express';
import {
  getDashboardStats,
  getInventory,
  updateInventoryStock,
  getDeliveryPartners,
  updateDeliveryPartnerStatus,
  getCustomers,
  toggleCustomerStatus,
  getCoupons,
  createCoupon,
  updateCoupon,
  getAdminSettings,
  updateAdminSettings,
  getTickets,
  replyTicket,
  getReports
} from '../controllers/adminController';
import { authenticateJwt, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateJwt);
router.use(requireRole(['ADMIN']));

router.get('/dashboard', getDashboardStats);
router.get('/inventory', getInventory);
router.patch('/inventory/:id', updateInventoryStock);
router.get('/delivery-partners', getDeliveryPartners);
router.patch('/delivery-partners/:id/status', updateDeliveryPartnerStatus);
router.get('/customers', getCustomers);
router.patch('/customers/:id/toggle-status', toggleCustomerStatus);
router.get('/coupons', getCoupons);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.get('/settings', getAdminSettings);
router.put('/settings', updateAdminSettings);
router.get('/tickets', getTickets);
router.patch('/tickets/:id/reply', replyTicket);
router.get('/reports', getReports);

export default router;
