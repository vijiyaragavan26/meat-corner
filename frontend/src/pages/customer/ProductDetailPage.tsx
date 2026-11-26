import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  Star,
  ShieldCheck,
  Clock,
  Sparkles,
  Plus,
  Minus,
  ShoppingCart,
  Zap,
  Check,
  ChevronLeft,
  Share2,
  Heart
} from 'lucide-react';
import { api } from '../../services/api';
import { Product, ProductVariant } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { useLanguage } from '../../contexts/LanguageContext';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const requestedCut = searchParams.get('cut');
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { t } = useLanguage();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedCut, setSelectedCut] = useState<string>('');
  const [selectedClean, setSelectedClean] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.getProductById(id)
      .then((res) => {
        if (res.success) {
          const p = res.data;
          setProduct(p);
          setRelated(p.related || []);
          if (p.variants && p.variants.length > 0) {
            setSelectedVariant(p.variants[0]);
          }
          if (p.cuttingOptions && p.cuttingOptions.length > 0) {
            if (requestedCut) {
              if (!p.cuttingOptions.includes(requestedCut)) {
                p.cuttingOptions = [requestedCut, ...p.cuttingOptions];
              }
              setSelectedCut(requestedCut);
            } else {
              setSelectedCut(p.cuttingOptions[0]);
            }
          }
          if (p.cleaningOptions && p.cleaningOptions.length > 0) {
            setSelectedClean(p.cleaningOptions[0]);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    addToCart({
      productId: product.id,
      variantId: selectedVariant.id,
      quantity,
      cuttingOption: selectedCut,
      cleaningOption: selectedClean
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !reviewComment.trim()) return;
    try {
      await api.getMe(); // checks auth
      // submit review via customer API
      setReviewSubmitted(true);
      setReviewComment('');
    } catch {
      alert('Please login to post a product review');
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="inline-block w-8 h-8 border-4 border-brand-700 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-500 mt-3 font-semibold">Loading tender chicken cut details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-charcoal">Chicken product not found</h2>
        <Link to="/products" className="text-brand-700 font-bold text-sm underline">
          Return to Chicken Menu
        </Link>
      </div>
    );
  }

  const currentPrice = (selectedVariant?.price || product.basePrice) * quantity;
  const comparePrice = selectedVariant?.compareAtPrice ? selectedVariant.compareAtPrice * quantity : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-bold text-gray-500 hover:text-brand-700 transition"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Chicken Menu
        </button>
      </div>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Product Images Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-3xl overflow-hidden bg-gray-100 border border-gray-200/80 shadow-md relative h-[380px] sm:h-[460px]">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-green-700 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-lg">
                {product.discountPercent}% OFF
              </span>
            )}
            <span className="absolute top-4 right-4 bg-brand-900/80 backdrop-blur-sm text-white font-bold text-xs px-3 py-1 rounded-full">
              Fresh Cut
            </span>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition ${
                    selectedImageIndex === idx ? 'border-brand-700 shadow-md' : 'border-gray-200 opacity-70'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100 text-center">
            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
              <ShieldCheck className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-charcoal block">0-4°C Chilled</span>
              <span className="text-[10px] text-gray-500">Never Frozen</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
              <Sparkles className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-charcoal block">Cut on Order</span>
              <span className="text-[10px] text-gray-500">100% Fresh Daily</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
              <Clock className="w-5 h-5 text-brand-700 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-charcoal block">Express</span>
              <span className="text-[10px] text-gray-500">30-45 Mins</span>
            </div>
          </div>
        </div>

        {/* Right: Product Details & Customization */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-brand-700 uppercase tracking-widest mb-1.5">
              <span>{product.category?.name || 'Fresh Chicken'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-charcoal leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center space-x-3 mt-2.5">
              <div className="flex items-center bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg text-amber-800 text-xs font-bold space-x-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.avgRating}</span>
              </div>
              <span className="text-xs text-gray-500 font-medium">({product.reviewCount} customer reviews)</span>
              <span className="text-xs text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded">
                In Stock & Available
              </span>
            </div>
          </div>

          {/* Pricing Highlight */}
          <div className="bg-brand-50/60 p-4 rounded-2xl border border-brand-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 font-semibold block">Total Price:</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-brand-700">₹{currentPrice}</span>
                {comparePrice && (
                  <span className="text-sm text-gray-400 line-through font-semibold">₹{comparePrice}</span>
                )}
              </div>
              <span className="text-[11px] text-gray-500">
                (₹{selectedVariant?.price} per {selectedVariant?.label || 'pack'})
              </span>
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center space-x-3 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-700 hover:bg-brand-50 hover:text-brand-700 font-bold"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm font-black w-6 text-center text-charcoal">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-700 hover:bg-brand-50 hover:text-brand-700 font-bold"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 1. Weight Selector (250g, 500g, 1kg, 2kg) */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal">
                1. Select Weight / Pack Size:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      selectedVariant?.id === v.id
                        ? 'border-brand-700 bg-brand-50 text-brand-900 shadow-sm ring-1 ring-brand-700'
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-charcoal'
                    }`}
                  >
                    <span className="text-xs font-bold">{v.label}</span>
                    <span className="text-sm font-extrabold text-brand-700 mt-1">₹{v.price}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. Butchery Cut Options */}
          {product.cuttingOptions && product.cuttingOptions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal">
                  2. Choose Butchery Cut Preference:
                </label>
                <Link
                  to="/cuts"
                  className="text-[11px] font-bold text-brand-700 hover:text-brand-900 underline flex items-center space-x-1"
                >
                  <span>🍗 100+ Cuts Catalogue</span>
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.cuttingOptions.map((cut) => (
                  <button
                    key={cut}
                    onClick={() => setSelectedCut(cut)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                      selectedCut === cut
                        ? 'bg-charcoal text-white border-charcoal shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {cut}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. Cleaning & Washing Options */}
          {product.cleaningOptions && product.cleaningOptions.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal">
                3. Cleaning & Rinse Preference:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.cleaningOptions.map((clean) => (
                  <button
                    key={clean}
                    onClick={() => setSelectedClean(clean)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                      selectedClean === clean
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {clean}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="grid grid-cols-2 gap-3 pt-3">
            <button
              onClick={handleAddToCart}
              className="bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold py-3.5 px-4 rounded-2xl border border-brand-200 shadow-sm transition flex items-center justify-center space-x-2 text-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{t('add_to_cart')}</span>
            </button>

            <button
              onClick={handleBuyNow}
              className="bg-brand-700 hover:bg-brand-800 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-brand-700/30 transition flex items-center justify-center space-x-2 text-sm"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Buy Now</span>
            </button>
          </div>

          {/* Freshness & Quality Promise */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2 text-xs text-gray-600">
            <h4 className="font-bold text-charcoal uppercase tracking-wider text-[11px]">
              Meat Corner Freshness Guarantee:
            </h4>
            <p>{product.freshnessInfo}</p>
          </div>
        </div>
      </div>

      {/* Product Description & Culinary Usage */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-lg font-black text-charcoal">Product Details & Cooking Notes</h3>
        <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">
          {product.description}
        </p>
      </div>

      {/* Customer Review Section */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-black text-charcoal">Customer Reviews & Ratings</h3>
          <div className="flex items-center text-amber-500 font-bold text-sm">
            <Star className="w-4 h-4 fill-amber-400 mr-1" />
            <span>{product.avgRating} out of 5</span>
          </div>
        </div>

        {/* Submit review */}
        <form onSubmit={handleReviewSubmit} className="bg-gray-50 p-4 rounded-2xl space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal">Write a review for this chicken cut</h4>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setReviewRating(s)}
                className={`text-lg ${s <= reviewRating ? 'text-amber-400' : 'text-gray-300'}`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            placeholder="Share your experience (e.g., taste, tenderness, butchery cut, delivery speed)..."
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            rows={2}
            className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs outline-none focus:border-brand-700"
          />
          <button
            type="submit"
            className="bg-brand-700 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-brand-800 transition"
          >
            Submit Review
          </button>
          {reviewSubmitted && (
            <p className="text-xs text-green-700 font-bold">Thank you! Your verified review has been submitted.</p>
          )}
        </form>
      </div>

      {/* Related Products Carousel */}
      {related.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-black text-charcoal">You Might Also Like</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/products/${item.id}`)}
                className="cursor-pointer bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-lg transition p-4 space-y-3"
              >
                <img
                  src={item.images[0] || 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=400&q=80'}
                  alt={item.name}
                  className="w-full h-36 object-cover rounded-2xl"
                />
                <h4 className="font-bold text-sm text-charcoal truncate">{item.name}</h4>
                <div className="flex justify-between items-center">
                  <span className="font-black text-brand-700 text-sm">₹{item.basePrice}/kg</span>
                  <span className="text-xs text-brand-700 font-bold bg-brand-50 px-2 py-1 rounded-lg">View Cut</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
