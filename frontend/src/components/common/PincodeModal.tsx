import React, { useState } from 'react';
import { X, MapPin, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { useLocation } from '../../contexts/LocationContext';

export const PincodeModal: React.FC = () => {
  const { isModalOpen, closeModal, pincode, locationName, setPincodeAndVerify } = useLocation();
  const [inputPin, setInputPin] = useState(pincode);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  if (!isModalOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPin.trim()) return;

    setIsChecking(true);
    setFeedback(null);
    const result = await setPincodeAndVerify(inputPin.trim());
    setIsChecking(false);

    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      setTimeout(() => {
        closeModal();
      }, 1200);
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  const quickPincodes = [
    { pin: '638116', area: 'Kanjikovil' },
    { pin: '638052', area: 'Perundurai' },
    { pin: '638001', area: 'Erode Town' },
    { pin: '638102', area: 'Bhavani' },
    { pin: '600001', area: 'Chennai Central' },
    { pin: '560001', area: 'Bangalore' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100">
        <button
          onClick={closeModal}
          className="absolute right-5 top-5 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-charcoal transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-charcoal">Select Delivery Location</h3>
            <p className="text-xs text-gray-500">Check chicken home delivery availability in your area</p>
          </div>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              Enter 6-digit PIN Code
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                maxLength={6}
                value={inputPin}
                onChange={(e) => setInputPin(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 638116"
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold tracking-wider text-charcoal focus:ring-2 focus:ring-brand-700/20 focus:border-brand-700 outline-none"
              />
              <button
                type="submit"
                disabled={isChecking || inputPin.length < 6}
                className="bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-brand-700/20 transition"
              >
                {isChecking ? 'Checking...' : 'Check'}
              </button>
            </div>
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-xl flex items-start text-xs font-medium ${
                feedback.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 mr-2 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 mr-2 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Popular Serviceable Areas:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {quickPincodes.map((qp) => (
                <button
                  type="button"
                  key={qp.pin}
                  onClick={() => {
                    setInputPin(qp.pin);
                    setPincodeAndVerify(qp.pin);
                    closeModal();
                  }}
                  className={`flex flex-col text-left p-2.5 rounded-xl border transition text-xs ${
                    pincode === qp.pin
                      ? 'border-brand-700 bg-brand-50 text-brand-900 font-bold'
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <span className="font-semibold">{qp.area}</span>
                  <span className="text-[11px] text-gray-500 font-mono">{qp.pin}</span>
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
