import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Eye,
  EyeOff,
  Clock,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
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

  // Step 1: Primary Credentials
  const [identifier, setIdentifier] = useState('vijiyaragavan26@gmail.com');
  const [password, setPassword] = useState('Vijay@123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Step 2: Double Protection Second Password Clearance
  const [step, setStep] = useState<1 | 2>(1);
  const [tempUser, setTempUser] = useState<any>(null);
  const [secondPassword, setSecondPassword] = useState('');
  const [showSecondPassword, setShowSecondPassword] = useState(false);

  // Brute-force lockout protection
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  useEffect(() => {
    if (lockoutTimer <= 0) return;
    const interval = setInterval(() => {
      setLockoutTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  // Step 1 Verification: Verify Admin primary email & password (Vijay@123)
  const handlePrimarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (user && user.role !== 'ADMIN') {
        logout();
      }

      // Check credentials (email: vijiyaragavan26@gmail.com, password: Vijay@123)
      const authenticatedUser = await login({ identifier, email: identifier, password });
      if (authenticatedUser.role !== 'ADMIN') {
        throw new Error('Access denied. Administrator clearance required.');
      }

      setTempUser(authenticatedUser);
      setStep(2);
      setFailedAttempts(0);
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

  // Step 2 Verification: Verify Double Protection Second Password (Vijay@234)
  const handleVerifyDoubleProtection = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const entered = secondPassword.trim();
    // Verify exact required second password: Vijay@234 (or vijay@234)
    if (entered === 'Vijay@234' || entered.toLowerCase() === 'vijay@234') {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        navigate('/admin/dashboard');
      }, 500);
    } else {
      setErrorMsg('Invalid Double Protection second password. Please enter the correct second password (Vijay@234).');
    }
  };

  const handleQuickFillSecondPassword = () => {
    setSecondPassword('Vijay@234');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-charcoal-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full mx-auto shadow-xl border-2 border-emerald-500/30 overflow-hidden">
            <img src="/logo.png" alt="MPM Meat Corner Logo" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-black text-charcoal tracking-tight">MPM MEAT CORNER Admin</h2>
          <p className="text-xs text-gray-500">Restricted Operations, Butchery & Order Fulfillment</p>
          
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-[10px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Double Protection 2-Factor Gateway</span>
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

        {/* STEP 1: Primary Credentials Form */}
        {step === 1 && (
          <form onSubmit={handlePrimarySubmit} className="space-y-4">
            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-[11px] text-gray-600 flex items-center justify-between">
              <span className="font-semibold">Step 1 of 2: Primary Password</span>
              <span className="font-bold text-brand-700">Protected</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                Admin Email or Mobile
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  disabled={lockoutTimer > 0}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="vijiyaragavan26@gmail.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-brand-700 disabled:opacity-50"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                First Password (Primary)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={lockoutTimer > 0}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Vijay@123"
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
              <span>{isLoading ? 'Verifying First Password...' : lockoutTimer > 0 ? `Locked (${lockoutTimer}s)` : 'Continue to Double Protection'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: Double Protection Second Password Form */}
        {step === 2 && (
          <form onSubmit={handleVerifyDoubleProtection} className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-900 flex items-center space-x-1.5">
                  <Shield className="w-4 h-4 text-emerald-700" />
                  <span>Step 2 of 2: Double Protection Second Password</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-extrabold text-[10px]">
                  2ND PASSWORD REQUIRED
                </span>
              </div>
              <p className="text-[11px] text-emerald-800">
                Administrator: <span className="font-bold">{tempUser?.name || 'Vijay'}</span> ({tempUser?.email || 'vijiyaragavan26@gmail.com'})
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                Enter Double Protection Second Password
              </label>
              <div className="relative">
                <input
                  type={showSecondPassword ? 'text' : 'password'}
                  required
                  value={secondPassword}
                  onChange={(e) => setSecondPassword(e.target.value)}
                  placeholder="Vijay@234"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-xs font-semibold outline-none focus:border-emerald-600 focus:bg-white"
                  autoFocus
                />
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowSecondPassword(!showSecondPassword)}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showSecondPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleQuickFillSecondPassword}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fill Second Password (Vijay@234)</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || !secondPassword.trim()}
              className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-black py-3.5 rounded-xl shadow-lg shadow-emerald-700/20 text-xs uppercase tracking-wider transition flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isLoading ? 'Verifying Second Protection...' : 'Verify & Enter Admin Portal'}</span>
            </button>

            <div className="flex items-center justify-between pt-1 text-xs">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-gray-500 hover:text-gray-700 font-semibold"
              >
                ← Back to Step 1
              </button>
            </div>
          </form>
        )}

        <div className="text-center pt-2">
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
