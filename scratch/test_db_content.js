const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1]] = match[2].replace(/['"]/g, '').trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

supabase.from('updates').select('content').eq('slug', 'sebi-spv-status-post-concession-invits-may-2026').single().then(res => {
    const content = res.data.content;
    const qIndex = content.indexOf('Q1');
    if (qIndex > -1) {
        console.log('Surrounding text of Q1:');
        console.log(content.substring(qIndex - 20, qIndex + 20));
    } else {
        console.log('Q1 not found');
    }
});
