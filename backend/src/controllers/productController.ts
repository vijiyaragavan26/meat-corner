import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, Product, Category } from '../db/dataStore';
import { AuthenticatedRequest } from '../middleware/auth';

// Public Catalog Endpoints
export const getCategories = (req: AuthenticatedRequest, res: Response) => {
  const categories = db.getActiveCategories();
  return res.json({ success: true, data: categories });
};

export const getProducts = (req: AuthenticatedRequest, res: Response) => {
  const { category, search, bestSeller, todaySpecial, recommended, sortBy } = req.query;

  const products = db.getProducts({
    categorySlug: category as string,
    search: search as string,
    bestSeller: bestSeller === 'true',
    todaySpecial: todaySpecial === 'true',
    recommended: recommended === 'true',
    sortBy: sortBy as any
  });

  return res.json({ success: true, count: products.length, data: products });
};

export const getProductById = (req: AuthenticatedRequest, res: Response) => {
  const id = String(req.params.id);
  const product = db.getProductById(id) || db.products.find((p) => p.slug === id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Chicken product not found.' });
  }

  // Related products from same category
  const related = db.products
    .filter((p) => p.id !== product.id && p.categoryId === product.categoryId && p.isActive)
    .slice(0, 4)
    .map((p) => ({
      ...p,
      variants: db.variants.filter((v) => v.productId === p.id && v.isActive)
    }));

  return res.json({ success: true, data: { ...product, related } });
};

// Admin Management Endpoints
export const adminCreateProduct = (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      categoryId,
      name,
      description,
      shortDescription,
      images,
      freshnessInfo,
      cuttingOptions,
      cleaningOptions,
      basePrice,
      discountPercent,
      isBestSeller,
      isTodaySpecial,
      isRecommended,
      variants
    } = req.body;

    if (!name || !categoryId || !basePrice) {
      return res.status(400).json({ success: false, message: 'Name, Category, and Base Price are required.' });
    }

    const productId = `prod_${uuidv4().substring(0, 8)}`;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newProduct: Product = {
      id: productId,
      categoryId,
      name,
      slug: `${slug}-${Math.floor(100 + Math.random() * 900)}`,
      description: description || 'Fresh farm-raised chicken cut and packed hygienically.',
      shortDescription: shortDescription || '100% farm fresh chicken cut on order.',
      images: images && images.length ? images : ['https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80'],
      freshnessInfo: freshnessInfo || 'Fresh daily farm harvest, Halal certified, zero antibiotics.',
      cuttingOptions: cuttingOptions || ['Curry Cut (Small)', 'Curry Cut (Medium)', 'Large Biryani Cut'],
      cleaningOptions: cleaningOptions || ['Standard Clean & Washed', 'Extra Washed with Turmeric'],
      basePrice: Number(basePrice),
      discountPercent: Number(discountPercent || 0),
      isBestSeller: Boolean(isBestSeller),
      isTodaySpecial: Boolean(isTodaySpecial),
      isRecommended: Boolean(isRecommended),
      isActive: true,
      avgRating: 4.8,
      reviewCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.products.push(newProduct);
    db.saveToDisk();

    // Variants
    if (variants && Array.isArray(variants) && variants.length > 0) {
      variants.forEach((v: any, idx: number) => {
        const vId = `var_${productId}_${idx + 1}`;
        db.variants.push({
          id: vId,
          productId,
          label: v.label || `${v.weightGrams} grams`,
          weightGrams: Number(v.weightGrams) || 500,
          price: Number(v.price) || basePrice,
          compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
          sku: `SKU-${productId}-${v.weightGrams || 500}`,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        db.inventory.push({
          id: `inv_${vId}`,
          productId,
          variantId: vId,
          stockQuantity: Number(v.stockQuantity) || 40,
          reservedQuantity: 0,
          lowStockThreshold: 5,
          updatedAt: new Date().toISOString()
        });
      });
    } else {
      // Default 500g and 1kg variants
      const v1 = `var_${productId}_500`;
      const v2 = `var_${productId}_1000`;
      db.variants.push(
        {
          id: v1,
          productId,
          label: '500 grams',
          weightGrams: 500,
          price: Math.round(Number(basePrice) * 0.52),
          compareAtPrice: Math.round(Number(basePrice) * 0.58),
          sku: `SKU-${productId}-500`,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: v2,
          productId,
          label: '1 kg',
          weightGrams: 1000,
          price: Number(basePrice),
          compareAtPrice: Math.round(Number(basePrice) * 1.1),
          sku: `SKU-${productId}-1000`,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );
      db.inventory.push(
        {
          id: `inv_${v1}`,
          productId,
          variantId: v1,
          stockQuantity: 40,
          reservedQuantity: 0,
          lowStockThreshold: 5,
          updatedAt: new Date().toISOString()
        },
        {
          id: `inv_${v2}`,
          productId,
          variantId: v2,
          stockQuantity: 30,
          reservedQuantity: 0,
          lowStockThreshold: 5,
          updatedAt: new Date().toISOString()
        }
      );
    }

    return res.status(201).json({ success: true, message: 'Chicken product created successfully', data: newProduct });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to create product' });
  }
};

export const adminUpdateProduct = (req: AuthenticatedRequest, res: Response) => {
  const id = String(req.params.id);
  const prodIndex = db.products.findIndex((p) => p.id === id);
  if (prodIndex === -1) {
    return res.status(404).json({ success: false, message: 'Chicken product not found.' });
  }

  const existing = db.products[prodIndex];
  const updated: Product = {
    ...existing,
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  db.products[prodIndex] = updated;
  db.saveToDisk();
  return res.json({ success: true, message: 'Product updated successfully', data: updated });
};

export const adminDeleteProduct = (req: AuthenticatedRequest, res: Response) => {
  const id = String(req.params.id);
  const prod = db.products.find((p) => p.id === id);
  if (!prod) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  prod.isActive = false;
  prod.updatedAt = new Date().toISOString();
  db.saveToDisk();
  return res.json({ success: true, message: 'Product deactivated successfully' });
};

// Admin Category Management
export const adminCreateCategory = (req: AuthenticatedRequest, res: Response) => {
  const { name, description, imageUrl, sortOrder } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'Category name is required' });
  }

  // Validate that category is chicken only
  const lower = name.toLowerCase();
  const prohibited = ['mutton', 'fish', 'prawn', 'seafood', 'beef', 'pork'];
  if (prohibited.some((item) => lower.includes(item))) {
    return res.status(400).json({
      success: false,
      message: 'Meat Corner is exclusively a chicken platform. Non-chicken categories are not permitted.'
    });
  }

  const id = `cat_${uuidv4().substring(0, 8)}`;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const newCat: Category = {
    id,
    name,
    slug,
    description: description || 'Fresh chicken category cuts',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=600&q=80',
    sortOrder: Number(sortOrder) || db.categories.length + 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.categories.push(newCat);
  db.saveToDisk();
  return res.status(201).json({ success: true, message: 'Chicken category created successfully', data: newCat });
};

export const adminUpdateCategory = (req: AuthenticatedRequest, res: Response) => {
  const id = String(req.params.id);
  const cat = db.categories.find((c) => c.id === id);
  if (!cat) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }
  Object.assign(cat, req.body, { updatedAt: new Date().toISOString() });
  db.saveToDisk();
  return res.json({ success: true, message: 'Category updated successfully', data: cat });
};
