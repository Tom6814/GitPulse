'use client'

import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { TimeRange } from '@/types'

interface TrendChartProps {
  data: { date: string; value: number }[]
  title: string
  color?: string
  showAllOption?: boolean
  sampled?: boolean
  sampledReason?: string
}

const timeRanges: { label: string; value: TimeRange }[] = [
  { label: '7天', value: '7d' },
  { label: '30天', value: '30d' },
  { label: '90天', value: '90d' },
  { label: '全部', value: 'all' },
]

export function TrendChart({
  data,
  title,
  color = '#32F08C',
  showAllOption = false,
  sampled = false,
  sampledReason,
}: TrendChartProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('30d')

  const ranges = showAllOption ? timeRanges : timeRanges.filter(r => r.value !== 'all')

  const filteredData = (() => {
    if (selectedRange === 'all') return data
    const days = selectedRange === '7d' ? 7 : selectedRange === '30d' ? 30 : 90
    return data.slice(-days)
  })()

  const maxTicks = selectedRange === '7d' ? 7 : selectedRange === '30d' ? 6 : selectedRange === '90d' ? 8 : 10
  const tickInterval = Math.max(0, Math.ceil(filteredData.length / maxTicks) - 1)

  return (
    <div className="bg-[#222427] border border-[var(--border-neutral-l1)] rounded-[10px] p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2 border-b border-[var(--border-neutral-l1)] pb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#D1D3DB] font-semibold">{title}</h3>
          {sampled && (
            <span className="text-[10px] font-mono text-[var(--status-warning-default)] bg-[var(--status-warning-surface-l1)] px-2 py-0.5 rounded-full border border-[var(--status-warning-surface-l2)]" title={sampledReason}>
              采样
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 bg-[var(--bg-overlay-l1)] rounded-md p-0.5">
          {ranges.map(range => (
            <button
              key={range.value}
              onClick={() => setSelectedRange(range.value)}
              className={`px-3 py-1 text-xs font-mono rounded transition ${
                selectedRange === range.value
                  ? 'bg-[var(--bg-brand-popup)] text-[#32F08C] font-semibold border border-[rgba(50,240,140,0.2)]'
                  : 'text-[#9599A6] hover:text-[#D1D3DB]'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {sampled && sampledReason && (
        <p className="text-[10px] text-[#9599A6] mb-3 font-mono">{sampledReason}</p>
      )}

      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(224,226,242,0.06)" />
            <XAxis
              dataKey="date"
              stroke="#666B75"
              fontSize={11}
              interval={tickInterval}
              tickFormatter={(value) => {
                const d = new Date(value)
                return `${d.getMonth() + 1}/${d.getDate()}`
              }}
            />
            <YAxis
              stroke="#666B75"
              fontSize={11}
              width={45}
              tickCount={8}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1A1B1D',
                border: '1px solid var(--border-neutral-l2)',
                borderRadius: '8px',
                color: '#D1D3DB',
                fontSize: '12px',
                fontFamily: 'var(--font-family-mono)',
              }}
              labelFormatter={(value: unknown) => {
                const v = value as string | number
                return new Date(v).toLocaleDateString('zh-CN')
              }}
              formatter={(value: unknown) => [String(value), 'Stars']}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: color, stroke: '#1A1B1D', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
