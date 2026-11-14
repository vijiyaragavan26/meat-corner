import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Boxes,
  Bike,
  Users,
  Tag,
  Settings,
  BarChart3,
  HelpCircle,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-700 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-gray-500 font-semibold">Verifying Administrator Session...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="bg-white rounded-3xl p-8 border border-gray-200 text-center space-y-4 max-w-md shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mx-auto text-xl">
            🔒
          </div>
          <h2 className="text-xl font-black text-charcoal">Admin Access Required</h2>
          <p className="text-xs text-gray-500">Please sign in with administrator credentials to manage the platform.</p>
          <Link
            to="/admin/login"
            className="bg-brand-700 text-white font-bold text-xs uppercase px-6 py-3 rounded-xl inline-block shadow"
          >
            Go to Admin Login
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Order Management', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Chicken Products', path: '/admin/products', icon: Package },
    { name: 'Chicken Categories', path: '/admin/categories', icon: Layers },
    { name: 'Inventory & Stock', path: '/admin/inventory', icon: Boxes },
    { name: 'Delivery Partners', path: '/admin/delivery-partners', icon: Bike },
    { name: 'Customer Accounts', path: '/admin/customers', icon: Users },
    { name: 'Offers & Coupons', path: '/admin/coupons', icon: Tag },
    { name: 'Sales Reports', path: '/admin/reports', icon: BarChart3 },
    { name: 'Customer Support', path: '/admin/support', icon: HelpCircle },
    { name: 'Store & PIN Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-charcoal text-white flex flex-col justify-between transform transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 space-y-6">
          {/* Logo */}
          <div className="flex items-center justify-between">
            <Link to="/admin/dashboard" className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-700 flex items-center justify-center text-white text-xl shadow">
                🍗
              </div>
              <div>
                <span className="font-black text-lg tracking-tight">MEAT CORNER</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-400 block -mt-1">
                  Admin Control
                </span>
              </div>
            </Link>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-brand-700 text-white shadow-md shadow-brand-700/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-white/10 space-y-3">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between text-xs font-bold text-gray-400 hover:text-white transition"
          >
            <span>Open Customer Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/admin/login');
            }}
            className="w-full flex items-center space-x-2 text-xs font-bold text-red-400 hover:text-red-300 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:text-charcoal"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span className="font-semibold text-charcoal">Operations Hub</span>
              <span>/</span>
              <span className="text-brand-700 font-bold uppercase tracking-wider">
                {location.pathname.replace('/admin/', '').replace('-', ' ') || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-charcoal">{user.name}</p>
              <p className="text-[10px] text-gray-400">Super Administrator</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-charcoal text-white flex items-center justify-center font-black text-sm">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* Page View */}
        <main className="p-6 sm:p-8 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
