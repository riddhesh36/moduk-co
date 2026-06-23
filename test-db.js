const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({path: '.env.local'});
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function test() {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5);
  console.log("Database Orders detail:");
  data?.forEach(o => {
    console.log(`ID: ${o.display_id}`);
    console.log(`  slot_date: ${o.slot_date}`);
    console.log(`  status: ${o.status}`);
    console.log(`  payment_method: ${o.payment_method}`);
    console.log(`  payment_status: ${o.payment_status}`);
    console.log(`  total_amount: ${o.total_amount}`);
    console.log(`  items: ${JSON.stringify(o.items)}`);
  });
  console.log("Current system time split date:", new Date().toISOString().split('T')[0]);
}
test();
