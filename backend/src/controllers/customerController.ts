import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, Address, SupportTicket } from '../db/dataStore';
import { AuthenticatedRequest } from '../middleware/auth';

// Customer Addresses
export const getAddresses = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const addresses = db.addresses.filter((a) => a.userId === req.user!.id);
  return res.json({ success: true, count: addresses.length, data: addresses });
};

export const addAddress = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const { label, recipientName, phone, line1, line2, landmark, area, city, state, pincode, lat, lng, isDefault } = req.body;

  if (!recipientName || !phone || !line1 || !pincode) {
    return res.status(400).json({ success: false, message: 'Recipient name, phone, address line, and PIN code are required.' });
  }

  if (isDefault) {
    db.addresses.filter((a) => a.userId === req.user!.id).forEach((a) => (a.isDefault = false));
  }

  const newAddress: Address = {
    id: `addr_${uuidv4().substring(0, 8)}`,
    userId: req.user.id,
    label: label || 'Home',
    recipientName,
    phone,
    line1,
    line2: line2 || null,
    landmark: landmark || null,
    area: area || city || 'Erode',
    city: city || 'Erode',
    state: state || 'Tamil Nadu',
    pincode: pincode.trim(),
    lat: Number(lat) || 11.3806,
    lng: Number(lng) || 77.5944,
    isDefault: Boolean(isDefault),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.addresses.push(newAddress);
  db.saveToDisk();

  return res.status(201).json({ success: true, message: 'Address saved successfully', data: newAddress });
};

export const deleteAddress = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const { id } = req.params;

  const idx = db.addresses.findIndex((a) => a.id === id && a.userId === req.user!.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Address not found' });
  }

  db.addresses.splice(idx, 1);
  db.saveToDisk();

  return res.json({ success: true, message: 'Address deleted successfully' });
};

// Wishlist
export const getWishlist = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const items = db.wishlists.filter((w) => w.userId === req.user!.id);
  const products = items
    .map((w) => db.getProductById(w.productId))
    .filter(Boolean);

  return res.json({ success: true, count: products.length, data: products });
};

export const toggleWishlist = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const { productId } = req.body;

  const idx = db.wishlists.findIndex((w) => w.userId === req.user!.id && w.productId === productId);
  let isWishlisted = false;

  if (idx > -1) {
    db.wishlists.splice(idx, 1);
    isWishlisted = false;
  } else {
    db.wishlists.push({
      id: `wsh_${uuidv4().substring(0, 8)}`,
      userId: req.user.id,
      productId,
      createdAt: new Date().toISOString()
    });
    isWishlisted = true;
  }

  db.saveToDisk();

  return res.json({
    success: true,
    message: isWishlisted ? 'Product added to your wishlist' : 'Product removed from wishlist',
    data: { isWishlisted }
  });
};

// Reviews
export const submitReview = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const { productId, rating, comment } = req.body;

  if (!productId || !rating || !comment) {
    return res.status(400).json({ success: false, message: 'Product, rating, and review comment are required' });
  }

  const product = db.products.find((p) => p.id === productId);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  // Update rating
  const currentTotal = product.avgRating * product.reviewCount;
  product.reviewCount += 1;
  product.avgRating = Number(((currentTotal + Number(rating)) / product.reviewCount).toFixed(2));
  product.updatedAt = new Date().toISOString();

  db.saveToDisk();

  return res.status(201).json({
    success: true,
    message: 'Thank you! Your review for this chicken cut has been submitted.',
    data: { avgRating: product.avgRating, reviewCount: product.reviewCount }
  });
};

// Support Tickets
export const createTicket = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const { orderNumber, subject, message } = req.body;

  if (!subject || !message) {
    return res.status(400).json({ success: false, message: 'Subject and message are required' });
  }

  const ticket: SupportTicket = {
    id: `tkt_${uuidv4().substring(0, 8)}`,
    userId: req.user.id,
    orderNumber: orderNumber || undefined,
    subject,
    message,
    status: 'OPEN',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.supportTickets.unshift(ticket);
  db.saveToDisk();

  return res.status(201).json({
    success: true,
    message: 'Support ticket submitted. Meat Corner care team will review shortly.',
    data: ticket
  });
};

export const getCustomerTickets = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const tickets = db.supportTickets.filter((t) => t.userId === req.user!.id);
  return res.json({ success: true, count: tickets.length, data: tickets });
};

// Serviceable PIN Code Check
export const checkPincode = (req: AuthenticatedRequest, res: Response) => {
  const { pincode } = req.body;
  if (!pincode) {
    return res.status(400).json({ success: false, message: 'PIN code is required' });
  }

  const pin = String(pincode).trim();
  const settings = db.storeSettings;
  const matchArea = settings.serviceableAreas.find((area) => area.isActive && area.pincodes.includes(pin));

  if (matchArea) {
    return res.json({
      success: true,
      serviceable: true,
      message: `Great news! Fresh chicken delivery is available to ${pin} (${matchArea.name}).`,
      data: {
        areaName: matchArea.name,
        estimatedDeliveryMinutes: 35,
        freeDeliveryAbove: settings.freeDeliveryAbove,
        baseDeliveryCharge: settings.baseDeliveryCharge
      }
    });
  }

  return res.json({
    success: false,
    serviceable: false,
    message: `Delivery is currently not available in PIN code ${pin}. We are rapidly expanding across Tamil Nadu.`
  });
};

export const getPublicSettings = (req: AuthenticatedRequest, res: Response) => {
  const { storeName, contactPhone, contactEmail, address, operatingHours, deliveryTimeSlots, serviceableAreas, baseDeliveryCharge, freeDeliveryAbove } = db.storeSettings;
  return res.json({
    success: true,
    data: {
      storeName,
      contactPhone,
      contactEmail,
      address,
      operatingHours,
      deliveryTimeSlots,
      serviceableAreas,
      baseDeliveryCharge,
      freeDeliveryAbove
    }
  });
};
