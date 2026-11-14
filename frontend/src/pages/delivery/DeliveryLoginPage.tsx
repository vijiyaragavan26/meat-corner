import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bike, Lock, Mail, ArrowRight, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const DeliveryLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('delivery@meatcorner.in');
  const [password, setPassword] = useState('Delivery@123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const user = await login({ email, password });
      if (user.role !== 'DELIVERY_PARTNER' && user.role !== 'ADMIN') {
        throw new Error('Access denied. Valid delivery partner credentials required.');
      }
      navigate('/delivery/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Delivery authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-emerald-100 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center text-2xl mx-auto shadow-lg shadow-emerald-700/40">
            <Bike className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-charcoal tracking-tight">Meat Corner Fleet</h2>
          <p className="text-xs text-gray-500">Delivery Partner Application Portal</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-800 flex items-center">
            <ShieldAlert className="w-4 h-4 mr-2 text-red-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              Rider Email / Phone
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="delivery@meatcorner.in"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-emerald-700"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-emerald-700"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black py-3.5 rounded-xl shadow-lg shadow-emerald-700/20 text-xs uppercase tracking-wider transition flex items-center justify-center space-x-2"
          >
            <span>{isLoading ? 'Authenticating Rider...' : 'Sign In to Driver App'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={() => {
              setEmail('delivery@meatcorner.in');
              setPassword('Delivery@123');
            }}
            className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold transition"
          >
            Fill Demo Rider: delivery@meatcorner.in / Delivery@123
          </button>
        </div>

        <div className="text-center">
          <Link to="/" className="text-xs text-gray-500 hover:text-emerald-700 font-semibold">
            ← Back to Meat Corner Customer Portal
          </Link>
        </div>
      </div>
    </div>
  );
};
