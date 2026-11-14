const API_BASE = '/api';

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

const handleResponse = async (res: Response) => {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || `Request failed with status ${res.status}`);
  }
  return json;
};

export const api = {
  // Auth
  register: (body: any) =>
    fetch(`${API_BASE}/auth/register`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  login: (body: any) =>
    fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  getMe: () =>
    fetch(`${API_BASE}/auth/me`, { headers: getHeaders() }).then(handleResponse),

  // Public Catalog
  getCategories: () =>
    fetch(`${API_BASE}/categories`, { headers: getHeaders() }).then(handleResponse),
  getProducts: (params?: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/products${query ? `?${query}` : ''}`, { headers: getHeaders() }).then(handleResponse);
  },
  getProductById: (id: string) =>
    fetch(`${API_BASE}/products/${id}`, { headers: getHeaders() }).then(handleResponse),

  // Cart
  getCart: () =>
    fetch(`${API_BASE}/cart`, { headers: getHeaders() }).then(handleResponse),
  addToCart: (body: any) =>
    fetch(`${API_BASE}/cart/items`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  updateCartItem: (id: string, body: any) =>
    fetch(`${API_BASE}/cart/items/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  removeCartItem: (id: string) =>
    fetch(`${API_BASE}/cart/items/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
  clearCart: () =>
    fetch(`${API_BASE}/cart`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
  applyCoupon: (code: string) =>
    fetch(`${API_BASE}/cart/apply-coupon`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ code }) }).then(handleResponse),
  removeCoupon: () =>
    fetch(`${API_BASE}/cart/remove-coupon`, { method: 'POST', headers: getHeaders() }).then(handleResponse),

  // Orders
  createOrder: (body: any) =>
    fetch(`${API_BASE}/orders`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  getCustomerOrders: () =>
    fetch(`${API_BASE}/orders`, { headers: getHeaders() }).then(handleResponse),
  getOrderById: (id: string) =>
    fetch(`${API_BASE}/orders/${id}`, { headers: getHeaders() }).then(handleResponse),

  // Payment
  createRazorpayOrder: (orderId: string) =>
    fetch(`${API_BASE}/payments/create-order`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ orderId }) }).then(handleResponse),
  verifyPayment: (body: any) =>
    fetch(`${API_BASE}/payments/verify`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),

  // Customer Management
  getAddresses: () =>
    fetch(`${API_BASE}/customer/addresses`, { headers: getHeaders() }).then(handleResponse),
  addAddress: (body: any) =>
    fetch(`${API_BASE}/customer/addresses`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  deleteAddress: (id: string) =>
    fetch(`${API_BASE}/customer/addresses/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
  getWishlist: () =>
    fetch(`${API_BASE}/customer/wishlist`, { headers: getHeaders() }).then(handleResponse),
  toggleWishlist: (productId: string) =>
    fetch(`${API_BASE}/customer/wishlist/toggle`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ productId }) }).then(handleResponse),
  checkPincode: (pincode: string) =>
    fetch(`${API_BASE}/customer/check-pincode`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ pincode }) }).then(handleResponse),
  getStoreSettings: () =>
    fetch(`${API_BASE}/customer/settings`, { headers: getHeaders() }).then(handleResponse),
  createSupportTicket: (body: any) =>
    fetch(`${API_BASE}/customer/tickets`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  getCustomerTickets: () =>
    fetch(`${API_BASE}/customer/tickets`, { headers: getHeaders() }).then(handleResponse),

  // Delivery Portal
  getDeliveryProfile: () =>
    fetch(`${API_BASE}/delivery/profile`, { headers: getHeaders() }).then(handleResponse),
  toggleDeliveryOnline: () =>
    fetch(`${API_BASE}/delivery/toggle-online`, { method: 'PATCH', headers: getHeaders() }).then(handleResponse),
  getDeliveryAssignments: () =>
    fetch(`${API_BASE}/delivery/assignments`, { headers: getHeaders() }).then(handleResponse),
  acceptDeliveryAssignment: (id: string) =>
    fetch(`${API_BASE}/delivery/assignments/${id}/accept`, { method: 'POST', headers: getHeaders() }).then(handleResponse),
  rejectDeliveryAssignment: (id: string, reason: string) =>
    fetch(`${API_BASE}/delivery/assignments/${id}/reject`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ reason }) }).then(handleResponse),
  updateDeliveryOrderStatus: (id: string, status: string) =>
    fetch(`${API_BASE}/delivery/orders/${id}/status`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify({ status }) }).then(handleResponse),
  verifyDeliveryOtp: (id: string, otp: string, cashCollected?: number) =>
    fetch(`${API_BASE}/delivery/orders/${id}/verify-otp`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ otp, cashCollected }) }).then(handleResponse),
  updateDeliveryGps: (body: { lat: number; lng: number; orderId?: string }) =>
    fetch(`${API_BASE}/delivery/location`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  getDeliveryEarnings: () =>
    fetch(`${API_BASE}/delivery/earnings`, { headers: getHeaders() }).then(handleResponse),

  // Admin Portal
  getAdminDashboard: () =>
    fetch(`${API_BASE}/admin/dashboard`, { headers: getHeaders() }).then(handleResponse),
  getAdminOrders: (params?: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/orders/admin/all${query ? `?${query}` : ''}`, { headers: getHeaders() }).then(handleResponse);
  },
  updateAdminOrderStatus: (id: string, body: any) =>
    fetch(`${API_BASE}/orders/admin/${id}/status`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  assignDeliveryPartner: (id: string, deliveryPartnerId: string) =>
    fetch(`${API_BASE}/orders/admin/${id}/assign-partner`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ deliveryPartnerId }) }).then(handleResponse),
  createAdminProduct: (body: any) =>
    fetch(`${API_BASE}/admin/products`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  updateAdminProduct: (id: string, body: any) =>
    fetch(`${API_BASE}/admin/products/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  deleteAdminProduct: (id: string) =>
    fetch(`${API_BASE}/admin/products/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
  createAdminCategory: (body: any) =>
    fetch(`${API_BASE}/admin/categories`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  updateAdminCategory: (id: string, body: any) =>
    fetch(`${API_BASE}/admin/categories/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  getAdminInventory: () =>
    fetch(`${API_BASE}/admin/inventory`, { headers: getHeaders() }).then(handleResponse),
  updateAdminInventory: (id: string, body: any) =>
    fetch(`${API_BASE}/admin/inventory/${id}`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  getAdminDeliveryPartners: () =>
    fetch(`${API_BASE}/admin/delivery-partners`, { headers: getHeaders() }).then(handleResponse),
  updateAdminDeliveryPartnerStatus: (id: string, body: any) =>
    fetch(`${API_BASE}/admin/delivery-partners/${id}/status`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  getAdminCustomers: () =>
    fetch(`${API_BASE}/admin/customers`, { headers: getHeaders() }).then(handleResponse),
  toggleAdminCustomerStatus: (id: string) =>
    fetch(`${API_BASE}/admin/customers/${id}/toggle-status`, { method: 'PATCH', headers: getHeaders() }).then(handleResponse),
  getAdminCoupons: () =>
    fetch(`${API_BASE}/admin/coupons`, { headers: getHeaders() }).then(handleResponse),
  createAdminCoupon: (body: any) =>
    fetch(`${API_BASE}/admin/coupons`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  updateAdminCoupon: (id: string, body: any) =>
    fetch(`${API_BASE}/admin/coupons/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  getAdminSettings: () =>
    fetch(`${API_BASE}/admin/settings`, { headers: getHeaders() }).then(handleResponse),
  updateAdminSettings: (body: any) =>
    fetch(`${API_BASE}/admin/settings`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  getAdminTickets: () =>
    fetch(`${API_BASE}/admin/tickets`, { headers: getHeaders() }).then(handleResponse),
  replyAdminTicket: (id: string, body: any) =>
    fetch(`${API_BASE}/admin/tickets/${id}/reply`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  getAdminReports: () =>
    fetch(`${API_BASE}/admin/reports`, { headers: getHeaders() }).then(handleResponse)
};
