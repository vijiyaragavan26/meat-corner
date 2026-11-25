import express from 'express';
import cors from 'cors';
import { config } from './config';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import cartRoutes from './routes/cartRoutes';
import orderRoutes from './routes/orderRoutes';
import paymentRoutes from './routes/paymentRoutes';
import { createRazorpayPaymentOrder, verifyRazorpayPayment } from './controllers/paymentController';
import { optionalAuth } from './middleware/auth';
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

// Root Landing Page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Meat Corner API</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: #1e293b; padding: 40px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); text-align: center; max-width: 500px; border: 1px solid #334155; }
          h1 { color: #ef4444; margin-bottom: 8px; font-size: 28px; }
          p { color: #cbd5e1; line-height: 1.6; }
          .badge { display: inline-block; background: #22c55e20; color: #22c55e; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: bold; margin-bottom: 20px; border: 1px solid #22c55e40; }
          .btn { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; transition: background 0.2s; }
          .btn:hover { background: #dc2626; }
          .links { margin-top: 24px; font-size: 13px; color: #94a3b8; }
          .links a { color: #38bdf8; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">● Server Online (Port 5000)</div>
          <h1>🍗 MEAT CORNER BACKEND API</h1>
          <p>The backend REST API is running successfully and ready to serve orders, products, and deliveries.</p>
          <a class="btn" href="http://localhost:3000">Open Meat Corner Store (Frontend) ➔</a>
          <div class="links">
            <p>API Health Check: <a href="/api/health" target="_blank">/api/health</a></p>
          </div>
        </div>
      </body>
    </html>
  `);
});

// API Health Check
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'MEAT CORNER',
    service: 'Online Fresh Chicken E-Commerce & Local Delivery API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mounted Routes (Mounted with /api and direct prefix for Vercel serverless function compatibility)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api', productRoutes);
app.use('/', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/payments', paymentRoutes);
app.post(['/api/create-order', '/create-order'], optionalAuth, createRazorpayPaymentOrder);
app.post(['/api/verify-payment', '/verify-payment'], optionalAuth, verifyRazorpayPayment);
app.use('/api/delivery', deliveryRoutes);
app.use('/delivery', deliveryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);
app.use('/api/customer', customerRoutes);
app.use('/customer', customerRoutes);

// Error Handling Middleware
app.use(errorHandler);

if (!process.env.VERCEL) {
  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🍗 MEAT CORNER REST API running on port ${PORT}`);
    console.log(`🚀 Ready for Customer, Admin & Delivery Portals`);
    console.log(`=================================================`);
  });
}

export default app;
