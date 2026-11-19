import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user && user.role === 'CUSTOMER') {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const [identifier, setIdentifier] = useState('7604906429');
  const [password, setPassword] = useState('Vijay@123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const user = await login({ identifier, email: identifier, password });
      if (user.role !== 'ADMIN') {
        throw new Error('Access denied. Administrator privileges required.');
      }
      navigate('/admin/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Admin authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-brand-700 text-white flex items-center justify-center text-2xl mx-auto shadow-lg shadow-brand-700/40">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-charcoal tracking-tight">MEAT CORNER Admin</h2>
          <p className="text-xs text-gray-500">Centralized Store, Inventory & Order Management</p>
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
              Admin Mobile Number or Email
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="7604906429 or admin@meatcorner.in"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-brand-700"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              Admin Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-brand-700"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-charcoal hover:bg-black text-white font-black py-3.5 rounded-xl shadow-lg text-xs uppercase tracking-wider transition flex items-center justify-center space-x-2"
          >
            <span>{isLoading ? 'Verifying Credentials...' : 'Sign In as Administrator'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={() => {
              setIdentifier('7604906429');
              setPassword('Vijay@123');
            }}
            className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition"
          >
            Fill Admin: 7604906429 / Vijay@123
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-gray-500 hover:text-brand-700 font-semibold"
          >
            ← Back to Meat Corner Customer Portal
          </button>
        </div>
      </div>
    </div>
  );
};
