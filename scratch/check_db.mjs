
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars. Make sure to run with --env-file=.env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkData() {
  console.log('Checking updates table...')
  const { data, count, error } = await supabase
    .from('updates')
    .select('*', { count: 'exact' })
  
  if (error) {
    console.error('Error fetching updates:', error)
  } else {
    console.log('Total updates:', count)
    if (data && data.length > 0) {
      console.log('Latest article:', data[0].title)
    }
  }

  console.log('Checking subscribers table...')
  const { data: subData, count: subCount, error: subError } = await supabase
    .from('subscribers')
    .select('*', { count: 'exact' })

  if (subError) {
    console.error('Error fetching subscribers:', subError)
  } else {
    console.log('Total subscribers:', subCount)
  }
}

checkData()
