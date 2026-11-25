import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  jwtSecret: process.env.JWT_SECRET || 'meat_corner_jwt_secret_production_2026_super_secure',
  jwtExpiresIn: '7d',
  supabaseUrl: process.env.SUPABASE_URL || 'https://ajiovbilwinoiyjvzhcv.supabase.co',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqaW92Ymlsd2lub2l5anZ6aGN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ1ODEyNDgsImV4cCI6MjExMDE1NzI0OH0.ogK51vYKTyA05C6hGKxZ2VW5fAVv5vGId_WNF8z-mdc',
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_live_U4LjWPaHTTaelg',
    keySecret: process.env.RAZORPAY_KEY_SECRET || 'u2IkQCj6UrLCh2icPW3sTu3C'
  }
};
