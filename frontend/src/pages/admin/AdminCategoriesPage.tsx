import React, { useEffect, useState } from 'react';
import { Layers, Plus, Edit2, Trash2, Check, X, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';
import { Category } from '../../types';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.getCategories();
      if (res.success) setCategories(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=600&q=80');
    setSortOrder(categories.length + 1);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setImageUrl(cat.imageUrl || '');
    setSortOrder(cat.sortOrder);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Chicken validation check
    const lower = name.toLowerCase();
    const banned = ['mutton', 'fish', 'prawn', 'seafood', 'beef', 'pork'];
    if (banned.some((b) => lower.includes(b))) {
      setErrorMsg('Meat Corner is chicken only. Mutton, fish, seafood, and other meats are strictly prohibited.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingCategory) {
        const res = await api.updateAdminCategory(editingCategory.id, {
          name,
          description,
          imageUrl,
          sortOrder: Number(sortOrder)
        });
        if (res.success) {
          setCategories((prev) => prev.map((c) => (c.id === editingCategory.id ? res.data : c)));
        }
      } else {
        const res = await api.createAdminCategory({
          name,
          description,
          imageUrl,
          sortOrder: Number(sortOrder)
        });
        if (res.success) {
          setCategories((prev) => [...prev, res.data]);
        }
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal">Chicken Category Management</h1>
          <p className="text-xs text-gray-500">
            Configure the 8 primary chicken cuts. Exclusively chicken categories permitted.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Chicken Category</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-400">Loading categories...</div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm p-4 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-3">
                <div className="w-full h-36 rounded-2xl overflow-hidden bg-gray-100">
                  <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                    Order #{cat.sortOrder}
                  </span>
                  <h3 className="font-bold text-base text-charcoal mt-1">{cat.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{cat.description}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-50 flex justify-between items-center text-xs">
                <button
                  onClick={() => openEditModal(cat)}
                  className="font-bold text-charcoal hover:text-brand-700 flex items-center space-x-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <span className="text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded text-[10px]">
                  Active
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100 space-y-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-5 top-5 p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-charcoal">
              {editingCategory ? 'Edit Chicken Category' : 'Create Chicken Category'}
            </h3>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 text-red-800 text-xs font-semibold flex items-center">
                <ShieldAlert className="w-4 h-4 mr-2 text-red-600 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Boneless Chicken"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-brand-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 100% boneless fresh cubes"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-brand-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Image URL</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-brand-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Display Sort Order</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-brand-700"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs uppercase transition"
              >
                {isSaving ? 'Saving...' : 'Save Category'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
