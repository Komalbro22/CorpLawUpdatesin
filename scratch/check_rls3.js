const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, anonKey);

async function checkAnonWrite() {
  console.log("Checking if ANON KEY can insert into updates...");
  const { data, error } = await supabase.from('updates').insert({ title: 'test', slug: 'test', category: 'MCA', summary: 'test' }).select();
  if (error) {
    console.log("RLS BLOCKED INSERT updates:", error.message);
  } else {
    console.log("RLS IS OFF on updates! Insert succeeded.", data);
    await supabase.from('updates').delete().eq('slug', 'test');
  }
}
checkAnonWrite();
