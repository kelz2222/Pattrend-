const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_KEY

export async function fetchEconomicCalendar() {
  const today = new Date()
  const from = today.toISOString().split('T')[0]
  const to = new Date(today.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const url = `https://finnhub.io/api/v1/calendar/economic?from=${from}&to=${to}&token=${FINNHUB_KEY}`
  const res = await fetch(url)
  const json = await res.json()

  return (json.economicCalendar || [])
    .filter((e) => e.impact === 'high' || e.impact === 'medium')
    .sort((a, b) => new Date(a.time) - new Date(b.time))
    .map((e) => ({
      time: e.time,
      country: e.country,
      event: e.event,
      impact: e.impact.toUpperCase(),
    }))
}
