import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { PincodeModal } from './components/common/PincodeModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { useAuth } from './contexts/AuthContext';

// Eagerly loaded for fast first paint
import { HomePage } from './pages/customer/HomePage';
import { AuthPage } from './pages/customer/AuthPage';

// Code-split Customer Pages for lightning speed
const ProductListPage = lazy(() => import('./pages/customer/ProductListPage').then(m => ({ default: m.ProductListPage })));
const ProductDetailPage = lazy(() => import('./pages/customer/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const CheckoutPage = lazy(() => import('./pages/customer/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const OrderConfirmationPage = lazy(() => import('./pages/customer/OrderConfirmationPage').then(m => ({ default: m.OrderConfirmationPage })));
const OrderTrackingPage = lazy(() => import('./pages/customer/OrderTrackingPage').then(m => ({ default: m.OrderTrackingPage })));
const AccountPage = lazy(() => import('./pages/customer/AccountPage').then(m => ({ default: m.AccountPage })));
const ChickenCutsPage = lazy(() => import('./pages/customer/ChickenCutsPage').then(m => ({ default: m.ChickenCutsPage })));

// Code-split Legal & Compliance Pages
const PrivacyPolicyPage = lazy(() => import('./pages/legal/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const TermsPage = lazy(() => import('./pages/legal/TermsPage').then(m => ({ default: m.TermsPage })));
const RefundPolicyPage = lazy(() => import('./pages/legal/RefundPolicyPage').then(m => ({ default: m.RefundPolicyPage })));

// Code-split Admin Pages (Loaded only when Admin opens the portal)
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage').then(m => ({ default: m.AdminOrdersPage })));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage').then(m => ({ default: m.AdminProductsPage })));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage').then(m => ({ default: m.AdminCategoriesPage })));
const AdminInventoryPage = lazy(() => import('./pages/admin/AdminInventoryPage').then(m => ({ default: m.AdminInventoryPage })));
const AdminDeliveryPartnersPage = lazy(() => import('./pages/admin/AdminDeliveryPartnersPage').then(m => ({ default: m.AdminDeliveryPartnersPage })));
const AdminCustomersPage = lazy(() => import('./pages/admin/AdminCustomersPage').then(m => ({ default: m.AdminCustomersPage })));
const AdminCouponsPage = lazy(() => import('./pages/admin/AdminCouponsPage').then(m => ({ default: m.AdminCouponsPage })));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage').then(m => ({ default: m.AdminSettingsPage })));
const AdminReportsPage = lazy(() => import('./pages/admin/AdminReportsPage').then(m => ({ default: m.AdminReportsPage })));
const AdminSupportPage = lazy(() => import('./pages/admin/AdminSupportPage').then(m => ({ default: m.AdminSupportPage })));

// Code-split Delivery Pages
const DeliveryLoginPage = lazy(() => import('./pages/delivery/DeliveryLoginPage').then(m => ({ default: m.DeliveryLoginPage })));
const DeliveryDashboard = lazy(() => import('./pages/delivery/DeliveryDashboard').then(m => ({ default: m.DeliveryDashboard })));

// Lightweight Route Loading Spinner
const RouteLoadingFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center p-8">
    <div className="flex flex-col items-center space-y-3">
      <div className="w-8 h-8 border-3 border-brand-700 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs text-gray-400 font-medium">Loading MPM Meat Corner...</p>
    </div>
  </div>
);

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
        <Suspense fallback={<RouteLoadingFallback />}>
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
              path="/cuts"
              element={
                <CustomerProtectedRoute>
                  <ChickenCutsPage />
                </CustomerProtectedRoute>
              }
            />
            <Route
              path="/chicken-cuts"
              element={
                <CustomerProtectedRoute>
                  <ChickenCutsPage />
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
        </Suspense>
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
