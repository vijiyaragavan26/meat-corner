import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, Coupon, StoreSettings } from '../db/dataStore';
import { AuthenticatedRequest } from '../middleware/auth';

export const getDashboardStats = (req: AuthenticatedRequest, res: Response) => {
  const orders = db.orders;
  const today = new Date().toISOString().slice(0, 10);

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'PAID' || o.status === 'DELIVERED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const todayOrders = orders.filter((o) => o.createdAt.startsWith(today));
  const todayRevenue = todayOrders
    .filter((o) => o.paymentStatus === 'PAID' || o.status === 'DELIVERED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrders = orders.filter((o) => ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP'].includes(o.status)).length;
  const completedOrders = orders.filter((o) => o.status === 'DELIVERED').length;
  const cancelledOrders = orders.filter((o) => o.status === 'CANCELLED' || o.status === 'REJECTED').length;

  const totalCustomers = db.users.filter((u) => u.role === 'CUSTOMER').length;
  const activePartners = db.deliveryPartners.filter((dp) => dp.isOnline && dp.approvalStatus === 'APPROVED').length;

  const lowStockItems = db.inventory.filter((i) => i.stockQuantity <= i.lowStockThreshold).length;

  const avgOrderValue = completedOrders > 0 ? Math.round(totalRevenue / completedOrders) : 0;

  // Status breakdown
  const statusDistribution: Record<string, number> = {};
  orders.forEach((o) => {
    statusDistribution[o.status] = (statusDistribution[o.status] || 0) + 1;
  });

  // Recent 7 days revenue trend
  const dailyTrends: Array<{ date: string; revenue: number; orders: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayOrders = orders.filter((o) => o.createdAt.startsWith(dateStr));
    const dayRev = dayOrders
      .filter((o) => o.paymentStatus === 'PAID' || o.status === 'DELIVERED')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    dailyTrends.push({
      date: dateStr,
      revenue: dayRev,
      orders: dayOrders.length
    });
  }

  return res.json({
    success: true,
    data: {
      metrics: {
        totalRevenue,
        todayRevenue,
        totalOrders: orders.length,
        todayOrders: todayOrders.length,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        totalCustomers,
        activePartners,
        lowStockItems,
        avgOrderValue
      },
      statusDistribution,
      dailyTrends,
      recentOrders: orders.slice(0, 6)
    }
  });
};

export const getInventory = (req: AuthenticatedRequest, res: Response) => {
  const items = db.inventory.map((inv) => {
    const product = db.products.find((p) => p.id === inv.productId);
    const variant = db.variants.find((v) => v.id === inv.variantId);
    return {
      ...inv,
      productName: product?.name || 'Unknown Chicken Cut',
      category: db.categories.find((c) => c.id === product?.categoryId)?.name || 'General',
      variantLabel: variant?.label || 'Standard Pack',
      availableQuantity: Math.max(0, inv.stockQuantity - inv.reservedQuantity),
      isLowStock: inv.stockQuantity <= inv.lowStockThreshold
    };
  });

  return res.json({ success: true, count: items.length, data: items });
};

export const updateInventoryStock = (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { stockQuantity, lowStockThreshold } = req.body;

  const item = db.inventory.find((i) => i.id === id || i.variantId === id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Inventory item not found' });
  }

  if (stockQuantity !== undefined) item.stockQuantity = Number(stockQuantity);
  if (lowStockThreshold !== undefined) item.lowStockThreshold = Number(lowStockThreshold);
  item.updatedAt = new Date().toISOString();

  db.saveToDisk();

  return res.json({ success: true, message: 'Inventory updated successfully', data: item });
};

export const getDeliveryPartners = (req: AuthenticatedRequest, res: Response) => {
  return res.json({ success: true, count: db.deliveryPartners.length, data: db.deliveryPartners });
};

export const updateDeliveryPartnerStatus = (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { approvalStatus, rejectionReason, commissionRate } = req.body;

  const partner = db.deliveryPartners.find((dp) => dp.id === id);
  if (!partner) {
    return res.status(404).json({ success: false, message: 'Delivery partner not found' });
  }

  if (approvalStatus) partner.approvalStatus = approvalStatus;
  if (rejectionReason !== undefined) partner.rejectionReason = rejectionReason;
  if (commissionRate !== undefined) partner.commissionRate = Number(commissionRate);
  partner.updatedAt = new Date().toISOString();

  db.saveToDisk();

  return res.json({
    success: true,
    message: `Delivery partner ${partner.fullName} updated to ${partner.approvalStatus}`,
    data: partner
  });
};

export const getCustomers = (req: AuthenticatedRequest, res: Response) => {
  const customers = db.users
    .filter((u) => u.role === 'CUSTOMER')
    .map((c) => {
      const customerOrders = db.orders.filter((o) => o.customerId === c.id);
      const totalSpent = customerOrders
        .filter((o) => o.paymentStatus === 'PAID' || o.status === 'DELIVERED')
        .reduce((sum, o) => sum + o.totalAmount, 0);

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        isActive: c.isActive,
        createdAt: c.createdAt,
        totalOrders: customerOrders.length,
        totalSpent
      };
    });

  return res.json({ success: true, count: customers.length, data: customers });
};

export const toggleCustomerStatus = (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const customer = db.users.find((u) => u.id === id);
  if (!customer) {
    return res.status(404).json({ success: false, message: 'Customer not found' });
  }

  customer.isActive = !customer.isActive;
  customer.updatedAt = new Date().toISOString();
  db.saveToDisk();

  return res.json({
    success: true,
    message: `Customer ${customer.name} is now ${customer.isActive ? 'Active' : 'Blocked'}`,
    data: customer
  });
};

// Coupons
export const getCoupons = (req: AuthenticatedRequest, res: Response) => {
  return res.json({ success: true, count: db.coupons.length, data: db.coupons });
};

export const createCoupon = (req: AuthenticatedRequest, res: Response) => {
  const { code, description, discountType, discountValue, minOrderValue, maxDiscount, usageLimit, expiresAt } = req.body;

  if (!code || !discountValue) {
    return res.status(400).json({ success: false, message: 'Coupon code and discount value are required' });
  }

  const existing = db.coupons.find((c) => c.code.toUpperCase() === code.toUpperCase().trim());
  if (existing) {
    return res.status(400).json({ success: false, message: 'A coupon with this code already exists' });
  }

  const newCoupon: Coupon = {
    id: `cpn_${uuidv4().substring(0, 8)}`,
    code: code.toUpperCase().trim(),
    description: description || 'Special Meat Corner promotional discount',
    discountType: discountType || 'PERCENTAGE',
    discountValue: Number(discountValue),
    minOrderValue: Number(minOrderValue || 0),
    maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
    usageLimit: Number(usageLimit || 500),
    usedCount: 0,
    startsAt: new Date().toISOString(),
    expiresAt: expiresAt || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true
  };

  db.coupons.push(newCoupon);
  db.saveToDisk();

  return res.status(201).json({ success: true, message: 'Coupon created successfully', data: newCoupon });
};

export const updateCoupon = (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const coupon = db.coupons.find((c) => c.id === id);
  if (!coupon) {
    return res.status(404).json({ success: false, message: 'Coupon not found' });
  }

  Object.assign(coupon, req.body);
  db.saveToDisk();

  return res.json({ success: true, message: 'Coupon updated successfully', data: coupon });
};

// Store Settings
export const getAdminSettings = (req: AuthenticatedRequest, res: Response) => {
  return res.json({ success: true, data: db.storeSettings });
};

export const updateAdminSettings = (req: AuthenticatedRequest, res: Response) => {
  Object.assign(db.storeSettings, req.body, { updatedAt: new Date().toISOString() });
  db.saveToDisk();
  return res.json({ success: true, message: 'Store settings updated successfully', data: db.storeSettings });
};

// Support Tickets
export const getTickets = (req: AuthenticatedRequest, res: Response) => {
  const tickets = db.supportTickets.map((t) => {
    const user = db.users.find((u) => u.id === t.userId);
    return {
      ...t,
      userName: user?.name || 'Customer',
      userEmail: user?.email || '',
      userPhone: user?.phone || ''
    };
  });
  return res.json({ success: true, count: tickets.length, data: tickets });
};

export const replyTicket = (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { adminReply, status = 'RESOLVED' } = req.body;

  const ticket = db.supportTickets.find((t) => t.id === id);
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Support ticket not found' });
  }

  ticket.adminReply = adminReply;
  ticket.status = status;
  ticket.updatedAt = new Date().toISOString();

  db.saveToDisk();

  return res.json({ success: true, message: 'Support reply saved successfully', data: ticket });
};

// Reports
export const getReports = (req: AuthenticatedRequest, res: Response) => {
  const { period = 'monthly' } = req.query;
  const orders = db.orders;

  const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
  orders.forEach((o) => {
    if (o.status !== 'CANCELLED' && o.status !== 'REJECTED') {
      o.items.forEach((item) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.productName, quantity: 0, revenue: 0 };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.totalPrice;
      });
    }
  });

  const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue);

  return res.json({
    success: true,
    data: {
      period,
      totalOrders: orders.length,
      topProducts,
      ordersSummary: orders.map((o) => ({
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        date: o.createdAt.slice(0, 10),
        itemsCount: o.items.length,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        status: o.status,
        totalAmount: o.totalAmount
      }))
    }
  });
};
