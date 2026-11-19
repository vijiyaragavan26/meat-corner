import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, ShieldCheck, Heart, ArrowUpRight, X, CheckCircle2, Award } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();
  const [showFssaiModal, setShowFssaiModal] = useState(false);

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
              {t('brand_sub')} M.P.M MEAT CORNER is dedicated exclusively to delivering the freshest, healthiest,
              antibiotic-free chicken directly from regional farms to your doorstep in 30-45 minutes.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-gray-400">
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
              <button
                type="button"
                onClick={() => setShowFssaiModal(true)}
                className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-500/40 font-mono font-bold transition cursor-pointer"
                title="Click to view official FSSAI Registration Certificate"
              >
                <Award className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                FSSAI: 22426064000473
              </button>
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
              <li>
                <Link to="/privacy-policy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="hover:text-white transition">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-white transition">
                  Refund Policy
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
                <span>115/1 Main Street, Anna Nagar, Pallapalayam, Perundurai, Erode - 638116</span>
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
          <p>© 2026 M.P.M MEAT CORNER. All rights reserved. Exclusively Fresh Chicken Products.</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 md:mt-0">
            <Link to="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link>
            <Link to="/terms-and-conditions" className="hover:text-white transition">Terms & Conditions</Link>
            <Link to="/refund-policy" className="hover:text-white transition">Refund Policy</Link>
            <button
              type="button"
              onClick={() => setShowFssaiModal(true)}
              className="inline-flex items-center space-x-1 font-mono text-emerald-400 hover:text-emerald-300 font-bold bg-charcoal-600 hover:bg-charcoal-700 px-2 py-0.5 rounded transition cursor-pointer"
            >
              <span>🛡️ FSSAI Reg. No: 22426064000473</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official FSSAI Registration Certificate Modal */}
      {showFssaiModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-charcoal w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex justify-between items-start pb-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-xl shrink-0">
                  🏛️
                </div>
                <div>
                  <div className="flex items-center space-x-1.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Government of Tamil Nadu • Food Safety Wing</span>
                  </div>
                  <h3 className="font-black text-lg text-charcoal">FSSAI Registration Certificate</h3>
                  <p className="text-[11px] text-gray-500">Under Food Safety and Standards Act, 2006</p>
                </div>
              </div>
              <button
                onClick={() => setShowFssaiModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Certificate Details Card */}
            <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-200 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-emerald-200">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Registration Number</span>
                <span className="font-mono font-black text-emerald-800 text-sm bg-white px-2.5 py-1 rounded-xl border border-emerald-300 shadow-sm">
                  22426064000473
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-400 font-bold block text-[10px] uppercase">Food Business Operator (FBO)</span>
                  <span className="font-extrabold text-charcoal text-sm">M.P.M Meat corner</span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold block text-[10px] uppercase">Kind of Business (KOB)</span>
                  <span className="font-bold text-charcoal">Retailer (Fresh Poultry)</span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold block text-[10px] uppercase">Food Category</span>
                  <span className="font-semibold text-charcoal">08 - Meat and meat products, including poultry & game</span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold block text-[10px] uppercase">Registration Validity</span>
                  <span className="font-bold text-emerald-700">Valid Upto: 20-09-2027</span>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-200 text-xs">
                <span className="text-gray-400 font-bold block text-[10px] uppercase">Registered Premises Address</span>
                <span className="font-medium text-gray-700 block mt-0.5">
                  115/1 MainStreet, Anna Nagar, Pallapalayam, Perundurai, Erode, Tamil Nadu - 638116
                </span>
              </div>
            </div>

            {/* Compliance Note */}
            <div className="bg-gray-50 rounded-xl p-3 text-[11px] text-gray-500 space-y-1">
              <p className="font-semibold text-gray-700">✓ 100% Certified Food Safety Compliance</p>
              <p>
                This establishment complies with the hygienic, safety, and cold-chain storage mandates of the Food Safety and Standards Authority of India (FSSAI).
              </p>
            </div>

            <button
              onClick={() => setShowFssaiModal(false)}
              className="w-full bg-charcoal hover:bg-black text-white font-bold py-2.5 rounded-xl text-xs transition"
            >
              Close Verification Certificate
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};
