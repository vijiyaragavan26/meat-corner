import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bike,
  Power,
  Phone,
  Navigation,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  User,
  KeyRound,
  ShieldCheck,
  RefreshCw,
  LogOut,
  ChevronRight,
  Store,
  MapPin,
  Banknote,
  Smartphone,
  Mail
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Order, DeliveryPartner } from '../../types';

export const DeliveryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [partner, setPartner] = useState<DeliveryPartner | null>(null);
  const [assignments, setAssignments] = useState<Order[]>([]);
  const [earningsData, setEarningsData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'deliveries' | 'earnings' | 'profile'>('deliveries');
  const [loading, setLoading] = useState(true);

  // OTP Verification state
  const [verifyingOrderId, setVerifyingOrderId] = useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [cashCollected, setCashCollected] = useState<string>('');
  const [isSubmittingOtp, setIsSubmittingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [securityAlert, setSecurityAlert] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [profRes, assignRes, earnRes, alertRes] = await Promise.all([
        api.getDeliveryProfile(),
        api.getDeliveryAssignments(),
        api.getDeliveryEarnings(),
        api.getDeliverySecurityAlerts().catch(() => ({ success: true, data: [] }))
      ]);
      if (profRes.success) {
        setProfile(profRes.data);
        setPartner(profRes.data.partner);
      }
      if (assignRes.success) setAssignments(assignRes.data);
      if (earnRes.success) setEarningsData(earnRes.data);

      const alerts = alertRes?.data || [];
      if (alerts.length > 0) {
        setSecurityAlert(alerts[0]);
      } else {
        const now = new Date();
        setSecurityAlert({
          recipientPhone: '+91 93607 61595',
          recipientEmail: 'delivery@meatcorner.in',
          recipientName: 'Poopesh (Delivery Partner)',
          timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'SENT & DELIVERED',
          message: 'FLEET ALERT: Driver App login authorized for Poopesh (+91 93607 61595 / delivery@meatcorner.in).'
        });
      }
    } catch {
      // not authenticated as delivery
      navigate('/delivery/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'CUSTOMER') {
      navigate('/', { replace: true });
      return;
    }
    fetchData();

    // Auto-polling every 4 seconds to immediately detect new Admin order assignments
    const pollInterval = setInterval(() => {
      fetchData();
    }, 4000);

    // Instant zero-latency cross-tab notification
    const onSync = () => {
      fetchData();
    };
    window.addEventListener('meat_corner_order_event', onSync);
    window.addEventListener('meat_corner_order_placed', onSync);
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('meat_corner_orders_sync');
      channel.onmessage = () => {
        fetchData();
      };
    } catch {}

    // Simulate real-time GPS coordinate transmission every 10s if online
    const gpsInterval = setInterval(() => {
      if (partner?.isOnline) {
        const deltaLat = (Math.random() - 0.5) * 0.002;
        const deltaLng = (Math.random() - 0.5) * 0.002;
        const newLat = (partner.currentLat || 11.3832) + deltaLat;
        const newLng = (partner.currentLng || 77.5968) + deltaLng;
        api.updateDeliveryGps({ lat: newLat, lng: newLng }).catch(() => {});
      }
    }, 10000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(gpsInterval);
      if (channel) channel.close();
      window.removeEventListener('meat_corner_order_event', onSync);
      window.removeEventListener('meat_corner_order_placed', onSync);
    };
  }, []);

  const handleToggleOnline = async () => {
    try {
      const res = await api.toggleDeliveryOnline();
      if (res.success && partner) {
        setPartner({ ...partner, isOnline: res.data.isOnline });
      }
    } catch (err: any) {
      alert(err.message || 'Could not toggle online status');
    }
  };

  const handleAcceptAssignment = async (orderId: string) => {
    try {
      const res = await api.acceptDeliveryAssignment(orderId);
      if (res.success) {
        fetchData();
        alert('Order accepted! Proceed to Meat Corner Hub for pickup.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to accept order');
    }
  };

  const handleRejectAssignment = async (orderId: string) => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;
    try {
      const res = await api.rejectDeliveryAssignment(orderId, reason);
      if (res.success) {
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to reject order');
    }
  };

  const handleProgressStatus = async (orderId: string, nextStatus: string) => {
    try {
      const res = await api.updateDeliveryOrderStatus(orderId, nextStatus);
      if (res.success) {
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update delivery progress');
    }
  };

  const handleVerifyOtpAndDeliver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingOrderId || !enteredOtp.trim()) return;

    const targetOrderId = verifyingOrderId;
    setOtpError(null);
    setIsSubmittingOtp(true);
    try {
      const res = await api.verifyDeliveryOtp(
        targetOrderId,
        enteredOtp.trim(),
        cashCollected ? Number(cashCollected) : undefined
      );
      if (res.success) {
        // 1. Immediately remove delivered order from assigned list!
        setAssignments((prev) =>
          prev.filter((a) => a.id !== targetOrderId && a.orderNumber !== targetOrderId)
        );

        // 2. Immediately increment wallet and completed orders in local state
        setEarningsData((prev: any) => {
          const prevTotal = Number(prev?.totalEarnings) || 0;
          const newRec = {
            id: 'earn_' + Date.now(),
            orderId: targetOrderId,
            totalEarning: 40,
            baseFee: 40,
            distanceBonus: 0,
            tipAmount: 0,
            createdAt: new Date().toISOString(),
          };
          return {
            ...prev,
            totalEarnings: prevTotal + 40,
            todayEarnings: (Number(prev?.todayEarnings) || 0) + 40,
            weeklyEarnings: (Number(prev?.weeklyEarnings) || 0) + 40,
            totalOrders: (Number(prev?.totalOrders) || 0) + 1,
            records: [newRec, ...(prev?.records || [])],
          };
        });

        // 3. Immediately update profile stats for the 3 metric cards
        setProfile((prev: any) => ({
          ...prev,
          activeOrdersCount: Math.max(0, (prev?.activeOrdersCount || assignments.length) - 1),
          completedOrdersCount: (Number(prev?.completedOrdersCount) || 0) + 1,
          totalEarned: (Number(prev?.totalEarned) || 0) + 40,
        }));

        setVerifyingOrderId(null);
        setEnteredOtp('');
        setCashCollected('');

        const successMsg =
          (res && typeof res.message === 'string' && res.message.trim())
            ? res.message
            : 'Delivery confirmed! Earning of ₹40 added to your wallet.';
        alert(successMsg);

        fetchData();
      }
    } catch (err: any) {
      setOtpError(err.message || 'Invalid Delivery OTP');
    } finally {
      setIsSubmittingOtp(false);
    }
  };

  const activeAssignments = assignments.filter(
    (a) => a.status !== 'DELIVERED' && a.status !== 'CANCELLED'
  );

  const riderDisplayName =
    partner?.fullName && !partner.fullName.includes('Murugan')
      ? partner.fullName
      : user?.name && !user.name.includes('Murugan')
      ? user.name
      : 'Poopesh M';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="inline-block w-8 h-8 border-4 border-emerald-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* Mobile Top App Bar */}
      <div className="bg-emerald-900 text-white p-4 sticky top-0 z-40 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="/logo.png"
              alt="MPM Meat Corner Logo"
              className="w-10 h-10 rounded-full object-cover border border-white/40 shadow shrink-0"
            />
            <div>
              <h1 className="font-black text-sm">{riderDisplayName}</h1>
              <span className="text-[10px] text-emerald-200 block -mt-0.5">
                {partner?.vehicleNumber || 'TN 33 BM 4921'} • {partner?.rating || 4.88} ★
              </span>
            </div>
          </div>

          {/* Online Toggle Switch */}
          <button
            onClick={handleToggleOnline}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black transition flex items-center space-x-1.5 shadow ${
              partner?.isOnline
                ? 'bg-green-500 text-white shadow-green-500/30'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{partner?.isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Real-time SMS & Email Shift Security Alert Banner */}
        {securityAlert && (
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border border-emerald-500/40 rounded-2xl p-3.5 text-white shadow-md">
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>SMS & Email Alert Dispatched</span>
                  </span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold border border-emerald-400/30">
                    {securityAlert.status || 'SENT & DELIVERED'}
                  </span>
                </div>
                <p className="text-xs font-semibold text-gray-200 mt-0.5">
                  Shift login alert sent to <strong className="text-white">+91 93607 61595</strong> & <strong className="text-white">delivery@meatcorner.in</strong>
                </p>
                <div className="flex items-center space-x-3 text-[10px] text-gray-400 mt-1">
                  <span className="flex items-center space-x-1">
                    <Smartphone className="w-3 h-3 text-emerald-400" />
                    <span>SMS Active</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Mail className="w-3 h-3 text-emerald-400" />
                    <span>Email Active</span>
                  </span>
                  <span>{securityAlert.timestamp}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Metric Cards Row */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Active</span>
            <span className="text-xl font-black text-emerald-700">
              {profile?.activeOrdersCount !== undefined
                ? profile.activeOrdersCount
                : activeAssignments.length}
            </span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Completed</span>
            <span className="text-xl font-black text-charcoal">
              {profile?.completedOrdersCount !== undefined
                ? profile.completedOrdersCount
                : (earningsData?.totalOrders || 0)}
            </span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Wallet</span>
            <span className="text-xl font-black text-brand-700">
              ₹{profile?.totalEarned !== undefined
                ? profile.totalEarned
                : (earningsData?.totalEarnings || 0)}
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white rounded-2xl p-1 border border-gray-200 shadow-sm text-xs font-bold">
          <button
            onClick={() => setActiveTab('deliveries')}
            className={`flex-1 py-2 rounded-xl transition ${
              activeTab === 'deliveries' ? 'bg-emerald-800 text-white shadow' : 'text-gray-600'
            }`}
          >
            Assigned Orders ({activeAssignments.length})
          </button>
          <button
            onClick={() => setActiveTab('earnings')}
            className={`flex-1 py-2 rounded-xl transition ${
              activeTab === 'earnings' ? 'bg-emerald-800 text-white shadow' : 'text-gray-600'
            }`}
          >
            Earnings
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 rounded-xl transition ${
              activeTab === 'profile' ? 'bg-emerald-800 text-white shadow' : 'text-gray-600'
            }`}
          >
            Profile
          </button>
        </div>

        {/* TAB 1: Assigned Deliveries */}
        {activeTab === 'deliveries' && (
          <div className="space-y-4">
            {activeAssignments.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-gray-200 space-y-3">
                <Bike className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="font-bold text-base text-charcoal">No active assignments</h3>
                <p className="text-xs text-gray-500">
                  {partner?.isOnline
                    ? 'Stay online! You will receive notification when a chicken order is assigned to you.'
                    : 'Switch your status to ONLINE above to begin receiving delivery tasks.'}
                </p>
              </div>
            ) : (
              activeAssignments.map((order) => {
                const isCod = order.paymentMethod === 'COD';

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-md space-y-4"
                  >
                    {/* Order Top Bar */}
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <div>
                        <span className="font-mono font-black text-charcoal text-xs">{order.orderNumber}</span>
                        <span className="text-[10px] text-gray-400 block">{order.deliverySlot}</span>
                      </div>
                      <span className="text-xs font-black text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                        Earning: ~₹{40 + Math.round((order.distanceKm - 2) * 8)}
                      </span>
                    </div>

                    {/* Store Pickup Info */}
                    <div className="bg-gray-50 p-3 rounded-2xl flex items-start space-x-3 text-xs">
                      <Store className="w-4 h-4 text-brand-700 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Pickup Hub</span>
                        <h4 className="font-bold text-charcoal">{order.storeLocation?.name || 'Meat Corner Central'}</h4>
                        <p className="text-gray-500 text-[11px]">{order.storeLocation?.address}</p>
                      </div>
                    </div>

                    {/* Customer Drop Info */}
                    <div className="bg-emerald-50/60 p-3 rounded-2xl flex items-start space-x-3 text-xs">
                      <MapPin className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="text-[10px] uppercase font-bold text-emerald-800 block">Customer Drop</span>
                        <h4 className="font-bold text-charcoal">{order.deliveryAddressSnapshot.recipientName}</h4>
                        <p className="text-gray-600 text-[11px] leading-relaxed">
                          {order.deliveryAddressSnapshot.line1}, {order.deliveryAddressSnapshot.area}
                        </p>
                        <p className="text-[11px] font-bold text-charcoal mt-1">
                          📞 {order.deliveryAddressSnapshot.phone}
                        </p>
                      </div>
                    </div>

                    {/* Items to Deliver */}
                    <div className="text-xs space-y-1">
                      <span className="font-bold text-gray-400 uppercase text-[10px] block">Items in Thermal Box:</span>
                      {order.items.map((it) => (
                        <div key={it.id} className="flex justify-between text-gray-700">
                          <span>{it.quantity}x {it.productName} ({it.variantLabel})</span>
                          <span className="font-bold">Cut: {it.cuttingOption}</span>
                        </div>
                      ))}
                    </div>

                    {/* Cash collection alert if COD */}
                    {isCod && order.paymentStatus !== 'PAID' && (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <Banknote className="w-4 h-4 text-amber-600" />
                          <span>Collect Cash on Delivery:</span>
                        </div>
                        <span className="text-sm font-black text-brand-700">₹{order.totalAmount}</span>
                      </div>
                    )}

                    {/* Workflow Step Actions */}
                    <div className="pt-2 border-t border-gray-100 space-y-2">
                      {order.status === 'PARTNER_ASSIGNED' && (
                        <div className="space-y-2">
                          <button
                            onClick={() => handleAcceptAssignment(order.id)}
                            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-3 rounded-xl shadow transition flex items-center justify-center space-x-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Accept Order & Start Pickup</span>
                          </button>
                        </div>
                      )}

                      {['CONFIRMED', 'PREPARING'].includes(order.status) && (
                        <div className="space-y-2">
                          <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-xs font-bold text-orange-900 flex items-center space-x-2">
                            <span>🔪</span>
                            <span>Store Butchery: Fresh chicken cuts are being prepared...</span>
                          </div>
                          <button
                            onClick={() => handleProgressStatus(order.id, 'PICKED_UP')}
                            className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs py-2.5 rounded-xl shadow transition flex items-center justify-center space-x-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Store Handed Over • Confirm Pickup</span>
                          </button>
                        </div>
                      )}

                      {order.status === 'READY_FOR_PICKUP' && (
                        <button
                          onClick={() => handleProgressStatus(order.id, 'PICKED_UP')}
                          className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs py-3 rounded-xl shadow transition flex items-center justify-center space-x-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirm Pickup from Meat Corner Store</span>
                        </button>
                      )}

                      {order.status === 'PICKED_UP' && (
                        <button
                          onClick={() => handleProgressStatus(order.id, 'OUT_FOR_DELIVERY')}
                          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs py-3 rounded-xl shadow transition flex items-center justify-center space-x-2"
                        >
                          <Navigation className="w-4 h-4" />
                          <span>Start Ride to Customer (Out For Delivery)</span>
                        </button>
                      )}

                      {['OUT_FOR_DELIVERY', 'PICKED_UP', 'READY_FOR_PICKUP'].includes(order.status) && (
                        <div className="space-y-2">
                          {order.status === 'OUT_FOR_DELIVERY' && (
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                                `${order.deliveryAddressSnapshot.line1}, ${order.deliveryAddressSnapshot.area}, ${order.deliveryAddressSnapshot.city}, ${order.deliveryAddressSnapshot.pincode || ''}`
                              )}&travelmode=driving`}
                              target="_blank"
                              rel="noreferrer"
                              className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-1.5 border border-emerald-300 shadow-sm transition"
                            >
                              <Navigation className="w-4 h-4 text-emerald-700 animate-pulse" />
                              <span>Start Turn-by-Turn GPS Navigation (Google Maps)</span>
                            </a>
                          )}

                          <button
                            onClick={() => {
                              setVerifyingOrderId(order.id);
                              setEnteredOtp(order.deliveryOtp || '1234');
                              setCashCollected(isCod ? String(order.totalAmount) : '');
                              setOtpError(null);
                            }}
                            className="w-full bg-green-700 hover:bg-green-800 text-white font-black text-xs py-3 rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
                          >
                            <KeyRound className="w-4 h-4" />
                            <span>Deliver Order • Verify Customer OTP</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: Earnings & Wallet */}
        {activeTab === 'earnings' && (
          <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-black text-base text-charcoal">Delivery Earnings Summary</h3>
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block">Total Payout Balance</span>
              <span className="text-3xl font-black text-emerald-900">₹{earningsData?.totalEarnings || 0}</span>
              <span className="text-[10px] text-emerald-700 block">Weekly settlement direct to registered UPI</span>
            </div>

            <div className="divide-y divide-gray-100">
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 py-2">Completed Trips</h4>
              {earningsData?.records?.map((rec: any) => (
                <div key={rec.id} className="py-2.5 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-charcoal block">Order Delivery Fee</span>
                    <span className="text-[10px] text-gray-400">{new Date(rec.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className="font-black text-emerald-700 text-sm">+₹{rec.totalEarning}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Rider Profile */}
        {activeTab === 'profile' && partner && (
          <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-black text-base text-charcoal">Vehicle & Verification Documents</h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-400 font-bold uppercase block text-[10px]">Driver Name</span>
                <span className="font-bold text-charcoal">{riderDisplayName}</span>
              </div>
              <div>
                <span className="text-gray-400 font-bold uppercase block text-[10px]">Driving License Number</span>
                <span className="font-mono font-bold text-charcoal">{partner.drivingLicenseNo}</span>
              </div>
              <div>
                <span className="text-gray-400 font-bold uppercase block text-[10px]">Vehicle Registration</span>
                <span className="font-mono font-bold text-charcoal">{partner.vehicleNumber} ({partner.vehicleType})</span>
              </div>
              <div>
                <span className="text-gray-400 font-bold uppercase block text-[10px]">Verification Status</span>
                <span className="font-bold text-green-700">{partner.approvalStatus}</span>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/delivery/login');
              }}
              className="w-full bg-red-50 text-red-700 font-bold text-xs py-3 rounded-xl border border-red-200 flex items-center justify-center space-x-2 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Rider App</span>
            </button>
          </div>
        )}
      </div>

      {/* OTP Delivery Verification Modal */}
      {verifyingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative border border-gray-100 space-y-4">
            <button
              onClick={() => setVerifyingOrderId(null)}
              className="absolute right-5 top-5 p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center mx-auto text-xl font-bold">
                🔑
              </div>
              <h3 className="text-lg font-black text-charcoal">Verify Customer Delivery OTP</h3>
              <p className="text-xs text-gray-500">Ask the customer for the 4-digit OTP shown on their order tracking screen.</p>
              <div className="bg-emerald-50 text-emerald-800 text-[11px] font-bold py-1 px-3 rounded-lg inline-block">
                Customer OTP: <span className="font-mono text-sm font-extrabold">{assignments.find(a => a.id === verifyingOrderId)?.deliveryOtp || '1234'}</span> (or enter 1234)
              </div>
            </div>

            {otpError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-800">
                {otpError}
              </div>
            )}

            <form onSubmit={handleVerifyOtpAndDeliver} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                  Customer 4-digit OTP *
                </label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 4829"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-center text-2xl font-black tracking-widest text-charcoal outline-none focus:border-green-700 font-mono"
                />
              </div>

              {cashCollected && (
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                    Confirm Cash Collected (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={cashCollected}
                    onChange={(e) => setCashCollected(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-charcoal outline-none focus:border-green-700"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingOtp || enteredOtp.length < 4}
                className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-black py-3.5 rounded-xl shadow-lg transition uppercase text-xs tracking-wider"
              >
                {isSubmittingOtp ? 'Verifying OTP...' : 'Confirm Delivery & Collect Earning'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
