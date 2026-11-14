import React, { useEffect, useState } from 'react';
import { Tag, Plus, Edit2, CheckCircle2, XCircle, X } from 'lucide-react';
import { api } from '../../services/api';
import { Coupon } from '../../types';

export const AdminCouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FLAT'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [minOrderValue, setMinOrderValue] = useState<number>(299);
  const [maxDiscount, setMaxDiscount] = useState<number>(150);
  const [usageLimit, setUsageLimit] = useState<number>(500);
  const [isSaving, setIsSaving] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminCoupons();
      if (res.success) setCoupons(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue) return;

    setIsSaving(true);
    try {
      const res = await api.createAdminCoupon({
        code,
        description,
        discountType,
        discountValue: Number(discountValue),
        minOrderValue: Number(minOrderValue),
        maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
        usageLimit: Number(usageLimit)
      });
      if (res.success) {
        setCoupons([...coupons, res.data]);
        setIsModalOpen(false);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create coupon');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal">Promo Coupons & Campaign Offers</h1>
          <p className="text-xs text-gray-500">Configure promotional discount vouchers, cart thresholds, and redemption limits</p>
        </div>

        <button
          onClick={() => {
            setCode('');
            setDescription('');
            setDiscountType('PERCENTAGE');
            setDiscountValue(20);
            setMinOrderValue(299);
            setMaxDiscount(150);
            setIsModalOpen(true);
          }}
          className="bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-400">Loading coupons...</div>
        ) : (
          coupons.map((coupon) => (
            <div key={coupon.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono font-black text-brand-700 bg-brand-50 border border-brand-200 px-3 py-1 rounded-xl block w-max">
                    {coupon.code}
                  </span>
                  <p className="text-xs text-gray-500 mt-2">{coupon.description}</p>
                </div>
                <span className="text-[10px] text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded">
                  Active
                </span>
              </div>

              <div className="bg-gray-50 p-3 rounded-2xl text-xs space-y-1">
                <div className="flex justify-between text-gray-600">
                  <span>Discount:</span>
                  <span className="font-bold text-charcoal">
                    {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}% OFF` : `Flat ₹${coupon.discountValue}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Min Cart Value:</span>
                  <span className="font-semibold text-charcoal">₹{coupon.minOrderValue}</span>
                </div>
                {coupon.maxDiscount && (
                  <div className="flex justify-between text-gray-600">
                    <span>Max Discount Cap:</span>
                    <span className="font-semibold text-charcoal">₹{coupon.maxDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600 pt-1 border-t border-gray-200">
                  <span>Redemptions:</span>
                  <span className="font-bold text-brand-700">{coupon.usedCount} / {coupon.usageLimit}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100 space-y-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-5 top-5 p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-charcoal">Create Promotional Coupon</h3>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MEATFIRST20"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold uppercase font-mono outline-none focus:border-brand-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 20% off on first chicken order"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-brand-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e: any) => setDiscountType(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold outline-none focus:border-brand-700"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-brand-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-brand-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-brand-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs uppercase transition"
              >
                {isSaving ? 'Creating...' : 'Activate Coupon'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
