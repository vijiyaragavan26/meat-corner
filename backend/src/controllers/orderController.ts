import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, Order, OrderItem, Address } from '../db/dataStore';
import { AuthenticatedRequest } from '../middleware/auth';
import { config } from '../config';

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
        cleaningOption: item.cleaningOption || product.cleaningOptions[0],
        imageUrl: product.images?.[0] || 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80',
        productImage: product.images?.[0] || 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80'
      });
    }

    if (subtotal < settings.minOrderAmount) {
      db.releaseStock(stockItems);
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is ₹${settings.minOrderAmount}. Current subtotal is ₹${subtotal}.`
      });
    }

    // Delivery charge & tax calculation with product override support
    let customDeliveryFee: number | null = null;
    let calculatedTax = 0;

    cart.items.forEach((item: any) => {
      const basePrice = Number(item.product?.basePrice ?? item.product?.price ?? 0);
      const weight = Number(item.variant?.weightGrams) || (item.variant?.label?.includes('1kg') ? 1000 : 500);
      const price = basePrice > 0
        ? (weight === 1000 ? basePrice : Math.max(1, Math.round(basePrice * (weight / 1000))))
        : (Number(item.variant?.price) || 250);
      const itemSubtotal = price * (item.quantity || 1);

      if (item.product?.deliveryFee !== undefined && item.product?.deliveryFee !== null) {
        customDeliveryFee = Number(item.product.deliveryFee);
      }
      const itemGst = item.product?.gstPercent !== undefined ? Number(item.product.gstPercent) : (settings.taxPercent ?? 5);
      calculatedTax += (itemSubtotal * (itemGst / 100));
    });

    let deliveryCharge = subtotal >= settings.freeDeliveryAbove
      ? 0
      : (customDeliveryFee !== null ? customDeliveryFee : settings.baseDeliveryCharge);

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

    const taxAmount = Math.round(calculatedTax);
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
export const adminGetOrders = async (req: AuthenticatedRequest, res: Response) => {
  const { status, search } = req.query;
  let list = [...db.orders];

  try {
    const supaRes = await fetch(`${config.supabaseUrl}/rest/v1/Orders?select=*,OrderItems(*),DeliveryPartners(*)&order=createdAt.desc&limit=100`, {
      headers: {
        apikey: config.supabaseAnonKey,
        Authorization: `Bearer ${config.supabaseAnonKey}`
      }
    });
    if (supaRes.ok) {
      const supaData: any = await supaRes.json();
      if (Array.isArray(supaData) && supaData.length > 0) {
        const orderMap = new Map<string, any>();
        supaData.forEach((o: any) => {
          const norm = {
            ...o,
            customerName: o.deliveryAddressSnapshot?.recipientName || o.customerName || 'Customer',
            customerPhone: o.deliveryAddressSnapshot?.phone || o.customerPhone || '',
            items: Array.isArray(o.OrderItems) && o.OrderItems.length > 0 ? o.OrderItems : (o.items || [])
          };
          orderMap.set(norm.orderNumber || norm.id, norm);
        });
        list.forEach((o) => {
          if (!orderMap.has(o.orderNumber || o.id)) {
            orderMap.set(o.orderNumber || o.id, o);
          }
        });
        list = Array.from(orderMap.values()).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      }
    }
  } catch (err) {
    console.warn('Failed to query Supabase in adminGetOrders:', err);
  }

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
    if (order.paymentMethod === 'RAZORPAY') {
      updates.paymentStatus = 'PAID';
    } else if (order.paymentStatus !== 'PAID') {
      updates.paymentStatus = 'COD_COLLECTED';
    }
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

  if (updates.status && updates.status !== order.status) {
    if (!order.timeline) order.timeline = [];
    order.timeline.push({
      event: `STATUS_${updates.status}`,
      title: `Order Status Changed to ${updates.status.replace(/_/g, ' ')}`,
      timestamp: now,
      actor: req.user?.name || 'Administrator',
      details: rejectionReason || cancellationReason || undefined
    });
  }

  const updatedOrder = db.updateOrder(order.id, updates);
  db.saveToDisk();
  return res.json({ success: true, message: `Order updated successfully`, data: updatedOrder });
};

export const adminSettleCodOrder = (req: AuthenticatedRequest, res: Response) => {
  const id = String(req.params.id);
  const order = db.getOrderById(id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const now = new Date().toISOString();
  order.paymentStatus = 'PAID';
  order.codDetails = {
    ...(order.codDetails || {
      status: 'COLLECTED',
      amountExpected: order.totalAmount,
      amountCollected: order.totalAmount,
      collectedAt: now,
      collectedByPartnerId: order.deliveryPartnerId || 'dp_1',
      collectedByPartnerName: order.deliveryPartnerName || 'Delivery Partner'
    }),
    status: 'SETTLED',
    settledAt: now,
    settledByAdminId: req.user?.name || 'Administrator',
    settlementNotes: req.body?.notes || 'COD cash handover verified by store admin'
  };

  if (!order.timeline) order.timeline = [];
  order.timeline.push({
    event: 'COD_SETTLED',
    title: 'COD Handover Verified & Settled to PAID',
    timestamp: now,
    actor: req.user?.name || 'Administrator',
    details: `₹${order.totalAmount} cash settled to Meat Corner store account`
  });
  order.updatedAt = now;

  db.saveToDisk();

  return res.json({
    success: true,
    message: `Order #${order.orderNumber} COD collection verified and settled as PAID!`,
    data: order
  });
};

export const adminSettlePartnerCodOrders = (req: AuthenticatedRequest, res: Response) => {
  const { partnerId } = req.body;
  if (!partnerId) {
    return res.status(400).json({ success: false, message: 'Please provide partnerId' });
  }

  const partner = db.deliveryPartners.find((p) => p.id === partnerId);
  const now = new Date().toISOString();
  let settledCount = 0;
  let totalSettled = 0;

  db.orders.forEach((o) => {
    if (
      o.deliveryPartnerId === partnerId &&
      o.paymentMethod === 'COD' &&
      o.paymentStatus === 'COD_COLLECTED'
    ) {
      o.paymentStatus = 'PAID';
      o.codDetails = {
        ...(o.codDetails || { status: 'COLLECTED', amountExpected: o.totalAmount, amountCollected: o.totalAmount }),
        status: 'SETTLED',
        settledAt: now,
        settledByAdminId: req.user?.name || 'Administrator',
        settlementNotes: `Batch settlement for ${partner?.fullName || partnerId}`
      };
      if (!o.timeline) o.timeline = [];
      o.timeline.push({
        event: 'COD_SETTLED',
        title: 'Partner Batch COD Settlement',
        timestamp: now,
        actor: req.user?.name || 'Administrator',
        details: `Batch cash settlement verified for ${partner?.fullName || partnerId}`
      });
      o.updatedAt = now;
      settledCount++;
      totalSettled += o.totalAmount;
    }
  });

  db.saveToDisk();

  return res.json({
    success: true,
    message: `Successfully settled ${settledCount} COD orders totaling ₹${totalSettled} from ${partner?.fullName || 'delivery partner'}.`,
    settledCount,
    totalSettled
  });
};

export const adminGetPaymentSummary = (req: AuthenticatedRequest, res: Response) => {
  const { startDate, endDate } = req.query;

  let orders = [...db.orders];
  if (startDate) {
    const s = new Date(startDate as string).getTime();
    orders = orders.filter((o) => new Date(o.createdAt).getTime() >= s);
  }
  if (endDate) {
    const e = new Date(endDate as string).getTime();
    orders = orders.filter((o) => new Date(o.createdAt).getTime() <= e);
  }

  let totalOnlinePaid = 0;
  let onlineCount = 0;
  let totalCodCollected = 0;
  let codCollectedCount = 0;
  let totalCodPending = 0;
  let codPendingCount = 0;
  let totalSettledRevenue = 0;
  let deliveredOrdersCount = 0;
  let pendingOrdersCount = 0;

  const partnerMap: Record<string, { partnerId: string; partnerName: string; totalCollected: number; totalSettled: number; pendingHandover: number; orderCount: number }> = {};

  orders.forEach((o) => {
    const amt = Number(o.totalAmount) || 0;
    if (o.status === 'DELIVERED') deliveredOrdersCount++;
    else if (o.status !== 'CANCELLED' && o.status !== 'REJECTED') pendingOrdersCount++;

    if (o.paymentMethod === 'RAZORPAY') {
      if (o.paymentStatus === 'PAID') {
        totalOnlinePaid += amt;
        onlineCount++;
        totalSettledRevenue += amt;
      }
    } else if (o.paymentMethod === 'COD') {
      if (o.paymentStatus === 'PAID') {
        totalSettledRevenue += amt;
      } else if (o.paymentStatus === 'COD_COLLECTED') {
        totalCodCollected += (o.codDetails?.amountCollected || amt);
        codCollectedCount++;
      } else if (o.paymentStatus === 'PENDING') {
        totalCodPending += amt;
        codPendingCount++;
      }

      if (o.deliveryPartnerId) {
        if (!partnerMap[o.deliveryPartnerId]) {
          partnerMap[o.deliveryPartnerId] = {
            partnerId: o.deliveryPartnerId,
            partnerName: o.deliveryPartnerName || 'Assigned Rider',
            totalCollected: 0,
            totalSettled: 0,
            pendingHandover: 0,
            orderCount: 0
          };
        }
        const pRecord = partnerMap[o.deliveryPartnerId];
        pRecord.orderCount++;
        if (o.paymentStatus === 'COD_COLLECTED') {
          pRecord.totalCollected += (o.codDetails?.amountCollected || amt);
          pRecord.pendingHandover += (o.codDetails?.amountCollected || amt);
        } else if (o.paymentStatus === 'PAID') {
          pRecord.totalCollected += amt;
          pRecord.totalSettled += amt;
        }
      }
    }
  });

  return res.json({
    success: true,
    data: {
      totalRevenue: totalSettledRevenue,
      totalOnlinePaid,
      onlineCount,
      totalCodCollected,
      codCollectedCount,
      totalCodPending,
      codPendingCount,
      totalDelivered: deliveredOrdersCount,
      totalPending: pendingOrdersCount,
      partnerBreakdown: Object.values(partnerMap)
    }
  });
};

export const adminDeleteOrder = (req: AuthenticatedRequest, res: Response) => {
  const id = String(req.params.id);
  const idx = db.orders.findIndex((o) => o.id === id || o.orderNumber === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const order = db.orders[idx];
  db.orders.splice(idx, 1);
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
