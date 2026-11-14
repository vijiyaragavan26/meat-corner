# MEAT CORNER DATABASE SCHEMA ARCHITECTURE

The platform uses Supabase PostgreSQL with 24 relational tables, Row-Level Security (RLS) policies, and foreign key constraints.

---

## 1. Entities & Schema Definitions

### `Users`
- `id` (TEXT, PK): Unique user ID (e.g. `usr_admin_1`, `usr_cust_1`, `usr_del_1`)
- `name` (TEXT): Full name
- `email` (TEXT, UNIQUE): Login email
- `phone` (TEXT): Mobile number
- `passwordHash` (TEXT): Bcrypt salted password hash
- `role` (ENUM: `CUSTOMER`, `ADMIN`, `DELIVERY_PARTNER`)
- `avatarUrl` (TEXT, Nullable)
- `isVerified` (BOOLEAN): Mobile/email verified flag
- `isActive` (BOOLEAN): Status toggle
- `createdAt`, `updatedAt` (TIMESTAMP)

### `CustomerProfiles`
- `id` (TEXT, PK)
- `userId` (TEXT, FK -> `Users.id`)
- `defaultAddressId` (TEXT, Nullable)
- `preferences` (JSONB): Dietary & butchery preferences
- `loyaltyPoints` (INTEGER): Points earned per order

### `DeliveryPartners`
- `id` (TEXT, PK): Driver ID (e.g. `dp_1`, `dp_2`)
- `userId` (TEXT, FK -> `Users.id`)
- `fullName` (TEXT)
- `phone` (TEXT)
- `email` (TEXT)
- `address` (TEXT)
- `drivingLicenseNo` (TEXT): Driving license number
- `drivingLicenseDoc` (TEXT, Nullable)
- `vehicleType` (TEXT): Motorcycle / Scooter
- `vehicleNumber` (TEXT): Vehicle registration (e.g. `TN 33 MC 4521`)
- `approvalStatus` (ENUM: `PENDING`, `APPROVED`, `REJECTED`)
- `isOnline` (BOOLEAN): Live availability switch
- `currentLat`, `currentLng` (DOUBLE PRECISION): Current GPS coordinates
- `commissionRate` (DOUBLE PRECISION): Base fee earned per order (e.g. ₹40)
- `totalDeliveries` (INTEGER): Total completed deliveries count
- `rating` (DOUBLE PRECISION): Average customer rating (1-5)

### `Addresses`
- `id` (TEXT, PK)
- `userId` (TEXT, FK -> `Users.id`)
- `label` (TEXT): `Home`, `Work`, `Other`
- `recipientName` (TEXT)
- `phone` (TEXT)
- `line1`, `line2`, `landmark` (TEXT)
- `area`, `city`, `state` (TEXT)
- `pincode` (TEXT): 6-digit postal code checked against serviceable zones
- `lat`, `lng` (DOUBLE PRECISION): Destination coordinates
- `isDefault` (BOOLEAN)

### `Categories` (Exclusively Chicken)
- `id` (TEXT, PK): `cat_curry`, `cat_breast`, `cat_skinless`, `cat_whole`, etc.
- `name` (TEXT): e.g. `Curry Cut Chicken`, `Chicken Breast`
- `slug` (TEXT, UNIQUE): e.g. `curry-cut-chicken`
- `description` (TEXT)
- `imageUrl` (TEXT)
- `sortOrder` (INTEGER)
- `isActive` (BOOLEAN)

### `Products` (Exclusively Chicken)
- `id` (TEXT, PK): Product ID (e.g. `prod_1`)
- `categoryId` (TEXT, FK -> `Categories.id`)
- `name` (TEXT): Name of chicken cut
- `slug` (TEXT, UNIQUE)
- `description`, `shortDescription` (TEXT)
- `images` (TEXT[]): Array of high-resolution chicken image URLs
- `freshnessInfo` (TEXT): e.g. "Halal certified, cut fresh daily"
- `cuttingOptions` (TEXT[]): e.g. `['Curry Cut (Small)', 'Curry Cut (Medium)', 'Large Biryani Cut']`
- `cleaningOptions` (TEXT[]): e.g. `['Standard Clean & Washed', 'Turmeric Washed']`
- `basePrice` (DOUBLE PRECISION): Price in ₹ per kilogram
- `discountPercent` (DOUBLE PRECISION)
- `isBestSeller`, `isTodaySpecial`, `isRecommended` (BOOLEAN)
- `isActive` (BOOLEAN)
- `avgRating` (DOUBLE PRECISION)
- `reviewCount` (INTEGER)

### `ProductVariants` (Weight Packs)
- `id` (TEXT, PK): e.g. `var_1_1`, `var_1_2`
- `productId` (TEXT, FK -> `Products.id`)
- `label` (TEXT): `250 grams`, `500 grams`, `1 kg`, `1.5 kg`, `2 kg`
- `weightGrams` (INTEGER): `250`, `500`, `1000`, `1500`, `2000`
- `price` (DOUBLE PRECISION): Price in ₹ for this weight pack
- `compareAtPrice` (DOUBLE PRECISION, Nullable)
- `sku` (TEXT)

### `Inventory`
- `id` (TEXT, PK)
- `productId` (TEXT, FK -> `Products.id`)
- `variantId` (TEXT, FK -> `ProductVariants.id`)
- `stockQuantity` (INTEGER): Total units available in processing center
- `reservedQuantity` (INTEGER): Units locked in active carts & unfulfilled orders
- `lowStockThreshold` (INTEGER): Alert trigger (e.g. 5 units)

### `Orders`
- `id` (TEXT, PK): Order UUID
- `orderNumber` (TEXT, UNIQUE): e.g. `MC-20261110-001`
- `customerId` (TEXT, FK -> `Users.id`)
- `deliveryAddressSnapshot` (JSONB): Immutable snapshot of address at checkout
- `deliveryPartnerId` (TEXT, FK -> `DeliveryPartners.id`, Nullable)
- `status` (ENUM: `PLACED`, `CONFIRMED`, `PREPARING`, `READY_FOR_PICKUP`, `PARTNER_ASSIGNED`, `PICKED_UP`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`, `REJECTED`)
- `paymentMethod` (ENUM: `RAZORPAY`, `COD`)
- `paymentStatus` (ENUM: `PENDING`, `PAID`, `FAILED`, `REFUNDED`)
- `subtotal`, `deliveryCharge`, `discountAmount`, `taxAmount`, `totalAmount` (DOUBLE PRECISION)
- `couponCode` (TEXT, Nullable)
- `deliverySlot` (TEXT): e.g. `Express (30-45 mins)`
- `deliveryOtp` (TEXT): High-security 4-digit code required for delivery confirmation
- `distanceKm` (DOUBLE PRECISION)
- `estimatedMinutes` (INTEGER)
- Timestamps: `confirmedAt`, `preparedAt`, `pickedUpAt`, `deliveredAt`, `cancelledAt`

### `OrderItems`
- `id` (TEXT, PK)
- `orderId` (TEXT, FK -> `Orders.id`)
- `productId`, `variantId` (TEXT)
- `productName`, `variantLabel` (TEXT)
- `quantity` (INTEGER)
- `unitPrice`, `totalPrice` (DOUBLE PRECISION)
- `cuttingOption`, `cleaningOption` (TEXT)

### `Payments`
- `id` (TEXT, PK)
- `orderId` (TEXT, FK -> `Orders.id`)
- `gateway` (TEXT): `RAZORPAY`
- `gatewayOrderId` (TEXT)
- `gatewayPaymentId` (TEXT)
- `gatewaySignature` (TEXT)
- `amount` (DOUBLE PRECISION)
- `status` (ENUM: `CREATED`, `AUTHORIZED`, `CAPTURED`, `FAILED`)

### `DeliveryLocations` (GPS Breadcrumbs)
- `id` (TEXT, PK)
- `orderId` (TEXT)
- `deliveryPartnerId` (TEXT)
- `lat`, `lng` (DOUBLE PRECISION)
- `recordedAt` (TIMESTAMP)

### `DeliveryEarnings`
- `id` (TEXT, PK)
- `deliveryPartnerId` (TEXT)
- `orderId` (TEXT)
- `baseFee` (DOUBLE PRECISION)
- `distanceBonus` (DOUBLE PRECISION)
- `tipAmount` (DOUBLE PRECISION)
- `totalEarning` (DOUBLE PRECISION)
- `payoutStatus` (ENUM: `PENDING`, `PAID`)

### `StoreSettings`
- `id` (TEXT, PK DEFAULT 'default')
- `storeName` (TEXT): `MEAT CORNER`
- `contactPhone`, `contactEmail`, `address` (TEXT)
- `storeLat`, `storeLng` (DOUBLE PRECISION)
- `serviceableAreas` (JSONB): Pincodes list and delivery radius
- `baseDeliveryCharge`, `freeDeliveryAbove`, `minOrderAmount`, `taxPercent` (DOUBLE PRECISION)
