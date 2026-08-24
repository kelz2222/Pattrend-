import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function DailyFreeBanner() {
  const [freeSetup, setFreeSetup] = useState(null)

  useEffect(() => {
    const fetchToday = async () => {
      const { data } = await supabase
        .from('daily_free_pick')
        .select('setup_id, setups(*)')
        .eq('pick_date', new Date().toISOString().split('T')[0])
        .single()

      if (data?.setups) setFreeSetup(data.setups)
    }

    fetchToday()
  }, [])

  if (!freeSetup) return null

  return (
    <div className="mx-auto max-w-4xl mb-6 p-4 bg-accent/10 border border-accent rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-accent font-semibold uppercase">🎁 Free Daily Pick</p>
          <p className="text-lg font-bold text-white mt-1">
            {freeSetup.pair_symbol} {freeSetup.timeframe} · {freeSetup.direction}
          </p>
          <p className="text-sm text-panel mt-1">
            Level: {freeSetup.level_price.toFixed(5)} · {freeSetup.volatility} Volatility
          </p>
        </div>
        <button
          onClick={() => navigator.share?.({
            title: 'Pattrend Free Pick',
            text: `Check out today's free forex setup on Pattrend: ${freeSetup.pair_symbol} ${freeSetup.timeframe}`,
            url: window.location.href,
          })}
          className="px-4 py-2 bg-accent text-bg rounded font-semibold hover:bg-accent/80"
        >
          Share
        </button>
      </div>
    </div>
  )
}
