import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation as useRouteLocation } from 'react-router-dom';
import {
  MapPin,
  Search,
  ShoppingCart,
  User as UserIcon,
  Globe,
  Shield,
  Bike,
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
  const routeLocation = useRouteLocation();
  const { user, logout } = useAuth();
  const { itemCount, openDrawer } = useCart();
  const { locationName, pincode, openModal } = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const leaveTimerRef = useRef<any>(null);

  const handleMouseEnterMenu = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  };

  const handleMouseLeaveMenu = () => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    leaveTimerRef.current = setTimeout(() => {
      setIsProfileOpen(false);
    }, 450);
  };

  // Auto-close Profile Menu whenever navigating to any page
  useEffect(() => {
    setIsProfileOpen(false);
  }, [routeLocation.pathname, routeLocation.search]);

  // Close menu on click outside, scroll, or when pressing Escape
  useEffect(() => {
    if (!isProfileOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsProfileOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
      }
    };

    const handleScroll = () => {
      setIsProfileOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('touchstart', handleClickOutside, true);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isProfileOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileOpen(false);
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
              {t('freshness_guarantee')} • FSSAI Reg: 22426064000473
            </span>
            <span className="text-brand-200">|</span>
            <span className="text-brand-100">⚡ {t('express_delivery')}</span>
          </div>
          <div className="flex items-center space-x-5">
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
          <div className="flex items-center space-x-3 sm:space-x-6 min-w-0">
            <Link
              to="/"
              onClick={() => setIsProfileOpen(false)}
              className="flex items-center space-x-2 sm:space-x-2.5 group flex-shrink-0"
            >
              <img
                src="/logo.png"
                alt="MPM Meat Corner Logo"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-md group-hover:scale-105 transition-transform border-2 border-emerald-500/20 flex-shrink-0"
              />
              <div className="flex flex-col">
                <div className="flex items-center">
                  <span className="text-lg sm:text-2xl font-black tracking-tight text-charcoal">MPM MEAT</span>
                  <span className="text-lg sm:text-2xl font-black tracking-tight text-brand-700 ml-1">CORNER</span>
                </div>
                <span className="text-[9px] sm:text-[10px] tracking-widest uppercase font-semibold text-gray-500 truncate">
                  Fresh • Hygienic • Healthy
                </span>
              </div>
            </Link>

            {/* Delivery Location Selector */}
            <button
              onClick={() => {
                setIsProfileOpen(false);
                openModal();
              }}
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
              onClick={() => setIsProfileOpen(false)}
              className="hidden sm:inline-flex text-sm font-semibold text-gray-700 hover:text-brand-700 transition"
            >
              {t('explore_menu')}
            </Link>

            {/* Cart Trigger Button */}
            <button
              onClick={() => {
                setIsProfileOpen(false);
                openDrawer();
              }}
              className="relative flex items-center bg-brand-700 hover:bg-brand-800 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium shadow-md shadow-brand-700/20 hover:shadow-lg transition group"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2 transition-transform group-hover:scale-110" />
              <span className="hidden sm:inline font-semibold">{t('cart')}</span>
              {Number(itemCount) > 0 && (
                <span className="ml-1 sm:ml-2 bg-white text-brand-700 font-bold text-xs px-1.5 sm:px-2 py-0.5 rounded-full shadow-sm">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Account / Profile Trigger Button */}
            <div
              className="relative"
              onMouseEnter={handleMouseEnterMenu}
              onMouseLeave={handleMouseLeaveMenu}
            >
              <button
                ref={buttonRef}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsProfileOpen((prev) => !prev);
                }}
                className="flex items-center space-x-1.5 sm:space-x-2 p-1 sm:p-1.5 rounded-xl hover:bg-gray-100 transition border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-700/20"
                aria-label="User account and profile menu"
                aria-expanded={isProfileOpen}
              >
                {user ? (
                  <>
                    <div className="w-8 h-8 rounded-lg bg-charcoal text-white flex items-center justify-center font-bold text-sm shadow-sm select-none">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold hidden md:inline max-w-[100px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-gray-500 hidden md:inline transition-transform duration-200 ${
                        isProfileOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-sm shadow-sm">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold hidden sm:inline text-gray-700">
                      {t('login_signup')}
                    </span>
                  </>
                )}
              </button>

              {/* Profile Menu Dropdown */}
              {isProfileOpen && (
                <>
                  {/* Backdrop for closing on outside click across mobile and desktop */}
                  <div
                    className="fixed inset-0 z-40 bg-black/10 md:bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsProfileOpen(false);
                    }}
                    aria-hidden="true"
                  />

                  <div
                    ref={menuRef}
                    className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 space-y-3.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                    role="dialog"
                    aria-label="Profile Menu"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* User Profile Header or Guest Login Banner */}
                    {user ? (
                      <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 flex items-center justify-between">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-charcoal text-white flex items-center justify-center font-bold text-sm shadow flex-shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-black text-charcoal truncate">{user.name}</p>
                            <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                            {user.role === 'ADMIN' && (
                              <span className="inline-block mt-0.5 text-[9px] font-bold uppercase bg-brand-100 text-brand-800 border border-brand-200 px-1.5 py-0.5 rounded">
                                Super Administrator
                              </span>
                            )}
                            {user.role === 'DELIVERY_PARTNER' && (
                              <span className="inline-block mt-0.5 text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded">
                                Delivery Partner
                              </span>
                            )}
                            {user.role !== 'ADMIN' && user.role !== 'DELIVERY_PARTNER' && (
                              <span className="inline-block mt-0.5 text-[9px] font-bold uppercase bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded">
                                Verified Customer
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsProfileOpen(false);
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-charcoal hover:bg-gray-200 transition"
                          aria-label="Close menu"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-2xl border border-gray-200">
                        <Link
                          to="/login"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-2 text-xs font-bold text-brand-700 hover:underline"
                        >
                          <UserIcon className="w-4 h-4" />
                          <span>{t('login_signup')} / Account</span>
                        </Link>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsProfileOpen(false);
                          }}
                          className="p-1 text-gray-400 hover:text-charcoal rounded-lg hover:bg-gray-200 transition"
                          aria-label="Close menu"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Language Switcher Grid */}
                    <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1.5 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => setLanguage('en')}
                        className={`py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition ${
                          language === 'en'
                            ? 'bg-white text-charcoal shadow-sm'
                            : 'text-gray-500 hover:text-charcoal'
                        }`}
                      >
                        <Globe className="w-3.5 h-3.5 text-brand-700" />
                        <span>English</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLanguage('ta')}
                        className={`py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition ${
                          language === 'ta'
                            ? 'bg-brand-700 text-white shadow-sm'
                            : 'text-gray-500 hover:text-charcoal'
                        }`}
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>தமிழ் (Tamil)</span>
                      </button>
                    </div>

                    {/* Sign Out / Log Out Button */}
                    {user ? (
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setIsProfileOpen(false);
                          navigate('/');
                        }}
                        className="w-full py-2.5 px-4 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl flex items-center justify-center space-x-2 border border-red-200 transition shadow-sm"
                      >
                        <LogOut className="w-4 h-4 text-red-600" />
                        <span>Sign Out / Log Out</span>
                      </button>
                    ) : (
                      <Link
                        to="/login"
                        onClick={() => setIsProfileOpen(false)}
                        className="w-full py-2.5 px-4 text-sm font-bold text-white bg-brand-700 hover:bg-brand-800 rounded-xl flex items-center justify-center space-x-2 transition shadow-sm"
                      >
                        <UserIcon className="w-4 h-4 text-white" />
                        <span>Sign In / Log In</span>
                      </Link>
                    )}

                    {/* Role-Based Links */}
                    <div className="pt-2 border-t border-gray-100 flex flex-col space-y-2">
                      {/* Admin Operations Hub (Admin Only) */}
                      {user?.role === 'ADMIN' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsProfileOpen(false)}
                          className="px-3 py-2.5 text-sm font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl flex items-center space-x-2 border border-brand-200 transition"
                        >
                          <Shield className="w-4 h-4 text-brand-700" />
                          <span>Admin Operations Hub</span>
                        </Link>
                      )}

                      {/* Delivery Partner Dashboard (Delivery Partner Only) */}
                      {user?.role === 'DELIVERY_PARTNER' && (
                        <Link
                          to="/delivery"
                          onClick={() => setIsProfileOpen(false)}
                          className="px-3 py-2.5 text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl flex items-center space-x-2 border border-emerald-200 transition"
                        >
                          <Bike className="w-4 h-4 text-emerald-700" />
                          <span>Delivery Partner Dashboard</span>
                        </Link>
                      )}

                      {/* 100+ Cuts Catalogue */}
                      <Link
                        to="/cuts"
                        onClick={() => setIsProfileOpen(false)}
                        className="px-3 py-2 text-sm font-bold text-brand-800 bg-brand-50 hover:bg-brand-100 rounded-lg flex items-center space-x-2 transition"
                      >
                        <span>🍗 100+ Cuts Catalogue</span>
                      </Link>

                      {/* Explore Chicken Cuts */}
                      <Link
                        to="/products"
                        onClick={() => setIsProfileOpen(false)}
                        className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg flex items-center space-x-2 transition"
                      >
                        <Package className="w-4 h-4 text-gray-400" />
                        <span>{t('explore_menu')}</span>
                      </Link>

                      {/* My Orders */}
                      <Link
                        to="/account"
                        onClick={() => setIsProfileOpen(false)}
                        className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg flex items-center space-x-2 transition"
                      >
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        <span>{t('my_orders')}</span>
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
