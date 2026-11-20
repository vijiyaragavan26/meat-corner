import React, { useEffect, useState, useCallback } from 'react';
import { Search, Trash2, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchCustomers = useCallback(async (showFullLoader: boolean = true) => {
    if (showFullLoader) setLoading(true);
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
      if (showFullLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers(true);

    // Auto-sync every 8 seconds so customer registrations show up immediately
    const interval = setInterval(() => {
      fetchCustomers(false);
    }, 8000);

    // Sync immediately when admin switches back to tab or on local storage change
    const handleFocus = () => fetchCustomers(false);
    const handleStorage = (e: StorageEvent) => {
      if (e.key?.includes('meat_corner')) {
        fetchCustomers(false);
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
    };
  }, [fetchCustomers]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchCustomers(false);
    setIsRefreshing(false);
  };

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
      setStatusMessage({
        text: err.message || 'Failed to update customer status.',
        type: 'error',
      });
      fetchCustomers(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const targetId = deleteTarget.id;
    const targetName = deleteTarget.name || 'Customer';

    // Optimistically remove from view
    setCustomers((prev) => prev.filter((c) => c.id !== targetId));
    setDeleteTarget(null);

    try {
      await api.deleteAdminCustomer(targetId);
      setStatusMessage({
        text: `Customer account "${targetName}" was permanently deleted from the database.`,
        type: 'success',
      });
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err: any) {
      setStatusMessage({
        text: err?.message || 'Failed to delete customer account. Please try again.',
        type: 'error',
      });
      fetchCustomers(false);
    } finally {
      setIsDeleting(false);
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
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal">Customer Accounts & Spending</h1>
          <p className="text-xs text-gray-500">
            Real-time customer registry, account management, and security controls
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleManualRefresh}
            title="Refresh and sync latest customer accounts from cloud"
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:border-brand-700 hover:text-brand-700 transition shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-brand-700' : ''}`} />
            <span>Sync Accounts</span>
          </button>

          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-charcoal outline-none focus:border-brand-700 w-60 shadow-sm"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {statusMessage && (
        <div
          className={`flex items-center justify-between p-3.5 rounded-2xl text-xs font-bold shadow-sm transition ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-red-50 text-red-900 border border-red-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs opacity-60 hover:opacity-100 ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Customers Table */}
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
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-700" />
                    Loading customer database...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No customers found matching search.
                  </td>
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
                    <td className="py-3.5 px-4 font-black text-charcoal">{c.totalOrders ?? 0} orders</td>
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
                      <div className="flex items-center justify-end space-x-2">
                        {/* Block / Unblock Toggle */}
                        <button
                          onClick={() => handleToggleStatus(c.id)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition ${
                            c.isActive !== false
                              ? 'text-amber-700 border-amber-200 hover:bg-amber-50'
                              : 'text-green-600 border-green-200 hover:bg-green-50'
                          }`}
                        >
                          {c.isActive !== false ? 'Block' : 'Unblock'}
                        </button>

                        {/* Delete Customer Account Option */}
                        <button
                          onClick={() => setDeleteTarget(c)}
                          title="Permanently Delete Customer Account"
                          className="inline-flex items-center space-x-1 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-red-100 space-y-4 animate-scaleIn">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-charcoal">Delete Customer Account?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to permanently delete customer account{' '}
                <strong className="text-charcoal">{deleteTarget.name}</strong> ({deleteTarget.phone || deleteTarget.email})?
              </p>
              <div className="text-[11px] text-red-700 mt-3 bg-red-50 p-3 rounded-2xl border border-red-100 space-y-1">
                <p className="font-bold">⚠️ Irreversible Action:</p>
                <p>This will permanently purge this customer from Supabase cloud database, invalidate their sign-in credentials, and erase their customer record immediately.</p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-charcoal bg-gray-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-md shadow-red-500/20"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
