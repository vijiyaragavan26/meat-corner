export type UserRole = 'CUSTOMER' | 'ADMIN' | 'DELIVERY_PARTNER';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  label: string;
  weightGrams: number;
  price: number;
  compareAtPrice?: number | null;
  sku: string;
  isActive: boolean;
}

export interface InventoryItem {
  id: string;
  productId: string;
  variantId: string;
  stockQuantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  images: string[];
  freshnessInfo: string;
  cuttingOptions: string[];
  cleaningOptions: string[];
  basePrice: number;
  discountPercent: number;
  isBestSeller: boolean;
  isTodaySpecial: boolean;
  isRecommended: boolean;
  isActive: boolean;
  avgRating: number;
  reviewCount: number;
  category?: Category;
  variants?: ProductVariant[];
  inventory?: InventoryItem[];
  related?: Product[];
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  landmark?: string | null;
  area: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
  isDefault: boolean;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  variantId: string;
  quantity: number;
  cuttingOption?: string;
  cleaningOption?: string;
  product?: Product;
  variant?: ProductVariant;
}

export interface Cart {
  id: string;
  userId: string;
  couponCode?: string | null;
  items: CartItem[];
  pricing: {
    subtotal: number;
    deliveryFee: number;
    discount: number;
    tax: number;
    total: number;
    appliedCoupon?: any;
    freeDeliveryThreshold: number;
    freeDeliveryRemaining: number;
  };
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  productName: string;
  variantLabel: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  cuttingOption?: string;
  cleaningOption?: string;
}

export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'PARTNER_ASSIGNED'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REJECTED';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  addressId?: string;
  deliveryAddressSnapshot: Address;
  deliveryPartnerId?: string | null;
  deliveryPartnerName?: string | null;
  deliveryPartnerPhone?: string | null;
  status: OrderStatus;
  paymentMethod: 'RAZORPAY' | 'COD';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  subtotal: number;
  deliveryCharge: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  couponCode?: string | null;
  deliveryInstructions?: string;
  deliverySlot: string;
  deliveryOtp: string;
  distanceKm: number;
  estimatedMinutes: number;
  rejectionReason?: string | null;
  cancellationReason?: string | null;
  confirmedAt?: string | null;
  preparedAt?: string | null;
  pickedUpAt?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
  items: OrderItem[];
  partnerLocation?: {
    lat: number;
    lng: number;
    recordedAt?: string;
  } | null;
  storeLocation?: {
    lat: number;
    lng: number;
    name: string;
    address: string;
  };
}

export interface DeliveryPartner {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  drivingLicenseNo: string;
  vehicleType: string;
  vehicleNumber: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string | null;
  isOnline: boolean;
  isAvailable: boolean;
  currentLat?: number | null;
  currentLng?: number | null;
  commissionRate: number;
  totalDeliveries: number;
  rating: number;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: string;
}

export interface StoreSettings {
  storeName: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  operatingHours: {
    openTime: string;
    closeTime: string;
    isOpenAllDays: boolean;
  };
  deliveryTimeSlots: string[];
  serviceableAreas: Array<{
    id: string;
    city: string;
    name: string;
    state: string;
    isActive: boolean;
    pincodes: string[];
  }>;
  baseDeliveryCharge: number;
  freeDeliveryAbove: number;
}

export interface SupportTicket {
  id: string;
  userId: string;
  orderNumber?: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  adminReply?: string;
  createdAt: string;
  updatedAt?: string;
}
