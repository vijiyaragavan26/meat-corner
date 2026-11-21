const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_U2oEDCqKO7xmJr';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '58QMwjgUA3n9hC4yGTVLwNQ0';

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
    const { orderId, amount, customerName, customerPhone } = body || {};

    if (!orderId && !amount) {
      return res.status(400).json({ success: false, message: 'Order ID or amount is required' });
    }

    const amountInPaise = Math.round((Number(amount) || 345) * 100);

    // Call official Razorpay Orders API
    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: String(orderId || 'rcpt_' + Date.now()).substring(0, 40),
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
      return res.status(rzpRes.status).json({
        success: false,
        message: data.error?.description || 'Failed to create Razorpay order'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        orderId,
        razorpayOrderId: data.id,
        amount: data.amount,
        currency: data.currency,
        keyId: RAZORPAY_KEY_ID
      }
    });
  } catch (err) {
    console.error('Server error creating Razorpay order:', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
  }
};
