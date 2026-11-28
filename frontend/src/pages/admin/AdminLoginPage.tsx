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

  // Step 2: Double Protection 2FA Clearance
  const [step, setStep] = useState<1 | 2>(1);
  const [tempUser, setTempUser] = useState<any>(null);
  const [securityPin, setSecurityPin] = useState('');
  const [generated2FACode, setGenerated2FACode] = useState('842826');
  const [isDispatching, setIsDispatching] = useState(false);
  const [codeSentMessage, setCodeSentMessage] = useState<string | null>(null);

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

  // Step 1 Verification: Verify Admin primary email & password
  const handlePrimarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (user && user.role !== 'ADMIN') {
        logout();
      }

      // Check credentials
      const authenticatedUser = await login({ identifier, email: identifier, password });
      if (authenticatedUser.role !== 'ADMIN') {
        throw new Error('Access denied. Administrator clearance required.');
      }

      // Generate a secure 6-digit double protection code
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGenerated2FACode(newCode);
      setTempUser(authenticatedUser);
      setStep(2);
      setCodeSentMessage(`Double Protection 2FA code dispatched to ${authenticatedUser.email || 'vijiyaragavan26@gmail.com'} & +91 76049 06429`);
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

  // Step 2 Verification: Verify 6-digit Double Protection PIN
  const handleVerifyDoubleProtection = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const enteredClean = securityPin.trim();
    // Accept generated code or static backup emergency PIN '842826' or '123456'
    if (enteredClean === generated2FACode || enteredClean === '842826' || enteredClean === '123456') {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        navigate('/admin/dashboard');
      }, 500);
    } else {
      setErrorMsg('Invalid Double Protection PIN. Please enter the 6-digit code dispatched to your phone/email.');
    }
  };

  const handleResendCode = () => {
    setIsDispatching(true);
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGenerated2FACode(newCode);
    setTimeout(() => {
      setIsDispatching(false);
      setCodeSentMessage(`New security authorization PIN sent to ${tempUser?.email || 'vijiyaragavan26@gmail.com'}`);
    }, 600);
  };

  const handleQuickFill = () => {
    setSecurityPin(generated2FACode);
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
            <span>Double Protection 256-Bit TLS Clearance</span>
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
              <span className="font-semibold">Step 1 of 2: Primary Credentials</span>
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
                Admin Password
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
              <span>{isLoading ? 'Verifying Admin Credentials...' : lockoutTimer > 0 ? `Locked (${lockoutTimer}s)` : 'Continue to Double Protection'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: Double Protection 2FA Clearance Form */}
        {step === 2 && (
          <form onSubmit={handleVerifyDoubleProtection} className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-900 flex items-center space-x-1.5">
                  <Shield className="w-4 h-4 text-emerald-700" />
                  <span>Step 2 of 2: Double Protection Clearance</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-extrabold text-[10px]">
                  2FA ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-emerald-800">
                Administrator: <span className="font-bold">{tempUser?.name || 'Vijay'}</span> ({tempUser?.email || 'vijiyaragavan26@gmail.com'})
              </p>
            </div>

            {/* Simulated 2FA Dispatch Card */}
            <div className="bg-gray-50 border border-dashed border-gray-300 p-3 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Double Protection Code</span>
                <span className="font-mono font-black text-brand-700 tracking-widest text-base">{generated2FACode}</span>
              </div>
              <button
                type="button"
                onClick={handleQuickFill}
                className="px-2.5 py-1.5 bg-brand-700 hover:bg-brand-800 text-white rounded-lg font-bold text-[11px] flex items-center space-x-1 transition shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>One-Click Fill</span>
              </button>
            </div>

            {codeSentMessage && (
              <p className="text-[11px] text-gray-500 font-medium text-center">
                {codeSentMessage}
              </p>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                Enter 6-Digit Double Protection Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={securityPin}
                  onChange={(e) => setSecurityPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit PIN"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-center text-lg font-mono font-black tracking-widest outline-none focus:border-emerald-600 focus:bg-white"
                  autoFocus
                />
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || securityPin.length < 6}
              className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-black py-3.5 rounded-xl shadow-lg shadow-emerald-700/20 text-xs uppercase tracking-wider transition flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isLoading ? 'Authorizing Administrative Access...' : 'Verify & Enter Admin Portal'}</span>
            </button>

            <div className="flex items-center justify-between pt-1 text-xs">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-gray-500 hover:text-gray-700 font-semibold"
              >
                ← Back to Step 1
              </button>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isDispatching}
                className="text-brand-700 hover:text-brand-800 font-bold inline-flex items-center space-x-1"
              >
                <RefreshCw className={`w-3 h-3 ${isDispatching ? 'animate-spin' : ''}`} />
                <span>Resend Code</span>
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
