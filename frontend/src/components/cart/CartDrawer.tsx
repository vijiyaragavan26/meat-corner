import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, Tag, ArrowRight, ShoppingBag, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useLanguage } from '../../contexts/LanguageContext';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const { cart, isDrawerOpen, closeDrawer, updateQuantity, removeItem, applyCoupon, removeCoupon } = useCart();
  const { t } = useLanguage();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  if (!isDrawerOpen) return null;

  const pricing = cart?.pricing || {
    subtotal: 0,
    deliveryFee: 0,
    discount: 0,
    tax: 0,
    total: 0,
    freeDeliveryThreshold: 499,
    freeDeliveryRemaining: 499
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setIsApplying(true);
    setCouponError(null);
    setCouponSuccess(null);
    try {
      const msg = await applyCoupon(couponInput.trim());
      setCouponSuccess(msg);
      setCouponInput('');
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon');
    } finally {
      setIsApplying(false);
    }
  };

  const freeDeliveryPercent = Math.min(
    100,
    Math.round(((pricing.freeDeliveryThreshold - pricing.freeDeliveryRemaining) / pricing.freeDeliveryThreshold) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={closeDrawer} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-brand-700" />
              <h2 className="text-lg font-bold text-charcoal">Your Fresh Chicken Cart</h2>
              {cart?.items?.length ? (
                <span className="bg-brand-50 text-brand-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {cart.items.length} items
                </span>
              ) : null}
            </div>
            <button
              onClick={closeDrawer}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-charcoal transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Delivery Banner Progress */}
          <div className="bg-brand-50/70 px-5 py-3 border-b border-brand-100/50">
            {pricing.freeDeliveryRemaining > 0 ? (
              <div>
                <div className="flex justify-between text-xs font-bold text-brand-900 mb-1">
                  <span>Add ₹{pricing.freeDeliveryRemaining} more for FREE Delivery!</span>
                  <span>{freeDeliveryPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-brand-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-700 transition-all duration-300"
                    style={{ width: `${freeDeliveryPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center text-xs font-bold text-green-700">
                <Sparkles className="w-4 h-4 mr-1.5 text-green-600" />
                <span>Congratulations! Your order qualifies for FREE Home Delivery.</span>
              </div>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {!cart?.items || cart.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center text-3xl">
                  🍗
                </div>
                <div>
                  <h3 className="font-bold text-lg text-charcoal">Your cart is empty</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs">
                    Browse our farm-fresh broiler, country chicken, curry cuts, and boneless fillets.
                  </p>
                </div>
                <button
                  onClick={() => {
                    closeDrawer();
                    navigate('/products');
                  }}
                  className="bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl shadow-md transition"
                >
                  Explore Chicken Menu
                </button>
              </div>
            ) : (
              cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex space-x-3.5 p-3 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-sm transition"
                >
                  <img
                    src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=300&q=80'}
                    alt={item.product?.name}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm text-charcoal truncate pr-2">{item.product?.name}</h4>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeItem(item.id || item.productId);
                        }}
                        className="text-gray-400 hover:text-red-600 p-1.5 -mr-1 -mt-1 rounded-lg hover:bg-red-50 transition cursor-pointer active:scale-90"
                        title="Delete item"
                        aria-label="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="text-[10px] font-semibold bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded">
                        {item.variant?.label || (item.variant?.weightGrams ? `${item.variant.weightGrams}g` : '500g')}
                      </span>
                      {item.cuttingOption && (
                        <span className="text-[10px] font-semibold bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                          {item.cuttingOption}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      <span className="font-extrabold text-brand-700 text-sm">
                        ₹{(
                          (item.variant?.price && item.variant.price > 0
                            ? item.variant.price
                            : item.product?.basePrice && item.product.basePrice > 0
                              ? item.product.basePrice
                              : 250) * Math.max(1, item.quantity || 1)
                        )}
                      </span>

                      {/* Quantity Stepper */}
                      <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if ((item.quantity || 1) <= 1) {
                              removeItem(item.id || item.productId);
                            } else {
                              updateQuantity(item.id || item.productId, (item.quantity || 1) - 1);
                            }
                          }}
                          className="w-6 h-6 flex items-center justify-center rounded bg-gray-100 text-gray-700 hover:bg-brand-50 hover:text-brand-700 active:scale-90 transition font-bold cursor-pointer"
                          title="Reduce quantity"
                          aria-label="Reduce quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold w-5 text-center select-none">{Math.max(1, item.quantity || 1)}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            updateQuantity(item.id || item.productId, (item.quantity || 1) + 1);
                          }}
                          className="w-6 h-6 flex items-center justify-center rounded bg-gray-100 text-gray-700 hover:bg-brand-50 hover:text-brand-700 active:scale-90 transition font-bold cursor-pointer"
                          title="Increase quantity"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Actions */}
          {cart?.items && cart.items.length > 0 && (
            <div className="p-5 border-t border-gray-100 bg-white space-y-4 shadow-lg">
              {/* Coupon Section */}
              {cart.couponCode ? (
                <div className="flex justify-between items-center bg-green-50 border border-green-200 p-2.5 rounded-xl text-xs">
                  <div className="flex items-center text-green-800 font-bold">
                    <Tag className="w-4 h-4 mr-1.5 text-green-600" />
                    <span>Coupon: {cart.couponCode} applied</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-red-600 font-bold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Enter promo coupon (e.g. MEATFIRST20)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal outline-none focus:border-brand-700"
                    />
                    <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                  </div>
                  <button
                    type="submit"
                    disabled={isApplying || !couponInput.trim()}
                    className="bg-charcoal hover:bg-black disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                  >
                    {isApplying ? 'Applying...' : 'Apply'}
                  </button>
                </form>
              )}

              {couponError && <p className="text-[11px] text-red-600 font-semibold">{couponError}</p>}
              {couponSuccess && <p className="text-[11px] text-green-600 font-semibold">{couponSuccess}</p>}

              {/* Bill Details */}
              <div className="space-y-1.5 text-xs border-t border-gray-100 pt-3">
                <div className="flex justify-between text-gray-500">
                  <span>{t('subtotal')}</span>
                  <span className="font-semibold text-charcoal">₹{pricing.subtotal}</span>
                </div>
                {pricing.discount > 0 && (
                  <div className="flex justify-between text-green-700 font-medium">
                    <span>Discount</span>
                    <span>-₹{pricing.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>{t('delivery_fee')}</span>
                  <span className="font-semibold text-charcoal">
                    {pricing.deliveryFee === 0 ? (
                      <span className="text-green-700 font-bold">{t('free_delivery')}</span>
                    ) : (
                      `₹${pricing.deliveryFee}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Taxes (GST 5%)</span>
                  <span className="font-semibold text-charcoal">₹{pricing.tax}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-charcoal pt-2 border-t border-gray-100">
                  <span>{t('total')}</span>
                  <span className="text-brand-700 text-base">₹{pricing.total}</span>
                </div>
              </div>

              {/* Proceed to Checkout Button */}
              <button
                onClick={() => {
                  closeDrawer();
                  navigate('/checkout');
                }}
                className="w-full bg-brand-700 hover:bg-brand-800 text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-brand-700/30 transition group"
              >
                <span>{t('checkout')}</span>
                <span className="text-xs bg-brand-900/50 px-2 py-0.5 rounded-full">₹{pricing.total}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <div className="flex items-center justify-center text-[10px] text-gray-400 font-medium space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                <span>100% Secure Checkout • Express Local Delivery</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
