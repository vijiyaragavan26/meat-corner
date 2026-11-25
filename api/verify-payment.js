const crypto = require('crypto');
const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_U4KkbgZrm2LkRT';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'nLEDJ78qXRn8jMuFT3Cvq2xj';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ajiovbilwinoiyjvzhcv.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqaW92Ymlsd2lub2l5anZ6aGN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ1ODEyNDgsImV4cCI6MjExMDE1NzI0OH0.ogK51vYKTyA05C6hGKxZ2VW5fAVv5vGId_WNF8z-mdc';

const processedPayments = new Set();

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {}
    }
    const {
      orderId,
      order_id,
      razorpayOrderId,
      razorpay_order_id,
      paymentId,
      payment_id,
      razorpayPaymentId,
      razorpay_payment_id,
      signature,
      razorpay_signature,
      razorpaySignature
    } = body || {};

    const finalOrderId = razorpay_order_id || razorpayOrderId || order_id || '';
    const finalPaymentId = razorpay_payment_id || razorpayPaymentId || payment_id || paymentId || '';
    const finalSignature = razorpay_signature || razorpaySignature || signature || '';
    const appOrderId = orderId || order_id || finalOrderId;

    // Validate missing fields -> return 400
    if (!finalOrderId || !finalPaymentId || !finalSignature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification fields (order_id, payment_id, razorpay_signature)'
      });
    }

    // Prevent duplicate payment processing (Idempotency)
    if (processedPayments.has(finalPaymentId)) {
      return res.status(200).json({
        success: true,
        message: 'Payment already processed and verified successfully (idempotent)',
        data: { orderId: appOrderId, razorpayPaymentId: finalPaymentId, status: 'CAPTURED' }
      });
    }

    // Backend HMAC-SHA256 signature verification: order_id + "|" + payment_id with KEY_SECRET
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${finalOrderId}|${finalPaymentId}`)
      .digest('hex');

    let isValid = false;
    try {
      isValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'utf-8'),
        Buffer.from(finalSignature, 'utf-8')
      );
    } catch {
      isValid = false;
    }

    // Signature mismatch -> return 400, do NOT mark as paid
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Signature verification failed. Invalid payment signature.'
      });
    }

    processedPayments.add(finalPaymentId);

    // Update Supabase Orders database securely
    const now = new Date().toISOString();
    if (appOrderId) {
      await fetch(`${SUPABASE_URL}/rest/v1/Orders?id=eq.${appOrderId}`, {
        method: 'PATCH',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          paymentMethod: 'RAZORPAY',
          updatedAt: now
        })
      }).catch((e) => console.error('Supabase Orders update error:', e));

      // Insert/update Payments table in Supabase
      await fetch(`${SUPABASE_URL}/rest/v1/Payments`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          orderId: appOrderId,
          paymentMethod: 'RAZORPAY',
          transactionId: finalPaymentId,
          status: 'CAPTURED',
          createdAt: now,
          updatedAt: now
        })
      }).catch((e) => console.error('Supabase Payments insert error:', e));
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully! Order is confirmed.',
      data: {
        orderId: appOrderId,
        razorpayPaymentId: finalPaymentId,
        razorpayOrderId: finalOrderId,
        status: 'CAPTURED'
      }
    });
  } catch (err) {
    console.error('Server error verifying payment:', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
  }
};
