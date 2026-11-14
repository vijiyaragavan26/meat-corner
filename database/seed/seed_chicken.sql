-- MEAT CORNER: Seed Pure Chicken Catalog & Initial Data

-- Ensure password hash for test users:
-- Passwords:
-- admin@meatcorner.in -> Admin@123
-- customer@meatcorner.in -> Customer@123
-- delivery@meatcorner.in -> Delivery@123
-- delivery2@meatcorner.in -> Delivery@123

-- Clean non-chicken data if exists
DELETE FROM "OrderItems" WHERE "productId" IN ('prod_6','prod_7','prod_8','prod_9','prod_10','prod_11','prod_12','prod_13','prod_14');
DELETE FROM "Inventory" WHERE "productId" IN ('prod_6','prod_7','prod_8','prod_9','prod_10','prod_11','prod_12','prod_13','prod_14');
DELETE FROM "ProductVariants" WHERE "productId" IN ('prod_6','prod_7','prod_8','prod_9','prod_10','prod_11','prod_12','prod_13','prod_14');
DELETE FROM "Products" WHERE "id" IN ('prod_6','prod_7','prod_8','prod_9','prod_10','prod_11','prod_12','prod_13','prod_14');
DELETE FROM "Categories" WHERE "id" IN ('cat_mt', 'cat_fs', 'cat_pr', 'cat_sf', 'cat_eg', 'cat_rtc');

-- 8 Core Chicken Categories
INSERT INTO "Categories" ("id", "name", "slug", "description", "imageUrl", "sortOrder", "isActive") VALUES
('cat_whole', 'Whole Chicken', 'whole-chicken', 'Whole farm-raised broiler & country chicken dressed and cleaned to perfection.', 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=600&q=80', 1, true),
('cat_skinless', 'Skinless Chicken', 'skinless-chicken', 'Tender cuts with skin neatly removed for health-conscious and lean meat recipes.', 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=80', 2, true),
('cat_curry', 'Curry Cut Chicken', 'curry-cut-chicken', 'Evenly sized bone-in chicken pieces perfect for gravies, salna, and traditional curries.', 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=600&q=80', 3, true),
('cat_boneless', 'Boneless Chicken', 'boneless-chicken', '100% boneless fresh chicken cubes, ideal for butter chicken, tikka, and stir-fries.', 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=80', 4, true),
('cat_breast', 'Chicken Breast', 'chicken-breast', 'High-protein, tender, succulent fillets cut daily from healthy grain-fed chickens.', 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=80', 5, true),
('cat_leg', 'Chicken Leg', 'chicken-leg', 'Juicy drumsticks and whole leg quarters bursting with flavour for grills & roasts.', 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=600&q=80', 6, true),
('cat_wings', 'Chicken Wings', 'chicken-wings', 'Crispy wingettes and drumettes ideal for hot wings, barbecue, and deep frying.', 'https://images.unsplash.com/photo-1527477321055-43615b6294a5?auto=format&fit=crop&w=600&q=80', 7, true),
('cat_liver_gizzard', 'Chicken Liver & Gizzard', 'chicken-liver-gizzard', 'Iron-rich, nutritious, meticulously cleaned fresh organ cuts for traditional roasts.', 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=600&q=80', 8, true)
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "slug" = EXCLUDED."slug",
  "description" = EXCLUDED."description",
  "imageUrl" = EXCLUDED."imageUrl",
  "sortOrder" = EXCLUDED."sortOrder",
  "isActive" = EXCLUDED."isActive";

-- Also update existing cat_fc, cat_cc if existing
UPDATE "Categories" SET "name" = 'Curry Cut Chicken', "slug" = 'curry-cut-chicken', "isActive" = true WHERE "id" = 'cat_fc';
UPDATE "Categories" SET "name" = 'Nattu Kozhi & Country Chicken', "slug" = 'country-chicken', "isActive" = true WHERE "id" = 'cat_cc';
