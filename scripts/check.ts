import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const envConfig = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8')
const envs: Record<string, string> = {}
for (const line of envConfig.split('\n')) {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    envs[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '')
  }
}

const supabaseUrl = envs['NEXT_PUBLIC_SUPABASE_URL']
const supabaseKey = envs['SUPABASE_SERVICE_ROLE_KEY']

const supabase = createClient(supabaseUrl, supabaseKey)
supabase.from('updates').select('title, views').order('views', {ascending: false}).limit(5).then(res => console.log(res.data))
