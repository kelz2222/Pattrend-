import React, { useEffect, useState } from 'react'
import { fetchEconomicCalendar } from '../lib/economicCalendar'

const IMPACT_COLORS = {
  HIGH: 'text-bear',
  MEDIUM: 'text-pending',
}

export default function EconomicCalendar() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEconomicCalendar()
      .then(setEvents)
      .catch((err) => console.error('Calendar fetch failed:', err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 py-4">
      <h2 className="text-sm font-semibold text-gray-400 mb-2">
        ECONOMIC CALENDAR [{events.length}]
      </h2>
      {loading ? (
        <div className="text-gray-500 text-sm">Loading...</div>
      ) : events.length === 0 ? (
        <div className="text-gray-500 text-sm">No high/medium impact events in range.</div>
      ) : (
        <div className="bg-panel border border-border rounded-lg divide-y divide-border">
          {events.map((e, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 text-sm">
              <div className="flex items-center gap-3">
                <span className="text-gray-500 text-xs w-32">
                  {new Date(e.time).toLocaleString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-gray-400 font-medium w-10">{e.country}</span>
                <span className="text-white">{e.event}</span>
              </div>
              <span className={`text-xs font-semibold ${IMPACT_COLORS[e.impact]}`}>
                {e.impact}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
