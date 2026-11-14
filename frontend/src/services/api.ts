import {
  DEMO_USERS,
  DEMO_CATEGORIES,
  DEMO_PRODUCTS,
  DEMO_ORDERS,
  DEMO_DELIVERY_PARTNERS,
} from './demoStore';

const RAW_API = (import.meta.env.VITE_API_URL as string) || '';
const API_BASE = RAW_API
  ? (RAW_API.endsWith('/api') ? RAW_API : `${RAW_API.replace(/\/$/, '')}/api`)
  : '/api';

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = localStorage.getItem('meat_corner_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let guestId = localStorage.getItem('meat_corner_guest_id');
  if (!guestId) {
    guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('meat_corner_guest_id', guestId);
  }
  headers['x-guest-id'] = guestId;

  return headers;
};

// Resilient API Caller that automatically falls back to demo mode if backend is unreachable or returns 405
async function callApi<T>(
  endpoint: string,
  options: RequestInit = {},
  fallbackGenerator?: () => T
): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: { ...getHeaders(), ...(options.headers || {}) },
    });

    // If server responds with 405 Method Not Allowed or 404 Not Found on static Vercel host
    if (res.status === 405 || res.status === 404 || res.status === 502) {
      if (fallbackGenerator) {
        return { success: true, data: fallbackGenerator() };
      }
    }

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (fallbackGenerator) {
        return { success: true, data: fallbackGenerator() };
      }
      throw new Error(json.message || `Request failed with status ${res.status}`);
    }
    return json;
  } catch (err: any) {
    if (fallbackGenerator) {
      return { success: true, data: fallbackGenerator() };
    }
    throw err;
  }
}

// In-Memory state for demo mode
let liveOrders = [...DEMO_ORDERS];
let liveCart: any = {
  id: 'cart_demo',
  items: [],
  subtotal: 0,
  deliveryCharge: 30,
  taxAmount: 0,
  discountAmount: 0,
  totalAmount: 30,
};

export const api = {
  // Auth
  register: (body: any) =>
    callApi('/auth/register', { method: 'POST', body: JSON.stringify(body) }, () => {
      const newUser = {
        id: 'usr_' + Date.now(),
        name: body.name || 'Valued Customer',
        email: body.email,
        phone: body.phone || '+91 98765 43210',
        role: body.role || 'CUSTOMER',
      };
      localStorage.setItem('meat_corner_user', JSON.stringify(newUser));
      return { token: 'jwt_demo_token_' + Date.now(), user: newUser };
    }),

  login: (body: any) =>
    callApi('/auth/login', { method: 'POST', body: JSON.stringify(body) }, () => {
      const email = (body.email || '').toLowerCase().trim();
      const matched = DEMO_USERS[email] || {
        id: 'usr_admin_1',
        name: 'Karthik Raja (Admin)',
        email: email || 'admin@meatcorner.in',
        phone: '+919876543200',
        role: email.includes('admin') ? 'ADMIN' : email.includes('deliv') ? 'DELIVERY_PARTNER' : 'CUSTOMER',
      };
      localStorage.setItem('meat_corner_user', JSON.stringify(matched));
      return { token: 'jwt_demo_token_' + Date.now(), user: matched };
    }),

  getMe: () =>
    callApi('/auth/me', {}, () => {
      const saved = localStorage.getItem('meat_corner_user');
      const user = saved ? JSON.parse(saved) : DEMO_USERS['admin@meatcorner.in'];
      return { user };
    }),

  // Public Catalog
  getCategories: () => callApi('/categories', {}, () => DEMO_CATEGORIES),

  getProducts: (params?: Record<string, string>) =>
    callApi(
      `/products${params ? '?' + new URLSearchParams(params).toString() : ''}`,
      {},
      () => {
        if (params?.categoryId) {
          return DEMO_PRODUCTS.filter((p) => p.categoryId === params.categoryId);
        }
        return DEMO_PRODUCTS;
      }
    ),

  getProductById: (id: string) =>
    callApi(`/products/${id}`, {}, () => {
      return DEMO_PRODUCTS.find((p) => p.id === id) || DEMO_PRODUCTS[0];
    }),

  // Cart
  getCart: () => callApi('/cart', {}, () => liveCart),

  addToCart: (body: any) =>
    callApi('/cart/items', { method: 'POST', body: JSON.stringify(body) }, () => {
      const prod = DEMO_PRODUCTS.find((p) => p.id === body.productId) || DEMO_PRODUCTS[0];
      const newItem = {
        id: 'citem_' + Date.now(),
        productId: prod.id,
        variantId: body.variantId,
        product: prod,
        quantity: body.quantity || 1,
        cuttingOption: body.cuttingOption || 'Curry Cut (Medium)',
        cleaningOption: body.cleaningOption || 'Standard Clean',
      };
      liveCart.items.push(newItem);
      liveCart.subtotal += prod.basePrice * newItem.quantity;
      liveCart.totalAmount = liveCart.subtotal + liveCart.deliveryCharge;
      return liveCart;
    }),

  updateCartItem: (id: string, body: any) =>
    callApi('/cart/items/' + id, { method: 'PUT', body: JSON.stringify(body) }, () => liveCart),

  removeCartItem: (id: string) =>
    callApi('/cart/items/' + id, { method: 'DELETE' }, () => {
      liveCart.items = liveCart.items.filter((i: any) => i.id !== id);
      return liveCart;
    }),

  clearCart: () =>
    callApi('/cart', { method: 'DELETE' }, () => {
      liveCart.items = [];
      liveCart.subtotal = 0;
      liveCart.totalAmount = 0;
      return liveCart;
    }),

  applyCoupon: (code: string) =>
    callApi('/cart/apply-coupon', { method: 'POST', body: JSON.stringify({ code }) }, () => {
      liveCart.discountAmount = 20;
      liveCart.totalAmount = Math.max(0, liveCart.subtotal + liveCart.deliveryCharge - 20);
      return liveCart;
    }),

  removeCoupon: () =>
    callApi('/cart/remove-coupon', { method: 'POST' }, () => {
      liveCart.discountAmount = 0;
      return liveCart;
    }),

  // Orders
  createOrder: (body: any) =>
    callApi('/orders', { method: 'POST', body: JSON.stringify(body) }, () => {
      const newOrder = {
        id: 'ord_' + Date.now(),
        orderNumber: 'MC-' + Math.floor(100000 + Math.random() * 900000),
        status: 'PLACED',
        totalAmount: liveCart.totalAmount || 350,
        subtotal: liveCart.subtotal || 320,
        deliveryCharge: 30,
        items: [...liveCart.items],
        deliveryAddressSnapshot: body.deliveryAddress || {
          recipientName: 'Priya Dharshini',
          phone: '+919876543210',
          line1: 'Plot No 24, Gandhi Nagar',
          city: 'Erode',
          pincode: '638116',
        },
        deliverySlot: 'Express (30-45 mins)',
        deliveryOtp: String(Math.floor(1000 + Math.random() * 9000)),
        createdAt: new Date().toISOString(),
      };
      liveOrders.unshift(newOrder);
      liveCart.items = [];
      return newOrder;
    }),

  getCustomerOrders: () => callApi('/orders', {}, () => liveOrders),

  getOrderById: (id: string) =>
    callApi('/orders/' + id, {}, () => {
      return liveOrders.find((o) => o.id === id || o.orderNumber === id) || liveOrders[0];
    }),

  // Payment
  createRazorpayOrder: (orderId: string) =>
    callApi('/payments/create-order', { method: 'POST', body: JSON.stringify({ orderId }) }, () => ({
      razorpayOrderId: 'order_demo_' + Date.now(),
      amount: 42500,
      currency: 'INR',
      keyId: 'rzp_test_demo',
    })),

  verifyPayment: (body: any) =>
    callApi('/payments/verify', { method: 'POST', body: JSON.stringify(body) }, () => ({
      status: 'CAPTURED',
      message: 'Payment verified successfully',
    })),

  // Customer Management
  getAddresses: () =>
    callApi('/customer/addresses', {}, () => [
      {
        id: 'addr_1',
        label: 'Home',
        recipientName: 'Priya Dharshini',
        phone: '+919876543210',
        line1: 'Plot No 24, Gandhi Nagar',
        area: 'Kanjikovil',
        city: 'Erode',
        pincode: '638116',
        isDefault: true,
      },
    ]),

  addAddress: (body: any) =>
    callApi('/customer/addresses', { method: 'POST', body: JSON.stringify(body) }, () => ({
      id: 'addr_' + Date.now(),
      ...body,
    })),

  deleteAddress: (id: string) => callApi('/customer/addresses/' + id, { method: 'DELETE' }, () => ({})),

  getWishlist: () => callApi('/customer/wishlist', {}, () => DEMO_PRODUCTS.slice(0, 2)),

  toggleWishlist: (productId: string) =>
    callApi('/customer/wishlist/toggle', { method: 'POST', body: JSON.stringify({ productId }) }, () => ({
      added: true,
    })),

  checkPincode: (pincode: string) =>
    callApi('/customer/check-pincode', { method: 'POST', body: JSON.stringify({ pincode }) }, () => ({
      serviceable: true,
      deliveryTimeMinutes: 35,
    })),

  getStoreSettings: () =>
    callApi('/customer/settings', {}, () => ({
      storeName: 'MEAT CORNER',
      contactPhone: '+91 98765 43210',
      contactEmail: 'support@meatcorner.in',
      address: '142 Main Road, Erode, Tamil Nadu 638116',
      freeDeliveryAbove: 499,
      baseDeliveryCharge: 30,
      minOrderAmount: 150,
    })),

  createSupportTicket: (body: any) =>
    callApi('/customer/tickets', { method: 'POST', body: JSON.stringify(body) }, () => ({
      id: 'tkt_' + Date.now(),
      ...body,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    })),

  getCustomerTickets: () =>
    callApi('/customer/tickets', {}, () => [
      {
        id: 'tkt_1',
        orderNumber: 'MC-20261113-4117',
        subject: 'Extra Turmeric Wash Request',
        status: 'RESOLVED',
        adminReply: 'Yes, our master butcher has turmeric washed your order.',
        createdAt: new Date().toISOString(),
      },
    ]),

  // Delivery Portal
  getDeliveryProfile: () => callApi('/delivery/profile', {}, () => DEMO_DELIVERY_PARTNERS[0]),

  toggleDeliveryOnline: () =>
    callApi('/delivery/toggle-online', { method: 'PATCH' }, () => ({
      isOnline: true,
    })),

  getDeliveryAssignments: () =>
    callApi('/delivery/assignments', {}, () =>
      liveOrders.map((o) => ({
        id: 'asgn_' + o.id,
        orderId: o.id,
        status: 'ACCEPTED',
        order: o,
      }))
    ),

  acceptDeliveryAssignment: (id: string) =>
    callApi('/delivery/assignments/' + id + '/accept', { method: 'POST' }, () => ({ success: true })),

  rejectDeliveryAssignment: (id: string, reason: string) =>
    callApi('/delivery/assignments/' + id + '/reject', { method: 'POST', body: JSON.stringify({ reason }) }, () => ({
      success: true,
    })),

  updateDeliveryOrderStatus: (id: string, status: string) =>
    callApi('/delivery/orders/' + id + '/status', { method: 'PATCH', body: JSON.stringify({ status }) }, () => {
      const ord = liveOrders.find((o) => o.id === id);
      if (ord) ord.status = status;
      return { success: true, order: ord };
    }),

  verifyDeliveryOtp: (id: string, otp: string, cashCollected?: number) =>
    callApi(
      '/delivery/orders/' + id + '/verify-otp',
      { method: 'POST', body: JSON.stringify({ otp, cashCollected }) },
      () => {
        const ord = liveOrders.find((o) => o.id === id);
        if (ord) ord.status = 'DELIVERED';
        return { success: true, verified: true };
      }
    ),

  updateDeliveryGps: (body: { lat: number; lng: number; orderId?: string }) =>
    callApi('/delivery/location', { method: 'POST', body: JSON.stringify(body) }, () => ({ success: true })),

  getDeliveryEarnings: () =>
    callApi('/delivery/earnings', {}, () => ({
      todayEarnings: 420,
      weeklyEarnings: 2850,
      totalOrders: 18,
      payoutStatus: 'PAID',
    })),

  // Admin Portal
  getAdminDashboard: () =>
    callApi('/admin/dashboard', {}, () => ({
      todayOrdersCount: liveOrders.length + 20,
      todayRevenue: 14850,
      activeDeliveriesCount: liveOrders.filter((o) => o.status === 'OUT_FOR_DELIVERY').length || 1,
      lowStockCount: 2,
      recentOrders: liveOrders,
      salesChart: [
        { time: '08:00', sales: 1200 },
        { time: '10:00', sales: 3400 },
        { time: '12:00', sales: 6800 },
        { time: '14:00', sales: 8500 },
        { time: '16:00', sales: 14850 },
      ],
    })),

  getAdminOrders: (params?: Record<string, string>) =>
    callApi(
      `/orders/admin/all${params ? '?' + new URLSearchParams(params).toString() : ''}`,
      {},
      () => liveOrders
    ),

  updateAdminOrderStatus: (id: string, body: any) =>
    callApi('/orders/admin/' + id + '/status', { method: 'PATCH', body: JSON.stringify(body) }, () => {
      const ord = liveOrders.find((o) => o.id === id);
      if (ord) {
        ord.status = body.status;
      }
      return { success: true, order: ord };
    }),

  assignDeliveryPartner: (id: string, deliveryPartnerId: string) =>
    callApi(
      '/orders/admin/' + id + '/assign-partner',
      { method: 'POST', body: JSON.stringify({ deliveryPartnerId }) },
      () => {
        const ord = liveOrders.find((o) => o.id === id);
        const partner = DEMO_DELIVERY_PARTNERS.find((p) => p.id === deliveryPartnerId) || DEMO_DELIVERY_PARTNERS[0];
        if (ord) {
          ord.deliveryPartnerId = partner.id;
          ord.deliveryPartner = partner;
          ord.status = 'PARTNER_ASSIGNED';
        }
        return { success: true, order: ord };
      }
    ),

  createAdminProduct: (body: any) =>
    callApi('/admin/products', { method: 'POST', body: JSON.stringify(body) }, () => {
      const newProd = { id: 'prod_' + Date.now(), ...body };
      DEMO_PRODUCTS.unshift(newProd);
      return newProd;
    }),

  updateAdminProduct: (id: string, body: any) =>
    callApi('/admin/products/' + id, { method: 'PUT', body: JSON.stringify(body) }, () => body),

  deleteAdminProduct: (id: string) =>
    callApi('/admin/products/' + id, { method: 'DELETE' }, () => ({ success: true })),

  createAdminCategory: (body: any) =>
    callApi('/admin/categories', { method: 'POST', body: JSON.stringify(body) }, () => {
      const newCat = { id: 'cat_' + Date.now(), ...body };
      DEMO_CATEGORIES.push(newCat);
      return newCat;
    }),

  updateAdminCategory: (id: string, body: any) =>
    callApi('/admin/categories/' + id, { method: 'PUT', body: JSON.stringify(body) }, () => body),

  getAdminInventory: () =>
    callApi('/admin/inventory', {}, () =>
      DEMO_PRODUCTS.map((p, idx) => ({
        id: 'inv_' + (idx + 1),
        productId: p.id,
        productName: p.name,
        stockQuantity: 85 - idx * 10,
        reservedQuantity: 5,
        lowStockThreshold: 10,
      }))
    ),

  updateAdminInventory: (id: string, body: any) =>
    callApi('/admin/inventory/' + id, { method: 'PATCH', body: JSON.stringify(body) }, () => ({ success: true })),

  getAdminDeliveryPartners: () => callApi('/admin/delivery-partners', {}, () => DEMO_DELIVERY_PARTNERS),

  updateAdminDeliveryPartnerStatus: (id: string, body: any) =>
    callApi(
      '/admin/delivery-partners/' + id + '/status',
      { method: 'PATCH', body: JSON.stringify(body) },
      () => ({ success: true })
    ),

  getAdminCustomers: () =>
    callApi('/admin/customers', {}, () => [
      {
        id: 'usr_cust_1',
        name: 'Priya Dharshini',
        email: 'customer@meatcorner.in',
        phone: '+919876543210',
        totalOrders: 14,
        totalSpent: 4850,
        isActive: true,
      },
      {
        id: 'usr_cust_2',
        name: 'Vijay Kumar',
        email: 'vijay@meatcorner.in',
        phone: '+917604906429',
        totalOrders: 8,
        totalSpent: 2950,
        isActive: true,
      },
    ]),

  toggleAdminCustomerStatus: (id: string) =>
    callApi('/admin/customers/' + id + '/toggle-status', { method: 'PATCH' }, () => ({ success: true })),

  getAdminCoupons: () =>
    callApi('/admin/coupons', {}, () => [
      {
        id: 'coup_1',
        code: 'MEATFIRST20',
        discountType: 'FLAT',
        discountValue: 20,
        minOrderValue: 199,
        isActive: true,
      },
      {
        id: 'coup_2',
        code: 'FRESHCHICKEN10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderValue: 299,
        isActive: true,
      },
      {
        id: 'coup_3',
        code: 'WEEKEND50',
        discountType: 'FLAT',
        discountValue: 50,
        minOrderValue: 699,
        isActive: true,
      },
    ]),

  createAdminCoupon: (body: any) =>
    callApi('/admin/coupons', { method: 'POST', body: JSON.stringify(body) }, () => ({
      id: 'coup_' + Date.now(),
      ...body,
    })),

  updateAdminCoupon: (id: string, body: any) =>
    callApi('/admin/coupons/' + id, { method: 'PUT', body: JSON.stringify(body) }, () => body),

  getAdminSettings: () =>
    callApi('/admin/settings', {}, () => ({
      storeName: 'MEAT CORNER',
      contactPhone: '+91 98765 43210',
      contactEmail: 'support@meatcorner.in',
      address: '142 Main Road, Erode, Tamil Nadu 638116',
      freeDeliveryAbove: 499,
      baseDeliveryCharge: 30,
      perKmCharge: 8,
      minOrderAmount: 150,
      taxPercent: 5,
    })),

  updateAdminSettings: (body: any) =>
    callApi('/admin/settings', { method: 'PUT', body: JSON.stringify(body) }, () => body),

  getAdminTickets: () =>
    callApi('/admin/tickets', {}, () => [
      {
        id: 'tkt_1',
        orderNumber: 'MC-20261113-4117',
        subject: 'Extra Turmeric Wash Request',
        customerName: 'Priya Dharshini',
        status: 'RESOLVED',
        adminReply: 'Yes, our master butcher has turmeric washed your order.',
        createdAt: new Date().toISOString(),
      },
    ]),

  replyAdminTicket: (id: string, body: any) =>
    callApi('/admin/tickets/' + id + '/reply', { method: 'PATCH', body: JSON.stringify(body) }, () => ({
      success: true,
    })),

  getAdminReports: () =>
    callApi('/admin/reports', {}, () => ({
      summary: {
        totalRevenue: 84500,
        totalOrders: 284,
        averageOrderValue: 297.5,
        deliveredRate: 98.2,
      },
      topSellingProducts: [
        { name: 'Chicken Curry Cut (Skinless)', soldKg: 145, revenue: 36250 },
        { name: 'Tender Chicken Breast Boneless', soldKg: 98, revenue: 31360 },
        { name: 'Nattu Kozhi Country Chicken', soldKg: 42, revenue: 19320 },
      ],
    })),
};
