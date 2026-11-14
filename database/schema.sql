-- MEAT CORNER: Full Production PostgreSQL Database Schema
-- Focus: 100% Fresh Chicken Products & Home Delivery

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom Enums
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
        CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'ADMIN', 'DELIVERY_PARTNER');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ApprovalStatus') THEN
        CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OrderStatus') THEN
        CREATE TYPE "OrderStatus" AS ENUM (
            'PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP',
            'PARTNER_ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY',
            'DELIVERED', 'CANCELLED', 'REJECTED'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentMethod') THEN
        CREATE TYPE "PaymentMethod" AS ENUM ('RAZORPAY', 'COD');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OrderPaymentStatus') THEN
        CREATE TYPE "OrderPaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DiscountType') THEN
        CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FLAT');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AssignmentStatus') THEN
        CREATE TYPE "AssignmentStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'PICKED_UP', 'COMPLETED', 'CANCELLED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PayoutStatus') THEN
        CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PAID');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TicketStatus') THEN
        CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RefundStatus') THEN
        CREATE TYPE "RefundStatus" AS ENUM ('REQUESTED', 'APPROVED', 'PROCESSED', 'FAILED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentTransactionStatus') THEN
        CREATE TYPE "PaymentTransactionStatus" AS ENUM ('CREATED', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED');
    END IF;
END $$;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS "Users" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT UNIQUE NOT NULL,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "avatarUrl" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "otpCode" TEXT,
    "otpExpiresAt" TIMESTAMP,
    "resetToken" TEXT,
    "resetTokenExpiresAt" TIMESTAMP,
    "refreshTokenHash" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. Customer Profiles
CREATE TABLE IF NOT EXISTS "CustomerProfiles" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "defaultAddressId" TEXT,
    "preferences" JSONB DEFAULT '{}',
    "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 3. Admin Profiles
CREATE TABLE IF NOT EXISTS "AdminProfiles" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "department" TEXT NOT NULL DEFAULT 'Operations',
    "permissions" JSONB DEFAULT '{"all": true}',
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4. Delivery Partners
CREATE TABLE IF NOT EXISTS "DeliveryPartners" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "drivingLicenseNo" TEXT NOT NULL,
    "drivingLicenseDoc" TEXT,
    "vehicleType" TEXT NOT NULL DEFAULT 'Motorcycle',
    "vehicleNumber" TEXT NOT NULL,
    "idProofDoc" TEXT,
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'APPROVED',
    "rejectionReason" TEXT,
    "isOnline" BOOLEAN NOT NULL DEFAULT true,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "currentLat" DOUBLE PRECISION,
    "currentLng" DOUBLE PRECISION,
    "lastLocationAt" TIMESTAMP,
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 40.0,
    "totalDeliveries" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 4.9,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 5. Customer Addresses
CREATE TABLE IF NOT EXISTS "Addresses" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "label" TEXT NOT NULL DEFAULT 'Home',
    "recipientName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "landmark" TEXT,
    "area" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'Tamil Nadu',
    "pincode" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL DEFAULT 11.3806,
    "lng" DOUBLE PRECISION NOT NULL DEFAULT 77.5944,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 6. Categories (Chicken Categories Only)
CREATE TABLE IF NOT EXISTS "Categories" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT UNIQUE NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 7. Products (Chicken Only)
CREATE TABLE IF NOT EXISTS "Products" (
    "id" TEXT PRIMARY KEY,
    "categoryId" TEXT NOT NULL REFERENCES "Categories"("id") ON DELETE RESTRICT,
    "name" TEXT NOT NULL,
    "slug" TEXT UNIQUE NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "freshnessInfo" TEXT NOT NULL DEFAULT '100% Farm Fresh Daily Cut, Antibiotic-Free, Halal Certified',
    "cuttingOptions" TEXT[] DEFAULT ARRAY['Curry Cut', 'Small Pieces', 'Medium Pieces', 'Large Pieces', 'Boneless', 'Skinless'],
    "cleaningOptions" TEXT[] DEFAULT ARRAY['Standard Clean', 'Extra Clean & Washed', 'With Skin', 'Skinless'],
    "basePrice" DOUBLE PRECISION NOT NULL,
    "discountPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isBestSeller" BOOLEAN NOT NULL DEFAULT false,
    "isTodaySpecial" BOOLEAN NOT NULL DEFAULT false,
    "isRecommended" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 4.8,
    "reviewCount" INTEGER NOT NULL DEFAULT 12,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 8. Product Variants (Weight options: 250g, 500g, 750g, 1kg, 1.5kg, 2kg)
CREATE TABLE IF NOT EXISTS "ProductVariants" (
    "id" TEXT PRIMARY KEY,
    "productId" TEXT NOT NULL REFERENCES "Products"("id") ON DELETE CASCADE,
    "label" TEXT NOT NULL,
    "weightGrams" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "compareAtPrice" DOUBLE PRECISION,
    "sku" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 9. Inventory
CREATE TABLE IF NOT EXISTS "Inventory" (
    "id" TEXT PRIMARY KEY,
    "productId" TEXT NOT NULL REFERENCES "Products"("id") ON DELETE CASCADE,
    "variantId" TEXT NOT NULL REFERENCES "ProductVariants"("id") ON DELETE CASCADE,
    "stockQuantity" INTEGER NOT NULL DEFAULT 50,
    "reservedQuantity" INTEGER NOT NULL DEFAULT 0,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 10. Carts
CREATE TABLE IF NOT EXISTS "Carts" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "couponCode" TEXT,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 11. Cart Items
CREATE TABLE IF NOT EXISTS "CartItems" (
    "id" TEXT PRIMARY KEY,
    "cartId" TEXT NOT NULL REFERENCES "Carts"("id") ON DELETE CASCADE,
    "productId" TEXT NOT NULL REFERENCES "Products"("id") ON DELETE CASCADE,
    "variantId" TEXT NOT NULL REFERENCES "ProductVariants"("id") ON DELETE CASCADE,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "cuttingOption" TEXT,
    "cleaningOption" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 12. Orders
CREATE TABLE IF NOT EXISTS "Orders" (
    "id" TEXT PRIMARY KEY,
    "orderNumber" TEXT UNIQUE NOT NULL,
    "idempotencyKey" TEXT,
    "customerId" TEXT NOT NULL REFERENCES "Users"("id") ON DELETE RESTRICT,
    "addressId" TEXT REFERENCES "Addresses"("id") ON DELETE SET NULL,
    "deliveryAddressSnapshot" JSONB NOT NULL,
    "deliveryPartnerId" TEXT REFERENCES "DeliveryPartners"("id") ON DELETE SET NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PLACED',
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'COD',
    "paymentStatus" "OrderPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "subtotal" DOUBLE PRECISION NOT NULL,
    "deliveryCharge" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "couponCode" TEXT,
    "deliveryInstructions" TEXT,
    "deliverySlot" TEXT NOT NULL DEFAULT 'Express (30-45 mins)',
    "deliveryOtp" TEXT NOT NULL,
    "distanceKm" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "estimatedMinutes" INTEGER NOT NULL DEFAULT 35,
    "rejectionReason" TEXT,
    "cancellationReason" TEXT,
    "confirmedAt" TIMESTAMP,
    "preparedAt" TIMESTAMP,
    "pickedUpAt" TIMESTAMP,
    "deliveredAt" TIMESTAMP,
    "cancelledAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 13. Order Items
CREATE TABLE IF NOT EXISTS "OrderItems" (
    "id" TEXT PRIMARY KEY,
    "orderId" TEXT NOT NULL REFERENCES "Orders"("id") ON DELETE CASCADE,
    "productId" TEXT NOT NULL REFERENCES "Products"("id"),
    "variantId" TEXT NOT NULL REFERENCES "ProductVariants"("id"),
    "productName" TEXT NOT NULL,
    "variantLabel" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "cuttingOption" TEXT,
    "cleaningOption" TEXT
);

-- 14. Payments
CREATE TABLE IF NOT EXISTS "Payments" (
    "id" TEXT PRIMARY KEY,
    "orderId" TEXT NOT NULL REFERENCES "Orders"("id") ON DELETE CASCADE,
    "gateway" TEXT NOT NULL DEFAULT 'RAZORPAY',
    "gatewayOrderId" TEXT,
    "gatewayPaymentId" TEXT,
    "gatewaySignature" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "PaymentTransactionStatus" NOT NULL DEFAULT 'CREATED',
    "rawPayload" JSONB,
    "verifiedAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 15. Refunds
CREATE TABLE IF NOT EXISTS "Refunds" (
    "id" TEXT PRIMARY KEY,
    "orderId" TEXT NOT NULL REFERENCES "Orders"("id") ON DELETE CASCADE,
    "paymentId" TEXT REFERENCES "Payments"("id"),
    "amount" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "RefundStatus" NOT NULL DEFAULT 'REQUESTED',
    "gatewayRefundId" TEXT,
    "processedBy" TEXT,
    "processedAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 16. Coupons
CREATE TABLE IF NOT EXISTS "Coupons" (
    "id" TEXT PRIMARY KEY,
    "code" TEXT UNIQUE NOT NULL,
    "description" TEXT,
    "discountType" "DiscountType" NOT NULL DEFAULT 'PERCENTAGE',
    "discountValue" DOUBLE PRECISION NOT NULL,
    "minOrderValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxDiscount" DOUBLE PRECISION,
    "usageLimit" INTEGER NOT NULL DEFAULT 1000,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "productId" TEXT REFERENCES "Products"("id") ON DELETE SET NULL,
    "startsAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "expiresAt" TIMESTAMP NOT NULL DEFAULT NOW() + INTERVAL '1 year',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 17. Delivery Assignments
CREATE TABLE IF NOT EXISTS "DeliveryAssignments" (
    "id" TEXT PRIMARY KEY,
    "orderId" TEXT NOT NULL REFERENCES "Orders"("id") ON DELETE CASCADE,
    "deliveryPartnerId" TEXT NOT NULL REFERENCES "DeliveryPartners"("id") ON DELETE CASCADE,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "assignedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "respondedAt" TIMESTAMP,
    "pickedUpAt" TIMESTAMP,
    "completedAt" TIMESTAMP
);

-- 18. Delivery Locations (Live GPS Track)
CREATE TABLE IF NOT EXISTS "DeliveryLocations" (
    "id" TEXT PRIMARY KEY,
    "orderId" TEXT NOT NULL REFERENCES "Orders"("id") ON DELETE CASCADE,
    "deliveryPartnerId" TEXT NOT NULL REFERENCES "DeliveryPartners"("id") ON DELETE CASCADE,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "heading" DOUBLE PRECISION,
    "speed" DOUBLE PRECISION,
    "recordedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 19. Delivery Earnings
CREATE TABLE IF NOT EXISTS "DeliveryEarnings" (
    "id" TEXT PRIMARY KEY,
    "deliveryPartnerId" TEXT NOT NULL REFERENCES "DeliveryPartners"("id") ON DELETE CASCADE,
    "orderId" TEXT NOT NULL REFERENCES "Orders"("id") ON DELETE CASCADE,
    "baseFee" DOUBLE PRECISION NOT NULL DEFAULT 40.0,
    "distanceBonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "commissionAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tipAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalEarning" DOUBLE PRECISION NOT NULL,
    "payoutStatus" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 20. Reviews
CREATE TABLE IF NOT EXISTS "Reviews" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "productId" TEXT NOT NULL REFERENCES "Products"("id") ON DELETE CASCADE,
    "orderId" TEXT REFERENCES "Orders"("id") ON DELETE SET NULL,
    "rating" INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    "title" TEXT,
    "comment" TEXT NOT NULL,
    "isVerifiedPurchase" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 21. Wishlists
CREATE TABLE IF NOT EXISTS "Wishlists" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "productId" TEXT NOT NULL REFERENCES "Products"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE("userId", "productId")
);

-- 22. Notifications
CREATE TABLE IF NOT EXISTS "Notifications" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT REFERENCES "Users"("id") ON DELETE CASCADE,
    "targetRole" "UserRole",
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "referenceId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 23. Support Tickets
CREATE TABLE IF NOT EXISTS "SupportTickets" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "orderNumber" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "adminReply" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 24. Store Settings
CREATE TABLE IF NOT EXISTS "StoreSettings" (
    "id" TEXT PRIMARY KEY DEFAULT 'default',
    "storeName" TEXT NOT NULL DEFAULT 'MEAT CORNER',
    "logoUrl" TEXT,
    "contactPhone" TEXT NOT NULL DEFAULT '+91 98765 43210',
    "contactEmail" TEXT NOT NULL DEFAULT 'support@meatcorner.in',
    "address" TEXT NOT NULL DEFAULT '142 Main Road, Near Bus Stand, Erode, Tamil Nadu 638116',
    "storeLat" DOUBLE PRECISION NOT NULL DEFAULT 11.3806,
    "storeLng" DOUBLE PRECISION NOT NULL DEFAULT 77.5944,
    "serviceableAreas" JSONB NOT NULL DEFAULT '[]',
    "baseDeliveryCharge" DOUBLE PRECISION NOT NULL DEFAULT 30,
    "perKmCharge" DOUBLE PRECISION NOT NULL DEFAULT 8,
    "freeDeliveryAbove" DOUBLE PRECISION NOT NULL DEFAULT 499,
    "minOrderAmount" DOUBLE PRECISION NOT NULL DEFAULT 150,
    "taxPercent" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "operatingHours" JSONB NOT NULL DEFAULT '{"openTime": "06:00", "closeTime": "22:00", "isOpenAllDays": true}',
    "deliveryTimeSlots" JSONB NOT NULL DEFAULT '["Express (30-45 mins)", "Morning (7:00 AM - 9:00 AM)", "Mid-Day (11:00 AM - 1:00 PM)", "Evening (5:00 PM - 7:00 PM)"]',
    "paymentSettings" JSONB NOT NULL DEFAULT '{"enableCod": true, "enableRazorpay": true}',
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indices for high performance
CREATE INDEX IF NOT EXISTS "idx_products_cat" ON "Products"("categoryId");
CREATE INDEX IF NOT EXISTS "idx_variants_prod" ON "ProductVariants"("productId");
CREATE INDEX IF NOT EXISTS "idx_inventory_variant" ON "Inventory"("variantId");
CREATE INDEX IF NOT EXISTS "idx_orders_customer" ON "Orders"("customerId");
CREATE INDEX IF NOT EXISTS "idx_orders_status" ON "Orders"("status");
CREATE INDEX IF NOT EXISTS "idx_orders_partner" ON "Orders"("deliveryPartnerId");
CREATE INDEX IF NOT EXISTS "idx_delivery_loc_order" ON "DeliveryLocations"("orderId");
