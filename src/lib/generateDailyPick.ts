import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

Deno.serve(async (_req) => {
  try {
    // Get all confirmed setups
    const { data: setups } = await supabase
      .from('setups')
      .select('*')
      .eq('status', 'CONFIRMED')

    if (!setups || setups.length === 0) {
      return new Response(JSON.stringify({ error: 'No confirmed setups' }), { status: 400 })
    }

    // Random pick
    const randomSetup = setups[Math.floor(Math.random() * setups.length)]

    // Insert today's free pick
    await supabase.from('daily_free_pick').upsert({
      setup_id: randomSetup.id,
      pick_date: new Date().toISOString().split('T')[0],
    }, { onConflict: 'pick_date' })

    return new Response(JSON.stringify({ picked: randomSetup.pair_symbol, date: new Date().toISOString().split('T')[0] }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
