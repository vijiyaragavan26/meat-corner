const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_U4KkbgZrm2LkRT';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'nLEDJ78qXRn8jMuFT3Cvq2xj';

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
    const { orderId, amount, currency = 'INR', receipt, customerName, customerPhone } = body || {};

    // Calculate amount in paise (minimum 100 paise)
    let amountInPaise = Number(amount);
    if (amountInPaise === undefined || amountInPaise === null || isNaN(amountInPaise)) {
      amountInPaise = 34500;
    }

    if (amountInPaise < 100) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be at least 100 paise'
      });
    }

    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: currency || 'INR',
        receipt: String(receipt || orderId || 'rcpt_' + Date.now()).substring(0, 40),
        notes: {
          orderId: String(orderId || ''),
          customerName: String(customerName || 'Customer'),
          customerPhone: String(customerPhone || '+91 93607 61595')
        }
      })
    });

    const data = await rzpRes.json();
    if (!rzpRes.ok) {
      console.error('Razorpay Orders API error:', data);
      if (rzpRes.status === 401 || data.error?.description?.includes('Authentication failed')) {
        return res.status(401).json({
          success: false,
          error: data.error?.description || 'Razorpay authentication failed. Verify API credentials.'
        });
      }
      return res.status(500).json({
        success: false,
        error: data.error?.description || 'Failed to create Razorpay order'
      });
    }

    return res.status(200).json({
      success: true,
      order_id: data.id,
      razorpayOrderId: data.id,
      amount: data.amount,
      currency: data.currency,
      keyId: RAZORPAY_KEY_ID,
      data: {
        order_id: data.id,
        orderId: orderId || data.id,
        razorpayOrderId: data.id,
        amount: data.amount,
        currency: data.currency,
        keyId: RAZORPAY_KEY_ID
      }
    });
  } catch (err) {
    console.error('Server error creating Razorpay order:', err);
    return res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
};
