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
    const subtotal = items.reduce((sum: number, it: any) => {
      const price = (it.variant?.price && it.variant.price > 0)
        ? it.variant.price
        : (it.product?.basePrice && it.product.basePrice > 0)
          ? it.product.basePrice
          : 250;
      return sum + price * (it.quantity || 1);
    }, 0);
    const deliveryFee = subtotal >= 499 || subtotal === 0 ? 0 : 30;
    const discount = couponCode ? 20 : 0;
    const tax = Math.round(subtotal * 0.05);
    const total = Math.max(0, subtotal + deliveryFee - discount + tax);
    return {
      subtotal,
      deliveryFee,
      discount,
      tax,
      total,
      freeDeliveryThreshold: 499,
      freeDeliveryRemaining: Math.max(0, 499 - subtotal),
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
    try {
      const res = await api.clearCart();
      if (res.success) setCart(res.data);
    } catch (err: any) {
      alert(err.message);
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
