import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  Award,
  Star,
  ChevronRight,
  Plus,
  Check,
  Flame,
  ThumbsUp,
  Percent,
  Scissors,
  Globe,
  Menu
} from 'lucide-react';
import { api } from '../../services/api';
import { Product, Category } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { useLanguage } from '../../contexts/LanguageContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { language, setLanguage, t } = useLanguage();

  const [categories, setCategories] = useState<Category[]>([]);
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [todayOffers, setTodayOffers] = useState<Product[]>([]);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      api.getCategories(),
      api.getProducts({ bestSeller: 'true' }),
      api.getProducts({ todaySpecial: 'true' }),
      api.getProducts({ recommended: 'true' })
    ])
      .then(([catsRes, bestRes, specRes, recRes]) => {
        if (catsRes.success) setCategories(catsRes.data);
        if (bestRes.success) setBestsellers(bestRes.data);
        if (specRes.success) setTodayOffers(specRes.data);
        if (recRes.success) setRecommended(recRes.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const primaryVariant = product.variants?.[0];
    if (primaryVariant) {
      addToCart({
        productId: product.id,
        variantId: primaryVariant.id,
        quantity: 1,
        cuttingOption: product.cuttingOptions[0],
        cleaningOption: product.cleaningOptions[0]
      });
    } else {
      navigate(`/products/${product.id}`);
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-charcoal-900 via-charcoal to-brand-950 text-white py-16 sm:py-24">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C62828_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 bg-brand-700/30 border border-brand-500/40 text-brand-200 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-brand-400 animate-spin" style={{ animationDuration: '4s' }} />
                <span>100% Farm Fresh Broiler & Country Chicken</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
                Fresh Chicken. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-brand-400 to-amber-300">
                  Fresh Quality.
                </span> <br />
                Delivered to Your Door.
              </h1>

              <p className="text-base sm:text-lg text-gray-300 max-w-xl font-normal leading-relaxed">
                Order your favourite chicken cuts online. Hand-selected healthy birds, precision butchered only after you place your order, and delivered chilled in 30-45 minutes.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/products"
                  className="bg-brand-700 hover:bg-brand-600 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-brand-700/30 hover:shadow-brand-600/50 transition-all flex items-center space-x-3 text-sm group"
                >
                  <span>{t('shop_now')}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <div className="flex items-center space-x-3 text-xs text-gray-400 px-4 py-3 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Delivery in <strong>30-45 mins</strong></span>
                </div>
              </div>

              {/* Quick Actions Grid (Language & Menu Shortcuts) */}
              <div className="pt-2">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {/* Action 1: Language Switcher Grid Card */}
                  <button
                    type="button"
                    onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
                    className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md transition-all text-left group"
                  >
                    <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-brand-700/90 text-white flex items-center justify-center font-bold text-sm shadow flex-shrink-0">
                        <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] sm:text-[10px] uppercase font-bold text-gray-300 block truncate">
                          Language / மொழி
                        </span>
                        <span className="text-xs sm:text-sm font-black text-white group-hover:text-amber-300 transition truncate block">
                          {language === 'en' ? 'தமிழ் (Tamil)' : 'English'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full flex-shrink-0 ml-1">
                      {language === 'en' ? 'EN' : 'தமிழ்'}
                    </span>
                  </button>

                  {/* Action 2: 100+ Cuts Catalogue & Menu Shortcut */}
                  <Link
                    to="/cuts"
                    className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md transition-all text-left group"
                  >
                    <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/90 text-white flex items-center justify-center font-bold text-sm shadow flex-shrink-0">
                        <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] sm:text-[10px] uppercase font-bold text-gray-300 block truncate">
                          Menu & Brochure
                        </span>
                        <span className="text-xs sm:text-sm font-black text-white group-hover:text-amber-300 transition truncate block">
                          100+ Cuts Catalogue
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-300 group-hover:translate-x-1 transition-transform flex-shrink-0 ml-1" />
                  </Link>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10 text-xs">
                <div>
                  <p className="font-extrabold text-white text-base">100%</p>
                  <p className="text-gray-400">Farm Fresh</p>
                </div>
                <div>
                  <p className="font-extrabold text-white text-base">0-4°C</p>
                  <p className="text-gray-400">Chilled Cold-Chain</p>
                </div>
                <div>
                  <p className="font-extrabold text-white text-base">Zero</p>
                  <p className="text-gray-400">Antibiotic Residue</p>
                </div>
                <div>
                  <p className="font-extrabold text-emerald-400 text-base">FSSAI</p>
                  <p className="text-gray-300 font-mono text-[10px]">22426064000473</p>
                </div>
              </div>
            </div>

            {/* Hero Image Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 group">
                  <img
                    src="https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80"
                    alt="Fresh Chicken Cuts Meat Corner"
                    className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent" />

                  {/* Floating Highlight Card */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 text-charcoal shadow-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-brand-700 uppercase tracking-widest bg-brand-50 px-2 py-0.5 rounded">
                        Today's Special
                      </span>
                      <h4 className="font-bold text-sm text-charcoal mt-1">Chicken Curry Cut (Skinless)</h4>
                      <p className="text-xs text-gray-500">Tender bone-in pieces • Cut fresh</p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-brand-700">₹250</span>
                      <span className="text-[10px] text-gray-400 block">/ kg</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Chicken Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-700">Exclusively Chicken</span>
            <h2 className="text-2xl sm:text-3xl font-black text-charcoal mt-1">{t('categories')}</h2>
          </div>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-bold text-brand-700 hover:text-brand-800 flex items-center group"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="group flex flex-col items-center p-3.5 rounded-2xl bg-white border border-gray-100 hover:border-brand-200 hover:shadow-lg transition-all text-center"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden mb-3 bg-gray-50 p-1 border border-gray-100 group-hover:scale-105 transition-transform">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-charcoal group-hover:text-brand-700 transition leading-tight">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Bestselling Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-brand-700">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span>Customer Favorites</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-charcoal mt-1">{t('bestsellers')}</h2>
          </div>
          <Link
            to="/products?bestSeller=true"
            className="text-xs sm:text-sm font-bold text-brand-700 hover:text-brand-800 flex items-center group"
          >
            <span>Explore All</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestsellers.slice(0, 4).map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/products/${product.id}`)}
              className="cursor-pointer group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-brand-100 hover:shadow-xl transition-all flex flex-col"
            >
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <img
                  src={product.images[0] || 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=600&q=80'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-brand-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                  Bestseller
                </span>
                {product.discountPercent > 0 && (
                  <span className="absolute top-3 right-3 bg-green-700 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow">
                    {product.discountPercent}% OFF
                  </span>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center space-x-1 text-amber-500 text-xs font-bold mb-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{product.avgRating}</span>
                    <span className="text-gray-400 font-normal">({product.reviewCount})</span>
                  </div>
                  <h3 className="font-bold text-base text-charcoal group-hover:text-brand-700 transition leading-snug line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {product.shortDescription || product.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400 font-medium block">Starting from</span>
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-xl font-black text-brand-700">₹{product.basePrice}</span>
                      <span className="text-xs text-gray-500 font-medium">/ kg</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleQuickAdd(product, e)}
                    className="bg-brand-50 hover:bg-brand-700 text-brand-700 hover:text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-brand-200 transition-all flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Today's Fresh Offers Banner Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-red-800 via-brand-700 to-red-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              Limited-Time Super Saver
            </span>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight">
              Get Flat 20% OFF On Your First Order
            </h2>
            <p className="text-sm text-red-100 leading-relaxed">
              Use code <strong className="bg-white text-brand-900 px-2 py-0.5 rounded font-mono font-bold">MEATFIRST20</strong> at checkout on orders above ₹299. Fresh farm-picked chicken delivered right to your kitchen.
            </p>
            <div className="pt-2">
              <Link
                to="/products"
                className="bg-white text-brand-800 hover:bg-gray-100 font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider inline-flex items-center space-x-2 shadow"
              >
                <span>Claim Offer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Recommended Chicken Cuts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-emerald-700">
              <ThumbsUp className="w-4 h-4" />
              <span>Butcher's Choice</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-charcoal mt-1">{t('recommended')}</h2>
          </div>
          <Link
            to="/products?recommended=true"
            className="text-xs sm:text-sm font-bold text-brand-700 hover:text-brand-800 flex items-center group"
          >
            <span>See All</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommended.slice(0, 4).map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/products/${product.id}`)}
              className="cursor-pointer group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-brand-100 hover:shadow-xl transition-all flex flex-col"
            >
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <img
                  src={product.images[0] || 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=600&q=80'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-base text-charcoal group-hover:text-brand-700 transition leading-snug line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {product.shortDescription || product.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400 font-medium block">Price</span>
                    <span className="text-xl font-black text-brand-700">₹{product.basePrice}/kg</span>
                  </div>

                  <button
                    onClick={(e) => handleQuickAdd(product, e)}
                    className="bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Precision Butchery & Custom Cuts Explainer */}
      <section className="bg-gray-50 py-16 border-y border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-700">Customized For Your Recipe</span>
            <h2 className="text-3xl font-black text-charcoal mt-1">Specialized Butchery Cuts</h2>
            <p className="text-sm text-gray-500 mt-2">
              Every dish demands a distinct meat cut. At MEAT CORNER, you choose exactly how our master butchers cut your chicken.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center text-xl font-bold mb-4">
                🍲
              </div>
              <h3 className="font-bold text-base text-charcoal mb-1">Curry Cut (Bone-In)</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Evenly cut pieces with bone intact. The bone releases rich, gelatinous stock that elevates gravies, chettinad curries, and salna.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-xl font-bold mb-4">
                🍚
              </div>
              <h3 className="font-bold text-base text-charcoal mb-1">Biryani Dum Cut</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Extra-large 12–14 pieces/kg designed to withstand 45+ minutes of low-flame dum cooking without disintegrating or drying out.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center text-xl font-bold mb-4">
                🥗
              </div>
              <h3 className="font-bold text-base text-charcoal mb-1">Boneless Breast Fillet</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                100% skinless, pure white lean meat. Trimmed of sinew and fat. Delivering 23g of clean protein per 100g for diet meals & butter chicken.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center text-xl font-bold mb-4">
                🔥
              </div>
              <h3 className="font-bold text-base text-charcoal mb-1">Tangdi Kebab & Wings</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Cleaned drumsticks with slit incisions and frenched lollipop wings. Deeply absorbs dry spice rubs and tandoori marinades.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Why Choose Meat Corner – 5-Step Hygiene Standard */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-700">Hygiene & Safety</span>
            <h2 className="text-3xl sm:text-4xl font-black text-charcoal leading-tight">
              {t('hygiene_title')}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Unlike local wet markets where chickens are exposed to open air and dust, MEAT CORNER maintains an unbroken cold-chain environment with clinical hygiene standards.
            </p>

            <div className="space-y-4">
              <div className="flex items-start space-x-3.5">
                <div className="w-7 h-7 rounded-xl bg-green-100 text-green-800 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-sm text-charcoal">Clean Air Butchery at 10°C</h4>
                  <p className="text-xs text-gray-500">Butchered and packed inside temperature-controlled sanitised processing bays.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="w-7 h-7 rounded-xl bg-green-100 text-green-800 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-sm text-charcoal">Triple RO Water & Turmeric Rinse</h4>
                  <p className="text-xs text-gray-500">Washed exclusively using purified potable RO water and optional natural turmeric wash.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="w-7 h-7 rounded-xl bg-green-100 text-green-800 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-sm text-charcoal">Vacuum Sealed & Insulated Delivery</h4>
                  <p className="text-xs text-gray-500">Delivered in thermal-grade food trays with cold gel packs directly to your door.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=80"
                alt="Meat Corner Clean Chicken"
                className="w-full h-[380px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 8. Customer Reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-700">Verified Reviews</span>
          <h2 className="text-3xl font-black text-charcoal mt-1">Loved by 10,000+ Chicken Lovers</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <div className="flex text-amber-400">
              {'★★★★★'}
            </div>
            <p className="text-xs text-gray-600 leading-relaxed italic">
              "The freshness is unbelievable. No bad smell, pieces were neatly cut into curry cut, and the meat was so tender in our Chettinad gravy! Delivered in just 32 mins in Kanjikovil."
            </p>
            <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-xs">
              <span className="font-bold text-charcoal">Boopesh M</span>
              <span className="text-green-700 font-semibold flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Verified Buyer
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <div className="flex text-amber-400">
              {'★★★★★'}
            </div>
            <p className="text-xs text-gray-600 leading-relaxed italic">
              "I am very particular about my gym diet. The boneless breast fillets are completely trimmed of fat and gristle. Packaging is top class."
            </p>
            <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-xs">
              <span className="font-bold text-charcoal">Rajesh Kannan</span>
              <span className="text-green-700 font-semibold flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Verified Buyer
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <div className="flex text-amber-400">
              {'★★★★★'}
            </div>
            <p className="text-xs text-gray-600 leading-relaxed italic">
              "Authentic Nattu Kozhi country chicken! It's so hard to find genuine free-range country chicken online. Meat Corner delivered exactly what was promised."
            </p>
            <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-xs">
              <span className="font-bold text-charcoal">Kavitha M.</span>
              <span className="text-green-700 font-semibold flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Verified Buyer
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
