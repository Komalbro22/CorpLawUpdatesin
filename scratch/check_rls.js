const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, anonKey);

async function checkAnonWrite() {
  console.log("Checking if ANON KEY can update updates table...");
  const { data, error } = await supabase.from('updates').update({ views: 999999 }).eq('slug', 'does-not-exist').select();
  if (error) {
    console.log("RLS BLOCKED WRITE (or other error):", error.message);
  } else {
    console.log("RLS MIGHT BE OFF! Write succeeded or no error returned. Data:", data);
  }

  console.log("Checking if ANON KEY can delete...");
  const del = await supabase.from('updates').delete().eq('slug', 'does-not-exist');
  if (del.error) {
    console.log("RLS BLOCKED DELETE:", del.error.message);
  } else {
    console.log("RLS MIGHT BE OFF! Delete succeeded.", del.data);
  }
}
checkAnonWrite();
