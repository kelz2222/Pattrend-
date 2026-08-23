import React, { useEffect, useRef } from 'react'
import { createChart, ColorType } from 'lightweight-charts'

export default function CandlestickChart({ data, levelPrice, levelLabel }) {
  const containerRef = useRef()
  const chartRef = useRef()

  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0f1420' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: '#1c2230' },
        horzLines: { color: '#1c2230' },
      },
      width: containerRef.current.clientWidth,
      height: 300,
      timeScale: { borderColor: '#1c2230' },
      rightPriceScale: { borderColor: '#1c2230' },
    })

    const series = chart.addCandlestickSeries({
      upColor: '#26a17b',
      downColor: '#e5484d',
      borderVisible: false,
      wickUpColor: '#26a17b',
      wickDownColor: '#e5484d',
    })

    series.setData(data)

    if (levelPrice) {
      series.createPriceLine({
        price: levelPrice,
        color: '#3b82f6',
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: levelLabel || 'Level',
      })
    }

    chart.timeScale().fitContent()
    chartRef.current = chart

    const handleResize = () => {
      chart.applyOptions({ width: containerRef.current.clientWidth })
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [data, levelPrice, levelLabel])

  return <div ref={containerRef} className="w-full" />
}
