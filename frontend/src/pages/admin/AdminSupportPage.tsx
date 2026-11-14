import React, { useEffect, useState } from 'react';
import { HelpCircle, MessageSquare, Send, CheckCircle2, Clock, X } from 'lucide-react';
import { api } from '../../services/api';
import { SupportTicket } from '../../types';

export const AdminSupportPage: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminTickets();
      if (res.success) setTickets(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyText.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.replyAdminTicket(activeTicket.id, {
        adminReply: replyText,
        status: 'RESOLVED'
      });
      if (res.success) {
        setTickets((prev) => prev.map((t) => (t.id === activeTicket.id ? res.data : t)));
        setActiveTicket(null);
        setReplyText('');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to send reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-charcoal">Customer Support & Inquiries</h1>
        <p className="text-xs text-gray-500">Respond to customer feedback, order queries, and butcher cut requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-400">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-400">No support tickets found.</div>
        ) : (
          tickets.map((tkt) => (
            <div
              key={tkt.id}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      tkt.status === 'RESOLVED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {tkt.status}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {new Date(tkt.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-charcoal">{tkt.subject}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{tkt.message}</p>
                <div className="text-[11px] text-gray-400 pt-1">
                  From: <strong className="text-charcoal">{tkt.userName || 'Customer'}</strong> ({tkt.userPhone || tkt.userEmail})
                </div>

                {tkt.adminReply && (
                  <div className="bg-brand-50 p-3 rounded-xl border border-brand-100 text-xs text-brand-900 mt-2">
                    <span className="font-bold block text-[10px]">Your Response:</span>
                    <p>{tkt.adminReply}</p>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-gray-50">
                <button
                  onClick={() => {
                    setActiveTicket(tkt);
                    setReplyText(tkt.adminReply || '');
                  }}
                  className="w-full bg-charcoal hover:bg-black text-white font-bold text-xs py-2 rounded-xl transition"
                >
                  {tkt.adminReply ? 'Update Reply' : 'Reply to Customer'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reply Modal */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100 space-y-4">
            <button
              onClick={() => setActiveTicket(null)}
              className="absolute right-5 top-5 p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-black text-charcoal">Respond to Support Ticket</h3>
              <p className="text-xs text-gray-500 mt-1">Ticket: {activeTicket.subject}</p>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl text-xs text-gray-600">
              <strong className="block text-charcoal">Customer Message:</strong>
              <p>{activeTicket.message}</p>
            </div>

            <form onSubmit={handleSendReply} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                  Official Response Message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type resolution or update here..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs outline-none focus:border-brand-700"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs uppercase transition shadow"
              >
                {isSubmitting ? 'Sending...' : 'Send Reply & Resolve Ticket'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
