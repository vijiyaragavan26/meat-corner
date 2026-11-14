import express from 'express';
import cors from 'cors';
import { config } from './config';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import cartRoutes from './routes/cartRoutes';
import orderRoutes from './routes/orderRoutes';
import paymentRoutes from './routes/paymentRoutes';
import deliveryRoutes from './routes/deliveryRoutes';
import adminRoutes from './routes/adminRoutes';
import customerRoutes from './routes/customerRoutes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Middlewares
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-guest-id']
  })
);

app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'MEAT CORNER',
    service: 'Online Fresh Chicken E-Commerce & Local Delivery API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mounted Routes
app.use('/api/auth', authRoutes);
app.use('/api', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/customer', customerRoutes);

// Error Handling Middleware
app.use(errorHandler);

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🍗 MEAT CORNER REST API running on port ${PORT}`);
  console.log(`🚀 Ready for Customer, Admin & Delivery Portals`);
  console.log(`=================================================`);
});

export default app;
