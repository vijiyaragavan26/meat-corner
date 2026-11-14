-- ==============================================================================
-- MEAT CORNER: ZERO-ERROR SCRIPT FOR ALL TABLES
-- (Safely skips existing orders to prevent duplicate key errors)
-- ==============================================================================

-- 1. DISABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
DO $$ 
DECLARE 
    tbl RECORD;
BEGIN 
    FOR tbl IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP 
        EXECUTE 'ALTER TABLE public."' || tbl.tablename || '" DISABLE ROW LEVEL SECURITY;'; 
    END LOOP; 
END $$;

-- 2. SEED STORE SETTINGS
INSERT INTO "StoreSettings" (
    "id", "storeName", "contactPhone", "contactEmail", "address", 
    "storeLat", "storeLng", "baseDeliveryCharge", "perKmCharge", 
    "freeDeliveryAbove", "minOrderAmount", "taxPercent", "updatedAt"
) VALUES (
    'default', 'MEAT CORNER', '+91 98765 43210', 'support@meatcorner.in', 
    '142 Main Road, Near Bus Stand, Erode, Tamil Nadu 638116',
    11.3806, 77.5944, 30.0, 8.0, 499.0, 150.0, 5.0, NOW()
) ON CONFLICT ("id") DO NOTHING;

-- 3. SEED USERS
INSERT INTO "Users" ("id", "name", "email", "phone", "passwordHash", "role", "avatarUrl", "isVerified", "isActive", "createdAt", "updatedAt") VALUES
('usr_admin_1', 'Karthik Raja', 'admin@meatcorner.in', '+919876543200', '$2a$10$Fhzn7DUa3kceOlmKg.6uoOwFlNX4aURVkYSOD7dSPai0KPSE8xAeC', 'ADMIN', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', true, true, NOW(), NOW()),
('usr_cust_1', 'Priya Dharshini', 'customer@meatcorner.in', '+919876543210', '$2a$10$bY6Il8so6Aewe3tf46xXM.Qgqeo15sySonatpO8Y5kXR.dRORm8bq', 'CUSTOMER', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80', true, true, NOW(), NOW()),
('usr_cust_2', 'Vijay Kumar', 'vijay@meatcorner.in', '+917604906429', '$2a$10$bY6Il8so6Aewe3tf46xXM.Qgqeo15sySonatpO8Y5kXR.dRORm8bq', 'CUSTOMER', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', true, true, NOW(), NOW()),
('usr_del_1', 'Murugan K', 'delivery@meatcorner.in', '+919876543201', '$2a$10$RVu0YpcTNA9itfvlPH7SUuWEHn1dDCh.temR5bGmZs1KqbA8b7T/u', 'DELIVERY_PARTNER', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', true, true, NOW(), NOW()),
('usr_del_2', 'Senthil Kumar', 'delivery2@meatcorner.in', '+919876543202', '$2a$10$RVu0YpcTNA9itfvlPH7SUuWEHn1dDCh.temR5bGmZs1KqbA8b7T/u', 'DELIVERY_PARTNER', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', true, true, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- 4. SEED CUSTOMER ADDRESSES
INSERT INTO "Addresses" (
    "id", "userId", "label", "recipientName", "phone", "line1", "line2", "landmark", "area", "city", "state", "pincode", "lat", "lng", "isDefault", "createdAt", "updatedAt"
) VALUES
('addr_1', 'usr_cust_1', 'Home', 'Priya Dharshini', '+919876543210', 'Plot No 24, Gandhi Nagar', 'Near Water Tank', 'Opposite Govt School', 'Kanjikovil', 'Erode', 'Tamil Nadu', '638116', 11.3850, 77.5920, true, NOW(), NOW()),
('addr_2', 'usr_cust_1', 'Work', 'Priya Dharshini', '+919876543210', 'Tech Park, 2nd Floor', 'Brough Road', 'Near City Tower', 'Central Erode', 'Erode', 'Tamil Nadu', '638001', 11.3780, 77.5900, false, NOW(), NOW()),
('addr_3', 'usr_cust_1', 'Home', 'Vijay Kumar', '+917604906429', 'No 15, Bharathi Street', 'Perundurai Road', 'Near Bus Stop', 'Kanjikovil', 'Erode', 'Tamil Nadu', '638116', 11.3830, 77.5940, true, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- 5. SEED PRODUCT VARIANTS (Enables OrderItems)
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

-- 6. SEED INVENTORY
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

-- 7. SEED COUPONS
INSERT INTO "Coupons" ("id", "code", "description", "discountType", "discountValue", "minOrderValue", "maxDiscount", "usageLimit", "usedCount", "isActive", "createdAt", "updatedAt") VALUES
('coup_1', 'MEATFIRST20', 'Flat ₹20 off on your first fresh chicken order', 'FLAT', 20.0, 199.0, 20.0, 5000, 1, true, NOW(), NOW()),
('coup_2', 'FRESHCHICKEN10', '10% instant discount up to ₹50 on chicken breast & cuts', 'PERCENTAGE', 10.0, 299.0, 50.0, 1000, 0, true, NOW(), NOW()),
('coup_3', 'WEEKEND50', 'Weekend Special: Flat ₹50 off on orders above ₹699', 'FLAT', 50.0, 699.0, 50.0, 2000, 0, true, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- 8. SEED ORDER ITEMS (Links directly to your existing orders in Orders table)
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

-- 9. SEED PAYMENTS
INSERT INTO "Payments" ("id", "orderId", "gateway", "amount", "currency", "status", "createdAt", "updatedAt")
SELECT 'pay_8691', o."id", 'RAZORPAY', 429.0, 'INR', 'CAPTURED', NOW(), NOW()
FROM "Orders" o WHERE o."orderNumber" = 'MC-20261113-8691'
ON CONFLICT ("id") DO NOTHING;

-- 10. SEED REVIEWS
INSERT INTO "Reviews" ("id", "userId", "productId", "rating", "title", "comment", "isVerifiedPurchase", "createdAt", "updatedAt") VALUES
('rev_1', 'usr_cust_1', 'prod_1', 5, 'Super fresh and tender!', 'The chicken curry cut was cleanly cut with no odor or feathers. Perfect for gravies.', true, NOW(), NOW()),
('rev_2', 'usr_cust_1', 'prod_4', 5, 'Authentic Nattu Kozhi', 'Genuine country chicken with firm meat and rich flavor for traditional kozhi kulambu.', true, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- 11. SEED SUPPORT TICKETS
INSERT INTO "SupportTickets" ("id", "userId", "orderNumber", "subject", "message", "status", "adminReply", "createdAt", "updatedAt") VALUES
('tkt_1', 'usr_cust_1', 'MC-20261113-4117', 'Extra Turmeric Wash Request', 'Can you please ensure the chicken is double washed with fresh turmeric?', 'RESOLVED', 'Yes, our master butcher has washed and turmeric-treated your order.', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;
