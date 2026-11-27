import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User as UserIcon,
  Package,
  MapPin,
  Heart,
  HelpCircle,
  LogOut,
  RotateCcw,
  Clock,
  ArrowRight,
  Plus,
  Trash2,
  CheckCircle2,
  Send,
  Eye,
  CreditCard,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { api } from '../../services/api';
import { Order, Address, SupportTicket } from '../../types';

export const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'tickets' | 'profile'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderFilter, setOrderFilter] = useState<'ALL' | 'ACTIVE' | 'HISTORY'>('ALL');
  const [selectedHistoryOrder, setSelectedHistoryOrder] = useState<Order | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // New ticket state
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketOrderNumber, setTicketOrderNumber] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  // Address management state
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newRecipient, setNewRecipient] = useState(user?.name || '');
  const [newPhone, setNewPhone] = useState(user?.phone || '');
  const [newLine1, setNewLine1] = useState('');
  const [newArea, setNewArea] = useState('Perundurai');
  const [newCity, setNewCity] = useState('Erode');
  const [newPin, setNewPin] = useState('638116');
  const [newLabel, setNewLabel] = useState('Home');

  const refreshOrders = () => {
    api.getCustomerOrders().then((res) => {
      if (res.success) setOrders(res.data);
    }).catch(() => {});
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    Promise.all([
      api.getCustomerOrders(),
      api.getAddresses(),
      api.getCustomerTickets()
    ])
      .then(([ordersRes, addrRes, tktRes]) => {
        if (ordersRes.success) setOrders(ordersRes.data);
        if (addrRes.success) setAddresses(addrRes.data);
        if (tktRes.success) setTickets(tktRes.data);
      })
      .finally(() => setLoading(false));

    // Fast polling every 5s for order status sync
    const interval = setInterval(refreshOrders, 5000);

    const onSync = () => {
      refreshOrders();
    };
    window.addEventListener('meat_corner_order_event', onSync);
    window.addEventListener('meat_corner_order_placed', onSync);
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('meat_corner_orders_sync');
      channel.onmessage = () => {
        refreshOrders();
      };
    } catch {}

    return () => {
      clearInterval(interval);
      if (channel) channel.close();
      window.removeEventListener('meat_corner_order_event', onSync);
      window.removeEventListener('meat_corner_order_placed', onSync);
    };
  }, [user]);

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      addToCart({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        cuttingOption: item.cuttingOption,
        cleaningOption: item.cleaningOption
      });
    });
    navigate('/checkout');
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;

    try {
      const res = await api.createSupportTicket({
        subject: ticketSubject,
        message: ticketMessage,
        orderNumber: ticketOrderNumber || undefined
      });
      if (res.success) {
        setTickets([res.data, ...tickets]);
        setTicketSubject('');
        setTicketMessage('');
        setTicketOrderNumber('');
        setTicketSubmitted(true);
      }
    } catch (err: any) {
      alert(err.message || 'Ticket creation failed');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    try {
      await api.deleteAddress(id);
    } catch (err) {
      console.error('Failed to delete address:', err);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLine1.trim()) return;
    try {
      const res = await api.addAddress({
        recipientName: newRecipient.trim() || user?.name || 'Customer',
        phone: newPhone.trim() || user?.phone || '',
        line1: newLine1.trim(),
        area: newArea.trim(),
        city: newCity.trim(),
        pincode: newPin.trim(),
        label: newLabel,
        isDefault: addresses.length === 0,
      });
      if (res && res.success && res.data) {
        setAddresses((prev) => [...prev, res.data]);
      } else if (res?.data) {
        setAddresses((prev) => [...prev, res.data]);
      } else if (res && res.id) {
        setAddresses((prev) => [...prev, res]);
      }
      setShowAddAddressModal(false);
      setNewLine1('');
    } catch (err) {
      console.error('Failed to add address:', err);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner Profile Summary */}
      <div className="bg-gradient-to-r from-charcoal via-charcoal-700 to-brand-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-700 flex items-center justify-center font-black text-2xl border-2 border-white/20">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black">{user.name}</h1>
            <p className="text-xs text-gray-300">{user.email} • {user.phone}</p>
            <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider bg-white/10 px-2.5 py-0.5 rounded-full text-brand-200">
              Verified Meat Corner Customer
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="bg-white/10 hover:bg-red-600/80 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center space-x-2 border border-white/20"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 space-x-2 sm:space-x-4 overflow-x-auto">
        {[
          { key: 'orders', label: 'My Orders', icon: Package },
          { key: 'addresses', label: 'Saved Addresses', icon: MapPin },
          { key: 'tickets', label: 'Support & Help', icon: HelpCircle },
          { key: 'profile', label: 'Profile Details', icon: UserIcon }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition ${
                isActive
                  ? 'border-brand-700 text-brand-700 bg-brand-50/30'
                  : 'border-transparent text-gray-500 hover:text-charcoal'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'orders' && (() => {
        const sortedOrders = [...orders].sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        const activeOrders = sortedOrders.filter(
          (o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
        );
        const historyOrders = sortedOrders.filter(
          (o) => o.status === 'DELIVERED' || o.status === 'CANCELLED'
        );

        if (sortedOrders.length === 0) {
          return (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 max-w-md mx-auto space-y-3">
              <Package className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="font-bold text-base text-charcoal">No orders yet</h3>
              <p className="text-xs text-gray-500">Your fresh chicken order history will appear here.</p>
              <Link
                to="/products"
                className="bg-brand-700 text-white font-bold text-xs uppercase px-5 py-2.5 rounded-xl inline-block shadow"
              >
                Start Shopping
              </Link>
            </div>
          );
        }

        const displayedOrders =
          orderFilter === 'ACTIVE'
            ? activeOrders
            : orderFilter === 'HISTORY'
            ? historyOrders
            : sortedOrders;

        return (
          <div className="space-y-6">
            {/* Order Category Filter Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setOrderFilter('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                  orderFilter === 'ALL'
                    ? 'bg-charcoal text-white shadow-xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span>All Orders</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-mono">{sortedOrders.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setOrderFilter('ACTIVE')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                  orderFilter === 'ACTIVE'
                    ? 'bg-brand-700 text-white shadow-xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className={`${activeOrders.length > 0 ? 'animate-ping' : ''} absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75`}></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-600"></span>
                </span>
                <span>Active Deliveries</span>
                <span className="text-[10px] bg-brand-50 text-brand-900 px-1.5 py-0.2 rounded-full font-mono">{activeOrders.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setOrderFilter('HISTORY')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                  orderFilter === 'HISTORY'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Order History</span>
                <span className="text-[10px] bg-gray-100 text-gray-800 px-1.5 py-0.2 rounded-full font-mono">{historyOrders.length}</span>
              </button>
            </div>

            {/* Main Orders Display */}
            <div className="space-y-4">
              {displayedOrders.map((order, idx) => {
                const isActive = order.status !== 'DELIVERED' && order.status !== 'CANCELLED';
                const isLatest = idx === 0 && orderFilter === 'ALL';

                return (
                  <div
                    key={order.id}
                    className={`bg-white rounded-3xl p-6 border shadow-xs transition space-y-4 ${
                      isActive
                        ? 'border-brand-200 ring-2 ring-brand-50 shadow-md'
                        : 'border-gray-100 hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-black text-charcoal">{order.orderNumber}</span>
                        {isLatest && (
                          <span className="text-[9px] font-black uppercase tracking-wider bg-brand-700 text-white px-2 py-0.5 rounded-full">
                            Latest Order
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            order.status === 'DELIVERED'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'CANCELLED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-brand-50 text-brand-800 animate-pulse'
                          }`}
                        >
                          {order.status.replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm font-black text-brand-700 font-mono">₹{order.totalAmount}</span>
                      </div>
                    </div>

                    {/* Ordered Items with Product Images */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="bg-gray-50/80 p-3 rounded-2xl text-xs flex items-center space-x-3 border border-gray-100/60">
                          <img
                            src={item.imageUrl || item.productImage || 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80'}
                            alt={item.productName}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-200 shadow-2xs flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80';
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <h5 className="font-bold text-charcoal truncate">{item.productName}</h5>
                            <p className="text-gray-500 text-[11px]">
                              {item.variantLabel} • Cut: {item.cuttingOption}
                            </p>
                            <div className="flex justify-between font-semibold text-gray-700 mt-0.5">
                              <span>Qty: {item.quantity}</span>
                              <span className="font-mono">₹{item.totalPrice}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap justify-between items-center gap-3 pt-2">
                      <div className="text-xs text-gray-500">
                        <span>Delivered to: <strong>{order.deliveryAddressSnapshot?.area || 'Home'}</strong></span>
                        <span className="text-[11px] text-gray-400 block">
                          Payment: {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Paid'} ({order.paymentStatus})
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* If active, direct live tracking link */}
                        {isActive && (
                          <Link
                            to={`/orders/${order.id}/track`}
                            className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Live GPS Tracking</span>
                          </Link>
                        )}

                        {/* View Order Details Modal Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedHistoryOrder(order)}
                          className="bg-gray-100 hover:bg-gray-200 text-charcoal font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>

                        {/* Reorder Button */}
                        <button
                          type="button"
                          onClick={() => handleReorder(order)}
                          className="bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition flex items-center space-x-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reorder</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Historical Order Full Details Modal */}
            {selectedHistoryOrder && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
                <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-gray-100 space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-start pb-3 border-b border-gray-100">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Order History Details</span>
                      <h3 className="font-mono font-black text-charcoal text-base">{selectedHistoryOrder.orderNumber}</h3>
                      <p className="text-xs text-gray-500">
                        Placed on {new Date(selectedHistoryOrder.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedHistoryOrder(null)}
                      className="p-1 rounded-full hover:bg-gray-100 text-gray-400"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Items in previous order */}
                  <div>
                    <h4 className="font-bold text-xs text-charcoal uppercase tracking-wider mb-2">Ordered Cuts</h4>
                    <div className="divide-y divide-gray-100 bg-gray-50 rounded-2xl p-3">
                      {selectedHistoryOrder.items.map((it) => (
                        <div key={it.id} className="py-2.5 flex items-center justify-between text-xs gap-3">
                          <div className="flex items-center space-x-3 min-w-0">
                            <img
                              src={it.imageUrl || it.productImage || 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80'}
                              alt={it.productName}
                              className="w-11 h-11 rounded-xl object-cover border border-gray-200 shadow-2xs flex-shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80';
                              }}
                            />
                            <div className="min-w-0">
                              <h5 className="font-bold text-charcoal truncate">{it.productName}</h5>
                              <p className="text-[11px] text-gray-500">
                                {it.variantLabel} • Cut: {it.cuttingOption}
                              </p>
                              <span className="text-gray-400 text-[11px]">Qty: {it.quantity} × ₹{it.unitPrice || Math.round(it.totalPrice / (it.quantity || 1))}</span>
                            </div>
                          </div>
                          <span className="font-extrabold text-charcoal font-mono">₹{it.totalPrice}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Address & Payment Info */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3.5 rounded-2xl">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-gray-400 block">Delivered To</span>
                      <p className="font-bold text-charcoal">{selectedHistoryOrder.deliveryAddressSnapshot?.recipientName}</p>
                      <p className="text-gray-500 text-[11px]">{selectedHistoryOrder.deliveryAddressSnapshot?.line1}, {selectedHistoryOrder.deliveryAddressSnapshot?.area}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-gray-400 block">Payment Summary</span>
                      <div className="flex justify-between text-gray-500 text-[11px]">
                        <span>Subtotal:</span>
                        <span className="font-mono">₹{selectedHistoryOrder.subtotal}</span>
                      </div>
                      <div className="flex justify-between text-gray-500 text-[11px]">
                        <span>Delivery:</span>
                        <span className="font-mono">₹{selectedHistoryOrder.deliveryCharge}</span>
                      </div>
                      <div className="flex justify-between font-black text-brand-700 text-xs pt-1 border-t border-gray-200">
                        <span>Total Paid:</span>
                        <span className="font-mono">₹{selectedHistoryOrder.totalAmount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedHistoryOrder(null)}
                      className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-charcoal"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleReorder(selectedHistoryOrder);
                        setSelectedHistoryOrder(null);
                      }}
                      className="bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition flex items-center space-x-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reorder All Items</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Tab 2: Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-charcoal">Saved Delivery Addresses</h3>
              <p className="text-xs text-gray-400">Manage your delivery locations for fast order checkout</p>
            </div>
            <button
              onClick={() => {
                setNewRecipient(user?.name || '');
                setNewPhone(user?.phone || '');
                setShowAddAddressModal(true);
              }}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 px-3.5 py-2 rounded-xl transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Address</span>
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-gray-100 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 bg-brand-50 text-brand-700 rounded-2xl flex items-center justify-center mx-auto">
                <MapPin className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-charcoal">No Saved Addresses</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                You have not added any delivery addresses yet. Add your home or delivery address for faster checkout.
              </p>
              <button
                onClick={() => {
                  setNewRecipient(user?.name || '');
                  setNewPhone(user?.phone || '');
                  setShowAddAddressModal(true);
                }}
                className="mt-2 bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition"
              >
                Add Delivery Address
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {addresses.map((addr) => (
                <div key={addr.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-2 relative group hover:border-gray-200 transition">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold bg-brand-50 text-brand-700 px-2 py-0.5 rounded">
                      {addr.label}
                    </span>
                    <div className="flex items-center space-x-2">
                      {addr.isDefault && (
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Default</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        title="Delete Address"
                        className="text-gray-400 hover:text-red-600 transition p-1 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-bold text-sm text-charcoal">{addr.recipientName}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {addr.line1}, {addr.area}, {addr.city} - {addr.pincode}
                  </p>
                  <p className="text-xs text-gray-600 font-semibold">📞 {addr.phone}</p>
                </div>
              ))}
            </div>
          )}

          {/* Add Address Modal */}
          {showAddAddressModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100 space-y-5 animate-scaleIn">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-brand-700" />
                    <h3 className="font-black text-base text-charcoal">Add Delivery Address</h3>
                  </div>
                  <button
                    onClick={() => setShowAddAddressModal(false)}
                    className="text-gray-400 hover:text-charcoal font-bold text-sm"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveAddress} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Recipient Name *</label>
                      <input
                        type="text"
                        required
                        value={newRecipient}
                        onChange={(e) => setNewRecipient(e.target.value)}
                        placeholder="e.g. Ragavan"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-brand-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="e.g. +91 84286 14692"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-brand-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Street Address / House No. *</label>
                    <input
                      type="text"
                      required
                      value={newLine1}
                      onChange={(e) => setNewLine1(e.target.value)}
                      placeholder="e.g. 115/1 Main Street, Anna Nagar"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-brand-700"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Area / Locality *</label>
                      <input
                        type="text"
                        required
                        value={newArea}
                        onChange={(e) => setNewArea(e.target.value)}
                        placeholder="e.g. Pallapalayam"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-brand-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-brand-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Pincode *</label>
                      <input
                        type="text"
                        required
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-brand-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Address Label</label>
                    <div className="flex space-x-2">
                      {['Home', 'Work', 'Other'].map((lbl) => (
                        <button
                          key={lbl}
                          type="button"
                          onClick={() => setNewLabel(lbl)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                            newLabel === lbl
                              ? 'border-brand-700 bg-brand-50 text-brand-700'
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setShowAddAddressModal(false)}
                      className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-charcoal bg-gray-100 rounded-xl transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold text-white bg-brand-700 hover:bg-brand-800 rounded-xl shadow transition"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Tickets & Support */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-black text-base text-charcoal">Submit a Complaint or Inquiry</h3>
            <form onSubmit={handleCreateTicket} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g. Delivery status, packaging feedback"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-brand-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Order Number (Optional)</label>
                <input
                  type="text"
                  value={ticketOrderNumber}
                  onChange={(e) => setTicketOrderNumber(e.target.value)}
                  placeholder="e.g. MC-20261110-001"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-brand-700 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Message *</label>
                <textarea
                  required
                  rows={3}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Describe your issue or query..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-brand-700"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-700 hover:bg-brand-800 text-white font-bold py-3 rounded-xl text-xs transition flex items-center justify-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Ticket</span>
              </button>
              {ticketSubmitted && (
                <p className="text-xs text-green-700 font-bold text-center">Ticket created! We will reply promptly.</p>
              )}
            </form>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <h3 className="font-black text-base text-charcoal">Your Support History</h3>
            {tickets.length === 0 ? (
              <p className="text-xs text-gray-500">No support tickets filed.</p>
            ) : (
              tickets.map((tkt) => (
                <div key={tkt.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-charcoal">{tkt.subject}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        tkt.status === 'RESOLVED' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {tkt.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{tkt.message}</p>
                  {tkt.adminReply && (
                    <div className="bg-brand-50 p-3 rounded-xl text-xs text-brand-900 border border-brand-100 mt-2">
                      <span className="font-bold block text-[11px]">Meat Corner Care Response:</span>
                      <p>{tkt.adminReply}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Profile Details */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm max-w-xl space-y-4">
          <h3 className="font-black text-base text-charcoal">Personal Information</h3>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-gray-400 font-bold uppercase tracking-wider block">Full Name</span>
              <span className="font-bold text-charcoal text-sm">{user.name}</span>
            </div>
            <div>
              <span className="text-gray-400 font-bold uppercase tracking-wider block">Email Address</span>
              <span className="font-bold text-charcoal text-sm">{user.email}</span>
            </div>
            <div>
              <span className="text-gray-400 font-bold uppercase tracking-wider block">Mobile Number</span>
              <span className="font-bold text-charcoal text-sm">{user.phone}</span>
            </div>
            <div>
              <span className="text-gray-400 font-bold uppercase tracking-wider block">Account Role</span>
              <span className="font-bold text-brand-700 text-sm">{user.role}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
