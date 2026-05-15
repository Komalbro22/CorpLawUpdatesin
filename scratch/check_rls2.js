const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, anonKey);

async function checkAnonWrite() {
  console.log("Checking if ANON KEY can insert into login_attempts...");
  const { data, error } = await supabase.from('login_attempts').insert({ ip: '1.2.3.4', attempts: 1 }).select();
  if (error) {
    console.log("RLS BLOCKED INSERT:", error.message);
  } else {
    console.log("RLS IS OFF! Insert succeeded.", data);
    await supabase.from('login_attempts').delete().eq('ip', '1.2.3.4');
  }
}
checkAnonWrite();
