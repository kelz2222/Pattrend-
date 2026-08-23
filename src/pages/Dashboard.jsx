import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { fetchCandles } from '../lib/twelveData'
import { useAuth } from '../context/AuthContext'
import SetupCard from '../components/SetupCard'

const TIMEFRAMES = ['MONTHLY', 'WEEKLY', 'DAILY', 'H4', 'H1', 'M30']
const PAIRS = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD', 'XAU/USD']

export default function Dashboard() {
  const { isPaid } = useAuth()
  const [timeframe, setTimeframe] = useState('WEEKLY')
  const [pair, setPair] = useState('EUR/USD')
  const [setups, setSetups] = useState([])
  const [candles, setCandles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data: setupData } = await supabase
        .from('setups')
        .select('*')
        .eq('timeframe', timeframe)
        .eq('pair_symbol', pair)
        .order('created_at', { ascending: false })

      setSetups(setupData || [])

      try {
        const candleData = await fetchCandles(pair, timeframe)
        setCandles(candleData)
      } catch (err) {
        console.error('Candle fetch failed:', err)
        setCandles([])
      }

      setLoading(false)
    }
    load()
  }, [timeframe, pair])

  const confirmed = setups.filter((s) => s.status === 'CONFIRMED')
  const pending = setups.filter((s) => s.status === 'PENDING')

  return (
    <div className="max-w-3xl mx-auto px-4 py-4">
      <div className="flex gap-1 overflow-x-auto mb-3 pb-1">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap ${
              timeframe === tf ? 'bg-accent text-black' : 'bg-panel text-gray-400 border border-border'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      <select
        value={pair}
        onChange={(e) => setPair(e.target.value)}
        className="w-full bg-panel border border-border text-white rounded px-3 py-2 mb-4 text-sm"
      >
        {PAIRS.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      {loading && <div className="text-center text-gray-500 py-8">Loading...</div>}

      {!loading && (
        <>
          <h2 className="text-sm font-semibold text-gray-400 mb-2">
            CONFIRMED SETUPS [{confirmed.length}]
          </h2>
          {!isPaid ? (
            <div className="bg-panel border border-border rounded-lg p-4 mb-4 text-sm text-gray-400">
              Confirmed setups are part of the paid plan ($15/month, USDT).{' '}
              <a href="/signup" className="text-accent underline">Create an account</a>
            </div>
          ) : confirmed.length === 0 ? (
            <div className="text-gray-500 text-sm mb-4">No confirmed setups on this timeframe right now.</div>
          ) : (
            confirmed.map((s) => <SetupCard key={s.id} setup={s} candles={candles} />)
          )}

          <h2 className="text-sm font-semibold text-gray-400 mb-2 mt-6">
            PENDING SETUPS [{pending.length}]
          </h2>
          {pending.length === 0 ? (
            <div className="text-gray-500 text-sm">No pending setups on this timeframe.</div>
          ) : (
            pending.map((s) => <SetupCard key={s.id} setup={s} candles={candles} />)
          )}
        </>
      )}
    </div>
  )
}
