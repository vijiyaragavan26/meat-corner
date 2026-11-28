import fs from 'fs';
import path from 'path';
import { supabase } from '../config/supabase';

// High-fidelity types matching the database schema
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'CUSTOMER' | 'ADMIN' | 'DELIVERY_PARTNER';
  avatarUrl?: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  productId: string;
  variantId: string;
  stockQuantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
  updatedAt: string;
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
  gstPercent?: number;
  deliveryFee?: number;
  isBestSeller: boolean;
  isTodaySpecial: boolean;
  isRecommended: boolean;
  isActive: boolean;
  avgRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  variants?: ProductVariant[];
  inventory?: InventoryItem[];
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
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: string;
  userId: string;
  couponCode?: string | null;
  items: CartItem[];
  updatedAt: string;
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
  imageUrl?: string;
  productImage?: string;
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

export type PaymentStatus = 'PENDING' | 'PAID' | 'COD_COLLECTED' | 'REFUND' | 'REFUNDED' | 'FAILED' | 'PARTIALLY_REFUNDED';

export interface PaymentDetails {
  gateway: 'RAZORPAY' | 'COD';
  transactionId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount?: number;
  paidAt?: string;
}

export interface CodDetails {
  status: 'PENDING' | 'COLLECTED' | 'SETTLED';
  amountExpected?: number;
  amountCollected?: number;
  collectedAt?: string;
  collectedByPartnerId?: string;
  collectedByPartnerName?: string;
  settledAt?: string;
  settledByAdminId?: string;
  settlementNotes?: string;
}

export interface OrderAuditLog {
  id?: string;
  event: string;
  title: string;
  timestamp: string;
  actor: string;
  details?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  idempotencyKey?: string;
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
  paymentStatus: PaymentStatus;
  paymentDetails?: PaymentDetails;
  codDetails?: CodDetails;
  timeline?: OrderAuditLog[];
  subtotal: number;
  deliveryCharge: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  couponCode?: string | null;
  deliveryInstructions?: string;
  deliverySlot: string;
  deliveryOtp: string;
  deliveryOtpAttempts?: number;
  deliveryOtpVerifiedAt?: string | null;
  distanceKm: number;
  estimatedMinutes: number;
  rejectionReason?: string | null;
  cancellationReason?: string | null;
  confirmedAt?: string | null;
  preparedAt?: string | null;
  pickedUpAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface DeliveryPartner {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  drivingLicenseNo: string;
  drivingLicenseDoc?: string | null;
  vehicleType: string;
  vehicleNumber: string;
  idProofDoc?: string | null;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string | null;
  isOnline: boolean;
  isAvailable: boolean;
  currentLat?: number | null;
  currentLng?: number | null;
  lastLocationAt?: string | null;
  commissionRate: number;
  totalDeliveries: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryAssignment {
  id: string;
  orderId: string;
  deliveryPartnerId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'PICKED_UP' | 'COMPLETED' | 'CANCELLED';
  rejectionReason?: string;
  assignedAt: string;
  respondedAt?: string;
  pickedUpAt?: string;
  completedAt?: string;
}

export interface DeliveryLocation {
  id: string;
  orderId: string;
  deliveryPartnerId: string;
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  recordedAt: string;
}

export interface DeliveryEarning {
  id: string;
  deliveryPartnerId: string;
  orderId: string;
  baseFee: number;
  distanceBonus: number;
  commissionAmount: number;
  tipAmount: number;
  totalEarning: number;
  payoutStatus: 'PENDING' | 'PAID';
  paidAt?: string | null;
  createdAt: string;
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
  productId?: string | null;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
}

export interface StoreSettings {
  id: string;
  storeName: string;
  logoUrl?: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  storeLat: number;
  storeLng: number;
  serviceableAreas: Array<{
    id: string;
    city: string;
    name: string;
    state: string;
    isActive: boolean;
    pincodes: string[];
    radiusKm: number;
    centerLat: number;
    centerLng: number;
  }>;
  baseDeliveryCharge: number;
  perKmCharge: number;
  freeDeliveryAbove: number;
  minOrderAmount: number;
  taxPercent: number;
  operatingHours: {
    openTime: string;
    closeTime: string;
    isOpenAllDays: boolean;
  };
  deliveryTimeSlots: string[];
  paymentSettings: {
    enableCod: boolean;
    enableRazorpay: boolean;
  };
  updatedAt: string;
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
  updatedAt: string;
}

// Initial Data Seeds
const initialUsers: User[] = [
  {
    id: 'usr_admin_1',
    name: 'Vijay',
    email: 'vijiyaragavan26@gmail.com',
    phone: '+917604906429',
    passwordHash: '$2a$10$Xtbdpup09gR2Tl5Sd56urOqLsTLc7ERthwXETKoy3v0rn/Yj.YGpe', // Vijay@123
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    isVerified: true,
    isActive: true,
    createdAt: '2026-11-10T09:05:15.763Z',
    updatedAt: '2026-11-13T10:46:28.000Z'
  },
  {
    id: 'usr_cust_1',
    name: 'Priya Dharshini',
    email: 'customer@meatcorner.in',
    phone: '+919876543210',
    passwordHash: '$2a$10$bY6Il8so6Aewe3tf46xXM.Qgqeo15sySonatpO8Y5kXR.dRORm8bq', // Customer@123
    role: 'CUSTOMER',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    isVerified: true,
    isActive: true,
    createdAt: '2026-11-10T09:05:15.763Z',
    updatedAt: '2026-11-13T10:46:28.000Z'
  },
  {
    id: 'usr_del_1',
    name: 'Poopesh',
    email: 'mboopesh60@gmail.com',
    phone: '+919360761595',
    passwordHash: '$2a$10$OZ8CWFL86xgF2cDxH0dc0u3uneDUPkDRDQgpq105ewOZgcZy6G7ey', // Poopesh@123
    role: 'DELIVERY_PARTNER',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    isVerified: true,
    isActive: true,
    createdAt: '2026-11-10T09:05:15.763Z',
    updatedAt: '2026-11-13T10:46:28.000Z'
  }
];

const initialCategories: Category[] = [
  {
    id: 'cat_curry',
    name: 'Curry Cut Chicken',
    slug: 'curry-cut-chicken',
    description: 'Evenly sized bone-in chicken pieces perfect for gravies, salna, and traditional curries.',
    imageUrl: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=600&q=80',
    sortOrder: 1,
    isActive: true,
    createdAt: '2026-11-10T09:05:15.763Z',
    updatedAt: '2026-11-13T10:46:28.000Z'
  },
  {
    id: 'cat_skinless',
    name: 'Skinless Chicken',
    slug: 'skinless-chicken',
    description: 'Tender cuts with skin neatly removed for health-conscious and lean meat recipes.',
    imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=80',
    sortOrder: 2,
    isActive: true,
    createdAt: '2026-11-10T09:05:15.763Z',
    updatedAt: '2026-11-13T10:46:28.000Z'
  },
  {
    id: 'cat_boneless',
    name: 'Boneless Chicken',
    slug: 'boneless-chicken',
    description: '100% boneless fresh chicken cubes, ideal for butter chicken, tikka, and stir-fries.',
    imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=80',
    sortOrder: 3,
    isActive: true,
    createdAt: '2026-11-10T09:05:15.763Z',
    updatedAt: '2026-11-13T10:46:28.000Z'
  },
  {
    id: 'cat_breast',
    name: 'Chicken Breast',
    slug: 'chicken-breast',
    description: 'High-protein, tender, succulent fillets cut daily from healthy grain-fed chickens.',
    imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=80',
    sortOrder: 4,
    isActive: true,
    createdAt: '2026-11-10T09:05:15.763Z',
    updatedAt: '2026-11-13T10:46:28.000Z'
  },
  {
    id: 'cat_leg',
    name: 'Chicken Leg',
    slug: 'chicken-leg',
    description: 'Juicy drumsticks and whole leg quarters bursting with flavour for grills & roasts.',
    imageUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=600&q=80',
    sortOrder: 5,
    isActive: true,
    createdAt: '2026-11-10T09:05:15.763Z',
    updatedAt: '2026-11-13T10:46:28.000Z'
  },
  {
    id: 'cat_wings',
    name: 'Chicken Wings',
    slug: 'chicken-wings',
    description: 'Crispy wingettes and drumettes ideal for hot wings, barbecue, and deep frying.',
    imageUrl: 'https://images.unsplash.com/photo-1527477321055-43615b6294a5?auto=format&fit=crop&w=600&q=80',
    sortOrder: 6,
    isActive: true,
    createdAt: '2026-11-10T09:05:15.763Z',
    updatedAt: '2026-11-13T10:46:28.000Z'
  },
  {
    id: 'cat_whole',
    name: 'Whole Chicken',
    slug: 'whole-chicken',
    description: 'Whole farm-raised broiler & country chicken dressed and cleaned to perfection.',
    imageUrl: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=600&q=80',
    sortOrder: 7,
    isActive: true,
    createdAt: '2026-11-10T09:05:15.763Z',
    updatedAt: '2026-11-13T10:46:28.000Z'
  },
  {
    id: 'cat_liver_gizzard',
    name: 'Chicken Liver & Gizzard',
    slug: 'chicken-liver-gizzard',
    description: 'Iron-rich, nutritious, meticulously cleaned fresh organ cuts for traditional roasts.',
    imageUrl: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=600&q=80',
    sortOrder: 8,
    isActive: true,
    createdAt: '2026-11-10T09:05:15.763Z',
    updatedAt: '2026-11-13T10:46:28.000Z'
  }
];

const initialProducts: Product[] = [
  {
    id: 'prod_1',
    categoryId: 'cat_curry',
    name: 'Chicken Curry Cut (Skinless)',
    slug: 'chicken-curry-cut-skinless',
    description: 'Fresh, juicy, bone-in chicken cuts trimmed meticulously without skin. Perfect balance of succulent leg, breast, and wing portions for South Indian chicken curry, chettinad gravies, and stews.',
    shortDescription: 'Juicy bone-in curry cut pieces, 100% skinless and farm-fresh.',
    images: ['https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80'],
    freshnessInfo: 'Antibiotic residue free, freshly cut post-order.',
    cuttingOptions: [
      'Curry Cut (Medium)',
      'Curry Cut (Small)',
      'Large Biryani Cut',
      'Small Pieces (20-30g)',
      'Medium Pieces (40-50g)',
      'Regular Cut',
      'Chicken 65 Cut',
      'Fry Cut'
    ],
    cleaningOptions: ['Standard Clean & Washed', 'Extra Washed with Turmeric Water'],
    basePrice: 250,
    discountPercent: 8,
    isBestSeller: true,
    isTodaySpecial: true,
    isRecommended: true,
    isActive: true,
    avgRating: 4.9,
    reviewCount: 142,
    createdAt: '2026-11-10T09:05:15.763Z',
    updatedAt: '2026-11-13T10:46:28.000Z'
  },
  {
    id: 'prod_2',
    categoryId: 'cat_breast',
    name: 'Tender Chicken Breast Boneless',
    slug: 'chicken-breast-boneless',
    description: 'Prime cuts of boneless, tender chicken breast fillets. Succulent, tender, and vacuum-sealed for maximum freshness. Perfect for gym diet, salads, and curries.',
    shortDescription: 'Whole tender fillets, supreme protein, 100% skinless & boneless.',
    images: ['https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=80'],
    freshnessInfo: 'Guaranteed 23g protein per 100g, hormone-free.',
    cuttingOptions: [
      'Breast Fillet',
      'Boneless Cubes (Bite-sized)',
      'Boneless Strips',
      'Butterfly Breast',
      'Tikka Cut (1.5" Cubes)',
      'Popcorn Cut (Mini Bites)',
      'Chicken Cutlet',
      'Paillard (Thin Pounded)'
    ],
    cleaningOptions: ['Pre-trimmed & Degreased', 'Standard Wash'],
    basePrice: 320,
    discountPercent: 5,
    isBestSeller: true,
    isTodaySpecial: false,
    isRecommended: true,
    isActive: true,
    avgRating: 4.9,
    reviewCount: 184,
    createdAt: '2026-11-10T09:05:15.763Z',
    updatedAt: '2026-11-13T10:46:28.000Z'
  },
  {
    id: 'prod_3',
    categoryId: 'cat_leg',
    name: 'Chicken Drumsticks (Tangdi Cut)',
    slug: 'chicken-drumsticks-lollipop',
    description: 'Plump, juicy chicken drumsticks with skin removed and neat bone exposure. Retains marinade deeply and stays extraordinarily juicy when grilled or fried.',
    shortDescription: 'Plump, juicy drumsticks perfect for tandoori and tangdi kebabs.',
    images: ['https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80'],
    freshnessInfo: 'Farm fresh daily, zero preservatives, chilled.',
    cuttingOptions: [
      'Deep Slits / Scored',
      'Natural Uncut',
      'Classic Lollipop Frenched',
      'Tandoori Slit Cut'
    ],
    cleaningOptions: ['Cleaned & Joint Trimmed'],
    basePrice: 290,
    discountPercent: 5,
    isBestSeller: true,
    isTodaySpecial: true,
    isRecommended: false,
    isActive: true,
    avgRating: 4.85,
    reviewCount: 96,
    createdAt: '2026-11-10T09:05:15.763Z',
    updatedAt: '2026-11-13T10:46:28.000Z'
  },
  {
    id: 'prod_4',
    categoryId: 'cat_curry',
    name: 'Nattu Kozhi Country Chicken Curry Cut',
    slug: 'nattu-kozhi-country-chicken',
    description: 'Free-range country chicken raised naturally in open farms. Firm, flavorful, and loaded with authentic rustic aroma. Supreme choice for pepper soup and medicinal rasam.',
    shortDescription: '100% genuine free-range country chicken (Nattu Kozhi).',
    images: ['https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80'],
    freshnessInfo: 'Naturally foraging birds, pesticide-free grain diet.',
    cuttingOptions: ['Curry Cut (Small)', 'Soup Cut (Medium)'],
    cleaningOptions: ['Flame Singed & Washed with Turmeric'],
    basePrice: 460,
    discountPercent: 5,
    isBestSeller: false,
    isTodaySpecial: true,
    isRecommended: true,
    isActive: true,
    avgRating: 4.95,
    reviewCount: 78,
    createdAt: '2026-11-10T09:05:15.763Z',
    updatedAt: '2026-11-13T10:46:28.000Z'
  },
  {
    id: 'prod_5',
    categoryId: 'cat_whole',
    name: 'Kadaknath Black Country Chicken',
    slug: 'kadaknath-country-chicken',
    description: 'Rare native breed known for its distinctive black meat and high medicinal properties. Very low cholesterol and extraordinarily high protein content.',
    shortDescription: 'Original Kadaknath black meat chicken with high nutrient value.',
    images: ['https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80'],
    freshnessInfo: 'Organically raised, zero chemical feeds.',
    cuttingOptions: ['Small Pieces', 'Curry Cut'],
    cleaningOptions: ['Flame Cleaned & Rinsed'],
    basePrice: 750,
    discountPercent: 0,
    isBestSeller: false,
    isTodaySpecial: false,
    isRecommended: true,
    isActive: true,
    avgRating: 4.9,
    reviewCount: 31,
    createdAt: '2026-11-10T09:05:15.763Z',
    updatedAt: '2026-11-13T10:46:28.000Z'
  },
  {
    id: 'prod_15',
    categoryId: 'cat_wings',
    name: 'Chicken Wings (Wingettes & Drumettes)',
    slug: 'chicken-wings-crispy',
    description: 'Fresh, juicy chicken wings separated into handy wingettes and drumettes. Unmatched crunch and flavor for appetizers, hot wings, and roasts.',
    shortDescription: 'Fresh party wings cut into drumettes and wingettes.',
    images: ['https://images.unsplash.com/photo-1527477321055-43615b6294a5?auto=format&fit=crop&w=800&q=80'],
    freshnessInfo: 'Chilled poultry, never frozen.',
    cuttingOptions: ['Joint Split (Wingette + Drumette)', 'Whole Wing'],
    cleaningOptions: ['Clean Plucked & Washed'],
    basePrice: 240,
    discountPercent: 10,
    isBestSeller: true,
    isTodaySpecial: true,
    isRecommended: false,
    isActive: true,
    avgRating: 4.8,
    reviewCount: 77,
    createdAt: '2026-11-10T09:05:15.763Z',
    updatedAt: '2026-11-13T10:46:28.000Z'
  },
  {
    id: 'prod_16',
    categoryId: 'cat_boneless',
    name: 'Boneless Chicken Breast Cubes',
    slug: 'boneless-chicken-breast-cubes',
    description: '100% boneless fresh chicken cubes, ideal for butter chicken, tikka, and stir-fries.',
    shortDescription: 'Evenly diced 100% boneless breast cubes for curries and tikka.',
    images: ['https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=80'],
    freshnessInfo: 'Lab tested, zero antibiotics, high lean protein.',
    cuttingOptions: ['Bite-sized Cubes', 'Stir Fry Strips'],
    cleaningOptions: ['Double Cleaned & Trimmed'],
    basePrice: 340,
    discountPercent: 8,
    isBestSeller: true,
    isTodaySpecial: false,
    isRecommended: true,
    isActive: true,
    avgRating: 4.95,
    reviewCount: 230,
    createdAt: '2026-11-10T09:05:15.763Z',
    updatedAt: '2026-11-13T10:46:28.000Z'
  },
  {
    id: 'prod_17',
    categoryId: 'cat_whole',
    name: 'Whole Chicken (With Skin - Broiler)',
    slug: 'whole-chicken-with-skin-broiler',
    description: 'Whole dressed chicken with fresh skin intact. Perfect for traditional slow roasting, tandoori whole roast, and deep flavour broths.',
    shortDescription: 'Whole dressed farm chicken with skin.',
    images: ['https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80'],
    freshnessInfo: '100% Farm Fresh and cleaned to perfection.',
    cuttingOptions: ['Whole Tied', 'Cut into 4 Halves', 'Cut into 8 Pieces'],
    cleaningOptions: ['Flame Singed & Rinsed'],
    basePrice: 210,
    discountPercent: 0,
    isBestSeller: false,
    isTodaySpecial: true,
    isRecommended: false,
    isActive: true,
    avgRating: 4.8,
    reviewCount: 42,
    createdAt: '2026-11-10T09:05:15.763Z',
    updatedAt: '2026-11-13T10:46:28.000Z'
  },
  {
    id: 'prod_18',
    categoryId: 'cat_skinless',
    name: 'Whole Chicken (Skinless Dressed)',
    slug: 'whole-chicken-skinless-dressed',
    description: 'Complete dressed whole broiler chicken without skin, neck, or giblets. High quality lean chicken ready for cooking.',
    shortDescription: 'Whole chicken dressed without skin.',
    images: ['https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80'],
    freshnessInfo: 'Antibiotic free, hygienically processed.',
    cuttingOptions: ['Whole Intact', 'Halved', 'Quartered'],
    cleaningOptions: ['Cavity Cleaned & Rinsed'],
    basePrice: 260,
    discountPercent: 5,
    isBestSeller: false,
    isTodaySpecial: false,
    isRecommended: true,
    isActive: true,
    avgRating: 4.85,
    reviewCount: 38,
    createdAt: '2026-11-10T09:05:15.763Z',
    updatedAt: '2026-11-13T10:46:28.000Z'
  },
  {
    id: 'prod_19',
    categoryId: 'cat_liver_gizzard',
    name: 'Fresh Chicken Liver',
    slug: 'fresh-chicken-liver-tender',
    description: 'Smooth, tender, iron-packed fresh chicken liver. Cleaned and trimmed of bile ducts.',
    shortDescription: 'Nutrient rich chicken liver cut fresh daily.',
    images: ['https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80'],
    freshnessInfo: 'Delivered chilled under 4°C.',
    cuttingOptions: ['Whole Livers', 'Halved Pieces'],
    cleaningOptions: ['Gallbladder Removed & Washed'],
    basePrice: 160,
    discountPercent: 0,
    isBestSeller: false,
    isTodaySpecial: false,
    isRecommended: false,
    isActive: true,
    avgRating: 4.7,
    reviewCount: 51,
    createdAt: '2026-11-10T09:05:15.763Z',
    updatedAt: '2026-11-13T10:46:28.000Z'
  },
  {
    id: 'prod_20',
    categoryId: 'cat_liver_gizzard',
    name: 'Fresh Chicken Gizzard & Heart',
    slug: 'fresh-chicken-gizzard-heart-cut',
    description: 'Chewy and rich in flavour, peeled and cleaned thoroughly for spicy fry and roasts.',
    shortDescription: 'Firm peeled chicken gizzard and hearts.',
    images: ['https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80'],
    freshnessInfo: '100% yellow membrane peeled and triple cleaned.',
    cuttingOptions: ['Bite-sized Pieces', 'Whole Cleaned'],
    cleaningOptions: ['Triple Washed'],
    basePrice: 180,
    discountPercent: 0,
    isBestSeller: false,
    isTodaySpecial: false,
    isRecommended: false,
    isActive: true,
    avgRating: 4.65,
    reviewCount: 29,
    createdAt: '2026-11-10T09:05:15.763Z',
    updatedAt: '2026-11-13T10:46:28.000Z'
  },
  {
    id: 'prod_21',
    categoryId: 'cat_boneless',
    name: 'Fresh Minced Chicken (Keema)',
    slug: 'fresh-minced-chicken-keema-boneless',
    description: 'Finely minced from prime boneless chicken breast and thighs. Soft and juicy for burgers, samosas, and keema masala.',
    shortDescription: 'Fine ground boneless chicken mince.',
    images: ['https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=80'],
    freshnessInfo: 'Freshly minced on order, zero preservatives.',
    cuttingOptions: ['Fine Mince', 'Medium Grind'],
    cleaningOptions: ['Hygienically Packed'],
    basePrice: 350,
    discountPercent: 10,
    isBestSeller: true,
    isTodaySpecial: true,
    isRecommended: true,
    isActive: true,
    avgRating: 4.9,
    reviewCount: 114,
    createdAt: '2026-11-10T09:05:15.763Z',
    updatedAt: '2026-11-13T10:46:28.000Z'
  },
  {
    id: 'prod_22',
    categoryId: 'cat_wings',
    name: 'Chicken Lollipop Cuts',
    slug: 'chicken-lollipop-fresh-cuts',
    description: 'Frenched chicken wingettes trimmed into easy-to-hold lollipops. Ready for restaurant-style Indo-Chinese chicken lollipop recipes.',
    shortDescription: 'Frenched chicken wing drumettes for lollipops.',
    images: ['https://images.unsplash.com/photo-1527477321055-43615b6294a5?auto=format&fit=crop&w=800&q=80'],
    freshnessInfo: 'Frenched with bone exposed, meat clustered neatly.',
    cuttingOptions: ['Classic Lollipop Frenched'],
    cleaningOptions: ['Pre-washed & Trimmed'],
    basePrice: 300,
    discountPercent: 8,
    isBestSeller: true,
    isTodaySpecial: false,
    isRecommended: true,
    isActive: true,
    avgRating: 4.95,
    reviewCount: 87,
    createdAt: '2026-11-10T09:05:15.763Z',
    updatedAt: '2026-11-13T10:46:28.000Z'
  },
  {
    id: 'prod_23',
    categoryId: 'cat_leg',
    name: 'Whole Chicken Leg Quarter',
    slug: 'whole-chicken-leg-quarter-thigh',
    description: 'Succulent whole leg with drumstick and thigh connected. Super juicy for slow roast and rich biryani pots.',
    shortDescription: 'Full leg quarter with thigh and drumstick.',
    images: ['https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80'],
    freshnessInfo: 'Chilled poultry, freshly cut.',
    cuttingOptions: ['Skinless Leg', 'With Skin for Roast', 'Slit / Scored'],
    cleaningOptions: ['Cleaned & Washed'],
    basePrice: 290,
    discountPercent: 0,
    isBestSeller: false,
    isTodaySpecial: true,
    isRecommended: false,
    isActive: true,
    avgRating: 4.8,
    reviewCount: 64,
    createdAt: '2026-11-10T09:05:15.763Z',
    updatedAt: '2026-11-13T10:46:28.000Z'
  },
  {
    id: 'prod_24',
    categoryId: 'cat_curry',
    name: 'Biryani Cut Special Chicken',
    slug: 'biryani-cut-special-chicken',
    description: 'Large, juicy bone-in chicken cuts specially sized so meat does not break down during dum biryani cooking.',
    shortDescription: 'Special large cuts engineered for dum biryani.',
    images: ['https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80'],
    freshnessInfo: 'Selected birds between 1.2kg to 1.5kg for tender meat.',
    cuttingOptions: ['Large Biryani Cut (12-14 pcs/kg)', 'Medium Biryani Cut (16 pcs/kg)'],
    cleaningOptions: ['Standard Clean', 'Turmeric Washed'],
    basePrice: 260,
    discountPercent: 5,
    isBestSeller: true,
    isTodaySpecial: true,
    isRecommended: true,
    isActive: true,
    avgRating: 4.9,
    reviewCount: 156,
    createdAt: '2026-11-10T09:05:15.763Z',
    updatedAt: '2026-11-13T10:46:28.000Z'
  }
];

const initialVariants: ProductVariant[] = [
  // prod_1 (Curry cut skinless)
  { id: 'var_1_1', productId: 'prod_1', label: '500 grams', weightGrams: 500, price: 130, compareAtPrice: 145, sku: 'SKU-CHK-1-500', isActive: true, createdAt: '2026-11-10T09:05:15.763Z', updatedAt: '2026-11-13T10:46:28.000Z' },
  { id: 'var_1_2', productId: 'prod_1', label: '1 kg', weightGrams: 1000, price: 250, compareAtPrice: 275, sku: 'SKU-CHK-1-1000', isActive: true, createdAt: '2026-11-10T09:05:15.763Z', updatedAt: '2026-11-13T10:46:28.000Z' },
  { id: 'var_1_3', productId: 'prod_1', label: '2 kg (Value Pack)', weightGrams: 2000, price: 480, compareAtPrice: 550, sku: 'SKU-CHK-1-2000', isActive: true, createdAt: '2026-11-10T09:05:15.763Z', updatedAt: '2026-11-13T10:46:28.000Z' },
  // prod_2 (Breast boneless)
  { id: 'var_2_1', productId: 'prod_2', label: '250 grams', weightGrams: 250, price: 85, compareAtPrice: 95, sku: 'SKU-CHK-2-250', isActive: true, createdAt: '2026-11-10T09:05:15.763Z', updatedAt: '2026-11-13T10:46:28.000Z' },
  { id: 'var_2_2', productId: 'prod_2', label: '500 grams', weightGrams: 500, price: 165, compareAtPrice: 180, sku: 'SKU-CHK-2-500', isActive: true, createdAt: '2026-11-10T09:05:15.763Z', updatedAt: '2026-11-13T10:46:28.000Z' },
  { id: 'var_2_3', productId: 'prod_2', label: '1 kg', weightGrams: 1000, price: 320, compareAtPrice: 350, sku: 'SKU-CHK-2-1000', isActive: true, createdAt: '2026-11-10T09:05:15.763Z', updatedAt: '2026-11-13T10:46:28.000Z' },
  // prod_3 (Drumsticks)
  { id: 'var_3_1', productId: 'prod_3', label: '500 grams (4-5 pcs)', weightGrams: 500, price: 150, compareAtPrice: 165, sku: 'SKU-CHK-3-500', isActive: true, createdAt: '2026-11-10T09:05:15.763Z', updatedAt: '2026-11-13T10:46:28.000Z' },
  { id: 'var_3_2', productId: 'prod_3', label: '1 kg (8-10 pcs)', weightGrams: 1000, price: 290, compareAtPrice: 320, sku: 'SKU-CHK-3-1000', isActive: true, createdAt: '2026-11-10T09:05:15.763Z', updatedAt: '2026-11-13T10:46:28.000Z' },
  // prod_4 (Nattu Kozhi)
  { id: 'var_4_1', productId: 'prod_4', label: '500 grams', weightGrams: 500, price: 235, compareAtPrice: 250, sku: 'SKU-CHK-4-500', isActive: true, createdAt: '2026-11-10T09:05:15.763Z', updatedAt: '2026-11-13T10:46:28.000Z' },
  { id: 'var_4_2', productId: 'prod_4', label: '1 kg', weightGrams: 1000, price: 460, compareAtPrice: 490, sku: 'SKU-CHK-4-1000', isActive: true, createdAt: '2026-11-10T09:05:15.763Z', updatedAt: '2026-11-13T10:46:28.000Z' },
  // prod_5 (Kadaknath)
  { id: 'var_5_1', productId: 'prod_5', label: '1 kg (Whole Bird)', weightGrams: 1000, price: 750, compareAtPrice: 800, sku: 'SKU-CHK-5-1000', isActive: true, createdAt: '2026-11-10T09:05:15.763Z', updatedAt: '2026-11-13T10:46:28.000Z' },
  // prod_15 (Wings)
  { id: 'var_15_1', productId: 'prod_15', label: '500 grams (10-12 pcs)', weightGrams: 500, price: 125, compareAtPrice: 140, sku: 'SKU-CHK-15-500', isActive: true, createdAt: '2026-11-10T09:05:15.763Z', updatedAt: '2026-11-13T10:46:28.000Z' },
  { id: 'var_15_2', productId: 'prod_15', label: '1 kg (20-24 pcs)', weightGrams: 1000, price: 240, compareAtPrice: 270, sku: 'SKU-CHK-15-1000', isActive: true, createdAt: '2026-11-10T09:05:15.763Z', updatedAt: '2026-11-13T10:46:28.000Z' },
  // prod_16 (Boneless cubes)
  { id: 'var_16_1', productId: 'prod_16', label: '250 grams', weightGrams: 250, price: 90, compareAtPrice: 100, sku: 'SKU-CHK-16-250', isActive: true, createdAt: '2026-11-10T09:05:15.763Z', updatedAt: '2026-11-13T10:46:28.000Z' },
  { id: 'var_16_2', productId: 'prod_16', label: '500 grams', weightGrams: 500, price: 175, compareAtPrice: 195, sku: 'SKU-CHK-16-500', isActive: true, createdAt: '2026-11-10T09:05:15.763Z', updatedAt: '2026-11-13T10:46:28.000Z' },
  { id: 'var_16_3', productId: 'prod_16', label: '1 kg', weightGrams: 1000, price: 340, compareAtPrice: 380, sku: 'SKU-CHK-16-1000', isActive: true, createdAt: '2026-11-10T09:05:15.763Z', updatedAt: '2026-11-13T10:46:28.000Z' },
  // prod_17 (Whole with skin)
  { id: 'var_17_1', productId: 'prod_17', label: '1 kg', weightGrams: 1000, price: 210, compareAtPrice: 230, sku: 'SKU-CHK-17-1000', isActive: true, createdAt: '2026-11-10T09:05:15.763Z', updatedAt: '2026-11-13T10:46:28.000Z' },
  { id: 'var_17_2', productId: 'prod_17', label: '1.5 kg', weightGrams: 1500, price: 315, compareAtPrice: 345, sku: 'SKU-CHK-17-1500', isActive: true, createdAt: '2026-11-10T09:05:15.763Z', updatedAt: '2026-11-13T10:46:28.000Z' },
  // prod_18 (Whole skinless)
  { id: 'var_18_1', productId: 'prod_18', label: '1 kg', weightGrams: 1000, price: 260, compareAtPrice: 290, sku: 'SKU-CHK-18-1000', isActive: true, createdAt: '2026-11-10T09:05:15.763Z', updatedAt: '2026-11-13T10:46:28.000Z' },
  { id: 'var_18_2', productId: 'prod_18', label: '1.5 kg', weightGrams: 1500, price: 390, compareAtPrice: 435, sku: 'SKU-CHK-18-1500', isActive: true, createdAt: '2026-11-10T09:05:15.763Z', updatedAt: '2026-11-13T10:46:28.000Z' },
  // prod_19 (Liver)
  { id: 'var_19_1', productId: 'prod_19', label: '250 grams', weightGrams: 250, price: 45, compareAtPrice: 50, sku: 'SKU-CHK-19-250', isActive: true, createdAt: '2026-11-10T09:05:15.763Z', updatedAt: '2026-11-13T10:46:28.000Z' },
  { id: 'var_19_2', productId: 'prod_19', label: '500 grams', weightGrams: 500, price: 85, compareAtPrice: 95, sku: 'SKU-CHK-19-500', isActive: true, createdAt: '2026-11-10T09:05:15.763Z', updatedAt: '2026-11-13T10:46:28.000Z' },
  { id: 'var_19_3', productId: 'prod_19', label: '1 kg', weightGrams: 1000, price: 160, compareAtPrice: 180, sku: 'SKU-CHK-19-1000', isActive: true, createdAt: '2026-11-10T09:05:15.763Z', updatedAt: '2026-11-13T10:46:28.000Z' },
  // prod_20 (Gizzard)
  { id: 'var_20_1', productId: 'prod_20', label: '250 grams', weightGrams: 250, price: 50, compareAtPrice: 55, sku: 'SKU-CHK-20-250', isActive: true, createdAt: '2026-11-10T09:05:15.763Z', updatedAt: '2026-11-13T10:46:28.000Z' },
  { id: 'var_20_2', productId: 'prod_20', label: '500 grams', weightGrams: 500, price: 95, compareAtPrice: 105, sku: 'SKU-CHK-20-500', isActive: true, createdAt: '2026-11-10T09:05:15.763Z', updatedAt: '2026-11-13T10:46:28.000Z' },
  // prod_21 (Keema)
  { id: 'var_21_1', productId: 'prod_21', label: '250 grams', weightGrams: 250, price: 95, compareAtPrice: 105, sku: 'SKU-CHK-21-250', isActive: true, createdAt: '2026-11-10T09:05:15.763Z', updatedAt: '2026-11-13T10:46:28.000Z' },
  { id: 'var_21_2', productId: 'prod_21', label: '500 grams', weightGrams: 500, price: 180, compareAtPrice: 200, sku: 'SKU-CHK-21-500', isActive: true, createdAt: '2026-11-10T09:05:15.763Z', updatedAt: '2026-11-13T10:46:28.000Z' },
  { id: 'var_21_3', productId: 'prod_21', label: '1 kg', weightGrams: 1000, price: 350, compareAtPrice: 390, sku: 'SKU-CHK-21-1000', isActive: true, createdAt: '2026-11-10T09:05:15.763Z', updatedAt: '2026-11-13T10:46:28.000Z' },
  // prod_22 (Lollipop)
  { id: 'var_22_1', productId: 'prod_22', label: '500 grams (10-12 pcs)', weightGrams: 500, price: 155, compareAtPrice: 175, sku: 'SKU-CHK-22-500', isActive: true, createdAt: '2026-11-10T09:05:15.763Z', updatedAt: '2026-11-13T10:46:28.000Z' },
  { id: 'var_22_2', productId: 'prod_22', label: '1 kg (20-24 pcs)', weightGrams: 1000, price: 300, compareAtPrice: 340, sku: 'SKU-CHK-22-1000', isActive: true, createdAt: '2026-11-10T09:05:15.763Z', updatedAt: '2026-11-13T10:46:28.000Z' },
  // prod_23 (Leg quarter)
  { id: 'var_23_1', productId: 'prod_23', label: '500 grams (2 full legs)', weightGrams: 500, price: 150, compareAtPrice: 165, sku: 'SKU-CHK-23-500', isActive: true, createdAt: '2026-11-10T09:05:15.763Z', updatedAt: '2026-11-13T10:46:28.000Z' },
  { id: 'var_23_2', productId: 'prod_23', label: '1 kg (4 full legs)', weightGrams: 1000, price: 290, compareAtPrice: 320, sku: 'SKU-CHK-23-1000', isActive: true, createdAt: '2026-11-10T09:05:15.763Z', updatedAt: '2026-11-13T10:46:28.000Z' },
  // prod_24 (Biryani cut)
  { id: 'var_24_1', productId: 'prod_24', label: '500 grams', weightGrams: 500, price: 135, compareAtPrice: 145, sku: 'SKU-CHK-24-500', isActive: true, createdAt: '2026-11-10T09:05:15.763Z', updatedAt: '2026-11-13T10:46:28.000Z' },
  { id: 'var_24_2', productId: 'prod_24', label: '1 kg', weightGrams: 1000, price: 260, compareAtPrice: 290, sku: 'SKU-CHK-24-1000', isActive: true, createdAt: '2026-11-10T09:05:15.763Z', updatedAt: '2026-11-13T10:46:28.000Z' }
];

const initialInventory: InventoryItem[] = initialVariants.map((v) => ({
  id: `inv_${v.id}`,
  productId: v.productId,
  variantId: v.id,
  stockQuantity: 45,
  reservedQuantity: 0,
  lowStockThreshold: 5,
  updatedAt: new Date().toISOString()
}));

const initialAddresses: Address[] = [
  {
    id: 'addr_1',
    userId: 'usr_cust_1',
    label: 'Home',
    recipientName: 'Priya Dharshini',
    phone: '+919876543210',
    line1: '24 Gandhi Nagar, Kanjikovil',
    line2: 'Near Mariamman Temple',
    landmark: 'Opposite Primary School',
    area: 'Kanjikovil',
    city: 'Erode',
    state: 'Tamil Nadu',
    pincode: '638116',
    lat: 11.3854,
    lng: 77.5992,
    isDefault: true,
    createdAt: '2026-11-10T09:05:15.763Z',
    updatedAt: '2026-11-10T09:05:15.763Z'
  }
];

const initialDeliveryPartners: DeliveryPartner[] = [
  {
    id: 'dp_1',
    userId: 'usr_del_1',
    fullName: 'Poopesh',
    phone: '+919360761595',
    email: 'mboopesh60@gmail.com',
    address: '18 Perundurai Road, Kanjikovil, Erode 638116',
    drivingLicenseNo: 'TN33-2018-004921',
    vehicleType: 'Motorcycle',
    vehicleNumber: 'TN 33 BM 4921',
    approvalStatus: 'APPROVED',
    isOnline: true,
    isAvailable: true,
    currentLat: 11.3832,
    currentLng: 77.5968,
    commissionRate: 40.0,
    totalDeliveries: 42,
    rating: 4.9,
    createdAt: '2026-11-10T09:05:15.763Z',
    updatedAt: '2026-11-13T10:46:28.000Z'
  }
];

const initialCoupons: Coupon[] = [
  {
    id: 'cpn_1',
    code: 'MEATFIRST20',
    description: '20% off up to ₹150 on your first fresh meat order above ₹299',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    minOrderValue: 299,
    maxDiscount: 150,
    usageLimit: 500,
    usedCount: 0,
    startsAt: '2026-11-10T09:05:48.904Z',
    expiresAt: '2027-02-08T09:05:48.904Z',
    isActive: true
  },
  {
    id: 'cpn_2',
    code: 'KANJIFRESH50',
    description: 'Flat ₹50 off on orders above ₹399 across Kanjikovil & Erode',
    discountType: 'FLAT',
    discountValue: 50,
    minOrderValue: 399,
    maxDiscount: 50,
    usageLimit: 500,
    usedCount: 0,
    startsAt: '2026-11-10T09:05:48.904Z',
    expiresAt: '2027-02-08T09:05:48.904Z',
    isActive: true
  },
  {
    id: 'cpn_3',
    code: 'SUNDAYFEAST',
    description: '15% off up to ₹200 on family packs above ₹499',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    minOrderValue: 499,
    maxDiscount: 200,
    usageLimit: 300,
    usedCount: 0,
    startsAt: '2026-11-10T09:05:48.904Z',
    expiresAt: '2027-02-08T09:05:48.904Z',
    isActive: true
  }
];

const initialStoreSettings: StoreSettings = {
  id: 'default',
  storeName: 'MEAT CORNER',
  logoUrl: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=200&q=80',
  contactPhone: '+91 98765 43210',
  contactEmail: 'support@meatcorner.in',
  address: '142 Main Road, Near Bus Stand, Kanjikovil, Erode, Tamil Nadu 638116',
  storeLat: 11.3806,
  storeLng: 77.5944,
  serviceableAreas: [
    {
      id: 'kanjikovil-erode',
      city: 'Erode',
      name: 'Kanjikovil & Erode District',
      state: 'Tamil Nadu',
      isActive: true,
      pincodes: ['638116', '638103', '638052', '638001', '638102', '638112', '600001', '560001', '110001'],
      radiusKm: 25,
      centerLat: 11.3806,
      centerLng: 77.5944
    }
  ],
  baseDeliveryCharge: 30,
  perKmCharge: 8,
  freeDeliveryAbove: 499,
  minOrderAmount: 149,
  taxPercent: 5,
  operatingHours: {
    openTime: '06:00',
    closeTime: '22:00',
    isOpenAllDays: true
  },
  deliveryTimeSlots: [
    'Express (30-45 mins)',
    'Morning (7:00 AM - 9:00 AM)',
    'Mid-Day (11:00 AM - 1:00 PM)',
    'Evening (5:00 PM - 7:00 PM)',
    'Night (7:00 PM - 9:00 PM)'
  ],
  paymentSettings: {
    enableCod: true,
    enableRazorpay: true
  },
  updatedAt: new Date().toISOString()
};

// Initial Order for demo
const initialOrders: Order[] = [
  {
    id: 'ord_demo_101',
    orderNumber: 'MC-20261110-001',
    customerId: 'usr_cust_1',
    customerName: 'Priya Dharshini',
    customerPhone: '+919876543210',
    addressId: 'addr_1',
    deliveryAddressSnapshot: initialAddresses[0],
    deliveryPartnerId: 'dp_1',
    deliveryPartnerName: 'Poopesh M',
    deliveryPartnerPhone: '+919360761595',
    status: 'PREPARING',
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    subtotal: 510,
    deliveryCharge: 0,
    discountAmount: 20,
    taxAmount: 24.5,
    totalAmount: 514.5,
    couponCode: 'MEATFIRST20',
    deliveryInstructions: 'Please ring the doorbell and leave at door if busy.',
    deliverySlot: 'Express (30-45 mins)',
    deliveryOtp: '4829',
    distanceKm: 2.1,
    estimatedMinutes: 30,
    confirmedAt: '2026-11-13T10:00:00.000Z',
    preparedAt: '2026-11-13T10:15:00.000Z',
    createdAt: '2026-11-13T09:50:00.000Z',
    updatedAt: '2026-11-13T10:15:00.000Z',
    items: [
      {
        id: 'ord_item_1',
        orderId: 'ord_demo_101',
        productId: 'prod_1',
        variantId: 'var_1_2',
        productName: 'Chicken Curry Cut (Skinless)',
        variantLabel: '1 kg',
        quantity: 1,
        unitPrice: 250,
        totalPrice: 250,
        cuttingOption: 'Curry Cut (Medium)',
        cleaningOption: 'Standard Clean & Washed'
      },
      {
        id: 'ord_item_2',
        orderId: 'ord_demo_101',
        productId: 'prod_24',
        variantId: 'var_24_2',
        productName: 'Biryani Cut Special Chicken',
        variantLabel: '1 kg',
        quantity: 1,
        unitPrice: 260,
        totalPrice: 260,
        cuttingOption: 'Large Biryani Cut (12-14 pcs/kg)',
        cleaningOption: 'Standard Clean'
      }
    ]
  }
];

class DataStore {
  public users: User[] = [...initialUsers];
  public categories: Category[] = [...initialCategories];
  public products: Product[] = [...initialProducts];
  public variants: ProductVariant[] = [...initialVariants];
  public inventory: InventoryItem[] = [...initialInventory];
  public addresses: Address[] = [...initialAddresses];
  public carts: Map<string, Cart> = new Map();
  public orders: Order[] = [...initialOrders];
  public deliveryPartners: DeliveryPartner[] = [...initialDeliveryPartners];
  public deliveryAssignments: DeliveryAssignment[] = [];
  public deliveryLocations: DeliveryLocation[] = [];
  public deliveryEarnings: DeliveryEarning[] = [
    {
      id: 'earn_1',
      deliveryPartnerId: 'dp_1',
      orderId: 'ord_demo_101',
      baseFee: 40,
      distanceBonus: 10,
      commissionAmount: 0,
      tipAmount: 20,
      totalEarning: 70,
      payoutStatus: 'PENDING',
      createdAt: '2026-11-13T10:00:00.000Z'
    }
  ];
  public coupons: Coupon[] = [...initialCoupons];
  public storeSettings: StoreSettings = { ...initialStoreSettings };
  public wishlists: Array<{ id: string; userId: string; productId: string; createdAt: string }> = [];
  public supportTickets: SupportTicket[] = [
    {
      id: 'tkt_1',
      userId: 'usr_cust_1',
      orderNumber: 'MC-20261110-001',
      subject: 'Scheduled delivery confirmation',
      message: 'Can I add extra turmeric wash instructions?',
      status: 'RESOLVED',
      adminReply: 'Yes, our butcher has added the extra turmeric wash to your order.',
      createdAt: '2026-11-13T10:05:00.000Z',
      updatedAt: '2026-11-13T10:10:00.000Z'
    }
  ];

  private storageFile = path.resolve(__dirname, '../../../meat_corner_local_db.json');

  constructor() {
    this.loadFromDisk();
  }

  public saveToDisk() {
    try {
      const data = {
        users: this.users,
        categories: this.categories,
        products: this.products,
        variants: this.variants,
        inventory: this.inventory,
        addresses: this.addresses,
        orders: this.orders,
        deliveryPartners: this.deliveryPartners,
        deliveryAssignments: this.deliveryAssignments,
        deliveryLocations: this.deliveryLocations,
        deliveryEarnings: this.deliveryEarnings,
        coupons: this.coupons,
        storeSettings: this.storeSettings,
        wishlists: this.wishlists,
        supportTickets: this.supportTickets
      };
      fs.writeFileSync(this.storageFile, JSON.stringify(data, null, 2), 'utf-8');
    } catch {
      // Continue safely if filesystem write is restricted
    }
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(this.storageFile)) {
        const raw = fs.readFileSync(this.storageFile, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.users) this.users = parsed.users;
        if (parsed.categories) this.categories = parsed.categories;
        if (parsed.products) this.products = parsed.products;
        if (parsed.variants) this.variants = parsed.variants;
        if (parsed.inventory) this.inventory = parsed.inventory;
        if (parsed.addresses) this.addresses = parsed.addresses;
        if (parsed.orders) this.orders = parsed.orders;
        if (parsed.deliveryPartners) this.deliveryPartners = parsed.deliveryPartners;
        if (parsed.coupons) this.coupons = parsed.coupons;
        if (parsed.storeSettings) this.storeSettings = parsed.storeSettings;
        if (parsed.supportTickets) this.supportTickets = parsed.supportTickets;
      }
    } catch {
      // Default to memory data
    }
  }

  // Users
  getUserByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  createUser(user: User): User {
    this.users.push(user);
    this.saveToDisk();
    return user;
  }

  // Categories & Products
  getActiveCategories(): Category[] {
    return this.categories
      .filter((c) => c.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  getProducts(filters?: {
    categorySlug?: string;
    search?: string;
    bestSeller?: boolean;
    todaySpecial?: boolean;
    recommended?: boolean;
    sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'popular';
  }): Product[] {
    let list = this.products.filter((p) => p.isActive);

    if (filters?.categorySlug) {
      const cat = this.categories.find((c) => c.slug === filters.categorySlug);
      if (cat) {
        list = list.filter((p) => p.categoryId === cat.id);
      }
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.shortDescription && p.shortDescription.toLowerCase().includes(q))
      );
    }

    if (filters?.bestSeller) list = list.filter((p) => p.isBestSeller);
    if (filters?.todaySpecial) list = list.filter((p) => p.isTodaySpecial);
    if (filters?.recommended) list = list.filter((p) => p.isRecommended);

    if (filters?.sortBy === 'price_asc') {
      list.sort((a, b) => a.basePrice - b.basePrice);
    } else if (filters?.sortBy === 'price_desc') {
      list.sort((a, b) => b.basePrice - a.basePrice);
    } else if (filters?.sortBy === 'rating') {
      list.sort((a, b) => b.avgRating - a.avgRating);
    } else {
      list.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    return list.map((p) => ({
      ...p,
      category: this.categories.find((c) => c.id === p.categoryId),
      variants: this.variants.filter((v) => v.productId === p.id && v.isActive),
      inventory: this.inventory.filter((i) => i.productId === p.id)
    }));
  }

  getProductById(id: string): Product | undefined {
    const prod = this.products.find((p) => p.id === id);
    if (!prod) return undefined;
    return {
      ...prod,
      category: this.categories.find((c) => c.id === prod.categoryId),
      variants: this.variants.filter((v) => v.productId === prod.id && v.isActive),
      inventory: this.inventory.filter((i) => i.productId === prod.id)
    };
  }

  // Cart Management
  getCart(userId: string): Cart {
    let cart = this.carts.get(userId);
    if (!cart) {
      cart = {
        id: `cart_${userId}`,
        userId,
        items: [],
        updatedAt: new Date().toISOString()
      };
      this.carts.set(userId, cart);
    }
    // Populate products and variants
    cart.items = cart.items.map((item) => {
      const prod = this.getProductById(item.productId);
      let variant = this.variants.find((v) => v.id === item.variantId);
      if (prod && prod.basePrice > 0 && variant) {
        const weight = variant.weightGrams || (variant.label?.includes('1kg') ? 1000 : 500);
        variant = {
          ...variant,
          price: weight === 1000 ? prod.basePrice : Math.max(1, Math.round(prod.basePrice * (weight / 1000)))
        };
      }
      return {
        ...item,
        product: prod,
        variant
      };
    });
    return cart;
  }

  saveCart(cart: Cart) {
    this.carts.set(cart.userId, cart);
  }

  // Inventory reservation and deduction
  checkAndReserveStock(items: Array<{ variantId: string; quantity: number }>): {
    success: boolean;
    error?: string;
  } {
    for (const item of items) {
      const inv = this.inventory.find((i) => i.variantId === item.variantId);
      if (!inv) {
        return { success: false, error: `Inventory record not found for variant ${item.variantId}` };
      }
      const available = inv.stockQuantity - inv.reservedQuantity;
      if (available < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for product. Available: ${available}, Requested: ${item.quantity}`
        };
      }
    }

    // Reserve stock
    for (const item of items) {
      const inv = this.inventory.find((i) => i.variantId === item.variantId);
      if (inv) {
        inv.reservedQuantity += item.quantity;
        inv.updatedAt = new Date().toISOString();
      }
    }
    this.saveToDisk();
    return { success: true };
  }

  deductStock(items: Array<{ variantId: string; quantity: number }>) {
    for (const item of items) {
      const inv = this.inventory.find((i) => i.variantId === item.variantId);
      if (inv) {
        inv.stockQuantity = Math.max(0, inv.stockQuantity - item.quantity);
        inv.reservedQuantity = Math.max(0, inv.reservedQuantity - item.quantity);
        inv.updatedAt = new Date().toISOString();
      }
    }
    this.saveToDisk();
  }

  releaseStock(items: Array<{ variantId: string; quantity: number }>) {
    for (const item of items) {
      const inv = this.inventory.find((i) => i.variantId === item.variantId);
      if (inv) {
        inv.reservedQuantity = Math.max(0, inv.reservedQuantity - item.quantity);
        inv.updatedAt = new Date().toISOString();
      }
    }
    this.saveToDisk();
  }

  // Delivery Partner helpers
  getDeliveryPartnerByUserId(userId: string): DeliveryPartner | undefined {
    return this.deliveryPartners.find((dp) => dp.userId === userId);
  }

  updateDeliveryPartner(id: string, updates: Partial<DeliveryPartner>): DeliveryPartner | undefined {
    const dp = this.deliveryPartners.find((p) => p.id === id);
    if (!dp) return undefined;
    Object.assign(dp, updates, { updatedAt: new Date().toISOString() });
    this.saveToDisk();
    return dp;
  }

  // Orders
  createOrder(order: Order): Order {
    if (!order.id) {
      order.id = `ord_${Date.now()}`;
    }
    this.orders.unshift(order);
    this.deductStock(order.items.map((it) => ({ variantId: it.variantId, quantity: it.quantity })));
    this.saveToDisk();
    return order;
  }

  getOrderById(id: string): Order | undefined {
    return this.orders.find((o) => o.id === id || o.orderNumber === id);
  }

  updateOrder(id: string, updates: Partial<Order>): Order | undefined {
    const ord = this.orders.find((o) => o.id === id || o.orderNumber === id);
    if (!ord) return undefined;
    Object.assign(ord, updates, { updatedAt: new Date().toISOString() });
    this.saveToDisk();
    return ord;
  }

  // Live Location Track
  updatePartnerLocation(orderId: string, partnerId: string, lat: number, lng: number) {
    const loc: DeliveryLocation = {
      id: `loc_${Date.now()}`,
      orderId,
      deliveryPartnerId: partnerId,
      lat,
      lng,
      recordedAt: new Date().toISOString()
    };
    this.deliveryLocations.push(loc);
    const dp = this.deliveryPartners.find((p) => p.id === partnerId);
    if (dp) {
      dp.currentLat = lat;
      dp.currentLng = lng;
      dp.lastLocationAt = new Date().toISOString();
    }
    this.saveToDisk();
    return loc;
  }
}

export const db = new DataStore();
