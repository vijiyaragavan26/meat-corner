import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock,
  Phone,
  CheckCircle2,
  Bike,
  Store,
  MapPin,
  ShieldCheck,
  ChevronLeft,
  KeyRound,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import { Order, OrderStatus } from '../../types';
import { LeafletMap } from '../../components/common/LeafletMap';

const stages: Array<{ key: OrderStatus; label: string; desc: string }> = [
  { key: 'PLACED', label: 'Order Placed', desc: 'Received at MEAT CORNER kitchen' },
  { key: 'CONFIRMED', label: 'Order Confirmed', desc: 'Order verified by butchery team' },
  { key: 'PREPARING', label: 'Fresh Butchery', desc: 'Cutting & vacuum packing your chicken' },
  { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup', desc: 'Packed in chilled thermal carrier' },
  { key: 'PARTNER_ASSIGNED', label: 'Delivery Partner Assigned', desc: 'Rider reaching the store' },
  { key: 'PICKED_UP', label: 'Picked Up', desc: 'Order with delivery partner' },
  { key: 'OUT_FOR_DELIVERY', label: 'On The Way', desc: 'Rider navigating to your home' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Fresh chicken handed over' }
];

export const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchOrder = async () => {
    if (!id) return;
    setIsRefreshing(true);
    try {
      const res = await api.getOrderById(id);
      if (res.success) {
        setOrder(res.data);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // Auto polling every 4 seconds for live tracking updates
    const interval = setInterval(fetchOrder, 4000);

    const onSync = () => {
      fetchOrder();
    };
    window.addEventListener('meat_corner_order_event', onSync);
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('meat_corner_orders_sync');
      channel.onmessage = () => {
        fetchOrder();
      };
    } catch {}

    return () => {
      clearInterval(interval);
      if (channel) channel.close();
      window.removeEventListener('meat_corner_order_event', onSync);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-brand-700 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-500 mt-2 font-bold">Connecting to live tracking satellite...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Order not found</h2>
        <Link to="/" className="text-brand-700 font-bold text-sm underline">
          Return to Home
        </Link>
      </div>
    );
  }

  // Calculate current stage index
  const statusOrder: OrderStatus[] = [
    'PLACED',
    'CONFIRMED',
    'PREPARING',
    'READY_FOR_PICKUP',
    'PARTNER_ASSIGNED',
    'PICKED_UP',
    'OUT_FOR_DELIVERY',
    'DELIVERED'
  ];

  let currentStageIndex = statusOrder.indexOf(order.status);
  if (currentStageIndex === -1) currentStageIndex = 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Bar with Refresh & Back */}
      <div className="flex items-center justify-between">
        <Link to="/account" className="inline-flex items-center text-xs font-bold text-gray-500 hover:text-brand-700">
          <ChevronLeft className="w-4 h-4 mr-1" />
          My Orders
        </Link>
        <button
          onClick={fetchOrder}
          className="flex items-center space-x-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl border border-brand-200 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Main Status Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full">
              Live Order Status
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-charcoal mt-1.5">
              {order.status === 'DELIVERED'
                ? 'Order Delivered Successfully!'
                : order.status === 'OUT_FOR_DELIVERY'
                ? 'Rider is on the way to your door!'
                : order.status === 'PREPARING'
                ? 'Fresh Chicken Butchery In Progress'
                : 'Order Being Processed'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Order <span className="font-mono font-bold text-charcoal">{order.orderNumber}</span> • Placed at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {/* Delivery OTP Card */}
          {order.status !== 'DELIVERED' && (
            <div className="bg-emerald-50 border-2 border-emerald-500/30 rounded-2xl p-4 text-center sm:text-right flex items-center sm:flex-col justify-between sm:justify-center">
              <div className="flex items-center space-x-1 text-emerald-800 font-bold text-xs">
                <KeyRound className="w-4 h-4 text-emerald-600" />
                <span>Delivery OTP</span>
              </div>
              <span className="text-2xl font-black text-emerald-900 tracking-widest font-mono">
                {order.deliveryOtp}
              </span>
              <span className="text-[10px] text-emerald-700 font-medium hidden sm:block">
                Share with rider upon delivery
              </span>
            </div>
          )}
        </div>

        {/* 8-Stage Visual Stepper */}
        <div className="py-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {stages.map((stage, idx) => {
              const isPassed = idx <= currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div
                  key={stage.key}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col justify-between ${
                    isCurrent
                      ? 'border-brand-700 bg-brand-50/70 ring-2 ring-brand-700 shadow-md'
                      : isPassed
                      ? 'border-green-200 bg-green-50/50 text-green-900'
                      : 'border-gray-100 bg-gray-50/50 opacity-50'
                  }`}
                >
                  <div
                    className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${
                      isCurrent
                        ? 'bg-brand-700 text-white animate-bounce'
                        : isPassed
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isPassed ? '✓' : idx + 1}
                  </div>
                  <h5 className="font-bold text-[11px] leading-tight text-charcoal">{stage.label}</h5>
                  <p className="text-[9px] text-gray-500 mt-1 line-clamp-1">{stage.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Live Map View */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg text-charcoal">Live Delivery GPS Map</h3>
            <p className="text-xs text-gray-500">Live coordinates streamed from our refrigerated fleet</p>
          </div>
          <div className="text-xs font-bold text-brand-700 bg-brand-50 px-3 py-1.5 rounded-xl border border-brand-200">
            Est. Distance: {order.distanceKm} km • {order.estimatedMinutes} mins
          </div>
        </div>

        <LeafletMap
          storeLat={order.storeLocation?.lat || 11.3806}
          storeLng={order.storeLocation?.lng || 77.5944}
          storeName={order.storeLocation?.name || 'MEAT CORNER Store'}
          customerLat={order.deliveryAddressSnapshot.lat || 11.3854}
          customerLng={order.deliveryAddressSnapshot.lng || 77.5992}
          customerAddress={`${order.deliveryAddressSnapshot.line1}, ${order.deliveryAddressSnapshot.area}`}
          riderLat={order.partnerLocation?.lat}
          riderLng={order.partnerLocation?.lng}
          riderName={order.deliveryPartnerName || 'Murugan K'}
          orderStatus={order.status}
        />
      </div>

      {/* Delivery Partner Details Card */}
      {order.deliveryPartnerId && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-2xl border border-emerald-200">
              🏍️
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                Assigned Delivery Partner
              </span>
              <h4 className="font-black text-base text-charcoal">{order.deliveryPartnerName || 'Murugan K'}</h4>
              <p className="text-xs text-gray-500">Verified Meat Corner Rider • 4.9 ★ Rating</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href={`tel:${order.deliveryPartnerPhone || '+919876543201'}`}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md shadow-emerald-600/20 flex items-center space-x-2 transition"
            >
              <Phone className="w-4 h-4" />
              <span>Call Rider</span>
            </a>
          </div>
        </div>
      )}

      {/* Order Items & Destination Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
          <h4 className="font-bold text-sm text-charcoal">Delivery Address</h4>
          <p className="text-xs font-semibold text-gray-800">{order.deliveryAddressSnapshot.recipientName}</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            {order.deliveryAddressSnapshot.line1}, {order.deliveryAddressSnapshot.area}, {order.deliveryAddressSnapshot.city} - {order.deliveryAddressSnapshot.pincode}
          </p>
          <p className="text-xs text-gray-600">📞 {order.deliveryAddressSnapshot.phone}</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
          <h4 className="font-bold text-sm text-charcoal">Payment & Order Details</h4>
          <div className="text-xs space-y-1.5 text-gray-500">
            <div className="flex justify-between">
              <span>Payment Mode:</span>
              <span className="font-bold text-charcoal">{order.paymentMethod} ({order.paymentStatus})</span>
            </div>
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span>{order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}</span>
            </div>
            <div className="flex justify-between font-bold text-charcoal pt-1 border-t">
              <span>Total Amount:</span>
              <span className="text-brand-700 font-black text-sm">₹{order.totalAmount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
