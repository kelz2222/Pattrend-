import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { fetchCandles } from '../lib/twelveData'
import { EconomicCalendar } from '../components/EconomicCalendar'
import { SetupCard } from '../components/SetupCard'
import { CandlestickChart } from '../components/CandlestickChart'
import { DailyFreeBanner } from '../components/DailyFreeBanner'

const TIMEFRAMES = ['MONTHLY', 'WEEKLY', 'DAILY', 'H4', 'H1', 'M30']
const PAIRS = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD', 'XAU/USD']

export function Dashboard() {
  const { user, profile, isPaid } = useAuth()
  const navigate = useNavigate()
  const [timeframe, setTimeframe] = useState('WEEKLY')
  const [pair, setPair] = useState('EUR/USD')
  const [setups, setSetups] = useState([])
  const [candles, setCandles] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) navigate('/signin')
  }, [user, navigate])

  useEffect(() => {
    const loadSetups = async () => {
      setLoading(true)
      try {
        const { data } = await supabase
          .from('setups')
          .select('*')
          .eq('pair_symbol', pair)
          .eq('timeframe', timeframe)

        setSetups(data || [])

        if (data && data.length > 0) {
          const candle = await fetchCandles(pair, timeframe)
          setCandles(candle || [])
        }
      } catch (err) {
        console.error('Error loading setups:', err)
      } finally {
        setLoading(false)
      }
    }

    loadSetups()
  }, [pair, timeframe])

  if (!profile) return <div className="min-h-screen bg-bg flex items-center justify-center text-white">Loading...</div>

  const confirmed = setups.filter(s => s.status === 'CONFIRMED')
  const pending = setups.filter(s => s.status === 'PENDING')

  return (
    <div className="min-h-screen bg-bg p-6">
      <DailyFreeBanner />

      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Pattrend</h1>
          <p className="text-panel">Confirmed price-action setups, refreshed every 4 hours.</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-accent mb-2">Timeframe</label>
          <div className="flex gap-2 flex-wrap">
            {TIMEFRAMES.map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-4 py-2 rounded font-semibold transition ${
                  timeframe === tf
                    ? 'bg-accent text-bg'
                    : 'bg-panel text-white hover:bg-border'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-accent mb-2">Pair</label>
          <select
            value={pair}
            onChange={e => setPair(e.target.value)}
            className="w-full px-4 py-3 bg-panel border border-border text-white rounded focus:outline-none focus:border-accent"
          >
            {PAIRS.map(p => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {loading && <p className="text-center text-panel">Loading setups...</p>}

        {!loading && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                CONFIRMED SETUPS [{confirmed.length}]
              </h2>
              {confirmed.length === 0 ? (
                <div className="bg-panel border border-border rounded p-6 text-center">
                  {!isPaid ? (
                    <>
                      <p className="text-panel mb-4">
                        Confirmed setups are part of the paid plan ($15/month, USDT). <button onClick={() => navigate('/account')} className="text-accent hover:underline">Create an account</button>
                      </p>
                    </>
                  ) : (
                    <p className="text-panel">No confirmed setups on this timeframe.</p>
                  )}
                </div>
              ) : (
                <div className="grid gap-4">
                  {confirmed.map(setup => (
                    <SetupCard key={setup.id} setup={setup} candles={candles} />
                  ))}
                </div>
              )}
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                PENDING SETUPS [{pending.length}]
              </h2>
              {pending.length === 0 ? (
                <p className="text-panel">No pending setups on this timeframe.</p>
              ) : (
                <div className="grid gap-4">
                  {pending.map(setup => (
                    <SetupCard key={setup.id} setup={setup} candles={candles} />
                  ))}
                </div>
              )}
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Economic Calendar</h2>
              <EconomicCalendar />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
