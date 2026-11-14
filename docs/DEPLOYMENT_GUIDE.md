# MEAT CORNER PRODUCTION DEPLOYMENT GUIDE

This guide details how to deploy MEAT CORNER to production on **Vercel / Netlify** (Frontend), **Render / Railway** (Backend), and **Supabase** (Database).

---

## 1. Database Deployment (Supabase)

1. Create a project in [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Run the complete schema script:
   - File: `database/schema.sql`
4. Run the pure chicken seed data:
   - File: `database/seed/seed_chicken.sql`
   - File: `database/seed/seed_data.sql`
5. Apply the Row-Level Security policies:
   - File: `database/policies/rls_policies.sql`
6. Copy your **Project URL** and **anon public key** from Settings -> API.

---

## 2. Backend Deployment (Render / Railway / Node.js)

1. Push your repository to GitHub.
2. In [Render](https://render.com) or [Railway](https://railway.app), create a new **Web Service**.
3. Set root directory to `backend`.
4. Configure Build Command:
   ```bash
   npm install && npm run build
   ```
5. Configure Start Command:
   ```bash
   npm start
   ```
6. Set Environment Variables:
   ```env
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=your_super_strong_production_jwt_secret_key_meatcorner_2026
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your_supabase_anon_public_key
   RAZORPAY_KEY_ID=rzp_live_your_actual_key_id
   RAZORPAY_KEY_SECRET=your_actual_razorpay_secret_key
   ```
7. Deploy the service and copy the live URL (e.g., `https://api.meatcorner.in` or `https://meatcorner-backend.onrender.com`).

---

## 3. Frontend Deployment (Vercel / Netlify)

1. In [Vercel](https://vercel.com) or [Netlify](https://netlify.com), import your repository.
2. Set root directory to `frontend`.
3. Framework Preset: **Vite**.
4. Build Command:
   ```bash
   npm run build
   ```
5. Output Directory:
   `dist`
6. In `frontend/vite.config.ts`, update the proxy / API base to your deployed backend URL:
   Or configure `VITE_API_URL=https://meatcorner-backend.onrender.com` in environment variables.
7. Deploy! Your MEAT CORNER full-stack chicken e-commerce and local delivery platform is live!
