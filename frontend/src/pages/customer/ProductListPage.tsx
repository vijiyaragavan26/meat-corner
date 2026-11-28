import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, Star, Plus, Check, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { api, subscribeToCatalogUpdates } from '../../services/api';
import { Product, Category, ProductVariant } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { useLanguage } from '../../contexts/LanguageContext';

export const ProductListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { t } = useLanguage();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & State
  const selectedCategory = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';
  const bestSellerOnly = searchParams.get('bestSeller') === 'true';
  const sortBy = searchParams.get('sortBy') || 'popular';

  // Selected weight variants for each product card
  const [selectedVariants, setSelectedVariants] = useState<Record<string, ProductVariant>>({});

  const loadCategories = () => {
    api.getCategories().then((res) => {
      if (res && res.success) setCategories(res.data);
    });
  };

  const loadProducts = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (selectedCategory) params.category = selectedCategory;
    if (searchQuery) params.search = searchQuery;
    if (bestSellerOnly) params.bestSeller = 'true';
    if (sortBy) params.sortBy = sortBy;

    api.getProducts(params)
      .then((res) => {
        if (res.success) {
          setProducts(res.data);
          // Set default selected variant (first variant)
          const varMap: Record<string, ProductVariant> = {};
          res.data.forEach((p: Product) => {
            if (p.variants && p.variants.length > 0) {
              varMap[p.id] = p.variants[0];
            }
          });
          setSelectedVariants(varMap);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
    const unsubscribe = subscribeToCatalogUpdates(() => {
      loadProducts();
      loadCategories();
    });
    return unsubscribe;
  }, [selectedCategory, searchQuery, bestSellerOnly, sortBy]);

  const handleCategoryClick = (slug: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (selectedCategory === slug) {
      newParams.delete('category');
    } else {
      newParams.set('category', slug);
    }
    setSearchParams(newParams);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sortBy', e.target.value);
    setSearchParams(newParams);
  };

  const handleAddProduct = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const variant = selectedVariants[product.id] || product.variants?.[0];
    if (variant) {
      addToCart({
        productId: product.id,
        variantId: variant.id,
        quantity: 1,
        cuttingOption: product.cuttingOptions[0],
        cleaningOption: product.cleaningOptions[0]
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Active Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700">Farm Fresh Poultry</span>
          <h1 className="text-2xl sm:text-3xl font-black text-charcoal">
            {selectedCategory
              ? categories.find((c) => c.slug === selectedCategory)?.name || 'Chicken Cuts'
              : searchQuery
              ? `Search results for "${searchQuery}"`
              : 'All Fresh Chicken Products'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {products.length} delicious chicken cuts available for home delivery
          </p>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center space-x-3">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:inline">
            Sort by:
          </label>
          <div className="relative">
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="bg-white border border-gray-200 text-charcoal text-xs font-semibold rounded-xl px-4 py-2.5 pr-8 appearance-none focus:outline-none focus:border-brand-700 shadow-sm"
            >
              <option value="popular">Popularity</option>
              <option value="rating">Top Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => {
            const p = new URLSearchParams(searchParams);
            p.delete('category');
            setSearchParams(p);
          }}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
            !selectedCategory
              ? 'bg-brand-700 text-white shadow-brand-700/20'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          All Cuts
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.slug)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
              selectedCategory === cat.slug
                ? 'bg-brand-700 text-white shadow-brand-700/20'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-3xl h-80 border border-gray-100 animate-pulse p-4">
              <div className="bg-gray-200 h-44 rounded-2xl mb-4" />
              <div className="bg-gray-200 h-4 rounded w-3/4 mb-2" />
              <div className="bg-gray-200 h-3 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center max-w-md mx-auto space-y-4">
          <div className="text-4xl">🍗</div>
          <h3 className="font-bold text-lg text-charcoal">No chicken cuts found</h3>
          <p className="text-xs text-gray-500">
            We couldn't find any products matching your active filters. Try searching for "curry cut" or "breast".
          </p>
          <button
            onClick={() => setSearchParams({})}
            className="bg-brand-700 text-white font-bold text-xs uppercase px-5 py-2.5 rounded-xl shadow"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const currentVariant = selectedVariants[product.id] || product.variants?.[0];
            const price = currentVariant ? currentVariant.price : product.basePrice;
            const comparePrice = currentVariant?.compareAtPrice;

            return (
              <div
                key={product.id}
                onClick={() => navigate(`/products/${product.id}`)}
                className="cursor-pointer group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-brand-200 hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Image container */}
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    <img
                      src={product.images[0] || 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=600&q=80'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {product.isBestSeller && (
                      <span className="absolute top-3 left-3 bg-brand-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                        Bestseller
                      </span>
                    )}

                    {product.discountPercent > 0 && (
                      <span className="absolute top-3 right-3 bg-green-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                        {product.discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{product.avgRating}</span>
                        <span className="text-gray-400 font-normal">({product.reviewCount})</span>
                      </div>
                      <span className="text-[10px] text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded">
                        Daily Farm Cut
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-charcoal group-hover:text-brand-700 transition leading-snug line-clamp-1">
                      {product.name}
                    </h3>

                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {product.shortDescription || product.description}
                    </p>

                    {/* Weight Variant Selector Chips */}
                    {product.variants && product.variants.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                          Select Weight:
                        </span>
                        <div className="flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {product.variants.map((v) => (
                            <button
                              key={v.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedVariants((prev) => ({ ...prev, [product.id]: v }));
                              }}
                              className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition ${
                                currentVariant?.id === v.id
                                  ? 'bg-brand-700 text-white border-brand-700 shadow-sm'
                                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              {v.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Bottom / Action */}
                <div className="p-5 pt-0">
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-xl font-black text-brand-700">₹{price}</span>
                        {comparePrice && (
                          <span className="text-xs text-gray-400 line-through">₹{comparePrice}</span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium block">
                        Net: {currentVariant?.weightGrams || 1000}g
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleAddProduct(product, e)}
                      className="bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-brand-700/20 transition flex items-center space-x-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t('add_to_cart')}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
