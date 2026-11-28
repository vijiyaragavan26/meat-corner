import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, Cart, CartItem } from '../db/dataStore';
import { AuthenticatedRequest } from '../middleware/auth';

const getUserId = (req: AuthenticatedRequest): string => {
  if (req.user) return req.user.id;
  const guestId = req.headers['x-guest-id'] as string;
  return guestId || 'guest_default';
};

export const getCart = (req: AuthenticatedRequest, res: Response) => {
  const userId = getUserId(req);
  const cart = db.getCart(userId);

  // Calculate pricing breakdown
  let subtotal = 0;
  cart.items.forEach((item) => {
    const basePrice = Number(item.product?.basePrice ?? item.product?.price ?? 0);
    const weight = Number(item.variant?.weightGrams) || (item.variant?.label?.includes('1kg') ? 1000 : 500);
    const price = basePrice > 0
      ? (weight === 1000 ? basePrice : Math.max(1, Math.round(basePrice * (weight / 1000))))
      : (Number(item.variant?.price) || 250);
    subtotal += price * (item.quantity || 1);
  });

  const settings = db.storeSettings;
  let deliveryFee = subtotal >= settings.freeDeliveryAbove ? 0 : settings.baseDeliveryCharge;
  if (subtotal === 0) deliveryFee = 0;

  // Coupon calculation
  let discount = 0;
  let appliedCoupon = null;
  if (cart.couponCode) {
    const coupon = db.coupons.find((c) => c.code === cart.couponCode && c.isActive);
    if (coupon) {
      if (subtotal >= coupon.minOrderValue) {
        if (coupon.discountType === 'PERCENTAGE') {
          discount = Math.round((subtotal * coupon.discountValue) / 100);
          if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
          }
        } else {
          discount = coupon.discountValue;
        }
        appliedCoupon = coupon;
      }
    }
  }

  const tax = Math.round(((subtotal - discount) * settings.taxPercent) / 100);
  const total = Math.max(0, subtotal - discount + deliveryFee + tax);

  return res.json({
    success: true,
    data: {
      ...cart,
      pricing: {
        subtotal,
        deliveryFee,
        discount,
        tax,
        total,
        appliedCoupon,
        freeDeliveryThreshold: settings.freeDeliveryAbove,
        freeDeliveryRemaining: Math.max(0, settings.freeDeliveryAbove - subtotal)
      }
    }
  });
};

export const addItemToCart = (req: AuthenticatedRequest, res: Response) => {
  const userId = getUserId(req);
  const { productId, variantId, quantity = 1, cuttingOption, cleaningOption } = req.body;

  if (!productId || !variantId) {
    return res.status(400).json({ success: false, message: 'ProductId and VariantId are required' });
  }

  const product = db.getProductById(productId);
  if (!product || !product.isActive) {
    return res.status(404).json({ success: false, message: 'Chicken product not found or unavailable' });
  }

  const variant = db.variants.find((v) => v.id === variantId && v.productId === productId && v.isActive);
  if (!variant) {
    return res.status(404).json({ success: false, message: 'Product weight variant not found' });
  }

  const cart = db.getCart(userId);
  const existingIndex = cart.items.findIndex(
    (item) =>
      item.variantId === variantId &&
      item.cuttingOption === cuttingOption &&
      item.cleaningOption === cleaningOption
  );

  if (existingIndex > -1) {
    cart.items[existingIndex].quantity += Number(quantity);
    cart.items[existingIndex].updatedAt = new Date().toISOString();
  } else {
    const newItem: CartItem = {
      id: `ci_${uuidv4().substring(0, 8)}`,
      cartId: cart.id,
      productId,
      variantId,
      quantity: Number(quantity),
      cuttingOption: cuttingOption || product.cuttingOptions[0],
      cleaningOption: cleaningOption || product.cleaningOptions[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    cart.items.push(newItem);
  }

  cart.updatedAt = new Date().toISOString();
  db.saveCart(cart);

  return getCart(req, res);
};

export const updateCartItem = (req: AuthenticatedRequest, res: Response) => {
  const userId = getUserId(req);
  const { id } = req.params;
  const { quantity, cuttingOption, cleaningOption } = req.body;

  const cart = db.getCart(userId);
  const itemIndex = cart.items.findIndex((it) => it.id === id);

  if (itemIndex === -1) {
    return res.status(404).json({ success: false, message: 'Cart item not found' });
  }

  if (quantity !== undefined) {
    const q = Number(quantity);
    if (q <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = q;
    }
  }

  if (cuttingOption && cart.items[itemIndex]) {
    cart.items[itemIndex].cuttingOption = cuttingOption;
  }

  if (cleaningOption && cart.items[itemIndex]) {
    cart.items[itemIndex].cleaningOption = cleaningOption;
  }

  cart.updatedAt = new Date().toISOString();
  db.saveCart(cart);

  return getCart(req, res);
};

export const removeCartItem = (req: AuthenticatedRequest, res: Response) => {
  const userId = getUserId(req);
  const { id } = req.params;

  const cart = db.getCart(userId);
  cart.items = cart.items.filter((it) => it.id !== id);
  cart.updatedAt = new Date().toISOString();
  db.saveCart(cart);

  return getCart(req, res);
};

export const clearCart = (req: AuthenticatedRequest, res: Response) => {
  const userId = getUserId(req);
  const cart = db.getCart(userId);
  cart.items = [];
  cart.couponCode = null;
  cart.updatedAt = new Date().toISOString();
  db.saveCart(cart);

  return getCart(req, res);
};

export const applyCoupon = (req: AuthenticatedRequest, res: Response) => {
  const userId = getUserId(req);
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: 'Coupon code is required' });
  }

  const coupon = db.coupons.find((c) => c.code.toUpperCase() === code.toUpperCase().trim() && c.isActive);
  if (!coupon) {
    return res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });
  }

  const cart = db.getCart(userId);
  let subtotal = 0;
  cart.items.forEach((it) => {
    const basePrice = Number(it.product?.basePrice ?? it.product?.price ?? 0);
    const weight = Number(it.variant?.weightGrams) || (it.variant?.label?.includes('1kg') ? 1000 : 500);
    const price = basePrice > 0
      ? (weight === 1000 ? basePrice : Math.max(1, Math.round(basePrice * (weight / 1000))))
      : (Number(it.variant?.price) || 250);
    subtotal += price * (it.quantity || 1);
  });

  if (subtotal < coupon.minOrderValue) {
    return res.status(400).json({
      success: false,
      message: `Coupon requires a minimum order amount of ₹${coupon.minOrderValue}. Your current cart total is ₹${subtotal}.`
    });
  }

  cart.couponCode = coupon.code;
  cart.updatedAt = new Date().toISOString();
  db.saveCart(cart);

  return getCart(req, res);
};

export const removeCoupon = (req: AuthenticatedRequest, res: Response) => {
  const userId = getUserId(req);
  const cart = db.getCart(userId);
  cart.couponCode = null;
  cart.updatedAt = new Date().toISOString();
  db.saveCart(cart);

  return getCart(req, res);
};
