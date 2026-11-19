import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ShieldAlert, CheckCircle2, Clock, MapPin, Phone, Mail, ArrowLeft, Scale } from 'lucide-react';

export const TermsPage: React.FC = () => {
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
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
                <Scale className="w-3.5 h-3.5 text-blue-600" />
                <span>Customer Agreement & Store Guidelines</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-charcoal tracking-tight">
                Terms and Conditions
              </h1>
              <p className="text-xs text-gray-500">
                Last updated: November 2026 • Please read these terms carefully before ordering.
              </p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center text-3xl font-bold shrink-0">
              📜
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-sm space-y-8 text-charcoal leading-relaxed text-sm">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-charcoal flex items-center space-x-2 border-b border-gray-100 pb-2">
              <span className="text-brand-700 font-mono">01.</span>
              <span>Overview & Agreement</span>
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm">
              These Terms and Conditions constitute a legally binding agreement between you (the customer) and <strong>MEAT CORNER</strong>. By registering an account, accessing our portal, or placing an order for fresh chicken products, you acknowledge and agree to be bound by these terms.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-charcoal flex items-center space-x-2 border-b border-gray-100 pb-2">
              <span className="text-brand-700 font-mono">02.</span>
              <span>Customer Account & Store Access</span>
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm">
              To ensure order authenticity and deliver hygienic food products, access to our storefront requires customer sign-in via verified Mobile Number, Email, or WhatsApp OTP. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 text-xs sm:text-sm">
              <li>Provide accurate, genuine contact details and delivery addresses.</li>
              <li>Maintain the confidentiality of your account credentials and one-time verification passwords.</li>
              <li>Notify Meat Corner immediately if you suspect any unauthorized access to your account.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-charcoal flex items-center space-x-2 border-b border-gray-100 pb-2">
              <span className="text-brand-700 font-mono">03.</span>
              <span>Product Specifications, Cuts & Pricing</span>
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 text-xs sm:text-sm">
              <li><strong>100% Halal & Antibiotic-Free:</strong> All poultry is ethically sourced, certified Halal cut, and stored strictly under 0–4°C chilled conditions.</li>
              <li><strong>Butchery Weight Standards:</strong> Product weight listings indicate gross or net weight based on chosen cut specifications (e.g. Skinless Curry Cut, Boneless Breast, Drumsticks). Natural weight variances of +/- 5% may occur during master artisanal butchering.</li>
              <li><strong>Pricing & Taxes:</strong> All product prices are listed in Indian Rupees (₹ INR) inclusive of applicable taxes (GST 5%). Delivery fees are clearly displayed before order checkout.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-charcoal flex items-center space-x-2 border-b border-gray-100 pb-2">
              <span className="text-brand-700 font-mono">04.</span>
              <span>Delivery & Handover Terms</span>
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 text-xs sm:text-sm">
              <li><strong>Delivery Window:</strong> We aim for 30–45 minute express delivery within designated serviceable pincodes across Erode and surrounding areas. Unforeseen weather, traffic, or road conditions may occasionally extend transit time.</li>
              <li><strong>Customer Availability:</strong> Customers must ensure availability at the registered address and contact number to receive perishable chilled meat.</li>
              <li><strong>OTP Delivery Verification:</strong> Our delivery partners may request an order verification PIN/OTP at handover to ensure correct drop-off.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-charcoal flex items-center space-x-2 border-b border-gray-100 pb-2">
              <span className="text-brand-700 font-mono">05.</span>
              <span>Admin & Delivery Portal Security</span>
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm">
              Meat Corner Admin and Delivery Partner portals are restricted operational hubs protected by elevated multi-factor authentication, device logging, and audit tracking. Unauthorized access attempts, brute-force exploits, or tampering will result in immediate IP banning and legal action under the Indian Information Technology Act.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-charcoal flex items-center space-x-2 border-b border-gray-100 pb-2">
              <span className="text-brand-700 font-mono">06.</span>
              <span>Governing Law & Jurisdiction</span>
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm">
              These terms shall be governed by and construed in accordance with the laws of India. Any legal disputes arising out of your use of Meat Corner services shall be subject to the exclusive jurisdiction of the competent courts in <strong>Erode, Tamil Nadu, India</strong>.
            </p>
          </section>

          {/* Contact Box */}
          <section className="p-6 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
            <h3 className="font-bold text-sm text-charcoal">Questions About Our Terms?</h3>
            <p className="text-xs text-gray-500">
              For any clarification regarding these terms, reach our support desk at <strong className="text-brand-700">support@meatcorner.in</strong> or call <strong className="text-brand-700">+91 98765 43210</strong>.
            </p>
          </section>
        </div>

        {/* Footer Policy Links */}
        <div className="text-center text-xs text-gray-400 space-x-4">
          <Link to="/privacy-policy" className="hover:text-brand-700 transition">Privacy Policy</Link>
          <span>•</span>
          <Link to="/refund-policy" className="hover:text-brand-700 transition">Refund & Cancellation Policy</Link>
          <span>•</span>
          <Link to="/" className="hover:text-brand-700 transition">Meat Corner Store</Link>
        </div>
      </div>
    </div>
  );
};
