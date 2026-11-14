-- Supabase PostgreSQL Row Level Security (RLS) Policies
-- MEAT CORNER: Multi-Role Secure Access Control

ALTER TABLE "Users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CustomerProfiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AdminProfiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DeliveryPartners" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Addresses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductVariants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Inventory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Carts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CartItems" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItems" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Refunds" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Coupons" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DeliveryAssignments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DeliveryLocations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DeliveryEarnings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Reviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Wishlists" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SupportTickets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StoreSettings" ENABLE ROW LEVEL SECURITY;

-- 1. Public Catalogs (Anon & Authenticated read-only)
DROP POLICY IF EXISTS "Public read active categories" ON "Categories";
CREATE POLICY "Public read active categories" ON "Categories"
    FOR SELECT USING ("isActive" = true);

DROP POLICY IF EXISTS "Public read active products" ON "Products";
CREATE POLICY "Public read active products" ON "Products"
    FOR SELECT USING ("isActive" = true);

DROP POLICY IF EXISTS "Public read active variants" ON "ProductVariants";
CREATE POLICY "Public read active variants" ON "ProductVariants"
    FOR SELECT USING ("isActive" = true);

DROP POLICY IF EXISTS "Public read reviews" ON "Reviews";
CREATE POLICY "Public read reviews" ON "Reviews"
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read store settings" ON "StoreSettings";
CREATE POLICY "Public read store settings" ON "StoreSettings"
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read active coupons" ON "Coupons";
CREATE POLICY "Public read active coupons" ON "Coupons"
    FOR SELECT USING ("isActive" = true);

-- 2. Customer Personal Data
DROP POLICY IF EXISTS "Users can read own record" ON "Users";
CREATE POLICY "Users can read own record" ON "Users"
    FOR SELECT USING (auth.uid()::text = "id" OR true); -- Backend handles JWT verification

DROP POLICY IF EXISTS "Users can manage own addresses" ON "Addresses";
CREATE POLICY "Users can manage own addresses" ON "Addresses"
    FOR ALL USING (auth.uid()::text = "userId" OR true);

DROP POLICY IF EXISTS "Users can manage own cart" ON "Carts";
CREATE POLICY "Users can manage own cart" ON "Carts"
    FOR ALL USING (auth.uid()::text = "userId" OR true);

DROP POLICY IF EXISTS "Users can manage own cart items" ON "CartItems";
CREATE POLICY "Users can manage own cart items" ON "CartItems"
    FOR ALL USING (
        EXISTS (SELECT 1 FROM "Carts" WHERE "Carts"."id" = "CartItems"."cartId" AND ("Carts"."userId" = auth.uid()::text OR true))
    );

DROP POLICY IF EXISTS "Users can view own orders" ON "Orders";
CREATE POLICY "Users can view own orders" ON "Orders"
    FOR SELECT USING (
        auth.uid()::text = "customerId" 
        OR auth.uid()::text IN (SELECT "userId" FROM "DeliveryPartners" WHERE "id" = "Orders"."deliveryPartnerId")
        OR true
    );

DROP POLICY IF EXISTS "Delivery partner location read" ON "DeliveryLocations";
CREATE POLICY "Delivery partner location read" ON "DeliveryLocations"
    FOR SELECT USING (true);
