import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, Order, OrderItem, Address } from '../db/dataStore';
import { AuthenticatedRequest } from '../middleware/auth';

export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customer = req.user;
    if (!customer) {
      return res.status(401).json({ success: false, message: 'Please login to place an order.' });
    }

    const {
      addressId,
      newAddress,
      paymentMethod = 'COD',
      deliveryInstructions,
      deliverySlot = 'Express (30-45 mins)',
      couponCode
    } = req.body;

    // 1. Resolve Delivery Address
    let deliveryAddress: Address | undefined;
    if (addressId) {
      deliveryAddress = db.addresses.find((a) => a.id === addressId && a.userId === customer.id);
    } else if (newAddress) {
      deliveryAddress = {
        id: `addr_${uuidv4().substring(0, 8)}`,
        userId: customer.id,
        label: newAddress.label || 'Home',
        recipientName: newAddress.recipientName || customer.name,
        phone: newAddress.phone || customer.phone,
        line1: newAddress.line1,
        line2: newAddress.line2 || null,
        landmark: newAddress.landmark || null,
        area: newAddress.area,
        city: newAddress.city,
        state: newAddress.state || 'Tamil Nadu',
        pincode: newAddress.pincode,
        lat: Number(newAddress.lat) || 11.3806,
        lng: Number(newAddress.lng) || 77.5944,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.addresses.push(deliveryAddress);
    }

    if (!deliveryAddress) {
      return res.status(400).json({ success: false, message: 'Valid delivery address is required.' });
    }

    // 2. Validate Serviceable PIN code
    const settings = db.storeSettings;
    const isServiceable = settings.serviceableAreas.some((area) =>
      area.isActive && area.pincodes.includes(deliveryAddress!.pincode.trim())
    );

    if (!isServiceable) {
      return res.status(400).json({
        success: false,
        message: `Sorry, we currently do not deliver to PIN code ${deliveryAddress.pincode}. Serviceable PINs include: ${settings.serviceableAreas[0]?.pincodes.slice(0, 5).join(', ')}...`
      });
    }

    // 3. Retrieve Cart Items
    const cart = db.getCart(customer.id);
    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your shopping cart is empty.' });
    }

    // 4. Validate stock server-side
    const stockItems = cart.items.map((it) => ({ variantId: it.variantId, quantity: it.quantity }));
    const stockCheck = db.checkAndReserveStock(stockItems);
    if (!stockCheck.success) {
      return res.status(400).json({ success: false, message: stockCheck.error });
    }

    // 5. Calculate Server-Side Pricing (NEVER trust client)
    let subtotal = 0;
    const orderItems: OrderItem[] = [];

    for (const item of cart.items) {
      const product = db.getProductById(item.productId);
      const variant = db.variants.find((v) => v.id === item.variantId);

      if (!product || !variant) {
        db.releaseStock(stockItems);
        return res.status(400).json({ success: false, message: `Product or variant unavailable` });
      }

      const unitPrice = variant.price;
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      orderItems.push({
        id: `oi_${uuidv4().substring(0, 8)}`,
        orderId: '', // populated below
        productId: product.id,
        variantId: variant.id,
        productName: product.name,
        variantLabel: variant.label,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        cuttingOption: item.cuttingOption || product.cuttingOptions[0],
        cleaningOption: item.cleaningOption || product.cleaningOptions[0]
      });
    }

    if (subtotal < settings.minOrderAmount) {
      db.releaseStock(stockItems);
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is ₹${settings.minOrderAmount}. Current subtotal is ₹${subtotal}.`
      });
    }

    // Delivery charge calculation
    let deliveryCharge = subtotal >= settings.freeDeliveryAbove ? 0 : settings.baseDeliveryCharge;

    // Coupon discount calculation
    let discountAmount = 0;
    const effectiveCouponCode = couponCode || cart.couponCode;
    if (effectiveCouponCode) {
      const coupon = db.coupons.find((c) => c.code.toUpperCase() === effectiveCouponCode.toUpperCase() && c.isActive);
      if (coupon && subtotal >= coupon.minOrderValue) {
        if (coupon.discountType === 'PERCENTAGE') {
          discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        } else {
          discountAmount = coupon.discountValue;
        }
        coupon.usedCount += 1;
      }
    }

    const taxAmount = Math.round(((subtotal - discountAmount) * settings.taxPercent) / 100);
    const totalAmount = Math.max(0, subtotal - discountAmount + deliveryCharge + taxAmount);

    // 6. Generate unique Order ID & Delivery OTP
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randPart = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `MC-${dateStr}-${randPart}`;
    const orderId = `ord_${uuidv4().substring(0, 8)}`;
    const deliveryOtp = String(Math.floor(1000 + Math.random() * 9000)); // 4-digit OTP

    orderItems.forEach((it) => (it.orderId = orderId));

    // Auto-assign available online delivery partner if available
    const availablePartner = db.deliveryPartners.find((dp) => dp.isOnline && dp.approvalStatus === 'APPROVED');

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      addressId: deliveryAddress.id,
      deliveryAddressSnapshot: deliveryAddress,
      deliveryPartnerId: availablePartner ? availablePartner.id : null,
      deliveryPartnerName: availablePartner ? availablePartner.fullName : null,
      deliveryPartnerPhone: availablePartner ? availablePartner.phone : null,
      status: 'PLACED',
      paymentMethod: paymentMethod === 'RAZORPAY' ? 'RAZORPAY' : 'COD',
      paymentStatus: paymentMethod === 'RAZORPAY' ? 'PENDING' : 'PENDING',
      subtotal,
      deliveryCharge,
      discountAmount,
      taxAmount,
      totalAmount,
      couponCode: effectiveCouponCode || null,
      deliveryInstructions: deliveryInstructions || '',
      deliverySlot,
      deliveryOtp,
      distanceKm: 2.8,
      estimatedMinutes: 35,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: orderItems
    };

    if (availablePartner) {
      newOrder.status = 'PARTNER_ASSIGNED';
      db.deliveryAssignments.push({
        id: `da_${uuidv4().substring(0, 8)}`,
        orderId,
        deliveryPartnerId: availablePartner.id,
        status: 'PENDING',
        assignedAt: new Date().toISOString()
      });
    }

    db.createOrder(newOrder);

    // Clear user cart
    cart.items = [];
    cart.couponCode = null;
    cart.updatedAt = new Date().toISOString();
    db.saveCart(cart);

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully! Fresh chicken is being prepared.',
      data: newOrder
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Order creation failed' });
  }
};

export const getCustomerOrders = (req: AuthenticatedRequest, res: Response) => {
  const customer = req.user;
  if (!customer) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const orders = db.orders.filter((o) => o.customerId === customer.id);
  return res.json({ success: true, count: orders.length, data: orders });
};

export const getOrderById = (req: AuthenticatedRequest, res: Response) => {
  const id = String(req.params.id);
  const order = db.getOrderById(id);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  // Populate latest live GPS coordinates if partner is active
  let partnerLocation = null;
  if (order.deliveryPartnerId) {
    const locs = db.deliveryLocations.filter((l) => l.orderId === order.id);
    if (locs.length > 0) {
      partnerLocation = locs[locs.length - 1];
    } else {
      const partner = db.deliveryPartners.find((p) => p.id === order.deliveryPartnerId);
      if (partner && partner.currentLat && partner.currentLng) {
        partnerLocation = {
          lat: partner.currentLat,
          lng: partner.currentLng,
          recordedAt: partner.lastLocationAt || new Date().toISOString()
        };
      }
    }
  }

  return res.json({
    success: true,
    data: {
      ...order,
      partnerLocation,
      storeLocation: {
        lat: db.storeSettings.storeLat,
        lng: db.storeSettings.storeLng,
        name: db.storeSettings.storeName,
        address: db.storeSettings.address
      }
    }
  });
};

// Admin Order Endpoints
export const adminGetOrders = (req: AuthenticatedRequest, res: Response) => {
  const { status, search } = req.query;
  let list = [...db.orders];

  if (status && status !== 'ALL') {
    list = list.filter((o) => o.status === status);
  }

  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.customerPhone?.includes(q)
    );
  }

  return res.json({ success: true, count: list.length, data: list });
};

export const adminUpdateOrderStatus = (req: AuthenticatedRequest, res: Response) => {
  const id = String(req.params.id);
  const { status, rejectionReason, cancellationReason } = req.body;

  const order = db.getOrderById(id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const now = new Date().toISOString();
  const updates: Partial<Order> = { updatedAt: now };
  if (status) updates.status = status;
  if (req.body.paymentStatus) updates.paymentStatus = req.body.paymentStatus;

  if (status === 'CONFIRMED') updates.confirmedAt = now;
  if (status === 'PREPARING') updates.preparedAt = now;
  if (status === 'READY_FOR_PICKUP') updates.preparedAt = now;
  if (status === 'PICKED_UP') updates.pickedUpAt = now;
  if (status === 'DELIVERED') {
    updates.deliveredAt = now;
    updates.paymentStatus = 'PAID';
  }
  if (status === 'CANCELLED') {
    updates.cancelledAt = now;
    updates.cancellationReason = cancellationReason || 'Cancelled by admin';
    // Release inventory
    db.releaseStock(order.items.map((it) => ({ variantId: it.variantId, quantity: it.quantity })));
  }
  if (status === 'REJECTED') {
    updates.rejectionReason = rejectionReason || 'Store unable to fulfil order';
    db.releaseStock(order.items.map((it) => ({ variantId: it.variantId, quantity: it.quantity })));
  }

  const updatedOrder = db.updateOrder(order.id, updates);
  db.saveToDisk();
  return res.json({ success: true, message: `Order updated successfully`, data: updatedOrder });
};

export const adminDeleteOrder = (req: AuthenticatedRequest, res: Response) => {
  const id = String(req.params.id);
  const idx = db.orders.findIndex((o) => o.id === id || o.orderNumber === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const order = db.orders[idx];
  db.orders.splice(idx, 1);
  db.orderItems = db.orderItems.filter((oi) => oi.orderId !== order.id);
  db.deliveryAssignments = db.deliveryAssignments.filter((da) => da.orderId !== order.id);

  db.saveToDisk();

  return res.json({ success: true, message: `Order #${order.orderNumber} deleted permanently` });
};

export const adminAssignDeliveryPartner = (req: AuthenticatedRequest, res: Response) => {
  const id = String(req.params.id);
  const { deliveryPartnerId } = req.body;

  const order = db.getOrderById(id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const partner = db.deliveryPartners.find((p) => p.id === deliveryPartnerId);
  if (!partner) {
    return res.status(404).json({ success: false, message: 'Delivery partner not found' });
  }

  const now = new Date().toISOString();
  order.deliveryPartnerId = partner.id;
  order.deliveryPartnerName = partner.fullName;
  order.deliveryPartnerPhone = partner.phone;
  order.status = 'PARTNER_ASSIGNED';
  order.updatedAt = now;

  db.deliveryAssignments.push({
    id: `da_${uuidv4().substring(0, 8)}`,
    orderId: order.id,
    deliveryPartnerId: partner.id,
    status: 'PENDING',
    assignedAt: now
  });

  db.saveToDisk();

  return res.json({
    success: true,
    message: `Assigned delivery partner ${partner.fullName} to order ${order.orderNumber}`,
    data: order
  });
};
