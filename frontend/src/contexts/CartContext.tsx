import React, { createContext, useContext, useState, useEffect } from 'react';
import { Cart } from '../types';
import { api } from '../services/api';

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  addToCart: (params: {
    productId: string;
    variantId: string;
    quantity?: number;
    cuttingOption?: string;
    cleaningOption?: string;
  }) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<string>;
  removeCoupon: () => Promise<void>;
  refreshCart: () => Promise<void>;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const refreshCart = async () => {
    try {
      const res = await api.getCart();
      if (res.success) {
        setCart(res.data);
      }
    } catch (err) {
      console.error('Failed to load cart', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();

    const onCartCleared = () => {
      setCart({
        id: 'cart_empty',
        userId: 'guest',
        items: [],
        subtotal: 0,
        deliveryCharge: 0,
        discountAmount: 0,
        taxAmount: 0,
        totalAmount: 0,
        pricing: {
          subtotal: 0,
          deliveryFee: 0,
          discount: 0,
          tax: 0,
          total: 0,
          freeDeliveryThreshold: 499,
          freeDeliveryRemaining: 499
        }
      } as any);
    };

    window.addEventListener('meat_corner_cart_cleared', onCartCleared);
    const onSettingsUpdated = () => {
      refreshCart();
    };
    window.addEventListener('meat_corner_settings_updated', onSettingsUpdated);
    return () => {
      window.removeEventListener('meat_corner_cart_cleared', onCartCleared);
      window.removeEventListener('meat_corner_settings_updated', onSettingsUpdated);
    };
  }, []);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const addToCart = async (params: {
    productId: string;
    variantId: string;
    quantity?: number;
    cuttingOption?: string;
    cleaningOption?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await api.addToCart(params);
      if (res.success) {
        setCart(res.data);
        setIsDrawerOpen(true);
      }
    } catch (err: any) {
      alert(err.message || 'Could not add product to cart');
    } finally {
      setIsLoading(false);
    }
  };

  const recalculatePricing = (items: any[], couponCode?: string | null) => {
    let storeSettings: any = null;
    try {
      storeSettings = JSON.parse(localStorage.getItem('meat_corner_store_settings') || 'null');
    } catch {}

    const baseDelivery = storeSettings?.baseDeliveryCharge !== undefined ? Number(storeSettings.baseDeliveryCharge) : 30;
    const freeDeliveryAbove = storeSettings?.freeDeliveryAbove !== undefined ? Number(storeSettings.freeDeliveryAbove) : 499;
    const storeTaxPercent = storeSettings?.taxPercent !== undefined ? Number(storeSettings.taxPercent) : 5;

    let customDeliveryFee: number | null = null;
    let calculatedTax = 0;

    const subtotal = items.reduce((sum: number, it: any) => {
      const basePrice = Number(it.product?.basePrice ?? (it.product as any)?.price ?? 0);
      const weight = Number(it.variant?.weightGrams) || (it.variant?.label?.includes('1kg') ? 1000 : 500);
      const price = basePrice > 0
        ? (weight === 1000 ? basePrice : Math.max(1, Math.round(basePrice * (weight / 1000))))
        : (Number(it.variant?.price) || 250);
      const itemSubtotal = price * Math.max(1, it.quantity || 1);

      if (it.product?.deliveryFee !== undefined && it.product?.deliveryFee !== null) {
        customDeliveryFee = Number(it.product.deliveryFee);
      }
      const itemGst = it.product?.gstPercent !== undefined ? Number(it.product.gstPercent) : storeTaxPercent;
      calculatedTax += (itemSubtotal * (itemGst / 100));

      return sum + itemSubtotal;
    }, 0);

    const deliveryFee = subtotal === 0
      ? 0
      : (subtotal >= freeDeliveryAbove
        ? 0
        : (customDeliveryFee !== null ? customDeliveryFee : baseDelivery));
    const discount = couponCode ? 20 : 0;
    const tax = Math.round(calculatedTax);
    const total = Math.max(0, subtotal + deliveryFee - discount + tax);
    return {
      subtotal,
      deliveryFee,
      discount,
      tax,
      total,
      freeDeliveryThreshold: freeDeliveryAbove,
      freeDeliveryRemaining: Math.max(0, freeDeliveryAbove - subtotal),
    };
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }

    // 1. Instant 0ms Optimistic UI update
    setCart((prev) => {
      if (!prev) return prev;
      const updatedItems = prev.items.map((it) => {
        if (it.id === itemId || it.productId === itemId) {
          return { ...it, quantity };
        }
        return it;
      });
      const pricing = recalculatePricing(updatedItems, prev.couponCode);
      return {
        ...prev,
        items: updatedItems,
        subtotal: pricing.subtotal,
        deliveryCharge: pricing.deliveryFee,
        taxAmount: pricing.tax,
        totalAmount: pricing.total,
        pricing,
      };
    });

    // 2. Background async sync
    try {
      const res = await api.updateCartItem(itemId, { quantity });
      if (res?.success && res.data) {
        setCart(res.data);
      }
    } catch (err) {
      console.error('Failed to sync cart update', err);
    }
  };

  const removeItem = async (itemId: string) => {
    // 1. Instant 0ms Optimistic UI removal
    setCart((prev) => {
      if (!prev) return prev;
      const remainingItems = prev.items.filter(
        (it) => it.id !== itemId && it.productId !== itemId && it.variantId !== itemId
      );
      const pricing = recalculatePricing(remainingItems, prev.couponCode);
      return {
        ...prev,
        items: remainingItems,
        subtotal: pricing.subtotal,
        deliveryCharge: pricing.deliveryFee,
        taxAmount: pricing.tax,
        totalAmount: pricing.total,
        pricing,
      };
    });

    // 2. Background async sync
    try {
      const res = await api.removeCartItem(itemId);
      if (res?.success && res.data) {
        setCart(res.data);
      }
    } catch (err) {
      console.error('Failed to sync item removal', err);
    }
  };

  const clearCart = async () => {
    // 0ms instantaneous optimistic state reset
    setCart({
      id: 'cart_empty',
      userId: 'guest',
      items: [],
      subtotal: 0,
      deliveryCharge: 0,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: 0,
      pricing: {
        subtotal: 0,
        deliveryFee: 0,
        discount: 0,
        tax: 0,
        total: 0,
        freeDeliveryThreshold: 499,
        freeDeliveryRemaining: 499
      }
    } as any);
    try {
      const res = await api.clearCart();
      if (res && res.success && res.data) setCart(res.data);
    } catch (err: any) {
      console.warn('Could not clear cart on backend:', err.message);
    }
  };

  const applyCoupon = async (code: string) => {
    const res = await api.applyCoupon(code);
    if (res.success) {
      setCart(res.data);
      return res.message || 'Coupon applied successfully!';
    }
    throw new Error(res.message || 'Failed to apply coupon');
  };

  const removeCoupon = async () => {
    try {
      const res = await api.removeCoupon();
      if (res.success) setCart(res.data);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        isDrawerOpen,
        setIsDrawerOpen,
        openDrawer,
        closeDrawer,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        applyCoupon,
        removeCoupon,
        refreshCart,
        itemCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
