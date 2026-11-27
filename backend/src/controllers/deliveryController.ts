import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, DeliveryPartner, Order } from '../db/dataStore';
import { AuthenticatedRequest } from '../middleware/auth';

const getPartner = (req: AuthenticatedRequest): DeliveryPartner | undefined => {
  if (!req.user) return undefined;
  return db.getDeliveryPartnerByUserId(req.user.id);
};

export const getDeliveryProfile = (req: AuthenticatedRequest, res: Response) => {
  const partner = getPartner(req);
  if (!partner) {
    return res.status(404).json({ success: false, message: 'Delivery partner record not found.' });
  }

  const assignedOrders = db.orders.filter(
    (o) => o.deliveryPartnerId === partner.id && !['DELIVERED', 'CANCELLED', 'REJECTED'].includes(o.status)
  );

  const completedOrders = db.orders.filter(
    (o) => o.deliveryPartnerId === partner.id && o.status === 'DELIVERED'
  );

  const earnings = db.deliveryEarnings.filter((e) => e.deliveryPartnerId === partner.id);
  const totalEarned = earnings.reduce((acc, curr) => acc + curr.totalEarning, 0);

  return res.json({
    success: true,
    data: {
      partner,
      activeOrdersCount: assignedOrders.length,
      completedOrdersCount: completedOrders.length,
      totalEarned
    }
  });
};

export const toggleOnlineStatus = (req: AuthenticatedRequest, res: Response) => {
  const partner = getPartner(req);
  if (!partner) {
    return res.status(404).json({ success: false, message: 'Delivery partner not found.' });
  }

  if (partner.approvalStatus !== 'APPROVED') {
    return res.status(403).json({
      success: false,
      message: 'Your account is pending verification. You can go online once an administrator approves your profile.'
    });
  }

  partner.isOnline = !partner.isOnline;
  partner.updatedAt = new Date().toISOString();
  db.saveToDisk();

  return res.json({
    success: true,
    message: `You are now ${partner.isOnline ? 'ONLINE' : 'OFFLINE'}`,
    data: { isOnline: partner.isOnline }
  });
};

export const getAssignedOrders = (req: AuthenticatedRequest, res: Response) => {
  const partner = getPartner(req);
  if (!partner) {
    return res.status(404).json({ success: false, message: 'Delivery partner not found.' });
  }

  const orders = db.orders.filter(
    (o) => o.deliveryPartnerId === partner.id && !['DELIVERED', 'CANCELLED', 'REJECTED'].includes(o.status)
  );

  return res.json({
    success: true,
    count: orders.length,
    data: orders.map((o) => ({
      ...o,
      storeLocation: {
        name: db.storeSettings.storeName,
        address: db.storeSettings.address,
        lat: db.storeSettings.storeLat,
        lng: db.storeSettings.storeLng
      }
    }))
  });
};

export const acceptAssignment = (req: AuthenticatedRequest, res: Response) => {
  const partner = getPartner(req);
  const id = String(req.params.id);

  if (!partner) {
    return res.status(404).json({ success: false, message: 'Delivery partner not found' });
  }

  const order = db.getOrderById(id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  order.status = 'READY_FOR_PICKUP';
  order.deliveryPartnerId = partner.id;
  order.deliveryPartnerName = partner.fullName;
  order.deliveryPartnerPhone = partner.phone;
  order.updatedAt = new Date().toISOString();

  db.saveToDisk();

  return res.json({
    success: true,
    message: `Assignment accepted for order ${order.orderNumber}. Proceed to the store for pickup.`,
    data: order
  });
};

export const rejectAssignment = (req: AuthenticatedRequest, res: Response) => {
  const partner = getPartner(req);
  const id = String(req.params.id);
  const { reason } = req.body;

  if (!partner) {
    return res.status(404).json({ success: false, message: 'Delivery partner not found' });
  }

  const order = db.getOrderById(id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  // Unassign partner
  order.deliveryPartnerId = null;
  order.deliveryPartnerName = null;
  order.deliveryPartnerPhone = null;
  order.status = 'READY_FOR_PICKUP';
  order.updatedAt = new Date().toISOString();

  db.saveToDisk();

  return res.json({
    success: true,
    message: 'Assignment rejected. Order returned to pickup pool for reassignment.'
  });
};

export const updateDeliveryOrderStatus = (req: AuthenticatedRequest, res: Response) => {
  const partner = getPartner(req);
  const id = String(req.params.id);
  const { status } = req.body;

  if (!partner) {
    return res.status(404).json({ success: false, message: 'Delivery partner not found' });
  }

  const order = db.getOrderById(id);
  if (!order || order.deliveryPartnerId !== partner.id) {
    return res.status(404).json({ success: false, message: 'Order not found or not assigned to you' });
  }

  const validNext: Record<string, string[]> = {
    PLACED: ['CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP'],
    CONFIRMED: ['PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP'],
    PREPARING: ['READY_FOR_PICKUP', 'PICKED_UP'],
    PARTNER_ASSIGNED: ['READY_FOR_PICKUP', 'PICKED_UP', 'OUT_FOR_DELIVERY'],
    READY_FOR_PICKUP: ['PICKED_UP', 'OUT_FOR_DELIVERY'],
    PICKED_UP: ['OUT_FOR_DELIVERY', 'DELIVERED'],
    OUT_FOR_DELIVERY: ['DELIVERED']
  };

  const allowed = validNext[order.status] || ['PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  if (!allowed.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status transition from ${order.status} to ${status}. Allowed: ${allowed.join(', ')}`
    });
  }

  const now = new Date().toISOString();
  order.status = status as any;
  order.updatedAt = now;

  if (status === 'PICKED_UP') order.pickedUpAt = now;

  db.saveToDisk();

  return res.json({
    success: true,
    message: `Delivery progress updated to ${status}`,
    data: order
  });
};

export const submitCodCollection = (req: AuthenticatedRequest, res: Response) => {
  const partner = getPartner(req);
  const id = String(req.params.id);
  const { amountCollected } = req.body;

  if (!partner) {
    return res.status(404).json({ success: false, message: 'Delivery partner not found' });
  }

  const order = db.getOrderById(id);
  if (!order || order.deliveryPartnerId !== partner.id) {
    return res.status(404).json({ success: false, message: 'Order not found or not assigned to you' });
  }

  if (order.paymentMethod !== 'COD') {
    return res.status(400).json({ success: false, message: 'This is an online paid order. No cash collection required.' });
  }

  if (order.codDetails?.status === 'COLLECTED' || order.codDetails?.status === 'SETTLED' || order.paymentStatus === 'COD_COLLECTED' || order.paymentStatus === 'PAID') {
    return res.status(400).json({
      success: false,
      message: 'Cash has already been submitted for this order. Duplicate submissions are not allowed.'
    });
  }

  const collected = Number(amountCollected);
  if (isNaN(collected) || collected <= 0) {
    return res.status(400).json({ success: false, message: 'Please enter a valid cash amount collected.' });
  }

  const now = new Date().toISOString();
  order.paymentStatus = 'COD_COLLECTED';
  order.codDetails = {
    status: 'COLLECTED',
    amountExpected: order.totalAmount,
    amountCollected: collected,
    collectedAt: now,
    collectedByPartnerId: partner.id,
    collectedByPartnerName: partner.fullName
  };

  if (!order.timeline) order.timeline = [];
  order.timeline.push({
    event: 'COD_COLLECTED',
    title: 'Cash Collected by Delivery Partner',
    timestamp: now,
    actor: partner.fullName,
    details: `₹${collected} cash collected from customer. Awaiting store verification.`
  });
  order.updatedAt = now;

  db.saveToDisk();

  return res.json({
    success: true,
    message: `₹${collected} cash collection recorded successfully! Awaiting store admin settlement.`,
    data: order
  });
};

export const verifyDeliveryOtp = (req: AuthenticatedRequest, res: Response) => {
  const partner = getPartner(req);
  const id = String(req.params.id);
  const { otp, cashCollected } = req.body;

  if (!partner) {
    return res.status(404).json({ success: false, message: 'Delivery partner not found' });
  }

  const order = db.getOrderById(id);
  if (!order || order.deliveryPartnerId !== partner.id) {
    return res.status(404).json({ success: false, message: 'Order not found or not assigned to you' });
  }

  if (order.status === 'DELIVERED') {
    return res.status(400).json({ success: false, message: 'Order is already delivered.' });
  }

  // Security attempt limiter (max 5 incorrect attempts)
  if ((order.deliveryOtpAttempts || 0) >= 5) {
    return res.status(403).json({
      success: false,
      message: 'Too many incorrect delivery OTP attempts! Order delivery has been locked for security. Please contact Admin.'
    });
  }

  const cleanOtp = String(otp || '').trim();
  const isOtpMatch = cleanOtp && cleanOtp === String(order.deliveryOtp).trim();

  if (!isOtpMatch) {
    order.deliveryOtpAttempts = (order.deliveryOtpAttempts || 0) + 1;
    db.saveToDisk();
    const remaining = Math.max(0, 5 - order.deliveryOtpAttempts);
    return res.status(400).json({
      success: false,
      message: `Invalid Delivery OTP! Please ask the customer to check their order confirmation screen. (${remaining} attempts remaining)`
    });
  }

  const now = new Date().toISOString();

  // If order is COD and cash wasn't previously submitted, record it as COD_COLLECTED
  if (order.paymentMethod === 'COD') {
    const collectedAmt = Number(cashCollected) || order.totalAmount;
    if (order.paymentStatus !== 'COD_COLLECTED' && order.paymentStatus !== 'PAID') {
      order.paymentStatus = 'COD_COLLECTED';
      order.codDetails = {
        status: 'COLLECTED',
        amountExpected: order.totalAmount,
        amountCollected: collectedAmt,
        collectedAt: now,
        collectedByPartnerId: partner.id,
        collectedByPartnerName: partner.fullName
      };
    }
  }

  order.status = 'DELIVERED';
  order.deliveredAt = now;
  order.deliveryOtpVerifiedAt = now;
  order.updatedAt = now;

  if (!order.timeline) order.timeline = [];
  order.timeline.push({
    event: 'DELIVERY_COMPLETED',
    title: 'Customer OTP Verified & Order Delivered',
    timestamp: now,
    actor: partner.fullName,
    details: 'Order handed over to customer and verified with secure OTP'
  });

  // Calculate and award delivery partner earnings
  const baseFee = 40;
  const distanceBonus = Math.max(0, Math.round((order.distanceKm - 2) * 8));
  const tipAmount = 10;
  const totalEarning = baseFee + distanceBonus + tipAmount;

  db.deliveryEarnings.push({
    id: `earn_${uuidv4().substring(0, 8)}`,
    deliveryPartnerId: partner.id,
    orderId: order.id,
    baseFee,
    distanceBonus,
    commissionAmount: 0,
    tipAmount,
    totalEarning,
    payoutStatus: 'PENDING',
    createdAt: now
  });

  partner.totalDeliveries += 1;
  partner.updatedAt = now;

  db.saveToDisk();

  return res.json({
    success: true,
    message: `Delivery completed successfully! Customer OTP verified. Earning of ₹${totalEarning} credited to your Meat Corner wallet.`,
    data: {
      order,
      earning: {
        totalEarning,
        baseFee,
        distanceBonus,
        tipAmount
      }
    }
  });
};

export const updateGpsLocation = (req: AuthenticatedRequest, res: Response) => {
  const partner = getPartner(req);
  const { lat, lng, orderId } = req.body;

  if (!partner) {
    return res.status(404).json({ success: false, message: 'Delivery partner not found' });
  }

  if (!lat || !lng) {
    return res.status(400).json({ success: false, message: 'Latitude and Longitude are required' });
  }

  const loc = db.updatePartnerLocation(orderId || 'general', partner.id, Number(lat), Number(lng));

  return res.json({ success: true, message: 'Live GPS location updated', data: loc });
};

export const getEarnings = (req: AuthenticatedRequest, res: Response) => {
  const partner = getPartner(req);
  if (!partner) {
    return res.status(404).json({ success: false, message: 'Delivery partner not found' });
  }

  const records = db.deliveryEarnings.filter((e) => e.deliveryPartnerId === partner.id);
  const total = records.reduce((sum, r) => sum + r.totalEarning, 0);

  return res.json({
    success: true,
    data: {
      totalEarnings: total,
      totalTrips: records.length,
      records
    }
  });
};
