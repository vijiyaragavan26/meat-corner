import { Router } from 'express';
import {
  getCategories,
  getProducts,
  getProductById,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminCreateCategory,
  adminUpdateCategory
} from '../controllers/productController';
import { authenticateJwt, requireRole } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/categories', getCategories);
router.get('/products', getProducts);
router.get('/products/:id', getProductById);

// Admin routes
router.post('/admin/products', authenticateJwt, requireRole(['ADMIN']), adminCreateProduct);
router.put('/admin/products/:id', authenticateJwt, requireRole(['ADMIN']), adminUpdateProduct);
router.delete('/admin/products/:id', authenticateJwt, requireRole(['ADMIN']), adminDeleteProduct);

router.post('/admin/categories', authenticateJwt, requireRole(['ADMIN']), adminCreateCategory);
router.put('/admin/categories/:id', authenticateJwt, requireRole(['ADMIN']), adminUpdateCategory);

export default router;
