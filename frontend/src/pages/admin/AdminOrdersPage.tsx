import React, { useEffect, useState } from 'react';
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
  CreditCard
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
    const isDelivered = status === 'DELIVERED';
    const autoPaymentStatus = isDelivered ? 'PAID' : undefined;

    // 1. Optimistic Update: immediately update the order status in state so UI reacts instantly
    setOrders((prev) =>
      prev.map((o) =>
        (o.id === orderId || o.orderNumber === orderId)
          ? {
              ...o,
              status,
              paymentStatus: autoPaymentStatus || o.paymentStatus,
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
              paymentStatus: autoPaymentStatus || prev.paymentStatus,
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
      if (res.success && res.data) {
        const updated = (res.data?.order || res.data) as any;
        setOrders((prev) =>
          prev.map((o) => {
            if (o.id === orderId || o.orderNumber === orderId) {
              return {
                ...o,
                ...updated,
                status,
                paymentStatus: autoPaymentStatus || updated?.paymentStatus || o.paymentStatus,
                items: Array.isArray(updated?.items) && updated.items.length > 0 ? updated.items : (Array.isArray(o.items) ? o.items : []),
                orderNumber: updated?.orderNumber || o.orderNumber || '',
                customerName: updated?.customerName || o.customerName || 'Customer',
                customerPhone: updated?.customerPhone || o.customerPhone || '',
                totalAmount: updated?.totalAmount ?? o.totalAmount ?? 0,
                deliveryPartnerName: updated?.deliveryPartnerName || o.deliveryPartnerName,
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
                  status,
                  paymentStatus: autoPaymentStatus || updated?.paymentStatus || prev.paymentStatus,
                  items: Array.isArray(updated?.items) && updated.items.length > 0 ? updated.items : (prev.items || []),
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

  const handlePaymentStatusUpdate = async (orderId: string, paymentStatus: 'PAID' | 'PENDING') => {
    setIsUpdating(true);
    setOrders((prev) =>
      prev.map((o) =>
        (o.id === orderId || o.orderNumber === orderId)
          ? { ...o, paymentStatus, updatedAt: new Date().toISOString() }
          : o
      )
    );
    if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.orderNumber === orderId)) {
      setSelectedOrder((prev) => (prev ? { ...prev, paymentStatus, updatedAt: new Date().toISOString() } : null));
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

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const recipient = o.deliveryAddressSnapshot?.recipientName?.toLowerCase() || '';
    const recipientPhone = o.deliveryAddressSnapshot?.phone || '';
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName?.toLowerCase().includes(q) ||
      o.customerPhone?.includes(q) ||
      recipient.includes(q) ||
      recipientPhone.includes(q) ||
      o.deliveryAddressSnapshot?.area?.toLowerCase().includes(q)
    );
  });

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
                        {order.createdAt && !isNaN(new Date(order.createdAt).getTime())
                          ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'Recent'} • {order.deliverySlot || 'Express (30-45 mins)'}
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

                    {/* Items */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-charcoal">{Array.isArray(order.items) ? order.items.length : 0} items</span>
                      <div className="text-[10px] text-gray-500 truncate max-w-[160px]">
                        {Array.isArray(order.items) && order.items.length > 0
                          ? order.items.map((it) => it?.productName || 'Chicken Cut').join(', ')
                          : 'Chicken Order'}
                      </div>
                    </td>

                    {/* Payment */}
                    <td className="py-3.5 px-4">
                      <span className="font-black text-brand-700 block text-sm">₹{order.totalAmount || 0}</span>
                      <div className="flex flex-col space-y-1 mt-1">
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-full inline-flex items-center w-max ${
                            order.paymentStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {order.paymentStatus === 'PAID' ? '✓ PAID' : 'PENDING'} • {order.paymentMethod || 'COD'}
                        </span>
                        {order.paymentStatus !== 'PAID' && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handlePaymentStatusUpdate(order.id || order.orderNumber, 'PAID')}
                            className="text-[9px] font-bold text-emerald-700 hover:text-emerald-900 hover:underline text-left inline-flex items-center space-x-1"
                            title="Mark Cash Collected / Paid"
                          >
                            <span>Mark Paid</span>
                          </button>
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
                  Current Status: <strong className="text-brand-700 bg-brand-50 px-2 py-0.5 rounded-lg">{selectedOrder.status.replace(/_/g, ' ')}</strong>
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

            {/* Items Breakdown */}
            <div>
              <h4 className="font-bold text-xs text-charcoal uppercase tracking-wider mb-2">Ordered Chicken Cuts</h4>
              <div className="divide-y divide-gray-100 bg-gray-50 rounded-2xl p-4">
                {(Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? selectedOrder.items : []).map((it) => (
                  <div key={it.id || it.productName} className="py-2 flex justify-between items-center text-xs">
                    <div>
                      <h5 className="font-bold text-charcoal">{it.productName}</h5>
                      <p className="text-[11px] text-gray-500">
                        {it.variantLabel} • Cut: {it.cuttingOption} • {it.cleaningOption}
                      </p>
                      <span className="text-gray-400">Qty: {it.quantity}</span>
                    </div>
                    <span className="font-extrabold text-charcoal">₹{it.totalPrice}</span>
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
              </div>

              <div className="bg-gray-50 p-3 rounded-2xl space-y-1">
                <span className="font-bold uppercase text-gray-400 block text-[10px]">Financial Summary</span>
                <p className="flex justify-between text-gray-500">
                  <span>Subtotal:</span>
                  <span>₹{selectedOrder.subtotal}</span>
                </p>
                <p className="flex justify-between text-gray-500">
                  <span>Delivery Fee:</span>
                  <span>₹{selectedOrder.deliveryCharge}</span>
                </p>
                <p className="flex justify-between font-black text-brand-700 text-sm pt-1 border-t">
                  <span>Total Amount:</span>
                  <span>₹{selectedOrder.totalAmount}</span>
                </p>
              </div>
            </div>

            {/* Payment Status Management Card */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Payment Information</p>
                <div className="flex items-center space-x-2 mt-0.5">
                  <CreditCard className="w-4 h-4 text-brand-700" />
                  <span className="font-bold text-xs text-charcoal">{selectedOrder.paymentMethod || 'COD'}</span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      selectedOrder.paymentStatus === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {selectedOrder.paymentStatus === 'PAID' ? '✓ PAID' : 'PENDING'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {selectedOrder.paymentStatus !== 'PAID' ? (
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handlePaymentStatusUpdate(selectedOrder.id || selectedOrder.orderNumber, 'PAID')}
                    className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-sm transition"
                  >
                    Mark Paid (Cash Collected)
                  </button>
                ) : (
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
