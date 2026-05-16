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
    const update = res.data;
    const faqs = [];
    if (update.content) {
        // Replace HTML tags with space, then clean up spaces
        const plainText = update.content
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/p>|<\/div>|<\/li>|<\/h[1-6]>/gi, '\n')
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/\u00A0/g, ' ');
            
        // 2. Find all markers (Q1, Q2, Question 1, etc.)
        const markerRegex = /(?:\r?\n|^)\s*((?:Q|Question)\s*\d+[:.\s]+)/gi;
        const markers = Array.from(plainText.matchAll(markerRegex));
        
        console.log('Markers found:', markers.length);
        
        const cleanText = (text) => text.replace(/\s+/g, ' ').trim();

        markers.forEach((marker, i) => {
            const start = marker.index + marker[0].length;
            const nextMarker = markers[i + 1];
            const end = nextMarker ? nextMarker.index : plainText.length;
            const block = plainText.substring(start, end).trim();
            
            let qRaw = '';
            let aRaw = '';
            
            const qEndMatch = block.match(/^(.*?\?)(?:\s+|$)([\s\S]*)$/);
            if (qEndMatch) {
                qRaw = qEndMatch[1];
                aRaw = qEndMatch[3];
            } else {
                const lines = block.split(/\r?\n/);
                qRaw = lines[0];
                aRaw = lines.slice(1).join(' ');
            }

            // The marker itself isn't included in the block because we start at marker.index + marker[0].length
            // Let's prepend the marker to the question to keep it nice, or just leave it out. 
            // In Search Console, Q1 doesn't matter much, but it's nice to have.
            const q = cleanText(marker[1].trim() + ' ' + qRaw);
            const a = cleanText(aRaw);
            
            if (q && a) {
                faqs.push({ question: q, answer: a });
            }
        });
        
        console.log('Final FAQs extracted:', faqs.length);
        if (faqs.length > 0) console.log(faqs[0]);
        if (faqs.length > 1) console.log(faqs[1]);
    }
});
