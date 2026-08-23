import React from 'react'
import CandlestickChart from './CandlestickChart'

const VOL_COLORS = {
  NORMAL: 'text-gray-400',
  ELEVATED: 'text-pending',
  HIGH: 'text-bear',
}

export default function SetupCard({ setup, candles }) {
  const isBullish = setup.direction === 'BULLISH'
  const isConfirmed = setup.status === 'CONFIRMED'

  return (
    <div className="bg-panel border border-border rounded-lg overflow-hidden mb-4">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">{setup.pair_symbol}</span>
          <span className="text-xs text-gray-500 uppercase">{setup.timeframe}</span>
          <span className={`text-sm font-medium ${isBullish ? 'text-bull' : 'text-bear'}`}>
            {isBullish ? '▲' : '▼'} {setup.direction}
          </span>
        </div>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded ${
            isConfirmed ? 'bg-accent text-black' : 'border border-pending text-pending'
          }`}
        >
          {setup.status}
        </span>
      </div>

      <div className="px-4 py-3 flex items-center justify-between text-sm">
        <div>
          <span className="text-gray-500">LEVEL </span>
          <span className="text-white font-mono text-lg">{setup.level_price}</span>
        </div>
        <span className={VOL_COLORS[setup.volatility] || 'text-gray-400'}>
          VOL {setup.volatility}
        </span>
      </div>

      {candles && candles.length > 0 && (
        <div className="px-2 pb-2">
          <CandlestickChart
            data={candles}
            levelPrice={setup.level_price}
            levelLabel={setup.level_type}
          />
        </div>
      )}

      <div className="px-4 py-3 border-t border-border text-xs text-gray-500 space-y-1">
        {setup.rejection_time && (
          <div>
            REJECTION {new Date(setup.rejection_time).toLocaleDateString()} — O{setup.rejection_open} H{setup.rejection_high} L{setup.rejection_low}
          </div>
        )}
        {setup.confirm_time ? (
          <div>
            CONFIRM {new Date(setup.confirm_time).toLocaleDateString()} — O{setup.confirm_open} H{setup.confirm_high} L{setup.confirm_low}
          </div>
        ) : (
          <div className="text-pending">CONFIRM — AWAITING NEXT CANDLE</div>
        )}
      </div>

      {setup.explanation && (
        <div className="px-4 pb-4 text-sm text-gray-300">{setup.explanation}</div>
      )}
    </div>
  )
}
