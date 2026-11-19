import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { PincodeModal } from './components/common/PincodeModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { useAuth } from './contexts/AuthContext';

// Customer Pages
import { HomePage } from './pages/customer/HomePage';
import { ProductListPage } from './pages/customer/ProductListPage';
import { ProductDetailPage } from './pages/customer/ProductDetailPage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { OrderConfirmationPage } from './pages/customer/OrderConfirmationPage';
import { OrderTrackingPage } from './pages/customer/OrderTrackingPage';
import { AccountPage } from './pages/customer/AccountPage';
import { AuthPage } from './pages/customer/AuthPage';

// Legal & Compliance Pages
import { PrivacyPolicyPage } from './pages/legal/PrivacyPolicyPage';
import { TermsPage } from './pages/legal/TermsPage';
import { RefundPolicyPage } from './pages/legal/RefundPolicyPage';

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

// Guard for Customer Portal: only signed-in customers can browse and use the store
const CustomerProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-700 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-gray-500 font-semibold">Verifying customer access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    const redirectUrl = location.pathname !== '/' ? `?redirect=${encodeURIComponent(location.pathname + location.search)}` : '';
    return <Navigate to={`/login${redirectUrl}`} replace />;
  }

  return <>{children}</>;
};

// Strict Admin Security Route Guard: only users with ADMIN role can access
const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-charcoal text-white">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Verifying Admin Clearance...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // If a customer attempts to access Admin, bounce out to customer storefront
  if (user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Strict Delivery Partner Security Route Guard: only users with DELIVERY_PARTNER role can access
const DeliveryProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-emerald-950 text-white">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Verifying Rider Clearance...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/delivery/login" replace />;
  }

  // If a customer attempts to access Delivery app, bounce out to customer storefront
  if (user.role !== 'DELIVERY_PARTNER' && user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');
  const isDeliveryPath = location.pathname.startsWith('/delivery');
  const isAuthPath = location.pathname === '/login';

  const showCustomerChrome = !isAdminPath && !isDeliveryPath && !isAuthPath;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Show Customer Header & Footer only when authenticated and on customer-facing routes */}
      {showCustomerChrome && <Header />}

      <div className="flex-1">
        <Routes>
          {/* Customer Authentication Gate */}
          <Route path="/login" element={<AuthPage />} />

          {/* Legal, Privacy & Compliance Policies (Publicly Accessible) */}
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-and-conditions" element={<TermsPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/refund-policy" element={<RefundPolicyPage />} />
          <Route path="/refunds" element={<RefundPolicyPage />} />

          {/* Customer Portal (Protected - Requires Customer Sign In First) */}
          <Route
            path="/"
            element={
              <CustomerProtectedRoute>
                <HomePage />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <CustomerProtectedRoute>
                <ProductListPage />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/products/:id"
            element={
              <CustomerProtectedRoute>
                <ProductDetailPage />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <CustomerProtectedRoute>
                <CheckoutPage />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/orders/:id/confirmed"
            element={
              <CustomerProtectedRoute>
                <OrderConfirmationPage />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/orders/:id/track"
            element={
              <CustomerProtectedRoute>
                <OrderTrackingPage />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <CustomerProtectedRoute>
                <AccountPage />
              </CustomerProtectedRoute>
            }
          />

          {/* Admin Portal (Strict Admin Security Protected) */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
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

          {/* Delivery Partner Portal (Strict Rider Security Protected) */}
          <Route path="/delivery/login" element={<DeliveryLoginPage />} />
          <Route
            path="/delivery"
            element={
              <DeliveryProtectedRoute>
                <DeliveryDashboard />
              </DeliveryProtectedRoute>
            }
          />
          <Route
            path="/delivery/dashboard"
            element={
              <DeliveryProtectedRoute>
                <DeliveryDashboard />
              </DeliveryProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Global Modals & Drawers */}
      {showCustomerChrome && (
        <>
          <PincodeModal />
          <CartDrawer />
          <Footer />
        </>
      )}
    </div>
  );
};
export default App;
