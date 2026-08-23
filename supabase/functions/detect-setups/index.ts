import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const TWELVE_DATA_KEY = Deno.env.get('TWELVE_DATA_KEY')!

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const PAIRS = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD', 'XAU/USD']
const TIMEFRAMES: Record<string, string> = {
  MONTHLY: '1month', WEEKLY: '1week', DAILY: '1day', H4: '4h', H1: '1h', M30: '30min',
}

async function fetchCandles(symbol: string, interval: string) {
  const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=${interval}&outputsize=60&apikey=${TWELVE_DATA_KEY}`
  const res = await fetch(url)
  const json = await res.json()
  if (json.status === 'error') throw new Error(json.message)
  return json.values
    .map((v: any) => ({
      time: v.datetime,
      open: parseFloat(v.open),
      high: parseFloat(v.high),
      low: parseFloat(v.low),
      close: parseFloat(v.close),
    }))
    .reverse() // oldest first
}

// Find swing highs/lows that price has tested at least twice (a real level)
function findLevels(candles: any[]) {
  const levels: { price: number; type: 'SUPPORT' | 'RESISTANCE' }[] = []
  for (let i = 2; i < candles.length - 2; i++) {
    const c = candles[i]
    const isSwingLow = c.low < candles[i - 1].low && c.low < candles[i - 2].low &&
      c.low < candles[i + 1].low && c.low < candles[i + 2].low
    const isSwingHigh = c.high > candles[i - 1].high && c.high > candles[i - 2].high &&
      c.high > candles[i + 1].high && c.high > candles[i + 2].high
    if (isSwingLow) levels.push({ price: c.low, type: 'SUPPORT' })
    if (isSwingHigh) levels.push({ price: c.high, type: 'RESISTANCE' })
  }
  return levels
}

function computeVolatility(candles: any[]) {
  const ranges = candles.slice(-14).map((c) => c.high - c.low)
  const avgRecent = ranges.slice(-3).reduce((a, b) => a + b, 0) / 3
  const avgBaseline = ranges.reduce((a, b) => a + b, 0) / ranges.length
  const ratio = avgRecent / avgBaseline
  if (ratio > 1.6) return 'HIGH'
  if (ratio > 1.2) return 'ELEVATED'
  return 'NORMAL'
}

Deno.serve(async () => {
  const results: string[] = []

  for (const pair of PAIRS) {
    for (const [timeframe, interval] of Object.entries(TIMEFRAMES)) {
      try {
        const candles = await fetchCandles(pair, interval)
        if (candles.length < 10) continue

        const levels = findLevels(candles.slice(0, -2)) // exclude last 2 (rejection/confirm candidates)
        const volatility = computeVolatility(candles)
        const rejectionCandle = candles[candles.length - 2]
        const latestCandle = candles[candles.length - 1]

        for (const level of levels) {
          const tolerance = level.price * 0.0015 // ~0.15% proximity

          // Bullish: wicked below support, closed back above it
          if (level.type === 'SUPPORT' &&
              rejectionCandle.low < level.price + tolerance &&
              rejectionCandle.close > level.price) {

            const isConfirmed = latestCandle.low > rejectionCandle.low && latestCandle.close > rejectionCandle.close

            await supabase.from('setups').upsert({
              pair_symbol: pair,
              timeframe,
              direction: 'BULLISH',
              level_type: 'SUPPORT',
              level_price: level.price,
              status: isConfirmed ? 'CONFIRMED' : 'PENDING',
              volatility,
              rejection_time: rejectionCandle.time,
              rejection_open: rejectionCandle.open,
              rejection_high: rejectionCandle.high,
              rejection_low: rejectionCandle.low,
              rejection_close: rejectionCandle.close,
              confirm_time: isConfirmed ? latestCandle.time : null,
              confirm_open: isConfirmed ? latestCandle.open : null,
              confirm_high: isConfirmed ? latestCandle.high : null,
              confirm_low: isConfirmed ? latestCandle.low : null,
              confirm_close: isConfirmed ? latestCandle.close : null,
              explanation: isConfirmed
                ? `Price wicked into support at ${level.price} and closed back above it, then the following candle made a higher low and a higher close — the rejection was confirmed.`
                : `The latest candle rejected support at ${level.price}. Waiting on the next candle to make a higher low and higher close before this is treated as confirmed.`,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'pair_symbol,timeframe,level_price' })
          }

          // Bearish: wicked above resistance, closed back below it
          if (level.type === 'RESISTANCE' &&
              rejectionCandle.high > level.price - tolerance &&
              rejectionCandle.close < level.price) {

            const isConfirmed = latestCandle.high < rejectionCandle.high && latestCandle.close < rejectionCandle.close

            await supabase.from('setups').upsert({
              pair_symbol: pair,
              timeframe,
              direction: 'BEARISH',
              level_type: 'RESISTANCE',
              level_price: level.price,
              status: isConfirmed ? 'CONFIRMED' : 'PENDING',
              volatility,
              rejection_time: rejectionCandle.time,
              rejection_open: rejectionCandle.open,
              rejection_high: rejectionCandle.high,
              rejection_low: rejectionCandle.low,
              rejection_close: rejectionCandle.close,
              confirm_time: isConfirmed ? latestCandle.time : null,
              confirm_open: isConfirmed ? latestCandle.open : null,
              confirm_high: isConfirmed ? latestCandle.high : null,
              confirm_low: isConfirmed ? latestCandle.low : null,
              confirm_close: isConfirmed ? latestCandle.close : null,
              explanation: isConfirmed
                ? `Price wicked into resistance at ${level.price} and closed back below it, then the following candle made a lower high and a lower close — the rejection was confirmed.`
                : `The latest candle rejected resistance at ${level.price}. Waiting on the next candle to make a lower high and lower close before this is treated as confirmed.`,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'pair_symbol,timeframe,level_price' })
          }
        }

        results.push(`${pair} ${timeframe}: ok`)
      } catch (err) {
        results.push(`${pair} ${timeframe}: ERROR ${err.message}`)
      }
    }
  }

  return new Response(JSON.stringify({ results }), { headers: { 'Content-Type': 'application/json' } })
})
