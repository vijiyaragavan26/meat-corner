-- ==============================================================================
-- MEAT CORNER: ZERO-ERROR END-TO-END DATABASE SETUP & COMPLETE SEED SCRIPT
-- 1. Unrestricts all 24 tables (Disables RLS completely)
-- 2. Safely seeds every single table with zero duplicate key or constraint errors
-- ==============================================================================

-- 1. DISABLE ROW LEVEL SECURITY (RLS) ACROSS ALL TABLES
DO $$ 
DECLARE 
    tbl RECORD;
BEGIN 
    FOR tbl IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP 
        EXECUTE 'ALTER TABLE public."' || tbl.tablename || '" DISABLE ROW LEVEL SECURITY;'; 
    END LOOP; 
END $$;

-- 2. STORE SETTINGS
INSERT INTO "StoreSettings" (
    "id", "storeName", "contactPhone", "contactEmail", "address", 
    "storeLat", "storeLng", "baseDeliveryCharge", "perKmCharge", 
    "freeDeliveryAbove", "minOrderAmount", "taxPercent", "updatedAt"
) VALUES (
    'default', 'MEAT CORNER', '+91 98765 43210', 'support@meatcorner.in', 
    '142 Main Road, Near Bus Stand, Erode, Tamil Nadu 638116',
    11.3806, 77.5944, 30.0, 8.0, 499.0, 150.0, 5.0, NOW()
) ON CONFLICT ("id") DO UPDATE SET "storeName" = EXCLUDED."storeName";

-- 3. USERS (Admin, Customer, Delivery Partners)
INSERT INTO "Users" ("id", "name", "email", "phone", "passwordHash", "role", "avatarUrl", "isVerified", "isActive", "createdAt", "updatedAt") VALUES
('usr_admin_1', 'Karthik Raja', 'admin@meatcorner.in', '+919876543200', '$2a$10$Fhzn7DUa3kceOlmKg.6uoOwFlNX4aURVkYSOD7dSPai0KPSE8xAeC', 'ADMIN', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', true, true, NOW(), NOW()),
('usr_cust_1', 'Priya Dharshini', 'customer@meatcorner.in', '+919876543210', '$2a$10$bY6Il8so6Aewe3tf46xXM.Qgqeo15sySonatpO8Y5kXR.dRORm8bq', 'CUSTOMER', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80', true, true, NOW(), NOW()),
('usr_cust_2', 'Vijay Kumar', 'vijay@meatcorner.in', '+917604906429', '$2a$10$bY6Il8so6Aewe3tf46xXM.Qgqeo15sySonatpO8Y5kXR.dRORm8bq', 'CUSTOMER', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', true, true, NOW(), NOW()),
('usr_del_1', 'Murugan K', 'delivery@meatcorner.in', '+919876543201', '$2a$10$RVu0YpcTNA9itfvlPH7SUuWEHn1dDCh.temR5bGmZs1KqbA8b7T/u', 'DELIVERY_PARTNER', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', true, true, NOW(), NOW()),
('usr_del_2', 'Senthil Kumar', 'delivery2@meatcorner.in', '+919876543202', '$2a$10$RVu0YpcTNA9itfvlPH7SUuWEHn1dDCh.temR5bGmZs1KqbA8b7T/u', 'DELIVERY_PARTNER', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', true, true, NOW(), NOW())
ON CONFLICT ("id") DO UPDATE SET "passwordHash" = EXCLUDED."passwordHash", "isActive" = true;

-- 4. PROFILES
INSERT INTO "AdminProfiles" ("id", "userId", "department", "permissions", "createdAt", "updatedAt") VALUES
('prof_adm_1', 'usr_admin_1', 'Operations & Logistics', '{"all": true}', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "CustomerProfiles" ("id", "userId", "loyaltyPoints", "createdAt", "updatedAt") VALUES
('prof_cust_1', 'usr_cust_1', 120, NOW(), NOW()),
('prof_cust_2', 'usr_cust_2', 50, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- 5. ADDRESSES
INSERT INTO "Addresses" (
    "id", "userId", "label", "recipientName", "phone", "line1", "line2", "landmark", "area", "city", "state", "pincode", "lat", "lng", "isDefault", "createdAt", "updatedAt"
) VALUES
('addr_1', 'usr_cust_1', 'Home', 'Priya Dharshini', '+919876543210', 'Plot No 24, Gandhi Nagar', 'Near Water Tank', 'Opposite Govt School', 'Kanjikovil', 'Erode', 'Tamil Nadu', '638116', 11.3850, 77.5920, true, NOW(), NOW()),
('addr_2', 'usr_cust_1', 'Work', 'Priya Dharshini', '+919876543210', 'Tech Park, 2nd Floor', 'Brough Road', 'Near City Tower', 'Central Erode', 'Erode', 'Tamil Nadu', '638001', 11.3780, 77.5900, false, NOW(), NOW()),
('addr_3', 'usr_cust_2', 'Home', 'Vijay Kumar', '+917604906429', 'No 15, Bharathi Street', 'Perundurai Road', 'Near Bus Stop', 'Kanjikovil', 'Erode', 'Tamil Nadu', '638116', 11.3830, 77.5940, true, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- 6. DELIVERY PARTNERS
INSERT INTO "DeliveryPartners" (
    "id", "userId", "fullName", "phone", "email", "address", 
    "drivingLicenseNo", "vehicleType", "vehicleNumber", "approvalStatus", 
    "isOnline", "isAvailable", "currentLat", "currentLng", "rating", "createdAt", "updatedAt"
) VALUES
('dp_1', 'usr_del_1', 'Murugan K', '+919876543201', 'delivery@meatcorner.in', 'Perundurai Road, Erode', 'TN33-2018-004921', 'Motorcycle', 'TN 33 BM 4921', 'APPROVED', true, true, 11.3810, 77.5950, 4.88, NOW(), NOW()),
('dp_2', 'usr_del_2', 'Senthil Kumar', '+919876543202', 'delivery2@meatcorner.in', 'Brough Road, Erode', 'TN33-2020-009132', 'Scooter', 'TN 33 CJ 9132', 'APPROVED', true, true, 11.3780, 77.5900, 4.92, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- 7. CATEGORIES
INSERT INTO "Categories" ("id", "name", "slug", "description", "imageUrl", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES
('cat_curry', 'Curry Cut Chicken', 'curry-cut-chicken', 'Evenly sized bone-in chicken pieces perfect for gravies, salna, and traditional curries.', 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=600&q=80', 1, true, NOW(), NOW()),
('cat_skinless', 'Skinless Chicken', 'skinless-chicken', 'Tender cuts with skin neatly removed for health-conscious and lean meat recipes.', 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=80', 2, true, NOW(), NOW()),
('cat_boneless', 'Boneless Chicken', 'boneless-chicken', '100% boneless fresh chicken cubes, ideal for butter chicken, tikka, and stir-fries.', 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=80', 3, true, NOW(), NOW()),
('cat_breast', 'Chicken Breast', 'chicken-breast', 'High-protein, tender, succulent fillets cut daily from healthy grain-fed chickens.', 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=80', 4, true, NOW(), NOW()),
('cat_leg', 'Chicken Leg', 'chicken-leg', 'Juicy drumsticks and whole leg quarters bursting with flavour for grills & roasts.', 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=600&q=80', 5, true, NOW(), NOW()),
('cat_wings', 'Chicken Wings', 'chicken-wings', 'Crispy wingettes and drumettes ideal for hot wings, barbecue, and deep frying.', 'https://images.unsplash.com/photo-1527477321055-43615b6294a5?auto=format&fit=crop&w=600&q=80', 6, true, NOW(), NOW()),
('cat_whole', 'Whole Chicken', 'whole-chicken', 'Whole farm-raised broiler & country chicken dressed and cleaned to perfection.', 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=600&q=80', 7, true, NOW(), NOW()),
('cat_liver_gizzard', 'Chicken Liver & Gizzard', 'chicken-liver-gizzard', 'Iron-rich, nutritious, meticulously cleaned fresh organ cuts for traditional roasts.', 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=600&q=80', 8, true, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- 8. PRODUCTS
INSERT INTO "Products" (
    "id", "categoryId", "name", "slug", "description", "shortDescription", 
    "images", "freshnessInfo", "cuttingOptions", "cleaningOptions", 
    "basePrice", "discountPercent", "isBestSeller", "isTodaySpecial", 
    "isRecommended", "isActive", "avgRating", "reviewCount", "createdAt", "updatedAt"
) VALUES
('prod_1', 'cat_curry', 'Chicken Curry Cut (Skinless)', 'chicken-curry-cut-skinless', 'Evenly sized bone-in chicken pieces from tender farm broilers. Washed, cleaned, and cut into uniform pieces.', 'Tender bone-in chicken cut into medium pieces.', ARRAY['https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80'], '100% antibiotic-free, chilled under 4°C.', ARRAY['Curry Cut (Small)', 'Curry Cut (Medium)', 'Large Biryani Cut'], ARRAY['Standard Clean & Washed', 'Extra Turmeric Wash'], 250, 0, true, true, true, true, 4.9, 142, NOW(), NOW()),
('prod_2', 'cat_breast', 'Tender Chicken Breast Boneless', 'tender-chicken-breast-boneless', 'Premium tender boneless chicken breast fillets. High in protein, low in fat. Cut fresh on order.', 'Succulent boneless chicken breast fillet.', ARRAY['https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=80'], 'Grade A, zero chemical wash.', ARRAY['Whole Fillet', 'Bite-sized Cubes', 'Thin Strips'], ARRAY['Pre-trimmed & Cleaned'], 320, 5, true, false, true, true, 4.95, 98, NOW(), NOW()),
('prod_3', 'cat_leg', 'Chicken Drumsticks (Tangdi Cut)', 'chicken-drumsticks-tangdi', 'Juicy, meaty drumsticks with bone-in for deep flavour. Perfect for tandoori, grills, and Chettinad fry.', 'Meaty drumsticks cut for grills & curries.', ARRAY['https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80'], 'Fresh daily cuts, farm fresh.', ARRAY['Deep Slits / Scored', 'Natural Uncut'], ARRAY['Skinless Cleaned'], 290, 0, true, false, true, true, 4.85, 76, NOW(), NOW()),
('prod_4', 'cat_curry', 'Nattu Kozhi Country Chicken Curry Cut', 'nattu-kozhi-country-chicken-curry-cut', 'Authentic free-range country chicken. Richer broth, firm texture, and high nutrients.', 'Traditional Tamil Nadu Nattu Kozhi.', ARRAY['https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80'], '100% Free range, zero antibiotics.', ARRAY['Curry Cut (Small)', 'Soup Cut (Medium)'], ARRAY['Standard Clean', 'Turmeric Singed'], 460, 0, true, true, true, true, 4.95, 112, NOW(), NOW()),
('prod_21', 'cat_boneless', 'Fresh Minced Chicken (Keema)', 'fresh-minced-chicken-keema', 'Finely minced boneless chicken breast and thighs. Great for chicken keema samosas and parathas.', 'Fine ground boneless chicken mince.', ARRAY['https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=80'], 'Minced fresh on order.', ARRAY['Fine Mince', 'Medium Grind'], ARRAY['Hygienically Packed'], 350, 10, true, false, true, true, 4.9, 84, NOW(), NOW()),
('prod_24', 'cat_curry', 'Biryani Cut Special Chicken', 'biryani-cut-special-chicken', 'Large, juicy succulent pieces cut specifically for slow dum biryani.', 'Large 12-14 pieces per kg cut for Biryani.', ARRAY['https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80'], 'Hand selected birds.', ARRAY['Large Biryani Cut (12-14 pcs/kg)'], ARRAY['Standard Clean'], 260, 0, true, true, true, true, 4.92, 130, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- 9. PRODUCT VARIANTS
INSERT INTO "ProductVariants" ("id", "productId", "label", "weightGrams", "price", "sku", "isActive", "createdAt", "updatedAt") VALUES
('var_1_500g', 'prod_1', '500g', 500, 130, 'MC-CHK-CUR-500G', true, NOW(), NOW()),
('var_1_1kg', 'prod_1', '1kg', 1000, 250, 'MC-CHK-CUR-1KG', true, NOW(), NOW()),
('var_1_1', 'prod_1', '500g', 500, 125, 'SKU-var_1_1', true, NOW(), NOW()),
('var_1_2', 'prod_1', '1kg', 1000, 250, 'SKU-var_1_2', true, NOW(), NOW()),
('var_2_500g', 'prod_2', '500g', 500, 165, 'MC-CHK-BRS-500G', true, NOW(), NOW()),
('var_2_1kg', 'prod_2', '1kg', 1000, 320, 'MC-CHK-BRS-1KG', true, NOW(), NOW()),
('var_3_500g', 'prod_3', '500g', 500, 150, 'MC-CHK-LEG-500G', true, NOW(), NOW()),
('var_3_1kg', 'prod_3', '1kg', 1000, 290, 'MC-CHK-LEG-1KG', true, NOW(), NOW()),
('var_4_1', 'prod_4', '500g', 500, 230, 'SKU-var_4_1', true, NOW(), NOW()),
('var_4_2', 'prod_4', '1kg', 1000, 460, 'SKU-var_4_2', true, NOW(), NOW()),
('var_21_1', 'prod_21', '500g', 500, 175, 'SKU-var_21_1', true, NOW(), NOW()),
('var_24_2', 'prod_24', '1kg', 1000, 260, 'SKU-var_24_2', true, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- 10. INVENTORY
INSERT INTO "Inventory" ("id", "productId", "variantId", "stockQuantity", "reservedQuantity", "lowStockThreshold", "updatedAt") VALUES
('inv_1', 'prod_1', 'var_1_500g', 85, 0, 10, NOW()),
('inv_2', 'prod_1', 'var_1_1kg', 120, 0, 10, NOW()),
('inv_3', 'prod_2', 'var_2_500g', 60, 0, 10, NOW()),
('inv_4', 'prod_2', 'var_2_1kg', 75, 0, 10, NOW()),
('inv_5', 'prod_3', 'var_3_500g', 90, 0, 10, NOW()),
('inv_6', 'prod_3', 'var_3_1kg', 110, 0, 10, NOW()),
('inv_7', 'prod_4', 'var_4_1', 45, 0, 5, NOW()),
('inv_8', 'prod_21', 'var_21_1', 50, 0, 5, NOW()),
('inv_9', 'prod_24', 'var_24_2', 80, 0, 10, NOW())
ON CONFLICT ("id") DO NOTHING;

-- 11. COUPONS
INSERT INTO "Coupons" ("id", "code", "description", "discountType", "discountValue", "minOrderValue", "maxDiscount", "usageLimit", "usedCount", "isActive", "createdAt", "updatedAt") VALUES
('coup_1', 'MEATFIRST20', 'Flat ₹20 off on your first fresh chicken order', 'FLAT', 20.0, 199.0, 20.0, 5000, 1, true, NOW(), NOW()),
('coup_2', 'FRESHCHICKEN10', '10% instant discount up to ₹50 on chicken breast & cuts', 'PERCENTAGE', 10.0, 299.0, 50.0, 1000, 0, true, NOW(), NOW()),
('coup_3', 'WEEKEND50', 'Weekend Special: Flat ₹50 off on orders above ₹699', 'FLAT', 50.0, 699.0, 50.0, 2000, 0, true, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- 12. ORDERS (INDIVIDUALLY INSERTED ONLY IF NOT ALREADY EXISTING)
INSERT INTO "Orders" (
    "id", "orderNumber", "customerId", "addressId", "deliveryAddressSnapshot", 
    "deliveryPartnerId", "status", "paymentMethod", "paymentStatus", 
    "subtotal", "deliveryCharge", "discountAmount", "taxAmount", "totalAmount", 
    "couponCode", "deliverySlot", "deliveryOtp", "distanceKm", "estimatedMinutes", 
    "confirmedAt", "preparedAt", "pickedUpAt", "deliveredAt", "createdAt", "updatedAt"
)
SELECT 
    'ord_ebd9175a', 'MC-20261113-4117', 'usr_cust_1', 'addr_1', 
    '{"recipientName": "Priya Dharshini", "phone": "+919876543210", "line1": "Plot No 24, Gandhi Nagar", "area": "Kanjikovil", "city": "Erode", "pincode": "638116"}'::jsonb,
    'dp_1', 'OUT_FOR_DELIVERY', 'COD', 'PENDING', 460.0, 30.0, 20.0, 23.0, 425.0,
    'MEATFIRST20', 'Express (30-45 mins)', '4117', 3.2, 35,
    NOW(), NOW(), NOW(), NULL, NOW() - INTERVAL '15 minutes', NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Orders" WHERE "orderNumber" = 'MC-20261113-4117');

INSERT INTO "Orders" (
    "id", "orderNumber", "customerId", "addressId", "deliveryAddressSnapshot", 
    "deliveryPartnerId", "status", "paymentMethod", "paymentStatus", 
    "subtotal", "deliveryCharge", "discountAmount", "taxAmount", "totalAmount", 
    "couponCode", "deliverySlot", "deliveryOtp", "distanceKm", "estimatedMinutes", 
    "confirmedAt", "preparedAt", "pickedUpAt", "deliveredAt", "createdAt", "updatedAt"
)
SELECT 
    'ord_8691', 'MC-20261113-8691', 'usr_cust_2', 'addr_3',
    '{"recipientName": "Vijay Kumar", "phone": "+917604906429", "line1": "No 15, Bharathi Street", "area": "Kanjikovil", "city": "Erode", "pincode": "638116"}'::jsonb,
    'dp_1', 'DELIVERED', 'RAZORPAY', 'PAID', 350.0, 30.0, 0.0, 17.5, 429.0,
    NULL, 'Express (30-45 mins)', '8691', 2.8, 30,
    NOW(), NOW(), NOW(), NOW(), NOW() - INTERVAL '45 minutes', NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Orders" WHERE "orderNumber" = 'MC-20261113-8691');

INSERT INTO "Orders" (
    "id", "orderNumber", "customerId", "addressId", "deliveryAddressSnapshot", 
    "deliveryPartnerId", "status", "paymentMethod", "paymentStatus", 
    "subtotal", "deliveryCharge", "discountAmount", "taxAmount", "totalAmount", 
    "couponCode", "deliverySlot", "deliveryOtp", "distanceKm", "estimatedMinutes", 
    "confirmedAt", "preparedAt", "pickedUpAt", "deliveredAt", "createdAt", "updatedAt"
)
SELECT 
    'ord_1794583647530', 'MC-647530', 'usr_cust_1', 'addr_1',
    '{"recipientName": "Priya Dharshini", "phone": "+919876543210", "line1": "Plot No 24, Gandhi Nagar", "area": "Kanjikovil", "city": "Erode", "pincode": "638116"}'::jsonb,
    'dp_1', 'PARTNER_ASSIGNED', 'COD', 'PAID', 260.0, 30.0, 0.0, 13.0, 303.0,
    NULL, 'Express (30-45 mins)', '6192', 2.1, 25,
    NOW(), NOW(), NULL, NULL, NOW() - INTERVAL '1 hour', NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Orders" WHERE "orderNumber" = 'MC-647530');

INSERT INTO "Orders" (
    "id", "orderNumber", "customerId", "addressId", "deliveryAddressSnapshot", 
    "deliveryPartnerId", "status", "paymentMethod", "paymentStatus", 
    "subtotal", "deliveryCharge", "discountAmount", "taxAmount", "totalAmount", 
    "couponCode", "deliverySlot", "deliveryOtp", "distanceKm", "estimatedMinutes", 
    "confirmedAt", "preparedAt", "pickedUpAt", "deliveredAt", "createdAt", "updatedAt"
)
SELECT 
    'ord_demo_101', 'MC-20261110-001', 'usr_cust_1', 'addr_1',
    '{"recipientName": "Priya Dharshini", "phone": "+919876543210", "line1": "Plot No 24, Gandhi Nagar", "area": "Kanjikovil", "city": "Erode", "pincode": "638116"}'::jsonb,
    'dp_1', 'PICKED_UP', 'COD', 'PENDING', 510.0, 0.0, 20.0, 24.5, 514.5,
    'MEATFIRST20', 'Express (30-45 mins)', '4829', 2.5, 30,
    NOW(), NOW(), NOW(), NULL, NOW() - INTERVAL '2 hours', NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Orders" WHERE "orderNumber" = 'MC-20261110-001');

-- 13. ORDER ITEMS (DYNAMIC LOOKUP BY REAL ORDER ID)
INSERT INTO "OrderItems" ("id", "orderId", "productId", "variantId", "productName", "variantLabel", "quantity", "unitPrice", "totalPrice", "cuttingOption", "cleaningOption")
SELECT 'oi_4117', o."id", 'prod_4', 'var_4_1', 'Nattu Kozhi Country Chicken Curry Cut', '500g', 2, 230.0, 460.0, 'Curry Cut (Small)', 'Standard Clean'
FROM "Orders" o WHERE o."orderNumber" = 'MC-20261113-4117'
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "OrderItems" ("id", "orderId", "productId", "variantId", "productName", "variantLabel", "quantity", "unitPrice", "totalPrice", "cuttingOption", "cleaningOption")
SELECT 'oi_8691', o."id", 'prod_21', 'var_21_1', 'Fresh Minced Chicken (Keema)', '500g', 1, 350.0, 350.0, 'Fine Mince', 'Standard Clean'
FROM "Orders" o WHERE o."orderNumber" = 'MC-20261113-8691'
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "OrderItems" ("id", "orderId", "productId", "variantId", "productName", "variantLabel", "quantity", "unitPrice", "totalPrice", "cuttingOption", "cleaningOption")
SELECT 'oi_647530', o."id", 'prod_1', 'var_1_1', 'Chicken Curry Cut (Skinless)', '500g', 1, 125.0, 125.0, 'Curry Cut (Medium)', 'Extra Turmeric Wash'
FROM "Orders" o WHERE o."orderNumber" = 'MC-647530'
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "OrderItems" ("id", "orderId", "productId", "variantId", "productName", "variantLabel", "quantity", "unitPrice", "totalPrice", "cuttingOption", "cleaningOption")
SELECT 'oi_001_a', o."id", 'prod_1', 'var_1_2', 'Chicken Curry Cut (Skinless)', '1kg', 1, 250.0, 250.0, 'Curry Cut (Medium)', 'Standard Clean & Washed'
FROM "Orders" o WHERE o."orderNumber" = 'MC-20261110-001'
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "OrderItems" ("id", "orderId", "productId", "variantId", "productName", "variantLabel", "quantity", "unitPrice", "totalPrice", "cuttingOption", "cleaningOption")
SELECT 'oi_001_b', o."id", 'prod_24', 'var_24_2', 'Biryani Cut Special Chicken', '1kg', 1, 260.0, 260.0, 'Large Biryani Cut (12-14 pcs/kg)', 'Standard Clean'
FROM "Orders" o WHERE o."orderNumber" = 'MC-20261110-001'
ON CONFLICT ("id") DO NOTHING;

-- 14. PAYMENTS
INSERT INTO "Payments" ("id", "orderId", "gateway", "amount", "currency", "status", "createdAt", "updatedAt")
SELECT 'pay_8691', o."id", 'RAZORPAY', 429.0, 'INR', 'CAPTURED', NOW() - INTERVAL '45 minutes', NOW()
FROM "Orders" o WHERE o."orderNumber" = 'MC-20261113-8691'
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Payments" ("id", "orderId", "gateway", "amount", "currency", "status", "createdAt", "updatedAt")
SELECT 'pay_4117', o."id", 'COD', 425.0, 'INR', 'CREATED', NOW() - INTERVAL '15 minutes', NOW()
FROM "Orders" o WHERE o."orderNumber" = 'MC-20261113-4117'
ON CONFLICT ("id") DO NOTHING;

-- 15. REFUNDS
INSERT INTO "Refunds" ("id", "orderId", "amount", "reason", "status", "createdAt", "updatedAt")
SELECT 'ref_1', o."id", 50.0, 'Promotional cash adjustment / Customer goodwill', 'COMPLETED', NOW(), NOW()
FROM "Orders" o WHERE o."orderNumber" = 'MC-20261113-8691'
ON CONFLICT ("id") DO NOTHING;

-- 16. DELIVERY ASSIGNMENTS
INSERT INTO "DeliveryAssignments" ("id", "orderId", "deliveryPartnerId", "status", "assignedAt")
SELECT 'asgn_1', o."id", 'dp_1', 'ACCEPTED', NOW() - INTERVAL '10 minutes'
FROM "Orders" o WHERE o."orderNumber" = 'MC-20261113-4117'
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "DeliveryAssignments" ("id", "orderId", "deliveryPartnerId", "status", "assignedAt")
SELECT 'asgn_2', o."id", 'dp_1', 'COMPLETED', NOW() - INTERVAL '40 minutes'
FROM "Orders" o WHERE o."orderNumber" = 'MC-20261113-8691'
ON CONFLICT ("id") DO NOTHING;

-- 17. DELIVERY LOCATIONS (LIVE GPS COORDINATES)
INSERT INTO "DeliveryLocations" ("id", "orderId", "deliveryPartnerId", "lat", "lng", "heading", "speed", "recordedAt")
SELECT 'loc_1', o."id", 'dp_1', 11.3820, 77.5930, 45.0, 28.5, NOW()
FROM "Orders" o WHERE o."orderNumber" = 'MC-20261113-4117'
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "DeliveryLocations" ("id", "orderId", "deliveryPartnerId", "lat", "lng", "heading", "speed", "recordedAt")
SELECT 'loc_2', o."id", 'dp_1', 11.3835, 77.5925, 50.0, 25.0, NOW()
FROM "Orders" o WHERE o."orderNumber" = 'MC-20261113-4117'
ON CONFLICT ("id") DO NOTHING;

-- 18. DELIVERY EARNINGS
INSERT INTO "DeliveryEarnings" ("id", "deliveryPartnerId", "orderId", "baseFee", "distanceBonus", "commissionAmount", "tipAmount", "totalEarning", "payoutStatus", "createdAt")
SELECT 'earn_1', 'dp_1', o."id", 40.0, 10.0, 0.0, 20.0, 70.0, 'PAID', NOW() - INTERVAL '40 minutes'
FROM "Orders" o WHERE o."orderNumber" = 'MC-20261113-8691'
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "DeliveryEarnings" ("id", "deliveryPartnerId", "orderId", "baseFee", "distanceBonus", "commissionAmount", "tipAmount", "totalEarning", "payoutStatus", "createdAt")
SELECT 'earn_2', 'dp_1', o."id", 40.0, 16.0, 0.0, 0.0, 56.0, 'PENDING', NOW() - INTERVAL '15 minutes'
FROM "Orders" o WHERE o."orderNumber" = 'MC-20261113-4117'
ON CONFLICT ("id") DO NOTHING;

-- 19. REVIEWS & RATINGS
INSERT INTO "Reviews" ("id", "userId", "productId", "rating", "title", "comment", "isVerifiedPurchase", "createdAt", "updatedAt") VALUES
('rev_1', 'usr_cust_1', 'prod_1', 5, 'Super fresh and tender!', 'The chicken curry cut was cleanly cut with no odor or feathers. Perfect for gravies.', true, NOW(), NOW()),
('rev_2', 'usr_cust_2', 'prod_4', 5, 'Authentic Nattu Kozhi', 'Genuine country chicken with firm meat and rich flavor for traditional kozhi kulambu.', true, NOW(), NOW()),
('rev_3', 'usr_cust_1', 'prod_21', 5, 'Melt-in-mouth chicken keema', 'Fine keema mince cooked tender within minutes without any sinews.', true, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- 20. WISHLISTS
INSERT INTO "Wishlists" ("id", "userId", "productId", "createdAt") VALUES
('wish_1', 'usr_cust_1', 'prod_2', NOW()),
('wish_2', 'usr_cust_1', 'prod_3', NOW())
ON CONFLICT ("id") DO NOTHING;

-- 21. NOTIFICATIONS
INSERT INTO "Notifications" ("id", "userId", "targetRole", "title", "message", "type", "isRead", "createdAt") VALUES
('notif_1', 'usr_cust_1', 'CUSTOMER', 'Chicken Order Out for Delivery 🍗', 'Your fresh chicken order #MC-20261113-4117 has been picked up by rider Murugan K.', 'ORDER_STATUS', false, NOW()),
('notif_2', 'usr_admin_1', 'ADMIN', 'New Fresh Order Received', 'Order #MC-20261113-4117 received for ₹425 via Cash on Delivery.', 'NEW_ORDER', true, NOW())
ON CONFLICT ("id") DO NOTHING;

-- 22. SUPPORT TICKETS
INSERT INTO "SupportTickets" ("id", "userId", "orderNumber", "subject", "message", "status", "adminReply", "createdAt", "updatedAt") VALUES
('tkt_1', 'usr_cust_1', 'MC-20261113-4117', 'Extra Turmeric Wash Request', 'Can you please ensure the chicken is double washed with fresh turmeric?', 'RESOLVED', 'Yes, our master butcher has washed and turmeric-treated your order.', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- 23. ACTIVE CARTS & CART ITEMS
INSERT INTO "Carts" ("id", "userId", "couponCode", "updatedAt") VALUES
('cart_cust_1', 'usr_cust_1', 'MEATFIRST20', NOW())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "CartItems" ("id", "cartId", "productId", "variantId", "quantity", "cuttingOption", "cleaningOption", "createdAt", "updatedAt") VALUES
('citem_1', 'cart_cust_1', 'prod_1', 'var_1_1kg', 1, 'Curry Cut (Medium)', 'Standard Clean & Washed', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;
