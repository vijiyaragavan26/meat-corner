import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Eye, FileText, Bell, Phone, Mail, MapPin, ArrowLeft } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50/60 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center text-xs font-bold text-gray-500 hover:text-brand-700 transition mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
            <span>Back to Meat Corner Store</span>
          </Link>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Customer Data Protection & Privacy</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-charcoal tracking-tight">
                Meat Corner Privacy Policy
              </h1>
              <p className="text-xs text-gray-500">
                Last updated: November 2026 • Effective for all Meat Corner users, customers, and partners.
              </p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center text-3xl font-bold shrink-0">
              🛡️
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-sm space-y-8 text-charcoal leading-relaxed text-sm">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-charcoal flex items-center space-x-2 border-b border-gray-100 pb-2">
              <span className="text-brand-700 font-mono">01.</span>
              <span>Introduction & Commitment</span>
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm">
              At <strong>MEAT CORNER</strong> (operating from Kanjikovil, Erode, Tamil Nadu), we are passionately committed to protecting your privacy and safeguarding your personal information. This Privacy Policy details how we collect, process, store, and protect your information when you browse our storefront, register an account, or order fresh chicken cuts for express home delivery.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-charcoal flex items-center space-x-2 border-b border-gray-100 pb-2">
              <span className="text-brand-700 font-mono">02.</span>
              <span>Information We Collect</span>
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm">
              To deliver farm-fresh chicken directly to your doorstep in 30–45 minutes, we collect the following categories of information:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                <h3 className="font-bold text-xs uppercase tracking-wider text-charcoal">Account & Contact Info</h3>
                <p className="text-xs text-gray-500">
                  Full name, mobile number (+91), email address, and optional butchery cutting preferences.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                <h3 className="font-bold text-xs uppercase tracking-wider text-charcoal">Delivery Address & Geo-Location</h3>
                <p className="text-xs text-gray-500">
                  Street address, landmark, area, pincode (Erode & nearby regions), and live coordinates for rider navigation.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                <h3 className="font-bold text-xs uppercase tracking-wider text-charcoal">Order & Transaction Records</h3>
                <p className="text-xs text-gray-500">
                  Chicken cut selections, weight options, payment method (UPI / Cards / Netbanking / COD), and invoice totals.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                <h3 className="font-bold text-xs uppercase tracking-wider text-charcoal">Device & Security Data</h3>
                <p className="text-xs text-gray-500">
                  IP address, browser type, and authentication timestamps to safeguard accounts from unauthorized logins.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-charcoal flex items-center space-x-2 border-b border-gray-100 pb-2">
              <span className="text-brand-700 font-mono">03.</span>
              <span>How We Use Your Information</span>
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 text-xs sm:text-sm">
              <li><strong>Order Butchery & Fulfillment:</strong> Communicating cut and cleaning specifications to our butchery team.</li>
              <li><strong>Rider Dispatch & Navigation:</strong> Assigning orders to Meat Corner delivery partners for express 30–45 min transit.</li>
              <li><strong>Automated Notifications:</strong> Dispatching real-time order tracking updates, verification OTPs, and security alerts via WhatsApp, SMS, or Email.</li>
              <li><strong>Fraud Prevention & Security:</strong> Safeguarding administrative and delivery operations with strict 2-factor authentication guards.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-charcoal flex items-center space-x-2 border-b border-gray-100 pb-2">
              <span className="text-brand-700 font-mono">04.</span>
              <span>Data Sharing & Third Parties</span>
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm">
              <strong>We never sell, rent, or trade your personal information.</strong> We only share data with trusted infrastructure providers required to execute your chicken delivery:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 text-xs sm:text-sm">
              <li><strong>Assigned Delivery Partners:</strong> Given only recipient name, delivery address, and contact number for rider drop-off.</li>
              <li><strong>Payment Processors (Razorpay / UPI):</strong> End-to-end encrypted financial transactions. Meat Corner never stores full debit/credit card numbers or CVV codes.</li>
              <li><strong>Law Enforcement & Legal Authorities:</strong> Disclosed only when strictly required by applicable Indian law or government mandate.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-charcoal flex items-center space-x-2 border-b border-gray-100 pb-2">
              <span className="text-brand-700 font-mono">05.</span>
              <span>Your Data Rights</span>
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm">
              You maintain complete control over your Meat Corner account. You may view or update your profile details anytime under the <Link to="/account" className="text-brand-700 font-bold hover:underline">My Account</Link> section or request complete deletion of your account and address records by reaching our support desk.
            </p>
          </section>

          {/* Section 6: Contact */}
          <section className="p-6 rounded-2xl bg-brand-50/60 border border-brand-100 space-y-3">
            <h3 className="font-bold text-sm text-brand-900">Privacy Inquiries & Grievance Officer</h3>
            <p className="text-xs text-brand-800">
              For any questions regarding this Privacy Policy or how your data is handled, please contact our administrative team:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div className="flex items-center space-x-2 text-brand-900 font-medium">
                <Mail className="w-4 h-4 text-brand-700 shrink-0" />
                <span>support@meatcorner.in</span>
              </div>
              <div className="flex items-center space-x-2 text-brand-900 font-medium">
                <Phone className="w-4 h-4 text-brand-700 shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-2 text-brand-900 font-medium">
                <MapPin className="w-4 h-4 text-brand-700 shrink-0" />
                <span>Erode, Tamil Nadu 638116</span>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Policy Links */}
        <div className="text-center text-xs text-gray-400 space-x-4">
          <Link to="/terms-and-conditions" className="hover:text-brand-700 transition">Terms & Conditions</Link>
          <span>•</span>
          <Link to="/refund-policy" className="hover:text-brand-700 transition">Refund & Cancellation Policy</Link>
          <span>•</span>
          <Link to="/" className="hover:text-brand-700 transition">Meat Corner Store</Link>
        </div>
      </div>
    </div>
  );
};
