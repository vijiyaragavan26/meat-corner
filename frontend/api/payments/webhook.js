const crypto = require('crypto');
const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'u2IkQCj6UrLCh2icPW3sTu3C';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ajiovbilwinoiyjvzhcv.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqaW92Ymlsd2lub2l5anZ6aGN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ1ODEyNDgsImV4cCI6MjExMDE1NzI0OH0.ogK51vYKTyA05C6hGKxZ2VW5fAVv5vGId_WNF8z-mdc';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Razorpay-Signature');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const signature = req.headers['x-razorpay-signature'];
    const bodyStr = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    if (signature) {
      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(bodyStr)
        .digest('hex');

      if (expectedSignature !== signature) {
        console.warn('Razorpay webhook signature verification failed');
      }
    }

    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const event = payload.event;
    console.log('Received Razorpay Webhook Event:', event);

    if (event === 'payment.captured' || event === 'order.paid') {
      const payment = payload.payload?.payment?.entity;
      const rzpOrderId = payment?.order_id;
      const paymentId = payment?.id;
      const notesOrderId = payment?.notes?.orderId;

      if (rzpOrderId || notesOrderId) {
        const now = new Date().toISOString();
        const headers = {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        };

        const targetId = notesOrderId || rzpOrderId;
        await fetch(`${SUPABASE_URL}/rest/v1/Orders?id=eq.${targetId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            status: 'CONFIRMED',
            paymentStatus: 'PAID',
            updatedAt: now
          })
        }).catch(() => {});

        await fetch(`${SUPABASE_URL}/rest/v1/Payments?orderId=eq.${targetId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            status: 'CAPTURED',
            gatewayPaymentId: paymentId,
            updatedAt: now
          })
        }).catch(() => {});
      }
    }

    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: err.message });
  }
};
