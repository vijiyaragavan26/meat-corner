import { Router } from 'express';
import {
  getAddresses,
  addAddress,
  deleteAddress,
  getWishlist,
  toggleWishlist,
  submitReview,
  createTicket,
  getCustomerTickets,
  checkPincode,
  getPublicSettings
} from '../controllers/customerController';
import { authenticateJwt, optionalAuth } from '../middleware/auth';

const router = Router();

// Publicly accessible customer features
router.post('/check-pincode', checkPincode);
router.get('/settings', getPublicSettings);

// Authenticated features
router.get('/addresses', authenticateJwt, getAddresses);
router.post('/addresses', authenticateJwt, addAddress);
router.delete('/addresses/:id', authenticateJwt, deleteAddress);

router.get('/wishlist', authenticateJwt, getWishlist);
router.post('/wishlist/toggle', authenticateJwt, toggleWishlist);

router.post('/reviews', authenticateJwt, submitReview);

router.get('/tickets', authenticateJwt, getCustomerTickets);
router.post('/tickets', authenticateJwt, createTicket);

export default router;
