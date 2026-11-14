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
  Send
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
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // New ticket state
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketOrderNumber, setTicketOrderNumber] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

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
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
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
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                  <div>
                    <span className="text-xs font-mono font-black text-charcoal">{order.orderNumber}</span>
                    <span className="text-xs text-gray-400 ml-2">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
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
                    <span className="text-sm font-black text-brand-700">₹{order.totalAmount}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="bg-gray-50 p-3 rounded-2xl text-xs space-y-1">
                      <h5 className="font-bold text-charcoal line-clamp-1">{item.productName}</h5>
                      <p className="text-gray-500 text-[11px]">
                        {item.variantLabel} • Cut: {item.cuttingOption}
                      </p>
                      <div className="flex justify-between font-semibold text-gray-700">
                        <span>Qty: {item.quantity}</span>
                        <span>₹{item.totalPrice}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap justify-between items-center gap-3 pt-2">
                  <div className="text-xs text-gray-500">
                    <span>Delivered to: <strong>{order.deliveryAddressSnapshot?.area || 'Home'}</strong></span>
                  </div>

                  <div className="flex space-x-3">
                    <Link
                      to={`/orders/${order.id}/track`}
                      className="bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs px-4 py-2 rounded-xl transition flex items-center space-x-1"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Track Order</span>
                    </Link>

                    <button
                      onClick={() => handleReorder(order)}
                      className="bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition flex items-center space-x-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reorder</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {addresses.map((addr) => (
              <div key={addr.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold bg-brand-50 text-brand-700 px-2 py-0.5 rounded">
                    {addr.label}
                  </span>
                  {addr.isDefault && (
                    <span className="text-[10px] text-green-700 font-bold">Default</span>
                  )}
                </div>
                <h4 className="font-bold text-sm text-charcoal">{addr.recipientName}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {addr.line1}, {addr.area}, {addr.city} - {addr.pincode}
                </p>
                <p className="text-xs text-gray-600 font-semibold">📞 {addr.phone}</p>
              </div>
            ))}
          </div>
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
