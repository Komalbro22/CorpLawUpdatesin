import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8')
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      let key = match[1].trim()
      let val = match[2].trim()
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
      process.env[key] = val
    }
  })
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(url, key)

async function seed() {
  console.log('Reading penalty provisions dataset...')
  const dataPath = path.join(process.cwd(), 'data', 'penalty-provisions.json')
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
  
  console.log(`Found ${data.length} entries. Mapping to DB schema...`)
  
  const mappedData = data.map((item: any) => ({
    id: item.id,
    sno: item.sno,
    section: item.section,
    act_chapter: item.act_chapter,
    title: item.title,
    plain_summary: item.plain_summary,
    penalty_type: item.penalty_type,
    
    company_base_amount_min: item.company_liability?.base_amount_min || null,
    company_base_amount_max: item.company_liability?.base_amount_max || null,
    company_per_day_continuing: item.company_liability?.per_day_continuing || null,
    company_max_cap: item.company_liability?.max_cap || null,
    company_notes: item.company_liability?.notes || null,
    
    officer_base_amount_min: item.officer_liability?.base_amount_min || null,
    officer_base_amount_max: item.officer_liability?.base_amount_max || null,
    officer_per_day_continuing: item.officer_liability?.per_day_continuing || null,
    officer_max_cap: item.officer_liability?.max_cap || null,
    officer_notes: item.officer_liability?.notes || null,
    
    imprisonment_applicable: item.imprisonment?.applicable || false,
    imprisonment_min_years: item.imprisonment?.min_years || null,
    imprisonment_max_years: item.imprisonment?.max_years || null,
    imprisonment_applies_to: item.imprisonment?.applies_to || null,
    
    refers_to_section_447: item.refers_to_section_447 || false,
    category: item.category,
    related_sections: item.related_sections || [],
    source_page: item.source_page,
    last_verified: item.last_verified,
    amendment_watch: item.amendment_watch || [],
    flags: item.flags || [],
    
    custom_amount_label: item.dynamic_variable?.custom_amount_label || null,
    company_custom_multiplier: item.dynamic_variable?.company_custom_multiplier || null,
    company_custom_cap: item.dynamic_variable?.company_custom_cap || null,
    officer_custom_multiplier: item.dynamic_variable?.officer_custom_multiplier || null,
    officer_custom_cap: item.dynamic_variable?.officer_custom_cap || null,
    
    detailed_summary: item.detailed_summary || null,
    eligible_for_446b: item.eligible_for_446b !== false
  }))

  console.log('Upserting to public.penalty_provisions...')
  
  const { error } = await supabase
    .from('penalty_provisions')
    .upsert(mappedData, { onConflict: 'id' })
    
  if (error) {
    console.error('Error inserting data:', error)
    if (error.code === '42P01') {
       console.error('\n--> IT LOOKS LIKE THE TABLE DOES NOT EXIST YET.')
       console.error('--> Please run the SQL migration in supabase/migrations/20260704000001_penalty_provisions.sql in your Supabase Dashboard first!')
    }
  } else {
    console.log('✅ Successfully seeded all 147 penalty provisions into Supabase 1!')
  }
}

seed()
