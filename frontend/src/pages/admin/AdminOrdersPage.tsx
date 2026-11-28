import React, { useEffect, useState, useMemo } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  Bike,
  AlertCircle,
  Eye,
  RefreshCw,
  X,
  Trash2,
  CreditCard,
  Banknote,
  ShieldCheck,
  Check
} from 'lucide-react';
import { api } from '../../services/api';
import { Order, DeliveryPartner, OrderStatus } from '../../types';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [newOrderAlert, setNewOrderAlert] = useState<{
    orderNumber: string;
    customerName: string;
    amount: number;
  } | null>(null);

  const safeFormatTime = (dateVal: any) => {
    if (!dateVal) return 'Recent';
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? 'Recent' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const safeFormatDateTime = (dateVal: any) => {
    if (!dateVal) return 'Recent';
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? 'Recent' : d.toLocaleString();
  };

  const playOrderChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {}
  };

  const fetchOrders = async (isBackground = false) => {
    if (isBackground && isUpdating) return;
    if (!isBackground) setLoading(true);
    else setIsRefreshing(true);
    try {
      const [ordRes, partRes] = await Promise.all([
        api.getAdminOrders(statusFilter !== 'ALL' ? { status: statusFilter } : undefined),
        api.getAdminDeliveryPartners()
      ]);
      if (ordRes.success) setOrders(ordRes.data);
      if (partRes.success) setPartners(partRes.data);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Fast polling every 3 seconds for instant cross-device order arrival
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 3000);

    // Instant zero-latency cross-tab notification
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('meat_corner_orders_sync');
      channel.onmessage = (event) => {
        const newOrd = event.data?.order || event.data?.detail?.order || event.data?.detail;
        if (event.data?.type === 'ORDER_CREATED' && newOrd) {
          playOrderChime();
          setNewOrderAlert({
            orderNumber: newOrd.orderNumber || newOrd.id,
            customerName: newOrd.customerName || newOrd.deliveryAddressSnapshot?.recipientName || 'Customer',
            amount: newOrd.totalAmount || 0
          });
          setOrders((prev) => {
            if (prev.some((o) => o.id === newOrd.id || o.orderNumber === newOrd.orderNumber)) {
              return prev;
            }
            return [newOrd, ...prev];
          });
        }
        if (event.data?.type === 'ORDER_UPDATED') {
          const { orderId, status: newStatus, paymentStatus: newPaymentStatus, paymentMethod: newPaymentMethod, deliveryPartnerId, deliveryPartner } = event.data;
          setOrders((prev) =>
            prev.map((o) => {
              if (o.id === orderId || o.orderNumber === orderId) {
                return {
                  ...o,
                  status: newStatus || o.status,
                  paymentStatus: newPaymentStatus || o.paymentStatus,
                  paymentMethod: newPaymentMethod || o.paymentMethod,
                  deliveryPartnerId: deliveryPartnerId !== undefined ? deliveryPartnerId : o.deliveryPartnerId,
                  deliveryPartnerName: deliveryPartner?.fullName || deliveryPartner?.name || o.deliveryPartnerName,
                };
              }
              return o;
            })
          );
        }
        if (event.data?.type === 'ORDER_DELETED' && event.data?.orderId) {
          const delId = event.data.orderId;
          setOrders((prev) => prev.filter((o) => o.id !== delId && o.orderNumber !== delId));
        }
      };
    } catch {}

    const handleWindowOrder = (e: any) => {
      if (e.detail) {
        const newOrd = e.detail;
        playOrderChime();
        setNewOrderAlert({
          orderNumber: newOrd.orderNumber || newOrd.id,
          customerName: newOrd.customerName || newOrd.deliveryAddressSnapshot?.recipientName || 'Customer',
          amount: newOrd.totalAmount || 0
        });
        setOrders((prev) => {
          if (prev.some((o) => o.id === newOrd.id || o.orderNumber === newOrd.orderNumber)) {
            return prev;
          }
          return [newOrd, ...prev];
        });
      }
    };

    window.addEventListener('meat_corner_order_placed', handleWindowOrder);

    return () => {
      clearInterval(interval);
      if (channel) channel.close();
      window.removeEventListener('meat_corner_order_placed', handleWindowOrder);
    };
  }, [statusFilter]);

  const handleStatusUpdate = async (orderId: string, status: OrderStatus, reason?: string) => {
    setIsUpdating(true);
    const targetOrder = orders.find((o) => o && (o.id === orderId || o.orderNumber === orderId));
    const isCod = targetOrder?.paymentMethod === 'COD';
    const isDelivered = status === 'DELIVERED';
    // For COD, delivery moves to COD_COLLECTED if not already settled to PAID; online moves to PAID
    const autoPaymentStatus = isDelivered
      ? (isCod ? (targetOrder?.paymentStatus === 'PAID' ? 'PAID' : 'COD_COLLECTED') : 'PAID')
      : undefined;

    // 1. Optimistic Update: immediately update the order status in state so UI reacts instantly
    setOrders((prev) =>
      prev.map((o) =>
        o && (o.id === orderId || o.orderNumber === orderId)
          ? {
              ...o,
              status,
              paymentStatus: autoPaymentStatus || o.paymentStatus || 'PENDING',
              updatedAt: new Date().toISOString()
            }
          : o
      )
    );
    if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.orderNumber === orderId)) {
      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              status,
              paymentStatus: autoPaymentStatus || prev.paymentStatus || 'PENDING',
              updatedAt: new Date().toISOString()
            }
          : null
      );
    }

    try {
      const payload: any = {
        status,
        rejectionReason: reason,
        cancellationReason: reason
      };
      if (autoPaymentStatus) {
        payload.paymentStatus = autoPaymentStatus;
      }
      const res = await api.updateAdminOrderStatus(orderId, payload);
      if (res && res.success) {
        const updated = (res.data?.order || res.data || res) as any;
        setOrders((prev) =>
          prev.map((o) => {
            if (o && (o.id === orderId || o.orderNumber === orderId)) {
              const safeItems = Array.isArray(o.items) && o.items.length > 0
                ? o.items
                : (Array.isArray(updated?.items) && updated.items.length > 0 ? updated.items : []);
              return {
                ...o,
                ...(typeof updated === 'object' && updated !== null ? updated : {}),
                id: o.id || updated?.id || orderId,
                orderNumber: o.orderNumber || updated?.orderNumber || orderId,
                status: status || updated?.status || o.status || 'PLACED',
                paymentStatus: autoPaymentStatus || updated?.paymentStatus || o.paymentStatus || 'PENDING',
                items: safeItems,
                customerName: o.customerName || updated?.customerName || 'Customer',
                customerPhone: o.customerPhone || updated?.customerPhone || '',
                totalAmount: o.totalAmount || updated?.totalAmount || 500,
                deliveryPartnerName: updated?.deliveryPartnerName !== undefined ? updated.deliveryPartnerName : o.deliveryPartnerName,
                deliveryPartnerId: updated?.deliveryPartnerId !== undefined ? updated.deliveryPartnerId : o.deliveryPartnerId,
              };
            }
            return o;
          })
        );
        if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.orderNumber === orderId)) {
          setSelectedOrder((prev) =>
            prev
              ? {
                  ...prev,
                  ...(typeof updated === 'object' && updated !== null ? updated : {}),
                  status: status || updated?.status || prev.status || 'PLACED',
                  paymentStatus: autoPaymentStatus || updated?.paymentStatus || prev.paymentStatus || 'PENDING',
                  items: Array.isArray(prev.items) && prev.items.length > 0
                    ? prev.items
                    : (Array.isArray(updated?.items) && updated.items.length > 0 ? updated.items : []),
                }
              : null
          );
        }
      }
    } catch (err: any) {
      console.error('Status update failed:', err);
      alert(err.message || 'Status update failed');
      await fetchOrders(true);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePaymentStatusUpdate = async (orderId: string, paymentStatus: 'PAID' | 'PENDING' | 'COD_COLLECTED') => {
    setIsUpdating(true);
    setOrders((prev) =>
      prev.map((o) =>
        (o.id === orderId || o.orderNumber === orderId)
          ? { ...o, paymentStatus: paymentStatus as any, updatedAt: new Date().toISOString() }
          : o
      )
    );
    if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.orderNumber === orderId)) {
      setSelectedOrder((prev) => (prev ? { ...prev, paymentStatus: paymentStatus as any, updatedAt: new Date().toISOString() } : null));
    }

    try {
      await api.updateAdminOrderStatus(orderId, { paymentStatus });
    } catch (err: any) {
      console.error('Payment update failed:', err);
      alert(err.message || 'Payment status update failed');
      await fetchOrders(true);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSettleCodOrder = async (orderId: string) => {
    setIsUpdating(true);
    try {
      const res = await api.settleCodOrder(orderId);
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId || o.orderNumber === orderId
              ? {
                  ...o,
                  paymentStatus: 'PAID',
                  codDetails: {
                    ...(o.codDetails || {
                      status: 'COLLECTED',
                      amountExpected: o.totalAmount,
                      amountCollected: o.totalAmount,
                      collectedAt: new Date().toISOString(),
                      collectedByPartnerId: o.deliveryPartnerId || 'dp_1',
                      collectedByPartnerName: o.deliveryPartnerName || 'Poopesh M',
                    }),
                    status: 'SETTLED',
                    settledAt: new Date().toISOString(),
                    settledByAdminId: 'Administrator',
                  },
                }
              : o
          )
        );
        if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.orderNumber === orderId)) {
          setSelectedOrder((prev) =>
            prev
              ? {
                  ...prev,
                  paymentStatus: 'PAID',
                  codDetails: {
                    ...(prev.codDetails || {
                      status: 'COLLECTED',
                      amountExpected: prev.totalAmount,
                      amountCollected: prev.totalAmount,
                      collectedAt: new Date().toISOString(),
                      collectedByPartnerId: prev.deliveryPartnerId || 'dp_1',
                      collectedByPartnerName: prev.deliveryPartnerName || 'Poopesh M',
                    }),
                    status: 'SETTLED',
                    settledAt: new Date().toISOString(),
                    settledByAdminId: 'Administrator',
                  },
                }
              : null
          );
        }
        alert('✓ COD cash handover verified and settled to PAID!');
      }
    } catch (err: any) {
      alert(err.message || 'Settlement failed');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSettlePartner = async (partnerId: string) => {
    if (!window.confirm('Confirm settlement of all collected COD cash for this delivery partner?')) return;
    setIsUpdating(true);
    try {
      const res = await api.settlePartnerCodOrders(partnerId);
      if (res.success) {
        await fetchOrders(true);
        alert(res.message || 'Partner COD orders settled successfully.');
      }
    } catch (err: any) {
      alert(err.message || 'Batch partner settlement failed');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteOrder = async (orderId: string, orderNumber?: string) => {
    const displayNum = orderNumber || orderId;
    if (!window.confirm(`Are you sure you want to permanently delete Order #${displayNum}? This action cannot be undone.`)) {
      return;
    }

    setIsUpdating(true);
    try {
      // Optimistic delete
      setOrders((prev) => prev.filter((o) => o.id !== orderId && o.orderNumber !== orderId && o.orderNumber !== displayNum));
      if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.orderNumber === orderId || selectedOrder.orderNumber === displayNum)) {
        setSelectedOrder(null);
      }
      await api.deleteAdminOrder(orderId);
    } catch (err: any) {
      console.error('Delete failed:', err);
      alert(err.message || 'Failed to delete order');
      await fetchOrders(true);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignPartner = async (orderId: string) => {
    if (!selectedPartnerId) {
      alert('Please select an active delivery partner.');
      return;
    }
    const partner = partners.find((p) => p.id === selectedPartnerId);
    setIsUpdating(true);

    // Optimistically update partner name and status immediately
    setOrders((prev) =>
      prev.map((o) =>
        (o.id === orderId || o.orderNumber === orderId)
          ? {
              ...o,
              status: 'PARTNER_ASSIGNED' as OrderStatus,
              deliveryPartnerId: selectedPartnerId,
              deliveryPartnerName: partner?.fullName || o.deliveryPartnerName,
            }
          : o
      )
    );

    try {
      const res = await api.assignDeliveryPartner(orderId, selectedPartnerId);
      if (res.success && res.data) {
        const updated = (res.data?.order || res.data) as any;
        setOrders((prev) =>
          prev.map((o) => {
            if (o.id === orderId || o.orderNumber === orderId) {
              return {
                ...o,
                ...updated,
                status: 'PARTNER_ASSIGNED' as OrderStatus,
                items: Array.isArray(updated?.items) && updated.items.length > 0 ? updated.items : (Array.isArray(o.items) ? o.items : []),
                orderNumber: updated?.orderNumber || o.orderNumber || '',
                deliveryPartnerId: selectedPartnerId,
                deliveryPartnerName: partner?.fullName || updated?.deliveryPartnerName || o.deliveryPartnerName,
              };
            }
            return o;
          })
        );
        if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.orderNumber === orderId)) {
          setSelectedOrder((prev) =>
            prev
              ? {
                  ...prev,
                  ...updated,
                  status: 'PARTNER_ASSIGNED' as OrderStatus,
                  deliveryPartnerId: selectedPartnerId,
                  deliveryPartnerName: partner?.fullName || prev.deliveryPartnerName,
                }
              : null
          );
        }
        alert('Delivery partner assigned successfully!');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to assign delivery partner');
      await fetchOrders(true);
    } finally {
      setIsUpdating(false);
    }
  };

  const paymentStats = useMemo(() => {
    let onlinePaid = 0;
    let onlineCount = 0;
    let codCollected = 0;
    let codCollectedCount = 0;
    let codPending = 0;
    let codPendingCount = 0;
    let settledRevenue = 0;
    let deliveredCount = 0;
    let pendingCount = 0;

    orders.forEach((o) => {
      if (!o) return;
      const amt = Number(o.totalAmount) || 0;
      const st = o.status || 'PLACED';
      if (st === 'DELIVERED') deliveredCount++;
      else if (st !== 'CANCELLED' && st !== 'REJECTED') pendingCount++;

      if (o.paymentMethod === 'ONLINE' || o.paymentMethod === 'RAZORPAY') {
        if (o.paymentStatus === 'PAID') {
          onlinePaid += amt;
          onlineCount++;
          settledRevenue += amt;
        }
      } else {
        // COD
        if (o.paymentStatus === 'COD_COLLECTED') {
          codCollected += amt;
          codCollectedCount++;
        } else if (o.paymentStatus === 'PAID') {
          settledRevenue += amt;
        } else {
          codPending += amt;
          codPendingCount++;
        }
      }
    });

    return {
      onlinePaid,
      onlineCount,
      codCollected,
      codCollectedCount,
      codPending,
      codPendingCount,
      settledRevenue,
      deliveredCount,
      pendingCount,
      totalOrders: (orders || []).length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return (orders || []).filter((o) => {
      if (!o) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase().trim();
      const ordNum = String(o.orderNumber || o.id || '').toLowerCase();
      const cName = String(o.customerName || '').toLowerCase();
      const cPhone = String(o.customerPhone || '');
      const rName = String(o.deliveryAddressSnapshot?.recipientName || '').toLowerCase();
      const rPhone = String(o.deliveryAddressSnapshot?.phone || '');
      const area = String(o.deliveryAddressSnapshot?.area || '').toLowerCase();
      return (
        ordNum.includes(q) ||
        cName.includes(q) ||
        cPhone.includes(q) ||
        rName.includes(q) ||
        rPhone.includes(q) ||
        area.includes(q)
      );
    });
  }, [orders, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Real-time Order Arrival Alert */}
      {newOrderAlert && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-center justify-between text-emerald-900 shadow-md animate-bounce">
          <div className="flex items-center space-x-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
            </span>
            <span className="font-bold text-sm">
              🔔 Instant Order Alert: #{newOrderAlert.orderNumber} received from {newOrderAlert.customerName} (₹{newOrderAlert.amount})!
            </span>
          </div>
          <button
            onClick={() => setNewOrderAlert(null)}
            className="text-xs bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold hover:bg-emerald-800 transition"
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* Page Title & Search Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal">
            Order Management & Fulfillment
          </h1>
          <p className="text-xs text-gray-500">Live order butchery queue, partner assignments, and customer deliveries</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search order #, customer, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-charcoal outline-none focus:border-brand-700 w-64 shadow-sm"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
          </div>

          <button
            onClick={() => fetchOrders(false)}
            title="Refresh orders list"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:text-brand-700 hover:bg-gray-50 shadow-sm transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-brand-700' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Payment & COD Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">Online Paid</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-xl font-black text-charcoal block mt-1">₹{paymentStats.onlinePaid}</span>
          <span className="text-[11px] text-emerald-700 font-medium">{paymentStats.onlineCount} orders verified</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-indigo-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-indigo-800 tracking-wider">COD Collected</span>
            <Banknote className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-xl font-black text-charcoal block mt-1">₹{paymentStats.codCollected}</span>
          <span className="text-[11px] text-indigo-700 font-medium">{paymentStats.codCollectedCount} awaiting settlement</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-amber-800 tracking-wider">COD Pending</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-xl font-black text-charcoal block mt-1">₹{paymentStats.codPending}</span>
          <span className="text-[11px] text-amber-700 font-medium">{paymentStats.codPendingCount} pending delivery</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Settled Revenue</span>
            <ShieldCheck className="w-4 h-4 text-brand-700" />
          </div>
          <span className="text-xl font-black text-brand-700 block mt-1">₹{paymentStats.settledRevenue}</span>
          <span className="text-[11px] text-gray-500 font-medium">{paymentStats.deliveredCount} delivered orders</span>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          'ALL',
          'PLACED',
          'CONFIRMED',
          'PREPARING',
          'READY_FOR_PICKUP',
          'PARTNER_ASSIGNED',
          'PICKED_UP',
          'OUT_FOR_DELIVERY',
          'DELIVERED',
          'CANCELLED'
        ].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
              statusFilter === st
                ? 'bg-charcoal text-white shadow'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {st.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Order Details</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items & Cuts</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Delivery Partner</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No chicken orders found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/80 transition">
                    {/* Order Details */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-charcoal block">{order.orderNumber || order.id}</span>
                      <span className="text-[10px] text-gray-400">
                        {safeFormatTime(order.createdAt)} • {order.deliverySlot || 'Express (30-45 mins)'}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-charcoal block">
                        {order.deliveryAddressSnapshot?.recipientName || order.customerName || 'Customer'}
                      </span>
                      <span className="text-[11px] text-gray-500 font-mono">
                        {order.deliveryAddressSnapshot?.phone || order.customerPhone || ''}
                      </span>
                      <span className="text-[10px] text-gray-400 block truncate max-w-[140px]">
                        {order.deliveryAddressSnapshot?.area || ''}
                      </span>
                    </td>

                    {/* Items & Cuts with Actual Ordered Product Images */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2.5">
                        {Array.isArray(order.items) && order.items.length > 0 && (
                          <div className="flex -space-x-2 overflow-hidden flex-shrink-0">
                            {order.items.slice(0, 3).map((it, iIdx) => (
                              <img
                                key={iIdx}
                                src={it.imageUrl || it.productImage || 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80'}
                                alt={it.productName || 'Chicken Cut'}
                                className="w-8 h-8 rounded-lg object-cover border-2 border-white shadow-xs"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80';
                                }}
                              />
                            ))}
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-charcoal block">
                            {Array.isArray(order.items) ? order.items.length : 0} {Array.isArray(order.items) && order.items.length === 1 ? 'Cut' : 'Cuts'}
                          </span>
                          <span
                            className="text-[10px] text-gray-500 truncate max-w-[150px] block"
                            title={Array.isArray(order.items) ? order.items.map(it => `${it.quantity || 1}x ${it.productName || 'Chicken Cut'}`).join(', ') : 'Chicken Cut'}
                          >
                            {Array.isArray(order.items) && order.items.length > 0
                              ? order.items.map((it) => `${it.quantity || 1}x ${it.productName || 'Chicken Cut'}`).join(', ')
                              : 'Chicken Cut'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Payment */}
                    <td className="py-3.5 px-4">
                      <span className="font-black text-brand-700 block text-sm">₹{order.totalAmount || order.subtotal || 500}</span>
                      <div className="flex flex-col space-y-1 mt-1">
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-full inline-flex items-center w-max ${
                            order.paymentStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : order.paymentStatus === 'COD_COLLECTED'
                              ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                              : order.paymentStatus === 'REFUNDED'
                              ? 'bg-purple-100 text-purple-900 border border-purple-300'
                              : order.paymentStatus === 'FAILED'
                              ? 'bg-red-100 text-red-900 border border-red-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {order.paymentStatus === 'PAID'
                            ? '✓ PAID'
                            : order.paymentStatus === 'COD_COLLECTED'
                            ? 'COD COLLECTED'
                            : order.paymentStatus === 'REFUNDED'
                            ? 'REFUND'
                            : order.paymentStatus === 'FAILED'
                            ? 'FAILED'
                            : 'PENDING'} • {order.paymentMethod === 'COD' ? 'CASH ON DELIVERY' : 'ONLINE'}
                        </span>

                        {/* Online Transaction Details */}
                        {(order.paymentMethod === 'ONLINE' || order.paymentMethod === 'RAZORPAY') && (
                          <div className="text-[9px] text-gray-500 font-mono">
                            {(order.paymentDetails?.transactionId || (order as any).razorpayPaymentId) && (
                              <span className="block truncate max-w-[125px]" title={order.paymentDetails?.transactionId || (order as any).razorpayPaymentId}>
                                Txn: {(order.paymentDetails?.transactionId || (order as any).razorpayPaymentId || '').slice(-8)}
                              </span>
                            )}
                            {order.paymentStatus === 'PAID' && (
                              <span className="text-emerald-700 font-sans font-semibold block text-[9px]">
                                Paid: ₹{order.totalAmount || order.subtotal || 500}
                              </span>
                            )}
                          </div>
                        )}

                        {/* COD Details: Expected vs Collected */}
                        {order.paymentMethod === 'COD' && (
                          <div className="text-[9px] space-y-0.5">
                            {order.paymentStatus === 'COD_COLLECTED' ? (
                              <>
                                <span className="text-indigo-900 font-bold block">
                                  Collected: ₹{order.codDetails?.amountCollected || order.totalAmount || order.subtotal || 500}
                                </span>
                                <span className="text-gray-400 block text-[8px]">
                                  Expected: ₹{order.totalAmount || order.subtotal || 500}
                                </span>
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => handleSettleCodOrder(order.id || order.orderNumber)}
                                  className="text-[9px] font-bold text-indigo-700 hover:text-indigo-900 hover:underline text-left inline-flex items-center space-x-1"
                                  title="Verify rider cash handover and mark as PAID"
                                >
                                  <span>✓ Settle COD Handover</span>
                                </button>
                              </>
                            ) : order.paymentStatus !== 'PAID' ? (
                              <>
                                <span className="text-amber-800 font-bold block">
                                  Collect: ₹{order.totalAmount || order.subtotal || 500}
                                </span>
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => handlePaymentStatusUpdate(order.id || order.orderNumber, 'PAID')}
                                  className="text-[9px] font-bold text-emerald-700 hover:text-emerald-900 hover:underline text-left inline-flex items-center space-x-1"
                                  title="Mark Cash Collected / Paid"
                                >
                                  <span>Mark Paid</span>
                                </button>
                              </>
                            ) : (
                              <span className="text-emerald-700 font-bold block text-[9px]">
                                Reconciled & Paid
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status Direct Selector */}
                    <td className="py-3.5 px-4">
                      <select
                        value={order.status || 'PLACED'}
                        disabled={isUpdating}
                        onChange={(e) => handleStatusUpdate(order.id || order.orderNumber, e.target.value as OrderStatus)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-xl uppercase tracking-wider outline-none border cursor-pointer shadow-sm transition ${
                          order.status === 'DELIVERED'
                            ? 'bg-green-100 text-green-900 border-green-300'
                            : order.status === 'CANCELLED' || order.status === 'REJECTED'
                            ? 'bg-red-100 text-red-900 border-red-300'
                            : order.status === 'OUT_FOR_DELIVERY' || order.status === 'PICKED_UP'
                            ? 'bg-blue-100 text-blue-900 border-blue-300'
                            : 'bg-brand-50 text-brand-900 border-brand-200'
                        }`}
                      >
                        <option value="PLACED">Placed</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PREPARING">Preparing</option>
                        <option value="READY_FOR_PICKUP">Ready for Pickup</option>
                        <option value="PARTNER_ASSIGNED">Partner Assigned</option>
                        <option value="PICKED_UP">Picked Up</option>
                        <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>

                    {/* Partner */}
                    <td className="py-3.5 px-4">
                      {order.deliveryPartnerName ? (
                        <div className="flex items-center space-x-1.5 text-emerald-800 font-semibold text-xs">
                          <Bike className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{order.deliveryPartnerName}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setSelectedPartnerId(order.deliveryPartnerId || '');
                          }}
                          className="bg-charcoal hover:bg-black text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-sm transition"
                        >
                          Manage
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleDeleteOrder(order.id || order.orderNumber, order.orderNumber)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition border border-transparent hover:border-red-200"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Order Details & Status Workflow Management */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 max-h-[90vh] overflow-y-auto space-y-6">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute right-5 top-5 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-charcoal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div>
              <span className="text-xs font-mono font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full">
                {selectedOrder.orderNumber}
              </span>
              <h3 className="text-xl font-black text-charcoal mt-2">Manage Chicken Order</h3>
              <p className="text-xs text-gray-500">
                Customer: <strong>{selectedOrder.customerName}</strong> ({selectedOrder.customerPhone})
              </p>
            </div>

            {/* Status Workflow Action Buttons */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Current Status: <strong className="text-brand-700 bg-brand-50 px-2 py-0.5 rounded-lg">{(selectedOrder.status || 'PLACED').replace(/_/g, ' ')}</strong>
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Change Status:</span>
                  <select
                    value={selectedOrder.status || 'PLACED'}
                    disabled={isUpdating}
                    onChange={(e) => handleStatusUpdate(selectedOrder.id || selectedOrder.orderNumber, e.target.value as OrderStatus)}
                    className="bg-white border border-gray-300 rounded-xl px-2.5 py-1 text-xs font-bold text-charcoal outline-none focus:border-brand-700 cursor-pointer shadow-sm"
                  >
                    <option value="PLACED">Placed</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PREPARING">Preparing</option>
                    <option value="READY_FOR_PICKUP">Ready for Pickup</option>
                    <option value="PARTNER_ASSIGNED">Partner Assigned</option>
                    <option value="PICKED_UP">Picked Up</option>
                    <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Quick Workflow Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                {selectedOrder.status === 'PLACED' && (
                  <button
                    disabled={isUpdating}
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'CONFIRMED')}
                    className="bg-green-700 hover:bg-green-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition shadow-sm"
                  >
                    Confirm Order
                  </button>
                )}

                {['PLACED', 'CONFIRMED', 'PARTNER_ASSIGNED'].includes(selectedOrder.status) && (
                  <button
                    disabled={isUpdating}
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'PREPARING')}
                    className="bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition shadow-sm"
                  >
                    Start Butchery (Preparing)
                  </button>
                )}

                {['PREPARING', 'CONFIRMED', 'PARTNER_ASSIGNED'].includes(selectedOrder.status) && (
                  <button
                    disabled={isUpdating}
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'READY_FOR_PICKUP')}
                    className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition shadow-sm"
                  >
                    Mark Ready for Pickup
                  </button>
                )}

                {['READY_FOR_PICKUP', 'PARTNER_ASSIGNED', 'PICKED_UP'].includes(selectedOrder.status) && (
                  <button
                    disabled={isUpdating}
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'OUT_FOR_DELIVERY')}
                    className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition shadow-sm"
                  >
                    Mark Out for Delivery
                  </button>
                )}

                {selectedOrder.status === 'OUT_FOR_DELIVERY' && (
                  <button
                    disabled={isUpdating}
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'DELIVERED')}
                    className="bg-green-700 hover:bg-green-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition shadow-sm"
                  >
                    Mark Delivered (Paid)
                  </button>
                )}

                {selectedOrder.status !== 'DELIVERED' && selectedOrder.status !== 'CANCELLED' && (
                  <button
                    disabled={isUpdating}
                    onClick={() => {
                      const reason = prompt('Please enter cancellation reason:');
                      if (reason) handleStatusUpdate(selectedOrder.id, 'CANCELLED', reason);
                    }}
                    className="bg-red-100 hover:bg-red-200 text-red-800 font-bold text-xs px-3 py-1.5 rounded-xl transition"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>

            {/* Delivery Partner Assignment Section */}
            <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                Assign Delivery Partner:
              </span>
              <div className="flex space-x-2">
                <select
                  value={selectedPartnerId}
                  onChange={(e) => setSelectedPartnerId(e.target.value)}
                  className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-charcoal outline-none focus:border-emerald-700"
                >
                  <option value="">-- Choose verified rider --</option>
                  {partners
                    .filter((p) => !p.approvalStatus || p.approvalStatus === 'APPROVED')
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.phone}) {p.isOnline ? '🟢 Online' : '⚪ Offline'}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  disabled={isUpdating || !selectedPartnerId}
                  onClick={() => handleAssignPartner(selectedOrder.id)}
                  className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                >
                  Assign Rider
                </button>
              </div>
            </div>

            {/* Items Breakdown with Actual Images, Quantities & Prices */}
            <div>
              <h4 className="font-bold text-xs text-charcoal uppercase tracking-wider mb-2">
                Ordered Chicken Cuts ({Array.isArray(selectedOrder.items) ? selectedOrder.items.length : 0})
              </h4>
              <div className="divide-y divide-gray-100 bg-gray-50 rounded-2xl p-4">
                {(Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? selectedOrder.items : []).map((it, idx) => (
                  <div key={it.id || it.productName || idx} className="py-2.5 flex items-center justify-between text-xs gap-3">
                    <div className="flex items-center space-x-3 min-w-0">
                      <img
                        src={it.imageUrl || it.productImage || 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80'}
                        alt={it.productName}
                        className="w-12 h-12 rounded-xl object-cover border border-gray-200 shadow-2xs flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div className="min-w-0">
                        <h5 className="font-bold text-charcoal truncate">{it.productName}</h5>
                        <p className="text-[11px] text-gray-500">
                          {it.variantLabel} • Cut: {it.cuttingOption} • {it.cleaningOption}
                        </p>
                        <div className="flex items-center space-x-2 text-gray-500 text-[11px] mt-0.5">
                          <span>Qty: <strong className="text-charcoal">{it.quantity}</strong></span>
                          <span>•</span>
                          <span>Unit Price: <strong className="text-charcoal font-mono">₹{it.unitPrice || Math.round(it.totalPrice / (it.quantity || 1))}</strong></span>
                        </div>
                      </div>
                    </div>
                    <span className="font-black text-brand-700 text-sm font-mono flex-shrink-0">₹{it.totalPrice}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Address & Payment Details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-gray-50 p-3 rounded-2xl space-y-1">
                <span className="font-bold uppercase text-gray-400 block text-[10px]">Destination</span>
                <p className="font-bold text-charcoal">{selectedOrder.deliveryAddressSnapshot?.recipientName}</p>
                <p className="text-gray-500">{selectedOrder.deliveryAddressSnapshot?.line1}, {selectedOrder.deliveryAddressSnapshot?.area}</p>
                <p className="text-gray-500">{selectedOrder.deliveryAddressSnapshot?.city} - {selectedOrder.deliveryAddressSnapshot?.pincode}</p>
                <p className="text-gray-600 font-mono text-[11px] font-bold">📞 {selectedOrder.deliveryAddressSnapshot?.phone}</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-2xl space-y-1">
                <span className="font-bold uppercase text-gray-400 block text-[10px]">Financial Summary</span>
                <p className="flex justify-between text-gray-500">
                  <span>Subtotal:</span>
                  <span className="font-mono">₹{selectedOrder.subtotal}</span>
                </p>
                <p className="flex justify-between text-gray-500">
                  <span>Delivery Fee:</span>
                  <span className="font-mono">₹{selectedOrder.deliveryCharge}</span>
                </p>
                {selectedOrder.discountAmount > 0 && (
                  <p className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount:</span>
                    <span className="font-mono">-₹{selectedOrder.discountAmount}</span>
                  </p>
                )}
                <p className="flex justify-between font-black text-brand-700 text-sm pt-1 border-t">
                  <span>Final Total Amount:</span>
                  <span className="font-mono">₹{selectedOrder.totalAmount}</span>
                </p>
              </div>
            </div>

            {/* Payment & Delivery Verification Card */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Payment Information</p>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <CreditCard className="w-4 h-4 text-brand-700" />
                    <span className="font-bold text-xs text-charcoal">
                      {selectedOrder.paymentMethod === 'COD' ? 'CASH ON DELIVERY' : 'ONLINE'}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        selectedOrder.paymentStatus === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : selectedOrder.paymentStatus === 'COD_COLLECTED'
                          ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {selectedOrder.paymentStatus === 'PAID'
                        ? '✓ PAID'
                        : selectedOrder.paymentStatus === 'COD_COLLECTED'
                        ? 'COD COLLECTED'
                        : 'PENDING'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {selectedOrder.paymentStatus === 'COD_COLLECTED' && (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleSettleCodOrder(selectedOrder.id || selectedOrder.orderNumber)}
                      className="bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm transition"
                    >
                      ✓ Settle COD Handover
                    </button>
                  )}

                  {selectedOrder.paymentStatus !== 'PAID' && selectedOrder.paymentStatus !== 'COD_COLLECTED' && (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handlePaymentStatusUpdate(selectedOrder.id || selectedOrder.orderNumber, 'PAID')}
                      className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-sm transition"
                    >
                      Mark Paid
                    </button>
                  )}

                  {selectedOrder.paymentStatus === 'PAID' && (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handlePaymentStatusUpdate(selectedOrder.id || selectedOrder.orderNumber, 'PENDING')}
                      className="bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-700 font-bold text-xs px-3 py-1.5 rounded-xl transition"
                    >
                      Mark Unpaid
                    </button>
                  )}
                </div>
              </div>

              {/* Transaction & Settlement Details */}
              <div className="pt-2 border-t border-gray-200/70 grid grid-cols-2 gap-3 text-[11px] text-gray-600">
                {(selectedOrder.paymentMethod === 'ONLINE' || selectedOrder.paymentMethod === 'RAZORPAY') && (
                  <>
                    <div>
                      <span className="text-gray-400 font-bold block text-[10px]">Paid Amount</span>
                      <span className="font-bold text-emerald-800 text-sm font-mono">₹{selectedOrder.totalAmount}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-bold block text-[10px]">Gateway Transaction ID</span>
                      <span className="font-mono font-bold text-charcoal truncate block" title={selectedOrder.paymentDetails?.transactionId || (selectedOrder as any).razorpayPaymentId}>
                        {selectedOrder.paymentDetails?.transactionId || (selectedOrder as any).razorpayPaymentId || 'rzp_verified_live'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-bold block text-[10px]">Payment Date & Time</span>
                      <span className="font-medium text-gray-700">
                        {safeFormatDateTime(selectedOrder.paymentDetails?.paidAt || selectedOrder.createdAt)}
                      </span>
                    </div>
                  </>
                )}
                {selectedOrder.paymentMethod === 'COD' && (
                  <>
                    <div>
                      <span className="text-gray-400 font-bold block text-[10px]">Expected COD Amount</span>
                      <span className="font-bold text-charcoal text-sm font-mono">₹{selectedOrder.totalAmount}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-bold block text-[10px]">Actual Cash Collected</span>
                      <span className={`font-bold text-sm font-mono ${selectedOrder.paymentStatus === 'COD_COLLECTED' || selectedOrder.paymentStatus === 'PAID' ? 'text-indigo-900' : 'text-amber-800'}`}>
                        {selectedOrder.codDetails?.amountCollected
                          ? `₹${selectedOrder.codDetails.amountCollected}`
                          : selectedOrder.paymentStatus === 'PAID'
                          ? `₹${selectedOrder.totalAmount}`
                          : 'Pending Collection'}
                      </span>
                    </div>
                    {selectedOrder.codDetails?.collectedAt && (
                      <div>
                        <span className="text-gray-400 font-bold block text-[10px]">Collection Timestamp</span>
                        <span className="font-medium text-gray-700">
                          {safeFormatDateTime(selectedOrder.codDetails.collectedAt)}
                        </span>
                      </div>
                    )}
                    {selectedOrder.codDetails?.collectedByPartnerName && (
                      <div>
                        <span className="text-gray-400 font-bold block text-[10px]">Collected by Rider</span>
                        <span className="font-medium text-gray-700">
                          {selectedOrder.codDetails.collectedByPartnerName}
                        </span>
                      </div>
                    )}
                  </>
                )}
                <div>
                  <span className="text-gray-400 font-bold block text-[10px]">Delivery OTP Status</span>
                  <span className={`font-bold ${selectedOrder.status === 'DELIVERED' ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {selectedOrder.status === 'DELIVERED'
                      ? '✓ Customer OTP Verified'
                      : 'Pending Customer OTP on Delivery'}
                  </span>
                </div>
              </div>

              {/* Audit Log / Timeline */}
              {Array.isArray(selectedOrder.timeline) && selectedOrder.timeline.length > 0 && (
                <div className="pt-2 border-t border-gray-200/70 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Order Audit Log</span>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {selectedOrder.timeline.map((evt: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-start text-[10px] text-gray-500 bg-white p-1.5 rounded-lg border border-gray-100">
                        <div>
                          <span className="font-bold text-charcoal">{evt.title}</span>
                          {evt.details && <p className="text-[10px] text-gray-500">{evt.details}</p>}
                        </div>
                        <span className="font-mono text-gray-400 flex-shrink-0">
                          {safeFormatTime(evt.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Print Invoice & Delete Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-gray-100 hover:bg-gray-200 text-charcoal font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center space-x-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Invoice</span>
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleDeleteOrder(selectedOrder.id || selectedOrder.orderNumber, selectedOrder.orderNumber)}
                  className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs px-3.5 py-2.5 rounded-xl transition flex items-center space-x-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Order</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-full sm:w-auto bg-charcoal text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-black transition text-center"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
