import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, CheckCircle2, AlertTriangle, Clock, HelpCircle, Phone, Mail, ArrowLeft, HeartHandshake } from 'lucide-react';

export const RefundPolicyPage: React.FC = () => {
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
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                <HeartHandshake className="w-3.5 h-3.5 text-amber-600" />
                <span>100% Freshness Guarantee & Fair Refunds</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-charcoal tracking-tight">
                Refund & Cancellation Policy
              </h1>
              <p className="text-xs text-gray-500">
                Last updated: November 2026 • Your complete satisfaction and fresh meat quality are our top priorities.
              </p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-3xl font-bold shrink-0">
              🔄
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-sm space-y-8 text-charcoal leading-relaxed text-sm">
          {/* Section 1: Freshness Guarantee */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-charcoal flex items-center space-x-2 border-b border-gray-100 pb-2">
              <span className="text-brand-700 font-mono">01.</span>
              <span>Our 100% Freshness Guarantee</span>
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm">
              At <strong>MEAT CORNER</strong>, we stand behind the premium quality and freshness of our chicken. All poultry is freshly butchered after your order is confirmed, cleaned under hygienic conditions, and delivered chilled in food-grade insulated packs. If you are ever unsatisfied with the freshness or quality of your chicken cut, we will make it right with an immediate free replacement or full refund.
            </p>
          </section>

          {/* Section 2: Order Cancellation Policy */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-charcoal flex items-center space-x-2 border-b border-gray-100 pb-2">
              <span className="text-brand-700 font-mono">02.</span>
              <span>Order Cancellation Rules</span>
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm">
              Because raw chicken is a customized perishable product cut to order, cancellations are subject to the following timeline:
            </p>
            <div className="space-y-3 pt-1">
              <div className="p-4 rounded-2xl bg-green-50/70 border border-green-200 flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-green-900 uppercase tracking-wide">
                    Cancellation Allowed (Within 5 Minutes of Order)
                  </h4>
                  <p className="text-xs text-green-800 mt-0.5">
                    You can cancel your order immediately via <Link to="/account" className="underline font-bold">My Orders</Link> or by calling support if the order is still in <strong>"PLACED"</strong> status before our butchery team begins processing.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-amber-900 uppercase tracking-wide">
                    Cancellation Not Allowed (Once Butchered or Dispatched)
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Once the bird has been custom butchered, cleaned, or handed over to our rider for express transit (<strong>"PREPARING"</strong> or <strong>"OUT FOR DELIVERY"</strong>), cancellations cannot be accepted for food hygiene and perishable safety standards.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Eligibility for Refunds & Replacements */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-charcoal flex items-center space-x-2 border-b border-gray-100 pb-2">
              <span className="text-brand-700 font-mono">03.</span>
              <span>When Are You Eligible for a Full Refund?</span>
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm">
              We offer a no-questions-asked refund or replacement under any of the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 text-xs sm:text-sm">
              <li><strong>Freshness or Spoilage Issues:</strong> The chicken arrived outside the safe chilled temperature (0–4°C) or is not fresh.</li>
              <li><strong>Wrong Item or Incorrect Cut:</strong> You received an item different from what was ordered (e.g. Skinless Curry Cut instead of Boneless Breast).</li>
              <li><strong>Packaging Damage or Tampering:</strong> The tamper-evident safety seal was broken during transit.</li>
              <li><strong>Missing Items:</strong> Any item included on your paid invoice was missing from the rider delivery bag.</li>
              <li><strong>Extreme Delay:</strong> Order arrived more than 60 minutes after confirmation due to logistics failure.</li>
            </ul>
          </section>

          {/* Section 4: How to Claim a Refund */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-charcoal flex items-center space-x-2 border-b border-gray-100 pb-2">
              <span className="text-brand-700 font-mono">04.</span>
              <span>How to Claim a Refund or Replacement</span>
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm">
              To submit a claim, please notify our customer support team within <strong>2 hours of delivery</strong>:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 text-xs sm:text-sm">
              <li>Open your order details under <Link to="/account" className="text-brand-700 font-bold hover:underline">Order History</Link>.</li>
              <li>Provide your Order Number (e.g. <code>MC-20261119-XXXX</code>) and a brief description or photo of the issue.</li>
              <li>You can contact us instantly via WhatsApp at <strong>+91 98765 43210</strong> or email <strong>support@meatcorner.in</strong>.</li>
            </ol>
          </section>

          {/* Section 5: Refund Processing Timelines */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-charcoal flex items-center space-x-2 border-b border-gray-100 pb-2">
              <span className="text-brand-700 font-mono">05.</span>
              <span>Refund Timelines & Method</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700">UPI / Netbanking / Cards</span>
                <h4 className="font-bold text-sm text-charcoal">3 to 5 Business Days</h4>
                <p className="text-xs text-gray-500">
                  Transferred directly back to your original source bank account via Razorpay gateway.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Meat Corner Store Wallet</span>
                <h4 className="font-bold text-sm text-charcoal">Instant (0 Minutes)</h4>
                <p className="text-xs text-gray-500">
                  Credited immediately to your customer wallet for your next fresh chicken order.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6: Support Contact */}
          <section className="p-6 rounded-2xl bg-brand-50/60 border border-brand-100 space-y-3">
            <h3 className="font-bold text-sm text-brand-900">Need Immediate Help With An Order?</h3>
            <p className="text-xs text-brand-800">
              Our master butchery and support managers are available 7 days a week (6:00 AM – 10:00 PM):
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
              <a href="tel:+919876543210" className="inline-flex items-center space-x-1.5 font-bold text-brand-700 hover:underline">
                <Phone className="w-4 h-4" />
                <span>+91 98765 43210</span>
              </a>
              <a href="mailto:support@meatcorner.in" className="inline-flex items-center space-x-1.5 font-bold text-brand-700 hover:underline">
                <Mail className="w-4 h-4" />
                <span>support@meatcorner.in</span>
              </a>
              <span className="inline-flex items-center space-x-1.5 text-gray-600">
                <span>📍 115/1 Main Street, Anna Nagar, Pallapalayam, Perundurai, Erode - 638116</span>
              </span>
            </div>
          </section>
        </div>

        {/* Footer Policy Links */}
        <div className="text-center text-xs text-gray-400 space-x-4">
          <Link to="/privacy-policy" className="hover:text-brand-700 transition">Privacy Policy</Link>
          <span>•</span>
          <Link to="/terms-and-conditions" className="hover:text-brand-700 transition">Terms & Conditions</Link>
          <span>•</span>
          <Link to="/" className="hover:text-brand-700 transition">Meat Corner Store</Link>
        </div>
      </div>
    </div>
  );
};
