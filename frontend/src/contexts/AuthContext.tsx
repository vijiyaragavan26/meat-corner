import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: any) => Promise<User>;
  loginWithOtp: (identifier: string, otp: string) => Promise<User>;
  sendOtp: (identifier: string) => Promise<{ success: boolean; message: string; otp?: string }>;
  register: (data: any) => Promise<User>;
  logout: () => void;
  isAdmin: boolean;
  isDeliveryPartner: boolean;
  isCustomer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('meat_corner_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('meat_corner_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Handle Supabase Email Magic Link redirect (#access_token=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (hash && (hash.includes('access_token=') || hash.includes('type=magiclink'))) {
      try {
        const cleanHash = hash.replace(/^[#?]/, '');
        const params = new URLSearchParams(cleanHash);
        const accessToken = params.get('access_token');

        if (accessToken) {
          // Decode JWT payload
          const base64Url = accessToken.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(
            decodeURIComponent(
              atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            )
          );

          const email = (payload.email || '').toLowerCase();
          const isAdminUser =
            email === 'vijiyaragavan26@gmail.com' ||
            email.includes('admin') ||
            email === 'admin@meatcorner.in';

          const authenticatedUser: User = isAdminUser
            ? {
                id: payload.sub || 'usr_admin_1',
                name: 'Vijay',
                email: 'vijiyaragavan26@gmail.com',
                phone: '+917604906429',
                role: 'ADMIN'
              }
            : {
                id: payload.sub || 'usr_cust_' + Date.now().toString().slice(-4),
                name: payload.user_metadata?.full_name || payload.user_metadata?.name || email.split('@')[0] || 'Customer',
                email: email,
                phone: payload.user_metadata?.phone || '+91 93607 61595',
                role: 'CUSTOMER'
              };

          localStorage.setItem('meat_corner_token', accessToken);
          localStorage.setItem('meat_corner_user', JSON.stringify(authenticatedUser));
          setToken(accessToken);
          setUser(authenticatedUser);

          // Clean URL hash without reloading
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      } catch (err) {
        console.error('Failed to parse Supabase email auth token from hash:', err);
      }
    }
  }, []);

  useEffect(() => {
    if (token) {
      api.getMe()
        .then((res) => {
          if (res.success && res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('meat_corner_user', JSON.stringify(res.data.user));
          } else {
            const saved = localStorage.getItem('meat_corner_user');
            if (saved) {
              setUser(JSON.parse(saved));
            } else {
              logout();
            }
          }
        })
        .catch(() => {
          const saved = localStorage.getItem('meat_corner_user');
          if (saved) {
            setUser(JSON.parse(saved));
          } else {
            logout();
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (credentials: any) => {
    const res = await api.login(credentials);
    if (res.success && res.data.token) {
      localStorage.setItem('meat_corner_token', res.data.token);
      localStorage.setItem('meat_corner_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const loginWithOtp = async (identifier: string, otp: string) => {
    const res = await api.verifyOtp({ identifier, otp });
    if (res.success && res.data.token) {
      localStorage.setItem('meat_corner_token', res.data.token);
      localStorage.setItem('meat_corner_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.message || 'OTP verification failed');
  };

  const sendOtp = async (identifier: string) => {
    const res = await api.sendOtp({ identifier });
    return res.data || { success: true, message: 'OTP sent' };
  };

  const register = async (data: any) => {
    const res = await api.register(data);
    if (res.success && res.data.token) {
      localStorage.setItem('meat_corner_token', res.data.token);
      localStorage.setItem('meat_corner_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('meat_corner_token');
    localStorage.removeItem('meat_corner_user');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'ADMIN';
  const isDeliveryPartner = user?.role === 'DELIVERY_PARTNER';
  const isCustomer = user?.role === 'CUSTOMER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        loginWithOtp,
        sendOtp,
        register,
        logout,
        isAdmin,
        isDeliveryPartner,
        isCustomer
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
