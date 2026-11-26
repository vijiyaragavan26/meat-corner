import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Star,
  CheckCircle2,
  XCircle,
  Package,
  Layers,
  X,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api';
import { Product, Category } from '../../types';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [basePrice, setBasePrice] = useState<number>(250);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isTodaySpecial, setIsTodaySpecial] = useState(false);
  const [isRecommended, setIsRecommended] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!toastMsg) return;
    const timer = setTimeout(() => setToastMsg(null), 4000);
    return () => clearTimeout(timer);
  }, [toastMsg]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.getProducts(),
        api.getCategories()
      ]);
      if (prodRes && prodRes.success) setProducts(prodRes.data || []);
      else if (Array.isArray(prodRes)) setProducts(prodRes);

      if (catRes && catRes.success) setCategories(catRes.data || []);
      else if (Array.isArray(catRes)) setCategories(catRes);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategoryId(categories[0]?.id || 'cat_curry');
    setBasePrice(250);
    setDiscountPercent(0);
    setDescription('Fresh farm-raised chicken cut and packed hygienically.');
    setShortDescription('100% farm fresh chicken cut on order.');
    setImageUrl('https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80');
    setIsBestSeller(false);
    setIsTodaySpecial(false);
    setIsRecommended(false);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name || '');
    setCategoryId(p.categoryId || categories[0]?.id || 'cat_curry');
    setBasePrice(p.basePrice || 250);
    setDiscountPercent(p.discountPercent || 0);
    setDescription(p.description || '');
    setShortDescription(p.shortDescription || '');
    setImageUrl(p.images?.[0] || 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80');
    setIsBestSeller(Boolean(p.isBestSeller));
    setIsTodaySpecial(Boolean(p.isTodaySpecial));
    setIsRecommended(Boolean(p.isRecommended));
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a product cut name.');
      return;
    }
    if (!categoryId) {
      alert('Please select a chicken category.');
      return;
    }
    if (!basePrice || basePrice <= 0) {
      alert('Please enter a valid base price per kg.');
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {
        name: name.trim(),
        categoryId,
        basePrice: Number(basePrice),
        discountPercent: Number(discountPercent || 0),
        description: description.trim() || 'Fresh farm-raised chicken cut and packed hygienically.',
        shortDescription: shortDescription.trim() || '100% farm fresh chicken cut on order.',
        images: [imageUrl.trim() || 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80'],
        isBestSeller,
        isTodaySpecial,
        isRecommended
      };

      if (editingProduct) {
        const res = await api.updateAdminProduct(editingProduct.id, payload);
        const updatedProd: Product = {
          ...editingProduct,
          ...payload,
          id: editingProduct.id,
          variants: editingProduct.variants || [
            { id: `var_${editingProduct.id}_500g`, productId: editingProduct.id, label: '500g', weightGrams: 500, price: Math.round(Number(basePrice) * 0.52), sku: `MC-${editingProduct.id}-500G`, isActive: true },
            { id: `var_${editingProduct.id}_1kg`, productId: editingProduct.id, label: '1kg', weightGrams: 1000, price: Number(basePrice), sku: `MC-${editingProduct.id}-1KG`, isActive: true }
          ]
        };
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updatedProd : p)));
        setToastMsg(`"${name.trim()}" updated successfully!`);
      } else {
        const res = await api.createAdminProduct(payload);
        const newProd: Product = res?.data || res || {
          ...payload,
          id: 'prod_' + Date.now()
        };
        setProducts((prev) => [newProd, ...prev]);
        setToastMsg(`"${name.trim()}" added to chicken catalog!`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string, prodName: string) => {
    if (!confirm(`Are you sure you want to deactivate "${prodName}" from the chicken catalog?`)) return;
    try {
      const res = await api.deleteAdminProduct(id);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setToastMsg(`"${prodName}" has been deactivated.`);
      }
    } catch (err: any) {
      alert(err.message || 'Deactivation failed');
    }
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'ALL' && p.categoryId !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 relative">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-[110] bg-emerald-600 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-white flex-shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal">Fresh Chicken Product Catalog</h1>
          <p className="text-xs text-gray-500">Configure chicken cuts, pricing per kg, weights, and stock</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search chicken cuts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-charcoal outline-none focus:border-brand-700 w-56 shadow-sm"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
          </div>

          <button
            onClick={openAddModal}
            className="bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-brand-700/20 transition flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Chicken Cut</span>
          </button>
        </div>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
            selectedCategory === 'ALL'
              ? 'bg-charcoal text-white shadow'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          All Cuts ({products.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
              selectedCategory === c.id
                ? 'bg-charcoal text-white shadow'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-400">Loading chicken catalog...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-400">No chicken cuts found.</div>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 overflow-hidden bg-gray-100">
                  <img
                    src={product.images[0] || 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=400&q=80'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                    {product.isBestSeller && (
                      <span className="bg-brand-700 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                        Bestseller
                      </span>
                    )}
                    {product.isTodaySpecial && (
                      <span className="bg-amber-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                        Special
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-sm text-charcoal line-clamp-1">{product.name}</h4>
                  </div>
                  <p className="text-[11px] text-gray-500 line-clamp-2">{product.shortDescription || product.description}</p>
                  <div className="pt-2 flex justify-between items-baseline">
                    <span className="font-black text-brand-700 text-lg">₹{product.basePrice}/kg</span>
                    <span className="text-[10px] text-gray-400 font-semibold">{product.variants?.length || 2} weight packs</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 border-t border-gray-50 flex justify-between items-center mt-2">
                <button
                  type="button"
                  onClick={() => openEditModal(product)}
                  className="text-xs font-bold text-charcoal hover:text-brand-700 flex items-center space-x-1 py-1 px-2 rounded-lg hover:bg-gray-50 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Cut</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteProduct(product.id, product.name)}
                  className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center space-x-1 py-1 px-2 rounded-lg hover:bg-red-50 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Deactivate</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 max-h-[90vh] overflow-y-auto space-y-5">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-5 top-5 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-charcoal transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-black text-charcoal">
                {editingProduct ? 'Edit Chicken Cut' : 'Add New Chicken Cut'}
              </h3>
              <p className="text-xs text-gray-500">Chicken-only fresh meat product catalog</p>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Product Cut Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Chicken Curry Cut (Skinless)"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-brand-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold outline-none focus:border-brand-700"
                  >
                    {categories.length > 0 ? (
                      categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="cat_curry">Curry Cut Chicken</option>
                        <option value="cat_boneless">Boneless Chicken</option>
                        <option value="cat_breast">Chicken Breast</option>
                        <option value="cat_leg">Chicken Leg</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Base Price / kg (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-brand-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Discount %</label>
                  <input
                    type="number"
                    min={0}
                    max={90}
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-brand-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-brand-700"
                  />
                </div>
              </div>

              {/* Live Image Preview */}
              {imageUrl && (
                <div className="flex items-center space-x-3 bg-gray-50 p-2.5 rounded-2xl border border-gray-100">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=200&q=80';
                    }}
                  />
                  <span className="text-[11px] text-gray-500 font-medium truncate flex-1">Image Preview</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Short Description</label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="e.g. Tender bone-in pieces, 100% skinless"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-brand-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Full Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs outline-none focus:border-brand-700"
                />
              </div>

              {/* Badges Toggle */}
              <div className="flex space-x-4 pt-1">
                <label className="flex items-center space-x-2 text-xs font-bold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestSeller}
                    onChange={(e) => setIsBestSeller(e.target.checked)}
                    className="rounded text-brand-700 focus:ring-brand-700"
                  />
                  <span>Mark as Bestseller</span>
                </label>
                <label className="flex items-center space-x-2 text-xs font-bold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTodaySpecial}
                    onChange={(e) => setIsTodaySpecial(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-600"
                  />
                  <span>Today's Special</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/3 bg-gray-100 hover:bg-gray-200 text-charcoal font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white font-black py-3.5 rounded-xl shadow-lg text-xs uppercase tracking-wider transition"
                >
                  {isSaving ? 'Saving Chicken Cut...' : editingProduct ? 'Update Product' : 'Create Chicken Cut'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
