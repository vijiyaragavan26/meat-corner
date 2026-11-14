import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Mail, Phone, User, ArrowRight, ShieldCheck, Bike, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { login, register } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (isRegister) {
        await register({ name, email, phone, password, role: 'CUSTOMER' });
      } else {
        await login({ email, password });
      }
      navigate(redirect);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = () => {
    setIsRegister(false);
    setEmail('customer@meatcorner.in');
    setPassword('Customer@123');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 text-white flex items-center justify-center text-2xl mx-auto shadow-md shadow-brand-700/30">
            🍗
          </div>
          <h2 className="text-2xl font-black text-charcoal">
            {isRegister ? 'Create Meat Corner Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-gray-500">
            {isRegister
              ? 'Join Meat Corner for fresh chicken cuts delivered to your door'
              : 'Log in to track orders and enjoy personalized chicken cuts'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-800">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Dharshini"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-brand-700"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@meatcorner.in"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-brand-700"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                Mobile Number *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-brand-700"
                />
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              Password *
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
            className="w-full bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white font-black py-3.5 rounded-xl shadow-lg shadow-brand-700/20 text-xs uppercase tracking-wider transition flex items-center justify-center space-x-2"
          >
            <span>{isLoading ? 'Processing...' : isRegister ? 'Register Account' : 'Login'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Login */}
        <div className="pt-2 border-t border-gray-100 space-y-2">
          <button
            type="button"
            onClick={handleDemoFill}
            className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition"
          >
            Fill Demo Customer: customer@meatcorner.in
          </button>

          <div className="flex justify-between items-center text-xs pt-1">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-brand-700 font-bold hover:underline"
            >
              {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
            </button>
          </div>
        </div>

        {/* Other Portals Shortcuts */}
        <div className="pt-4 border-t border-gray-100 flex justify-around text-xs text-gray-500">
          <Link to="/delivery" className="flex items-center text-emerald-700 font-bold hover:underline">
            <Bike className="w-3.5 h-3.5 mr-1" />
            <span>Delivery Partner</span>
          </Link>
          <span className="text-gray-300">|</span>
          <Link to="/admin" className="flex items-center text-brand-700 font-bold hover:underline">
            <Shield className="w-3.5 h-3.5 mr-1" />
            <span>Admin Control</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
