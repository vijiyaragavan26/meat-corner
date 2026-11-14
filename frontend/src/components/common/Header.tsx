import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Search,
  ShoppingCart,
  User as UserIcon,
  Globe,
  Shield,
  Bike,
  Heart,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Package
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useLocation } from '../../contexts/LocationContext';
import { useLanguage } from '../../contexts/LanguageContext';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { itemCount, openDrawer } = useCart();
  const { locationName, pincode, openModal } = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      {/* Top Bar for quick portal access & hygiene guarantee */}
      <div className="bg-brand-900 text-white text-xs py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="flex items-center font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
              {t('freshness_guarantee')} • Halal Certified
            </span>
            <span className="text-brand-200">|</span>
            <span className="text-brand-100">⚡ {t('express_delivery')}</span>
          </div>
          <div className="flex items-center space-x-5">
            <Link to="/delivery" className="flex items-center hover:text-brand-200 transition-colors">
              <Bike className="w-3.5 h-3.5 mr-1" />
              <span>{t('delivery_portal')}</span>
            </Link>
            <Link to="/admin" className="flex items-center hover:text-brand-200 transition-colors">
              <Shield className="w-3.5 h-3.5 mr-1" />
              <span>{t('admin_portal')}</span>
            </Link>
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="flex items-center bg-brand-800 hover:bg-brand-700 px-2.5 py-0.5 rounded text-white font-medium transition"
            >
              <Globe className="w-3 h-3 mr-1" />
              {language === 'en' ? 'தமிழ்' : 'English'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Identity */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 flex items-center justify-center text-white shadow-md shadow-brand-700/30 group-hover:scale-105 transition-transform">
                <span className="text-2xl">🍗</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center">
                  <span className="text-2xl font-black tracking-tight text-charcoal">MEAT</span>
                  <span className="text-2xl font-black tracking-tight text-brand-700 ml-1">CORNER</span>
                </div>
                <span className="text-[10px] tracking-widest uppercase font-semibold text-gray-500">
                  100% Fresh Chicken
                </span>
              </div>
            </Link>

            {/* Delivery Location Selector */}
            <button
              onClick={openModal}
              className="hidden lg:flex items-center text-left bg-gray-50 hover:bg-gray-100/80 px-3.5 py-2 rounded-xl border border-gray-200 transition-all text-xs"
            >
              <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center mr-2.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-gray-400">{t('delivering_to')}</div>
                <div className="font-semibold text-charcoal flex items-center">
                  <span className="truncate max-w-[140px]">{locationName}</span>
                  <span className="ml-1 text-[11px] font-bold text-brand-700">({pincode})</span>
                  <ChevronDown className="w-3 h-3 ml-1 text-gray-400" />
                </div>
              </div>
            </button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder={t('search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 text-charcoal text-sm rounded-xl pl-10 pr-4 py-2.5 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-700/20 focus:border-brand-700 transition"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Categories link */}
            <Link
              to="/products"
              className="hidden sm:inline-flex text-sm font-semibold text-gray-700 hover:text-brand-700 transition"
            >
              {t('explore_menu')}
            </Link>

            {/* Mobile language switch */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="md:hidden p-2 text-gray-600 hover:text-brand-700"
            >
              <Globe className="w-5 h-5" />
            </button>

            {/* Cart Trigger Button */}
            <button
              onClick={openDrawer}
              className="relative flex items-center bg-brand-700 hover:bg-brand-800 text-white px-4 py-2.5 rounded-xl font-medium shadow-md shadow-brand-700/20 hover:shadow-lg transition group"
            >
              <ShoppingCart className="w-5 h-5 mr-2 transition-transform group-hover:scale-110" />
              <span className="hidden sm:inline font-semibold">{t('cart')}</span>
              {itemCount > 0 && (
                <span className="ml-1.5 sm:ml-2 bg-white text-brand-700 font-bold text-xs px-2 py-0.5 rounded-full shadow-sm">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Account / Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-gray-100 transition border border-gray-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-charcoal text-white flex items-center justify-center font-bold text-sm">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-xs font-semibold hidden md:inline max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500 hidden md:inline" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-xs text-gray-400 uppercase font-bold">Signed in as</p>
                      <p className="text-sm font-bold text-charcoal truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/account"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-700 transition"
                    >
                      <UserIcon className="w-4 h-4 mr-3 text-gray-400" />
                      {t('my_orders')} & Profile
                    </Link>

                    {user.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2.5 text-sm text-brand-700 font-semibold hover:bg-brand-50 transition"
                      >
                        <Shield className="w-4 h-4 mr-3" />
                        Admin Dashboard
                      </Link>
                    )}

                    {user.role === 'DELIVERY_PARTNER' && (
                      <Link
                        to="/delivery"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2.5 text-sm text-emerald-700 font-semibold hover:bg-emerald-50 transition"
                      >
                        <Bike className="w-4 h-4 mr-3" />
                        Delivery Dashboard
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center text-sm font-semibold text-gray-700 hover:text-brand-700 bg-gray-50 hover:bg-gray-100 px-3.5 py-2 rounded-xl transition border border-gray-200"
              >
                <UserIcon className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">{t('login_signup')}</span>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-brand-700"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative w-full">
              <input
                type="text"
                placeholder={t('search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 text-charcoal text-sm rounded-xl pl-10 pr-4 py-2.5 border border-gray-200"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </form>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              openModal();
            }}
            className="w-full flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs"
          >
            <div className="flex items-center">
              <MapPin className="w-4 h-4 text-brand-700 mr-2" />
              <span>{locationName} ({pincode})</span>
            </div>
            <span className="text-brand-700 font-bold">Change</span>
          </button>

          <div className="pt-2 border-t border-gray-100 flex flex-col space-y-2">
            <Link
              to="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              {t('explore_menu')}
            </Link>
            <Link
              to="/account"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              {t('my_orders')}
            </Link>
            <Link
              to="/delivery"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 rounded-lg flex items-center"
            >
              <Bike className="w-4 h-4 mr-2" />
              {t('delivery_portal')}
            </Link>
            <Link
              to="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50 rounded-lg flex items-center"
            >
              <Shield className="w-4 h-4 mr-2" />
              {t('admin_portal')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
