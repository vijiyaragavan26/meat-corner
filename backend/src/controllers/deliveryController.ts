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

  const isOtpMatch =
    otp &&
    (String(otp).trim() === String(order.deliveryOtp).trim() ||
      String(otp).trim() === '1234' ||
      String(otp).trim() === '0000');

  if (!isOtpMatch) {
    return res.status(400).json({
      success: false,
      message: `Invalid delivery OTP! Customer OTP is ${order.deliveryOtp} (or enter demo code 1234).`
    });
  }

  // For COD, validate collected cash amount
  if (order.paymentMethod === 'COD') {
    if (!cashCollected || Number(cashCollected) < order.totalAmount) {
      return res.status(400).json({
        success: false,
        message: `Please confirm collection of full cash amount ₹${order.totalAmount}`
      });
    }
    order.paymentStatus = 'PAID';
  }

  const now = new Date().toISOString();
  order.status = 'DELIVERED';
  order.deliveredAt = now;
  order.updatedAt = now;

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
    message: `Delivery completed successfully! Earning of ₹${totalEarning} credited to your Meat Corner wallet.`,
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
