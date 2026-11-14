import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { PincodeModal } from './components/common/PincodeModal';
import { CartDrawer } from './components/cart/CartDrawer';

// Customer Pages
import { HomePage } from './pages/customer/HomePage';
import { ProductListPage } from './pages/customer/ProductListPage';
import { ProductDetailPage } from './pages/customer/ProductDetailPage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { OrderConfirmationPage } from './pages/customer/OrderConfirmationPage';
import { OrderTrackingPage } from './pages/customer/OrderTrackingPage';
import { AccountPage } from './pages/customer/AccountPage';
import { AuthPage } from './pages/customer/AuthPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage';
import { AdminDeliveryPartnersPage } from './pages/admin/AdminDeliveryPartnersPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminCouponsPage } from './pages/admin/AdminCouponsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminSupportPage } from './pages/admin/AdminSupportPage';

// Delivery Pages
import { DeliveryLoginPage } from './pages/delivery/DeliveryLoginPage';
import { DeliveryDashboard } from './pages/delivery/DeliveryDashboard';

export const App: React.FC = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');
  const isDeliveryPath = location.pathname.startsWith('/delivery');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Show Customer Header & Footer only on customer-facing routes */}
      {!isAdminPath && !isDeliveryPath && <Header />}

      <div className="flex-1">
        <Routes>
          {/* Customer Portal */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders/:id/confirmed" element={<OrderConfirmationPage />} />
          <Route path="/orders/:id/track" element={<OrderTrackingPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/login" element={<AuthPage />} />

          {/* Admin Portal */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="inventory" element={<AdminInventoryPage />} />
            <Route path="delivery-partners" element={<AdminDeliveryPartnersPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="coupons" element={<AdminCouponsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="support" element={<AdminSupportPage />} />
          </Route>

          {/* Delivery Partner Portal */}
          <Route path="/delivery/login" element={<DeliveryLoginPage />} />
          <Route path="/delivery" element={<DeliveryDashboard />} />
          <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Global Modals & Drawers */}
      <PincodeModal />
      <CartDrawer />

      {!isAdminPath && !isDeliveryPath && <Footer />}
    </div>
  );
};
export default App;
