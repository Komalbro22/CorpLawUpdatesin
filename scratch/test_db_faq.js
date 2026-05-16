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
        const sanitized = update.content.replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ');
        // Find all markers (Q1, Q2, Question 1, etc.)
        const markerRegex = /(?:\r?\n|^)\s*(?:\*\*|)?(?:Q|Question)\s*\d+[:.\s]+/gi;
        const markers = Array.from(sanitized.matchAll(markerRegex));
        
        console.log('Markers found:', markers.length);
        if (markers.length > 0) {
            console.log('First marker:', markers[0][0]);
        }
        
        const cleanText = (text) => text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

        markers.forEach((marker, i) => {
            const start = (marker.index || 0) + marker[0].length;
            const nextMarker = markers[i + 1];
            const end = nextMarker ? (nextMarker.index || sanitized.length) : sanitized.length;
            const block = sanitized.substring(start, end).trim();
            
            let qRaw = '';
            let aRaw = '';
            
            const qEndMatch = block.match(/^(.*?(\?|\*\*))(?:\s+|$)([\s\S]*)$/);
            if (qEndMatch) {
                qRaw = qEndMatch[1];
                aRaw = qEndMatch[3];
            } else {
                const lines = block.split(/\r?\n/);
                qRaw = lines[0];
                aRaw = lines.slice(1).join(' ');
            }

            const q = cleanText(qRaw);
            const a = cleanText(aRaw);
            
            if (q && a) {
                faqs.push({ question: q, answer: a });
            }
        });
        
        console.log('Final FAQs extracted:', faqs.length);
        if (faqs.length > 0) console.log(faqs[0]);
    }
});
