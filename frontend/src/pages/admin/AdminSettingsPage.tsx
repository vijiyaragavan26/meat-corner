import React, { useEffect, useState } from 'react';
import { Settings, Save, MapPin, Clock, DollarSign, ShieldCheck, Store } from 'lucide-react';
import { api } from '../../services/api';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Form states
  const [storeName, setStoreName] = useState('MEAT CORNER');
  const [contactPhone, setContactPhone] = useState('+91 93607 61595');
  const [contactEmail, setContactEmail] = useState('mboopesh60@gmail.com');
  const [address, setAddress] = useState('');
  const [baseDeliveryCharge, setBaseDeliveryCharge] = useState<number>(30);
  const [freeDeliveryAbove, setFreeDeliveryAbove] = useState<number>(499);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(149);
  const [taxPercent, setTaxPercent] = useState<number>(5);
  const [pincodesInput, setPincodesInput] = useState('');

  useEffect(() => {
    api.getAdminSettings()
      .then((res) => {
        if (res.success && res.data) {
          const s = res.data;
          setSettings(s);
          setStoreName(s.storeName);
          setContactPhone(s.contactPhone);
          setContactEmail(s.contactEmail);
          setAddress(s.address);
          setBaseDeliveryCharge(s.baseDeliveryCharge);
          setFreeDeliveryAbove(s.freeDeliveryAbove);
          setMinOrderAmount(s.minOrderAmount);
          setTaxPercent(s.taxPercent !== undefined ? s.taxPercent : 5);
          const pins = s.serviceableAreas?.[0]?.pincodes || [];
          setPincodesInput(pins.join(', '));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(false);

    try {
      const pinList = pincodesInput
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);

      const payload = {
        storeName,
        contactPhone,
        contactEmail,
        address,
        baseDeliveryCharge: Number(baseDeliveryCharge),
        freeDeliveryAbove: Number(freeDeliveryAbove),
        minOrderAmount: Number(minOrderAmount),
        taxPercent: Number(taxPercent),
        serviceableAreas: [
          {
            id: 'primary-zone',
            name: 'Serviceable Coverage Zone',
            city: 'Erode',
            state: 'Tamil Nadu',
            isActive: true,
            pincodes: pinList,
            radiusKm: 25,
            centerLat: 11.3806,
            centerLng: 77.5944
          }
        ]
      };

      const res = await api.updateAdminSettings(payload);
      if (res.success) {
        setSuccessMsg(true);
        setTimeout(() => setSuccessMsg(false), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-gray-400">Loading store settings...</div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-charcoal">Store Operations & Delivery Zones</h1>
        <p className="text-xs text-gray-500">Configure business information, serviceable PIN codes, and delivery fee thresholds</p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-xs font-bold">
          Store settings and serviceable PIN codes successfully updated!
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        {/* Business Info */}
        <div className="space-y-4">
          <h3 className="font-black text-base text-charcoal flex items-center space-x-2">
            <Store className="w-4 h-4 text-brand-700" />
            <span>Store Profile</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Store Name</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-brand-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Support Contact Phone</label>
              <input
                type="text"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-brand-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Support Email</label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-brand-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Central Processing Address</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-brand-700"
            />
          </div>
        </div>

        {/* Delivery Charges, Taxes & Minimums */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="font-black text-base text-charcoal flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-brand-700" />
            <span>Delivery Fees, Taxes & Thresholds</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Base Delivery Fee (₹)</label>
              <input
                type="number"
                required
                value={baseDeliveryCharge}
                onChange={(e) => setBaseDeliveryCharge(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-brand-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Free Delivery Above (₹)</label>
              <input
                type="number"
                required
                value={freeDeliveryAbove}
                onChange={(e) => setFreeDeliveryAbove(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-brand-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Standard GST (%)</label>
              <input
                type="number"
                required
                min={0}
                max={28}
                value={taxPercent}
                onChange={(e) => setTaxPercent(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-brand-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Min Order Amount (₹)</label>
              <input
                type="number"
                required
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-brand-700"
              />
            </div>
          </div>
        </div>

        {/* Serviceable PIN Codes */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="font-black text-base text-charcoal flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-brand-700" />
            <span>Serviceable Delivery PIN Codes (Comma Separated)</span>
          </h3>
          <p className="text-xs text-gray-500">
            Customers entering any of these 6-digit PIN codes can place chicken delivery orders.
          </p>

          <textarea
            rows={3}
            value={pincodesInput}
            onChange={(e) => setPincodesInput(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs font-mono font-semibold outline-none focus:border-brand-700"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white font-bold text-xs px-6 py-3.5 rounded-xl shadow transition flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Changes...' : 'Save Store Configuration'}</span>
        </button>
      </form>
    </div>
  );
};
