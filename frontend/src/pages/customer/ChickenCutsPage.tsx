import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Flame,
  Clock,
  Layers,
  HeartHandshake
} from 'lucide-react';
import {
  CHICKEN_CUT_CATEGORIES,
  TOTAL_CUTS_COUNT,
  ChickenCut
} from '../../data/chickenCutsData';

export const ChickenCutsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBoneFilter, setSelectedBoneFilter] = useState<'ALL' | 'Bone-in' | 'Boneless' | 'Organ'>('ALL');

  // Filter cuts by category, search query, and bone type
  const filteredCategories = useMemo(() => {
    return CHICKEN_CUT_CATEGORIES.map((cat) => {
      const matchingCuts = cat.cuts.filter((cut) => {
        // Category filter
        if (selectedCategory !== 'ALL' && cat.number !== selectedCategory) {
          return false;
        }

        // Bone type filter
        if (selectedBoneFilter !== 'ALL' && cut.boneType !== selectedBoneFilter) {
          return false;
        }

        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = cut.name.toLowerCase().includes(q);
          const matchTamil = cut.tamilName?.toLowerCase().includes(q) || false;
          const matchDesc = cut.description.toLowerCase().includes(q);
          const matchCooking = cut.cookingStyle.some((s) => s.toLowerCase().includes(q));
          const matchPopular = cut.popularFor.toLowerCase().includes(q);
          return matchName || matchTamil || matchDesc || matchCooking || matchPopular;
        }

        return true;
      });

      return {
        ...cat,
        cuts: matchingCuts,
      };
    }).filter((cat) => cat.cuts.length > 0);
  }, [selectedCategory, searchQuery, selectedBoneFilter]);

  const totalMatchingCuts = useMemo(() => {
    return filteredCategories.reduce((sum, cat) => sum + cat.cuts.length, 0);
  }, [filteredCategories]);

  const handleOrderCut = (cut: ChickenCut) => {
    // If cut has a target product, go directly to that product detail page
    if (cut.targetProductId) {
      navigate(`/products/${cut.targetProductId}?cut=${encodeURIComponent(cut.name)}`);
    } else {
      navigate(`/products?search=${encodeURIComponent(cut.name)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 1. Header Banner matching the PDF Brochure */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-red-900 text-white relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-xs font-bold text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Official Meat Corner Butchery Guide • 100+ Cuts, One Trusted Choice</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight font-serif">
              Complete Chicken Cutting Catalogue
            </h1>

            <p className="text-sm sm:text-base text-brand-100 font-medium">
              Choose Your Favourite Cut – We Bring Freshness to Your Doorstep! Expertly butchered by master craftsmen to elevate every home-cooked recipe.
            </p>

            {/* 4 Quality Badges from Brochure */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 text-center">
                <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                <span className="text-xs font-bold block text-white">Hygienic Processing</span>
                <span className="text-[10px] text-brand-200">Zero Contamination</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 text-center">
                <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-1" />
                <span className="text-xs font-bold block text-white">100% Fresh Daily</span>
                <span className="text-[10px] text-brand-200">Never Frozen Poultry</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 text-center">
                <Flame className="w-6 h-6 text-amber-400 mx-auto mb-1" />
                <span className="text-xs font-bold block text-white">Chilled Fresh</span>
                <span className="text-[10px] text-brand-200">Stored at 0-4°C</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 text-center">
                <Clock className="w-6 h-6 text-sky-400 mx-auto mb-1" />
                <span className="text-xs font-bold block text-white">Fast Delivery</span>
                <span className="text-[10px] text-brand-200">30-45 Mins Express</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Search & Filter Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-3xl p-5 shadow-xl border border-gray-100 space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cuts (e.g. Lollipop, Biryani, Cubes, Wings)..."
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm font-semibold text-charcoal outline-none focus:border-brand-700 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600 bg-gray-200 rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Bone Type Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 sm:pb-0">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1 hidden sm:inline">Type:</span>
              {(['ALL', 'Bone-in', 'Boneless', 'Organ'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedBoneFilter(type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                    selectedBoneFilter === type
                      ? 'bg-charcoal text-white shadow'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type === 'ALL' ? 'All Cuts' : type}
                </button>
              ))}
            </div>

            <div className="text-xs font-black text-brand-800 bg-brand-50 px-3.5 py-2 rounded-xl shrink-0">
              Showing {totalMatchingCuts} of {TOTAL_CUTS_COUNT} Cuts
            </div>
          </div>

          {/* 10 Category Quick Jump Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none border-t border-gray-100 pt-3">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center space-x-1 ${
                selectedCategory === 'ALL'
                  ? 'bg-brand-700 text-white shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>⭐ All 10 Categories</span>
            </button>
            {CHICKEN_CUT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.number)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center space-x-1.5 ${
                  selectedCategory === cat.number
                    ? 'bg-brand-700 text-white shadow'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.number}. {cat.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Catalogue Grid by Category */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-12">
        {filteredCategories.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 space-y-3">
            <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto text-2xl">
              🔍
            </div>
            <h3 className="text-lg font-black text-charcoal">No Chicken Cuts Found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              We couldn't find any cuts matching "{searchQuery}". Try searching for "Biryani", "Lollipop", "Cubes", or "Wings".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                setSelectedBoneFilter('ALL');
              }}
              className="text-xs font-bold text-brand-700 underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <div key={category.id} className="space-y-4">
              {/* Category Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-gray-200 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-xl shadow-sm">
                    {category.icon}
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-charcoal flex items-center space-x-2">
                      <span className="text-brand-700">{category.number}.</span>
                      <span>{category.title}</span>
                      {category.tamilTitle && (
                        <span className="text-sm font-normal text-gray-500 hidden sm:inline">
                          ({category.tamilTitle})
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-gray-500 font-medium -mt-0.5">{category.tagline}</p>
                  </div>
                </div>

                <div className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full self-start sm:self-auto">
                  {category.cuts.length} Varieties
                </div>
              </div>

              {/* Cuts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {category.cuts.map((cut) => (
                  <div
                    key={cut.id}
                    className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 group relative overflow-hidden"
                  >
                    {/* Top Cut Number Badge */}
                    <div className="flex items-start justify-between">
                      <span className="w-8 h-8 rounded-xl bg-brand-50 text-brand-800 text-xs font-black flex items-center justify-center border border-brand-100 group-hover:bg-brand-700 group-hover:text-white transition">
                        #{cut.number}
                      </span>

                      <span
                        className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full tracking-wider ${
                          cut.boneType === 'Boneless'
                            ? 'bg-rose-100 text-rose-800'
                            : cut.boneType === 'Organ'
                            ? 'bg-purple-100 text-purple-800'
                            : cut.boneType === 'Special'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {cut.boneType}
                      </span>
                    </div>

                    {/* Cut Title & Details */}
                    <div className="space-y-1.5 flex-1">
                      <h3 className="font-black text-base text-charcoal group-hover:text-brand-700 transition">
                        {cut.name}
                      </h3>
                      {cut.tamilName && (
                        <p className="text-xs text-gray-500 font-medium">{cut.tamilName}</p>
                      )}
                      <p className="text-xs text-gray-600 leading-relaxed pt-1">{cut.description}</p>
                    </div>

                    {/* Pieces / Weight Guide */}
                    {cut.piecesPerKg && (
                      <div className="bg-gray-50 rounded-2xl p-2.5 border border-gray-100 text-[11px] space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                          Portion Guide
                        </span>
                        <span className="font-extrabold text-charcoal">{cut.piecesPerKg}</span>
                      </div>
                    )}

                    {/* Cooking Tags */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                        Best For
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {cut.cookingStyle.map((style) => (
                          <span
                            key={style}
                            className="text-[10px] font-semibold bg-brand-50/70 text-brand-900 border border-brand-100 px-2 py-0.5 rounded-lg"
                          >
                            {style}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Order Action Button */}
                    <button
                      onClick={() => handleOrderCut(cut)}
                      className="w-full bg-charcoal hover:bg-brand-700 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 shadow-sm group-hover:shadow"
                    >
                      <span>Order This Cut</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4. Custom Butchery Request Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center space-x-1.5 bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-emerald-200">
              <HeartHandshake className="w-4 h-4" />
              <span>Personalized Master Butchery Service</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Need a Custom Cut Not Listed Here?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
              Our in-house master butchers cut and clean every bird fresh upon your order. Simply type your custom cutting or piece-sizing instructions in the delivery notes at checkout!
            </p>
          </div>

          <Link
            to="/products"
            className="bg-white text-emerald-950 font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg hover:bg-emerald-50 transition shrink-0 flex items-center space-x-2"
          >
            <span>Explore Fresh Chicken</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ChickenCutsPage;
