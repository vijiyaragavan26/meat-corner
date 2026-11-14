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
      if (res.success) setCustomers(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await api.toggleAdminCustomerStatus(id);
      if (res.success) {
        setCustomers((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isActive: res.data.isActive } : c))
        );
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update customer status');
    }
  };

  const filtered = customers.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q);
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
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-charcoal block">{c.name}</span>
                      <span className="text-gray-400 text-[10px]">{c.email}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-gray-600">{c.phone}</td>
                    <td className="py-3.5 px-4 text-gray-400">{c.createdAt.slice(0, 10)}</td>
                    <td className="py-3.5 px-4 font-black text-charcoal">{c.totalOrders} orders</td>
                    <td className="py-3.5 px-4 font-black text-brand-700 text-sm">₹{c.totalSpent}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          c.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(c.id)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition ${
                          c.isActive
                            ? 'text-red-600 border-red-200 hover:bg-red-50'
                            : 'text-green-600 border-green-200 hover:bg-green-50'
                        }`}
                      >
                        {c.isActive ? 'Block' : 'Unblock'}
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
