import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, ShieldAlert, ShieldCheck, Eye, EyeOff, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, user, logout } = useAuth();

  // If already logged in as customer, redirect to customer store
  useEffect(() => {
    if (user && user.role === 'CUSTOMER') {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const [identifier, setIdentifier] = useState('7604906429');
  const [password, setPassword] = useState('Vijay@123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Security brute-force protection
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  useEffect(() => {
    if (lockoutTimer <= 0) return;
    const interval = setInterval(() => {
      setLockoutTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      // Clear any conflicting session before admin authentication
      if (user && user.role !== 'ADMIN') {
        logout();
      }

      const authenticatedUser = await login({ identifier, email: identifier, password });
      if (authenticatedUser.role !== 'ADMIN') {
        throw new Error('Access denied. Administrator clearance required.');
      }
      setFailedAttempts(0);
      navigate('/admin/dashboard');
    } catch (err: any) {
      const nextFailed = failedAttempts + 1;
      setFailedAttempts(nextFailed);
      if (nextFailed >= 5) {
        setLockoutTimer(30);
        setErrorMsg('Security lockout: 5 failed attempts. Please wait 30 seconds.');
      } else {
        setErrorMsg(err.message || `Authentication failed (${5 - nextFailed} attempts remaining).`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full mx-auto shadow-xl border-2 border-emerald-500/30 overflow-hidden">
            <img src="/logo.png" alt="MPM Meat Corner Logo" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-black text-charcoal tracking-tight">MPM MEAT CORNER Admin</h2>
          <p className="text-xs text-gray-500">Restricted Operations, Butchery & Order Fulfillment</p>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-gray-100 border border-gray-200 text-gray-700 rounded-full text-[10px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-700" />
            <span>256-Bit TLS Administrative Gateway</span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-800 flex items-center">
            <ShieldAlert className="w-4 h-4 mr-2 text-red-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {lockoutTimer > 0 && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-600 animate-spin" />
            <span>Security Lockout active: retry in {lockoutTimer}s</span>
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
                disabled={lockoutTimer > 0}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="7604906429 or vijiyaragavan26@gmail.com"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-brand-700 disabled:opacity-50"
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
                type={showPassword ? 'text' : 'password'}
                required
                disabled={lockoutTimer > 0}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-xs font-semibold outline-none focus:border-brand-700 disabled:opacity-50"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || lockoutTimer > 0}
            className="w-full bg-charcoal hover:bg-black disabled:opacity-50 text-white font-black py-3.5 rounded-xl shadow-lg text-xs uppercase tracking-wider transition flex items-center justify-center space-x-2"
          >
            <span>{isLoading ? 'Verifying Security Clearance...' : lockoutTimer > 0 ? `Locked (${lockoutTimer}s)` : 'Sign In as Administrator'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-gray-100">
          <button
            type="button"
            disabled={lockoutTimer > 0}
            onClick={() => {
              setIdentifier('7604906429');
              setPassword('Vijay@123');
            }}
            className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition disabled:opacity-50"
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
