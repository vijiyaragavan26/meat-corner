import React, { useEffect, useState } from 'react';
import { Bike, ShieldCheck, CheckCircle2, XCircle, Star, Phone, MapPin, Edit3, X, UserPlus, Plus } from 'lucide-react';
import { api } from '../../services/api';
import { DeliveryPartner } from '../../types';

export const AdminDeliveryPartnersPage: React.FC = () => {
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPartner, setEditingPartner] = useState<DeliveryPartner | null>(null);
  const [commissionRate, setCommissionRate] = useState<number>(40);
  const [isUpdating, setIsUpdating] = useState(false);

  // Add Delivery Partner Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    vehicleType: 'Motorcycle',
    vehicleNumber: '',
    drivingLicenseNo: '',
    address: 'Perundurai, Erode',
    commissionRate: 40,
  });

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

  const handleAddPartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const res = await (api as any).createAdminDeliveryPartner(formData);
      if (res.success && res.data) {
        setPartners((prev) => [res.data, ...prev]);
        setSuccessMessage(`Delivery Partner "${res.data.fullName}" successfully added and activated!`);
        setShowAddModal(false);
        setFormData({
          fullName: '',
          phone: '',
          email: '',
          password: '',
          vehicleType: 'Motorcycle',
          vehicleNumber: '',
          drivingLicenseNo: '',
          address: 'Perundurai, Erode',
          commissionRate: 40,
        });
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to add delivery partner');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal">Delivery Partner Roster & Fleets</h1>
          <p className="text-xs text-gray-500">
            Verify driver licenses, manage active riders, review ratings, and configure delivery earnings
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-2 bg-brand-700 hover:bg-brand-800 text-white font-bold px-4 py-2.5 rounded-2xl text-xs uppercase transition shadow-md hover:shadow-lg w-max cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Delivery Partner</span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
                        className="bg-gray-100 hover:bg-gray-200 text-charcoal font-bold text-[11px] px-2.5 py-1 rounded-lg transition cursor-pointer"
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

      {/* Add New Delivery Partner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-gray-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowAddModal(false);
                setErrorMessage(null);
              }}
              className="absolute right-5 top-5 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-charcoal">Add New Delivery Partner</h3>
                <p className="text-xs text-gray-500">Register and authorize a new delivery rider</p>
              </div>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-xl text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleAddPartnerSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Poopesh M"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-bold outline-none focus:border-brand-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9360761595"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-bold outline-none focus:border-brand-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. rider@meatcorner.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-bold outline-none focus:border-brand-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">
                    Rider App Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="e.g. Poopesh@123"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-bold outline-none focus:border-brand-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">
                    Vehicle Type *
                  </label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-bold outline-none focus:border-brand-700 cursor-pointer"
                  >
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Scooter">Scooter</option>
                    <option value="Electric Bike">Electric Bike</option>
                    <option value="Bicycle">Bicycle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">
                    Vehicle Reg Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TN 33 BM 4921"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-bold outline-none focus:border-brand-700 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">
                    Driving License No *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TN33-2022-004921"
                    value={formData.drivingLicenseNo}
                    onChange={(e) => setFormData({ ...formData, drivingLicenseNo: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-bold outline-none focus:border-brand-700 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">
                    Base Fee / Delivery (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={10}
                    value={formData.commissionRate}
                    onChange={(e) => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-bold outline-none focus:border-brand-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">
                  Operational Area / Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Perundurai Road, Erode"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-bold outline-none focus:border-brand-700"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl text-xs hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs uppercase transition shadow cursor-pointer flex items-center justify-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isSubmitting ? 'Adding...' : 'Add Partner'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Commission Modal */}
      {editingPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative border border-gray-100 space-y-4">
            <button
              onClick={() => setEditingPartner(null)}
              className="absolute right-5 top-5 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
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
                className="w-full bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs uppercase transition shadow cursor-pointer"
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
