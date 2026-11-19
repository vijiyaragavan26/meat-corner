import React, { useEffect, useState } from 'react';
import { Users, Search, ShieldCheck, ShieldAlert, ShoppingBag } from 'lucide-react';
import { api } from '../../services/api';

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminCustomers();
      if (res && res.success && Array.isArray(res.data)) {
        setCustomers(res.data);
      } else if (Array.isArray(res?.data)) {
        setCustomers(res.data);
      } else if (Array.isArray(res)) {
        setCustomers(res);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleStatus = async (id: string) => {
    // Instant optimistic UI update
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
    try {
      const res = await api.toggleAdminCustomerStatus(id);
      if (res && res.success && res.data) {
        setCustomers((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isActive: res.data.isActive } : c))
        );
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update customer status');
      fetchCustomers();
    }
  };

  const filtered = customers.filter((c) => {
    if (!c) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase().trim();
    const name = (c.name || '').toLowerCase();
    const email = (c.email || '').toLowerCase();
    const phone = (c.phone || '').toLowerCase();
    return name.includes(q) || email.includes(q) || phone.includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal">Customer Accounts & Spending</h1>
          <p className="text-xs text-gray-500">View customer lifetime value, order frequency, and account security</p>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search customer by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-charcoal outline-none focus:border-brand-700 w-64 shadow-sm"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4">Total Orders</th>
                <th className="py-3 px-4">Lifetime Spend</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">Loading customer database...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">No customers found matching search.</td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-charcoal block">{c.name || 'Valued Customer'}</span>
                      <span className="text-gray-400 text-[10px]">{c.email || 'customer@meatcorner.in'}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-gray-600">{c.phone || '—'}</td>
                    <td className="py-3.5 px-4 text-gray-400">
                      {c.createdAt ? String(c.createdAt).slice(0, 10) : '2026-11-10'}
                    </td>
                    <td className="py-3.5 px-4 font-black text-charcoal">{c.totalOrders ?? 1} orders</td>
                    <td className="py-3.5 px-4 font-black text-brand-700 text-sm">₹{c.totalSpent ?? 0}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          c.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {c.isActive !== false ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(c.id)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition ${
                          c.isActive !== false
                            ? 'text-red-600 border-red-200 hover:bg-red-50'
                            : 'text-green-600 border-green-200 hover:bg-green-50'
                        }`}
                      >
                        {c.isActive !== false ? 'Block' : 'Unblock'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
