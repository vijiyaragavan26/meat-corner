import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, Clock, MapPin, Package, ArrowRight, ShieldCheck, Phone } from 'lucide-react';
import { api } from '../../services/api';
import { Order } from '../../types';

export const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fire festive celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Fallback
    }

    if (id) {
      api.getOrderById(id)
        .then((res) => {
          if (res.success) setOrder(res.data);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <div className="inline-block w-8 h-8 border-4 border-brand-700 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-500 mt-2 font-bold">Retrieving order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold">Order not found</h2>
        <Link to="/" className="text-brand-700 underline text-sm font-bold">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      {/* Top Celebration Card */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl text-center space-y-4 relative overflow-hidden">
        <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold text-green-700 uppercase tracking-wider bg-green-50 px-3 py-1 rounded-full">
            Order Confirmed & Butchery Underway
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-charcoal mt-2">
            Thank you, {order.customerName || 'Valued Customer'}!
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Your fresh chicken cuts are being freshly butchered and packed at our central hub.
          </p>
        </div>

        {/* Order Details Badge */}
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-wrap justify-around items-center gap-4 text-left">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Order Number</span>
            <span className="text-sm font-black text-charcoal font-mono">{order.orderNumber}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Estimated Delivery</span>
            <span className="text-sm font-bold text-brand-700 flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1" />
              {order.deliverySlot}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Delivery OTP</span>
            <span className="text-base font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-mono">
              {order.deliveryOtp}
            </span>
          </div>
        </div>

        {/* Track Order CTA Button */}
        <div className="pt-2">
          <Link
            to={`/orders/${order.id}/track`}
            className="w-full bg-brand-700 hover:bg-brand-800 text-white font-extrabold py-4 px-6 rounded-2xl shadow-xl shadow-brand-700/30 transition flex items-center justify-center space-x-2 text-sm group"
          >
            <span>Live Track Your Order on Map</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Ordered Chicken Cuts */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-base font-black text-charcoal flex items-center space-x-2">
          <Package className="w-4 h-4 text-brand-700" />
          <span>Items Ordered ({order.items.length})</span>
        </h3>

        <div className="divide-y divide-gray-100">
          {order.items.map((item) => (
            <div key={item.id} className="py-3 flex justify-between items-center text-xs">
              <div>
                <h5 className="font-bold text-charcoal text-sm">{item.productName}</h5>
                <p className="text-gray-500 text-[11px]">
                  {item.variantLabel} • Cut: {item.cuttingOption} • {item.cleaningOption}
                </p>
                <span className="text-gray-400">Qty: {item.quantity}</span>
              </div>
              <span className="font-extrabold text-charcoal text-sm">₹{item.totalPrice}</span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-sm font-black text-charcoal">
          <span>Total Paid ({order.paymentMethod})</span>
          <span className="text-brand-700 text-base">₹{order.totalAmount}</span>
        </div>
      </div>

      {/* Delivery Destination */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-start space-x-4">
        <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-5 h-5" />
        </div>
        <div className="text-xs">
          <h4 className="font-bold text-charcoal text-sm mb-1">Delivering To:</h4>
          <p className="font-semibold text-gray-700">{order.deliveryAddressSnapshot.recipientName}</p>
          <p className="text-gray-500">{order.deliveryAddressSnapshot.line1}, {order.deliveryAddressSnapshot.area}</p>
          <p className="text-gray-500">{order.deliveryAddressSnapshot.city} - {order.deliveryAddressSnapshot.pincode}</p>
        </div>
      </div>
    </div>
  );
};
