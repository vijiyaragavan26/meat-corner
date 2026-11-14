# 🍗 MEAT CORNER – Complete Chicken E-Commerce & Home Delivery Platform

> **Fresh Chicken. Fresh Quality. Delivered to Your Door.**  
> A high-performance, full-stack, chicken-exclusive online shopping and hyperlocal delivery platform modeled after modern quick-commerce food ordering applications.

---

## 🌟 Executive Overview

**MEAT CORNER** is built exclusively for fresh chicken products in India (INR ₹, Asia/Kolkata, English & தமிழ் Tamil language support). It integrates three dedicated portals sharing a unified real-time database, authentication engine, inventory manager, Razorpay payment gateway, and GPS delivery tracking system:

1. **🛍️ Customer Portal (`/`)**: Rich catalog of cut-to-order fresh chicken, butchery cut customizations (Curry cut, Keema, Biryani cut, Boneless, Lollipops), pincode verification, cart calculations, Razorpay/COD checkout, order history, and real-time order tracking.
2. **🛡️ Admin Portal (`/admin`)**: Complete management suite for real-time sales analytics, orders lifecycle, product and butchery configuration, inventory control, delivery partner onboarding/verification, coupons, store operating hours, and customer support tickets.
3. **🚴 Delivery Partner Portal (`/delivery`)**: Dedicated driver dashboard for duty toggle (Online/Offline), incoming order alerts, route navigation with Leaflet maps, customer call shortcuts, and secure 4-digit Delivery OTP verification.

---

## 🔐 Demo Credentials

All portals are pre-configured with role-based access control and bcrypt-hashed credentials:

| Portal | Role | Email | Password | Access URL |
| :--- | :--- | :--- | :--- | :--- |
| **Admin Portal** | `ADMIN` | `admin@meatcorner.in` | `Admin@123` | `http://localhost:3000/admin/login` |
| **Customer Portal** | `CUSTOMER` | `customer@meatcorner.in` | `Customer@123` | `http://localhost:3000/auth` |
| **Delivery Rider 1** | `DELIVERY_PARTNER` | `delivery@meatcorner.in` | `Delivery@123` | `http://localhost:3000/delivery/login` |
| **Delivery Rider 2** | `DELIVERY_PARTNER` | `delivery2@meatcorner.in` | `Delivery@123` | `http://localhost:3000/delivery/login` |

---

## 🏗️ Technology Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MEAT CORNER FRONTEND                            │
│           (React 18 + TypeScript + Vite + Tailwind CSS)                │
│                                                                        │
│   ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐ │
│   │  Customer Portal   │ │    Admin Portal    │ │  Delivery Partner  │ │
│   │    - Home & Cuts   │ │  - KPI Analytics   │ │  - Online / Status │ │
│   │    - Cart & Promo  │ │  - Orders Dispatch │ │  - Orders Dispatch │ │
│   │    - Checkout/COD  │ │  - Pure Inventory  │ │  - Turn-by-Turn    │ │
│   │    - Live Tracking │ │  - Partner KYC     │ │  - Secure OTP Conf │ │
│   └─────────┬──────────┘ └─────────┬──────────┘ └─────────┬──────────┘ │
└─────────────┼──────────────────────┼──────────────────────┼────────────┘
              │                      │                      │
              └──────────────────────┼──────────────────────┘
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        NODE.JS / EXPRESS REST API                      │
│     (TypeScript + JWT Auth + RBAC + Zod Validation + Razorpay HMAC)    │
│  - /api/auth       - /api/products   - /api/cart      - /api/orders    │
│  - /api/payments   - /api/delivery   - /api/admin     - /api/customer  │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
┌─────────────────────────────────┐   ┌──────────────────────────────────┐
│      SUPABASE POSTGRESQL        │   │    THIRD-PARTY INTEGRATIONS      │
│  - Project Ref: klyhftfhknxrgq  │   │  - Razorpay Orders & HMAC Webhook│
│  - RLS Security Policies        │   │  - OpenStreetMap & Leaflet       │
│  - Pure Chicken Seed Data       │   │  - Cloud Chilled Logistics       │
└─────────────────────────────────┘   └──────────────────────────────────┘
```

---

## 🍗 Exclusively Pure Chicken Catalog

To maintain strict brand integrity, non-chicken meats (mutton, beef, fish, seafood, pork, and eggs) are strictly disallowed at both the schema and API layer.

### Configured Categories:
1. **Whole Chicken** (Broiler & Country Nattu Kozhi)
2. **Skinless Chicken** (Lean cuts & portions)
3. **Curry Cut Chicken** (Small, Medium, Large pieces)
4. **Boneless Chicken** (Breast fillets, Keema mince, Tikka cubes)
5. **Chicken Breast** (Tender fillets, high-protein lean meat)
6. **Chicken Leg** (Juicy drumsticks, whole leg quarters)
7. **Chicken Wings** (Frenched lollipops, wingettes, drumettes)
8. **Chicken Liver & Gizzard** (Fresh nutrient-rich organ cuts)

### Butchery Customization Options:
- **Cutting**: Curry Cut (Small/Medium), Biryani Cut (Large), Boneless Cubes, Keema Mince, Frenched Lollipops, Whole Intact.
- **Cleaning**: Standard Clean, Turmeric Washed, Cavity Cleaned & Flame Singed.
- **Portion Weights**: 250g, 500g, 750g, 1 kg, 1.5 kg, 2 kg.

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ or v20+
- **npm** or **pnpm**

### 2. Installation
Clone or navigate to the project directory:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Setup
Copy the environment template:
```bash
# In backend directory
cp .env.example .env

# In frontend directory
cp .env.example .env
```

### 4. Running the Application

Open two terminal sessions:

#### Terminal 1: Backend Server (Port 5000)
```bash
cd backend
npm run dev
# Or production mode:
# npm run build && npm start
```

#### Terminal 2: Frontend Client (Port 3000)
```bash
cd frontend
npm run dev
```

Visit **`http://localhost:3000`** in your browser.

---

## 🧪 Automated End-to-End Verification

The backend includes a zero-dependency in-process verification test that validates:
- Pure chicken category compliance
- Catalog integrity & butchery options
- Seed user bcrypt authentication
- Cart calculations and stock deduction
- Order creation with server-side 4-digit Delivery OTP
- Admin status dispatch transitions
- Live driver GPS tracking coordinates
- Delivery completion with customer OTP verification

To execute the test:
```bash
cd backend
npm run test:e2e
```

Expected output:
```text
🍗 MEAT CORNER IN-PROCESS END-TO-END VERIFICATION
 Verified: 100% pure chicken categories only!
 Verified: 100% pure chicken products catalog!
  - Admin password check (Admin@123): MATCH
  - Customer password check (Customer@123): MATCH
  - Rider password check (Delivery@123): MATCH
  - Customer OTP verified successfully!
  - Order marked DELIVERED and COD cash collected (PAID).
 ALL IN-PROCESS E2E TESTS PASSED WITH ZERO ERRORS!
```

---

## 📁 Repository Directory Structure

```
├── backend/
│   ├── src/
│   │   ├── config/             # Supabase, JWT & Razorpay configuration
│   │   ├── controllers/        # REST route handlers (Auth, Product, Cart, Order, etc.)
│   │   ├── db/                 # High-fidelity data store & Supabase integration
│   │   ├── middleware/         # JWT auth, RBAC authorization & error handlers
│   │   ├── routes/             # Express route definitions
│   │   └── server.ts           # Express server entry point
│   ├── test_e2e.js             # Automated E2E verification test script
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Header, Footer, CartDrawer, LeafletMap, PincodeModal
│   │   ├── contexts/           # AuthContext, CartContext, LocationContext, LanguageContext
│   │   ├── pages/              # Customer, Admin and Delivery Partner pages
│   │   ├── services/           # Axios/Fetch API client wrapper
│   │   ├── types/              # TypeScript models and interfaces
│   │   ├── App.tsx             # React Router routing configuration
│   │   └── main.tsx            # Application entry
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── database/
│   ├── schema.sql              # Supabase PostgreSQL DDL schema
│   ├── seed/
│   │   ├── seed_chicken.sql    # Pure chicken categories and seed products
│   │   └── seed_data.sql       # Users, addresses, store settings, and coupons
│   └── policies/
│       └── rls_policies.sql    # Row-Level Security policies
│
├── docs/
│   ├── API_DOCUMENTATION.md    # Comprehensive REST API endpoint reference
│   ├── DATABASE_SCHEMA.md      # Detailed ER diagrams and table structures
│   ├── SETUP_GUIDE.md          # Local developer setup walkthrough
│   └── DEPLOYMENT_GUIDE.md     # Production deployment instructions (Render/Vercel)
│
├── .env.example                # Global environment variable documentation
└── README.md                   # This project guide
```

---

## 📚 Technical Documentation Links

- [REST API Documentation](file:///c:/Users/vijiy/OneDrive/Desktop/project/docs/API_DOCUMENTATION.md)
- [Database Schema & ER Models](file:///c:/Users/vijiy/OneDrive/Desktop/project/docs/DATABASE_SCHEMA.md)
- [Local Developer Setup Guide](file:///c:/Users/vijiy/OneDrive/Desktop/project/docs/SETUP_GUIDE.md)
- [Production Deployment Guide](file:///c:/Users/vijiy/OneDrive/Desktop/project/docs/DEPLOYMENT_GUIDE.md)

---

## 🛡️ License & Commercial Rights
Designed and built for **MEAT CORNER India**. All rights reserved.
