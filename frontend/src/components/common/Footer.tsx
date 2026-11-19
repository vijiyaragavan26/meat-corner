import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, ShieldCheck, Heart, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-charcoal text-gray-300 pt-16 pb-12 border-t border-charcoal-600 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-charcoal-600">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-700 flex items-center justify-center text-white text-xl">
                🍗
              </div>
              <div className="flex items-center">
                <span className="text-2xl font-black tracking-tight text-white">MEAT</span>
                <span className="text-2xl font-black tracking-tight text-brand-500 ml-1">CORNER</span>
              </div>
            </Link>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              {t('brand_sub')} MEAT CORNER is dedicated exclusively to delivering the freshest, healthiest,
              antibiotic-free chicken directly from regional farms to your doorstep in 30-45 minutes.
            </p>
            <div className="flex items-center space-x-3 pt-2 text-xs text-gray-400">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-charcoal-600 text-green-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                100% Halal Cut
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-charcoal-600 text-amber-400 font-medium">
                No Antibiotics
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-charcoal-600 text-blue-400 font-medium">
                0-4°C Chilled
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Chicken Cuts</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/products?category=curry-cut-chicken" className="hover:text-white transition">
                  Curry Cut Chicken
                </Link>
              </li>
              <li>
                <Link to="/products?category=chicken-breast" className="hover:text-white transition">
                  Boneless Chicken Breast
                </Link>
              </li>
              <li>
                <Link to="/products?category=chicken-leg" className="hover:text-white transition">
                  Chicken Drumsticks
                </Link>
              </li>
              <li>
                <Link to="/products?category=chicken-wings" className="hover:text-white transition">
                  Crispy Chicken Wings
                </Link>
              </li>
              <li>
                <Link to="/products?category=whole-chicken" className="hover:text-white transition">
                  Whole Farm Chicken
                </Link>
              </li>
              <li>
                <Link to="/products?category=chicken-liver-gizzard" className="hover:text-white transition">
                  Chicken Liver & Gizzard
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Links */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Customer Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/account" className="hover:text-white transition">
                  My Orders & Profile
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white transition">
                  Fresh Chicken Menu
                </Link>
              </li>
              <li>
                <Link to="/checkout" className="hover:text-white transition">
                  Express Checkout
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Hours */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Store & Contact</h4>
            <ul className="space-y-3 text-xs text-gray-400">
              <li className="flex items-start">
                <MapPin className="w-4 h-4 text-brand-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>142 Main Road, Near Bus Stand, Kanjikovil, Erode, Tamil Nadu 638116</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-4 h-4 text-brand-500 mr-2 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-4 h-4 text-brand-500 mr-2 flex-shrink-0" />
                <span>support@meatcorner.in</span>
              </li>
              <li className="flex items-center">
                <Clock className="w-4 h-4 text-brand-500 mr-2 flex-shrink-0" />
                <span>Open 7 Days: 6:00 AM – 10:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>© 2026 MEAT CORNER. All rights reserved. Exclusively Fresh Chicken Products.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Refund Policy</span>
            <span>FSSAI Lic. No: 12423005000128</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
