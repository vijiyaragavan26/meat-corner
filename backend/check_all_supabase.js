const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: __dirname + '/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const allTables = [
  'StoreSettings',
  'Users',
  'AdminProfiles',
  'CustomerProfiles',
  'Addresses',
  'DeliveryPartners',
  'Categories',
  'Products',
  'ProductVariants',
  'Inventory',
  'Coupons',
  'Orders',
  'OrderItems',
  'Payments',
  'Refunds',
  'DeliveryAssignments',
  'DeliveryLocations',
  'DeliveryEarnings',
  'Reviews',
  'Wishlists',
  'Notifications',
  'SupportTickets',
  'Carts',
  'CartItems'
];

async function checkAll() {
  console.log('--- SUPABASE AUDIT FOR MEAT CORNER ---');
  console.log('Project URL:', process.env.SUPABASE_URL);
  
  const emptyTables = [];
  const errorTables = [];
  const populatedTables = [];

  for (const table of allTables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table}: ERROR -> ${error.message} (Code: ${error.code})`);
        errorTables.push({ table, error: error.message });
      } else {
        const rowCount = count !== null ? count : (data ? data.length : 0);
        if (rowCount === 0) {
          console.log(`⚠️  ${table}: 0 rows (Empty)`);
          emptyTables.push(table);
        } else {
          console.log(`✅ ${table}: ${rowCount} rows`);
          populatedTables.push({ table, count: rowCount });
        }
      }
    } catch (e) {
      console.log(`❌ ${table}: EXCEPTION -> ${e.message}`);
      errorTables.push({ table, error: e.message });
    }
  }

  console.log('\n--- AUDIT SUMMARY ---');
  console.log(`✅ Populated tables: ${populatedTables.length}`);
  console.log(`⚠️  Empty tables: ${emptyTables.length} ->`, emptyTables.join(', '));
  console.log(`❌ Error tables: ${errorTables.length}`);
}

checkAll().catch(console.error);
