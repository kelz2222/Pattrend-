const API_KEY = import.meta.env.VITE_TWELVE_DATA_KEY
const BASE_URL = 'https://api.twelvedata.com/time_series'

const INTERVAL_MAP = {
  MONTHLY: '1month',
  WEEKLY: '1week',
  DAILY: '1day',
  H4: '4h',
  H1: '1h',
  M30: '30min',
}

export async function fetchCandles(symbol, timeframe, outputsize = 100) {
  const interval = INTERVAL_MAP[timeframe] || '1day'
  const url = `${BASE_URL}?symbol=${encodeURIComponent(symbol)}&interval=${interval}&outputsize=${outputsize}&apikey=${API_KEY}`

  const res = await fetch(url)
  const json = await res.json()

  if (json.status === 'error') {
    throw new Error(json.message || 'Failed to fetch price data')
  }

  return json.values
    .map((v) => ({
      time: Math.floor(new Date(v.datetime).getTime() / 1000),
      open: parseFloat(v.open),
      high: parseFloat(v.high),
      low: parseFloat(v.low),
      close: parseFloat(v.close),
    }))
    .sort((a, b) => a.time - b.time)
}
