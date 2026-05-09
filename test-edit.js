const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({path: '.env.local'});
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data } = await supabase.from('delivery_slots').select('*');
  console.log("Slots before:", data);
  
  // Test if anon can update using the policy
  const { data: upData, error } = await supabase.from('delivery_slots').update({ is_active: false }).eq('id', 'SLOT-11AM').select();
  console.log("Update via anon:", upData, error);
}
run();
