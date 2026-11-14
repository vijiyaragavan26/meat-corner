const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: __dirname + '/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function populateMissing() {
  console.log('--- POPULATING MISSING TABLES IN SUPABASE ---');

  // 1. AdminProfiles
  console.log('Seeding AdminProfiles...');
  await supabase.from('AdminProfiles').upsert([
    { id: 'prof_adm_1', userId: 'usr_admin_1', department: 'Operations & Logistics', permissions: { all: true } }
  ]);

  // 2. CustomerProfiles
  console.log('Seeding CustomerProfiles...');
  await supabase.from('CustomerProfiles').upsert([
    { id: 'prof_cust_1', userId: 'usr_cust_1', loyaltyPoints: 120 },
    { id: 'prof_cust_2', userId: 'usr_cust_2', loyaltyPoints: 50 }
  ]);

  // Fetch real order IDs
  const { data: orders } = await supabase.from('Orders').select('id, orderNumber').limit(5);
  const order8691 = orders?.find(o => o.orderNumber === 'MC-20261113-8691') || orders?.[0];
  const order4117 = orders?.find(o => o.orderNumber === 'MC-20261113-4117') || orders?.[1] || orders?.[0];

  if (order8691) {
    // 3. Payments
    console.log('Seeding Payments for order:', order8691.orderNumber);
    await supabase.from('Payments').upsert([
      { id: 'pay_1', orderId: order8691.id, gateway: 'RAZORPAY', amount: 429.0, currency: 'INR', status: 'CAPTURED' },
      { id: 'pay_2', orderId: order4117.id, gateway: 'COD', amount: 425.0, currency: 'INR', status: 'CREATED' }
    ]);

    // 4. DeliveryAssignments
    console.log('Seeding DeliveryAssignments...');
    await supabase.from('DeliveryAssignments').upsert([
      { id: 'asgn_1', orderId: order4117.id, deliveryPartnerId: 'dp_1', status: 'ACCEPTED' },
      { id: 'asgn_2', orderId: order8691.id, deliveryPartnerId: 'dp_1', status: 'COMPLETED' }
    ]);

    // 5. DeliveryLocations
    console.log('Seeding DeliveryLocations...');
    await supabase.from('DeliveryLocations').upsert([
      { id: 'loc_1', orderId: order4117.id, deliveryPartnerId: 'dp_1', lat: 11.3820, lng: 77.5930, heading: 45.0, speed: 28.5 },
      { id: 'loc_2', orderId: order4117.id, deliveryPartnerId: 'dp_1', lat: 11.3835, lng: 77.5925, heading: 50.0, speed: 25.0 }
    ]);

    // 6. DeliveryEarnings
    console.log('Seeding DeliveryEarnings...');
    await supabase.from('DeliveryEarnings').upsert([
      { id: 'earn_1', deliveryPartnerId: 'dp_1', orderId: order8691.id, baseFee: 40.0, distanceBonus: 10.0, commissionAmount: 0.0, tipAmount: 20.0, totalEarning: 70.0, payoutStatus: 'PAID' },
      { id: 'earn_2', deliveryPartnerId: 'dp_1', orderId: order4117.id, baseFee: 40.0, distanceBonus: 16.0, commissionAmount: 0.0, tipAmount: 0.0, totalEarning: 56.0, payoutStatus: 'PENDING' }
    ]);
  }

  // 7. Notifications
  console.log('Seeding Notifications...');
  await supabase.from('Notifications').upsert([
    { id: 'notif_1', userId: 'usr_cust_1', targetRole: 'CUSTOMER', title: 'Chicken Order Out for Delivery 🍗', message: 'Your fresh chicken order #MC-20261113-4117 has been picked up by rider Murugan K.', type: 'ORDER_STATUS', isRead: false },
    { id: 'notif_2', userId: 'usr_admin_1', targetRole: 'ADMIN', title: 'New Fresh Order Received', message: 'Order #MC-20261113-4117 received for ₹425 via Cash on Delivery.', type: 'NEW_ORDER', isRead: true }
  ]);

  // 8. Carts
  console.log('Seeding Carts...');
  await supabase.from('Carts').upsert([
    { id: 'cart_cust_1', userId: 'usr_cust_1', couponCode: 'MEATFIRST20' }
  ]);

  // 9. CartItems
  console.log('Seeding CartItems...');
  await supabase.from('CartItems').upsert([
    { id: 'citem_1', cartId: 'cart_cust_1', productId: 'prod_1', variantId: 'var_1_1kg', quantity: 1, cuttingOption: 'Curry Cut (Medium)', cleaningOption: 'Standard Clean & Washed' }
  ]);

  console.log('🎉 ALL TABLES POPULATED SUCCESSFULLY!');
}

populateMissing().catch(console.error);
