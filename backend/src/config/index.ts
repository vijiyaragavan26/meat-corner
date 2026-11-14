import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  jwtSecret: process.env.JWT_SECRET || 'meat_corner_jwt_secret_production_2026_super_secure',
  jwtExpiresIn: '7d',
  supabaseUrl: process.env.SUPABASE_URL || 'https://klyhftfhknxrgqadhmbb.supabase.co',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtseWhmdGZoa254cmdxYWRobWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQyOTg2NDksImV4cCI6MjEwOTg3NDY0OX0.Y6s1PsDPTRtoNmhfPdaAOCcpbtVsaUItwn78wUsX5Co',
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_meatcorner',
    keySecret: process.env.RAZORPAY_KEY_SECRET || 'test_secret_meatcorner_key_2026'
  }
};
