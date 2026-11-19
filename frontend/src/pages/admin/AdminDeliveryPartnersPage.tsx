import React, { useEffect, useState } from 'react';
import { Bike, ShieldCheck, CheckCircle2, XCircle, Star, Phone, MapPin, Edit3, X } from 'lucide-react';
import { api } from '../../services/api';
import { DeliveryPartner } from '../../types';

export const AdminDeliveryPartnersPage: React.FC = () => {
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPartner, setEditingPartner] = useState<DeliveryPartner | null>(null);
  const [commissionRate, setCommissionRate] = useState<number>(40);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminDeliveryPartners();
      if (res.success) setPartners(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleStatusChange = async (id: string, approvalStatus: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await api.updateAdminDeliveryPartnerStatus(id, { approvalStatus });
      if (res.success) {
        setPartners((prev) => prev.map((p) => (p.id === id ? res.data : p)));
      }
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  const handleUpdateCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartner) return;
    setIsUpdating(true);
    try {
      const res = await api.updateAdminDeliveryPartnerStatus(editingPartner.id, {
        commissionRate: Number(commissionRate)
      });
      if (res.success) {
        setPartners((prev) => prev.map((p) => (p.id === editingPartner.id ? res.data : p)));
        setEditingPartner(null);
      }
    } catch (err: any) {
      alert(err.message || 'Commission update failed');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-charcoal">Delivery Partner Roster & Fleets</h1>
        <p className="text-xs text-gray-500">
          Verify driver licenses, manage active riders, review ratings, and configure delivery earnings
        </p>
      </div>

      {/* Partners Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Driver Profile</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Vehicle Details</th>
                <th className="py-3 px-4">License #</th>
                <th className="py-3 px-4">Status & Online</th>
                <th className="py-3 px-4">Deliveries</th>
                <th className="py-3 px-4">Base Fee / Order</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">Loading delivery roster...</td>
                </tr>
              ) : (
                partners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-charcoal text-white flex items-center justify-center font-bold text-xs">
                          {(partner.fullName || 'R').charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-charcoal block">{partner.fullName || 'Delivery Partner'}</span>
                          <span className="text-[10px] text-amber-500 font-bold flex items-center">
                            <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                            {partner.rating} ★
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-charcoal block">{partner.phone}</span>
                      <span className="text-gray-400 text-[10px]">{partner.email}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-charcoal block">{partner.vehicleNumber}</span>
                      <span className="text-gray-500 text-[10px]">{partner.vehicleType}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-gray-700">
                      {partner.drivingLicenseNo}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase block w-max ${
                            partner.approvalStatus === 'APPROVED'
                              ? 'bg-green-100 text-green-800'
                              : partner.approvalStatus === 'PENDING'
                              ? 'bg-amber-100 text-amber-800 animate-pulse'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {partner.approvalStatus}
                        </span>
                        <span className="text-[10px] font-semibold text-gray-500">
                          {partner.isOnline ? '🟢 Live Online' : '⚪ Offline'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-black text-charcoal text-sm">
                      {partner.totalDeliveries} orders
                    </td>

                    <td className="py-3.5 px-4 font-black text-brand-700">
                      ₹{partner.commissionRate}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      {partner.approvalStatus === 'PENDING' && (
                        <button
                          onClick={() => handleStatusChange(partner.id, 'APPROVED')}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg transition"
                        >
                          Approve
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setEditingPartner(partner);
                          setCommissionRate(partner.commissionRate);
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-charcoal font-bold text-[11px] px-2.5 py-1 rounded-lg transition"
                      >
                        Fee
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Commission Modal */}
      {editingPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative border border-gray-100 space-y-4">
            <button
              onClick={() => setEditingPartner(null)}
              className="absolute right-5 top-5 p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-black text-charcoal">Delivery Compensation</h3>
              <p className="text-xs text-gray-500 mt-0.5">{editingPartner.fullName}</p>
            </div>

            <form onSubmit={handleUpdateCommission} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                  Base Earning Per Delivery (₹)
                </label>
                <input
                  type="number"
                  required
                  min={10}
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-brand-700"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="w-full bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs uppercase transition shadow"
              >
                {isUpdating ? 'Updating...' : 'Update Earning Rate'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
