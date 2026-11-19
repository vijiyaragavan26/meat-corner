import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Lock,
  Mail,
  Phone,
  User,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  Sparkles,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { user, isLoading: authLoading, login, loginWithOtp, sendOtp, register } = useAuth();

  // If already logged in, redirect immediately to target page
  useEffect(() => {
    if (user && !authLoading) {
      navigate(redirect, { replace: true });
    }
  }, [user, authLoading, navigate, redirect]);

  // View state: 'signin' | 'register'
  const [isRegister, setIsRegister] = useState(false);
  // Login mode: 'password' | 'otp'
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');

  // Sign In inputs (can be mobile number or email)
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP flow inputs
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Register inputs
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Request OTP
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanId = identifier.trim();
    if (!cleanId) {
      setErrorMsg('Please enter your mobile number or email address to receive OTP.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await sendOtp(cleanId);
      setIsOtpSent(true);
      const code = res.otp || '123456';
      setGeneratedOtp(code);
      setSuccessMsg(`OTP sent! Your verification code is ${code} (Demo Test OTP)`);
      setCountdown(30);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Sign In (Password or OTP)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanId = identifier.trim();
    if (!cleanId) {
      setErrorMsg('Please enter your mobile number or email.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (loginMode === 'password') {
        if (!password) {
          setErrorMsg('Please enter your password.');
          setIsSubmitting(false);
          return;
        }
        await login({ identifier: cleanId, email: cleanId, password });
      } else {
        // OTP Login
        if (!otp || otp.trim().length < 4) {
          setErrorMsg('Please enter the 6-digit OTP code received on your mobile or email.');
          setIsSubmitting(false);
          return;
        }
        await loginWithOtp(cleanId, otp.trim());
      }
      navigate(redirect);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit New Customer Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!regEmail.trim() && !regPhone.trim()) {
      setErrorMsg('Please enter your email address or mobile number.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: regName.trim(),
        email: regEmail.trim() || `cust_${Date.now()}@meatcorner.in`,
        phone: regPhone.trim() || '+91 98765 43210',
        password: regPassword || 'Customer@123',
        role: 'CUSTOMER'
      });
      navigate(redirect);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-white to-gray-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-flex items-center justify-center space-x-2.5 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 text-white flex items-center justify-center text-2xl shadow-lg shadow-brand-700/30 group-hover:scale-105 transition-transform">
            🍗
          </div>
          <div className="text-left">
            <span className="text-2xl font-black text-charcoal tracking-tight block leading-tight">
              MEAT <span className="text-brand-700">CORNER</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block -mt-1">
              Fresh Chicken Delivery
            </span>
          </div>
        </Link>

        {/* Access Notice Badge */}
        <div className="inline-flex items-center bg-brand-50 border border-brand-200 text-brand-800 text-[11px] font-bold px-3 py-1 rounded-full space-x-1.5 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-700" />
          <span>Customer Sign-In Required to Access Store</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-charcoal">
          {isRegister ? 'Create Your Account' : 'Welcome to Meat Corner'}
        </h1>
        <p className="text-xs text-gray-500 max-w-xs mx-auto">
          {isRegister
            ? 'Sign up to order antibiotic-free chicken cuts with express 30-45 min delivery.'
            : 'Please sign in with your mobile number or email to start shopping.'}
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xl shadow-gray-200/50 rounded-3xl border border-gray-100 space-y-6">
          {/* Main Mode Toggle: Sign In vs Create Account */}
          <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2.5 rounded-xl transition-all ${
                !isRegister
                  ? 'bg-white text-charcoal shadow-sm'
                  : 'text-gray-500 hover:text-charcoal'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2.5 rounded-xl transition-all ${
                isRegister
                  ? 'bg-white text-charcoal shadow-sm'
                  : 'text-gray-500 hover:text-charcoal'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback alerts */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-800 flex items-start space-x-2">
              <span className="text-base leading-none">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-xs font-semibold text-green-800 flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ============================================================ */}
          {/* SIGN IN VIEW */}
          {/* ============================================================ */}
          {!isRegister ? (
            <div className="space-y-5">
              {/* Login Method Sub-Toggle: Password vs OTP */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Login Method:
                </span>
                <div className="flex space-x-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMode('password');
                      setErrorMsg(null);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                      loginMode === 'password'
                        ? 'bg-brand-700 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Lock className="w-3 h-3" />
                    <span>Password</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMode('otp');
                      setErrorMsg(null);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                      loginMode === 'otp'
                        ? 'bg-brand-700 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <KeyRound className="w-3 h-3" />
                    <span>Email / SMS OTP</span>
                  </button>
                </div>
              </div>

              <form onSubmit={loginMode === 'otp' && !isOtpSent ? handleRequestOtp : handleLoginSubmit} className="space-y-4">
                {/* Identifier: Mobile or Email */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Mobile Number or Email Address *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. +91 98765 43210 or name@email.com"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-brand-700 focus:bg-white transition"
                    />
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    Enter your registered 10-digit mobile number or email address
                  </span>
                </div>

                {/* --- PASSWORD METHOD --- */}
                {loginMode === 'password' && (
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                        Password *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginMode('otp');
                          handleRequestOtp();
                        }}
                        className="text-[11px] font-bold text-brand-700 hover:underline"
                      >
                        Forgot? Sign In with OTP
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your account password"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-xs font-semibold outline-none focus:border-brand-700 focus:bg-white transition"
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
                )}

                {/* --- OTP METHOD --- */}
                {loginMode === 'otp' && (
                  <div className="space-y-3 pt-1">
                    {!isOtpSent ? (
                      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 space-y-1.5">
                        <div className="font-bold flex items-center space-x-1.5">
                          <Sparkles className="w-4 h-4 text-amber-600" />
                          <span>Fast Instant OTP Login</span>
                        </div>
                        <p className="text-[11px] text-amber-800">
                          Click below to receive a 6-digit one-time password on your mobile or email.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* OTP Input */}
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                              Enter 6-Digit OTP *
                            </label>
                            {generatedOtp && (
                              <button
                                type="button"
                                onClick={() => setOtp(generatedOtp)}
                                className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-lg border border-green-200 hover:bg-green-100"
                              >
                                Auto-Fill ({generatedOtp})
                              </button>
                            )}
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              maxLength={6}
                              required
                              value={otp}
                              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                              placeholder="1 2 3 4 5 6"
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-center text-sm font-mono font-bold tracking-widest outline-none focus:border-brand-700 focus:bg-white transition"
                            />
                            <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                          </div>
                        </div>

                        {/* Resend Link */}
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>Didn't receive code?</span>
                          {countdown > 0 ? (
                            <span className="font-semibold text-gray-400 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              Resend in {countdown}s
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRequestOtp()}
                              className="font-bold text-brand-700 hover:underline"
                            >
                              Resend OTP
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Primary Action Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white font-black py-3.5 rounded-xl shadow-lg shadow-brand-700/20 text-xs uppercase tracking-wider transition flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </div>
                  ) : loginMode === 'otp' && !isOtpSent ? (
                    <>
                      <span>Send Login OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>{loginMode === 'otp' ? 'Verify OTP & Enter Store' : 'Sign In with Password'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* ============================================================ */
            /* REGISTER VIEW */
            /* ============================================================ */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Priya Dharshini"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-brand-700 focus:bg-white transition"
                  />
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Mobile Number *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-brand-700 focus:bg-white transition"
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-brand-700 focus:bg-white transition"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Create Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-xs font-semibold outline-none focus:border-brand-700 focus:bg-white transition"
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
                disabled={isSubmitting}
                className="w-full bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white font-black py-3.5 rounded-xl shadow-lg shadow-brand-700/20 text-xs uppercase tracking-wider transition flex items-center justify-center space-x-2"
              >
                <span>{isSubmitting ? 'Creating Account...' : 'Register & Enter Store'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
export default AuthPage;