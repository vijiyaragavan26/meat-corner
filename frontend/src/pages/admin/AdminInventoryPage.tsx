import React, { useEffect, useState } from 'react';
import { Boxes, AlertTriangle, CheckCircle2, Search, Edit3, X } from 'lucide-react';
import { api } from '../../services/api';

export const AdminInventoryPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [newStock, setNewStock] = useState<number>(0);
  const [newThreshold, setNewThreshold] = useState<number>(5);
  const [isSaving, setIsSaving] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminInventory();
      if (res.success) setItems(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const openStockModal = (item: any) => {
    setEditingItem(item);
    setNewStock(item.stockQuantity);
    setNewThreshold(item.lowStockThreshold);
  };

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsSaving(true);
    try {
      const res = await api.updateAdminInventory(editingItem.id, {
        stockQuantity: Number(newStock),
        lowStockThreshold: Number(newThreshold)
      });
      if (res.success) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === editingItem.id
              ? {
                  ...i,
                  stockQuantity: Number(newStock),
                  availableQuantity: Number(newStock) - i.reservedQuantity,
                  lowStockThreshold: Number(newThreshold),
                  isLowStock: Number(newStock) <= Number(newThreshold)
                }
              : i
          )
        );
        setEditingItem(null);
      }
    } catch (err: any) {
      alert(err.message || 'Stock adjustment failed');
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = items.filter((i) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return i.productName.toLowerCase().includes(q) || i.category.toLowerCase().includes(q);
  });

  const lowStockCount = items.filter((i) => i.isLowStock).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal">Real-Time Inventory & Butchery Stock</h1>
          <p className="text-xs text-gray-500">Live bird weights, reserved orders, and low-stock protection</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search chicken inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-charcoal outline-none focus:border-brand-700 w-56 shadow-sm"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
          </div>

          {lowStockCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-1.5 shadow-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>{lowStockCount} Low Stock Alert(s)</span>
            </div>
          )}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Chicken Cut</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Pack Weight</th>
                <th className="py-3 px-4">Physical Stock</th>
                <th className="py-3 px-4">Reserved (In Cart/Order)</th>
                <th className="py-3 px-4">Available For Order</th>
                <th className="py-3 px-4">Threshold</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">Loading inventory data...</td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3 px-4 font-bold text-charcoal">{item.productName}</td>
                    <td className="py-3 px-4 text-gray-500">{item.category}</td>
                    <td className="py-3 px-4 font-semibold text-gray-700">{item.variantLabel}</td>
                    <td className="py-3 px-4 font-black text-charcoal text-sm">{item.stockQuantity}</td>
                    <td className="py-3 px-4 font-bold text-amber-600">{item.reservedQuantity}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded ${
                          item.availableQuantity <= 5
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {item.availableQuantity} units
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 font-mono">{item.lowStockThreshold} units</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openStockModal(item)}
                        className="bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs px-3 py-1.5 rounded-xl border border-brand-200 transition"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative border border-gray-100 space-y-4">
            <button
              onClick={() => setEditingItem(null)}
              className="absolute right-5 top-5 p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-black text-charcoal">Adjust Bird Stock</h3>
              <p className="text-xs text-gray-500 mt-0.5">{editingItem.productName} ({editingItem.variantLabel})</p>
            </div>

            <form onSubmit={handleUpdateStock} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Total Units in Butchery</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={newStock}
                  onChange={(e) => setNewStock(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-brand-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Low Stock Warning Threshold</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={newThreshold}
                  onChange={(e) => setNewThreshold(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-brand-700"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs uppercase transition shadow"
              >
                {isSaving ? 'Updating...' : 'Save Inventory Level'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
