# MEAT CORNER SETUP & INSTALLATION GUIDE

This guide provides step-by-step instructions to run the MEAT CORNER platform locally.

---

## 1. Prerequisites

- **Node.js**: v18+ or v20+ installed
- **npm** or **pnpm** installed
- **Supabase Account / Project**: Project configured with PostgreSQL

---

## 2. Pre-Configured Demo Accounts

| Role | Email | Password | Access URL |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@meatcorner.in` | `Admin@123` | `/admin/login` |
| **Customer** | `customer@meatcorner.in` | `Customer@123` | `/login` |
| **Delivery Rider 1** | `delivery@meatcorner.in` | `Delivery@123` | `/delivery/login` |
| **Delivery Rider 2** | `delivery2@meatcorner.in` | `Delivery@123` | `/delivery/login` |

*Note: All three login screens include 1-click "Fill Demo" shortcut buttons for instant access.*

---

## 3. Project Structure

```
meat-corner/
  ├── backend/           # Node.js + Express + TypeScript REST API
  │   ├── src/
  │   │   ├── config/    # Supabase, JWT & Razorpay configurations
  │   │   ├── db/        # Active data layer & Supabase sync
  │   │   ├── controllers/# Business logic for all 3 portals
  │   │   ├── routes/    # REST API endpoints
  │   │   └── server.ts  # Express server entry point
  │   └── dist/          # Compiled production JavaScript
  ├── frontend/          # React 18 + Vite + Tailwind CSS
  │   ├── src/
  │   │   ├── components/# Common components, Cart Drawer, Leaflet Map
  │   │   ├── contexts/  # Auth, Cart, Location, and Language contexts
  │   │   ├── pages/
  │   │   │   ├── customer/ # Storefront, Catalog, Cart, Checkout, Tracking
  │   │   │   ├── admin/    # Dashboard, Orders, Products, Inventory, Reports
  │   │   │   └── delivery/ # Mobile-first Driver Dashboard & OTP verification
  │   │   └── types/     # Shared TypeScript contracts
  │   └── dist/          # Optimized production static assets
  ├── database/
  │   ├── schema.sql     # Full PostgreSQL schema with 24 tables & enums
  │   ├── seed/          # Pure chicken catalog seed SQL
  │   └── policies/      # Supabase RLS security policies
  └── docs/              # Architecture guides
```

---

## 4. Running the Backend Server

1. Open a terminal in the `backend/` directory:
   ```bash
   cd backend
   npm install
   npm run build
   npm start
   ```
2. The backend server starts on port `5000`:
   ```
   =================================================
   🍗 MEAT CORNER REST API running on port 5000
   🚀 Ready for Customer, Admin & Delivery Portals
   =================================================
   ```
3. Verify health endpoint: `http://localhost:5000/api/health`

---

## 5. Running the Frontend Application

1. Open a terminal in the `frontend/` directory:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. The Vite dev server starts on port `3000`:
   `http://localhost:3000`

---

## 6. End-to-End Order & Delivery Lifecycle Walkthrough

To experience the entire connected workflow:

1. **Customer Order**:
   - Open `http://localhost:3000`.
   - Verify PIN code `638116` (Kanjikovil & Erode).
   - Select **Chicken Curry Cut (Skinless)**, choose weight **1 kg**, and cut preference **Curry Cut (Medium)**.
   - Click **Add to Cart**.
   - Open cart, apply coupon code `MEATFIRST20` (receives 20% discount).
   - Click **Proceed to Checkout**.
   - Select delivery address and choose payment method: **Cash on Delivery (COD)** or **Razorpay**.
   - Click **Place Order**. You are redirected to the confirmation screen with a 4-digit **Delivery OTP** (e.g., `4829`)!
   - Click **Live Track Your Order on Map**.

2. **Admin Order Management**:
   - In a new tab, open `http://localhost:3000/admin`.
   - Click **Fill Demo Admin** (`admin@meatcorner.in` / `Admin@123`).
   - Go to **Order Management**. The newly placed order appears in the queue.
   - Click **Manage** -> **Confirm Order** -> **Start Butchery (Preparing)**.
   - Notice the status immediately changes and reflects on the customer's live tracking screen!
   - Under "Assign Delivery Partner", select **Murugan K** and click **Assign Rider**.

3. **Delivery Partner Fulfillment**:
   - Open `http://localhost:3000/delivery`.
   - Click **Fill Demo Rider** (`delivery@meatcorner.in` / `Delivery@123`).
   - Click **ONLINE** switch.
   - Under **Assigned Orders**, see the order assigned by Admin.
   - Click **Accept Order** -> **Confirm Pickup** -> **Start Ride (Out For Delivery)**.
   - In the customer tracking screen, see the rider icon moving live on the Leaflet GPS map!
   - When the rider arrives, click **Reached Destination • Enter Customer OTP**.
   - Enter the 4-digit OTP shown on the customer screen.
   - For COD, confirm cash collection.
   - Click **Confirm Delivery**.
   - The order status turns to **DELIVERED**, driver wallet is credited with ₹50+ delivery earnings, and inventory is finalized!
