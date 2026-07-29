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
  color = '#3fb950',
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

  const step = Math.max(1, Math.floor(filteredData.length / 12))

  return (
    <div className="bg-bg-secondary rounded-xl p-6 border border-bg-tertiary">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-text-primary">{title}</h3>
          {sampled && (
            <span className="text-xs text-accent-orange bg-accent-orange/10 px-2 py-0.5 rounded-full" title={sampledReason}>
              采样数据
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 bg-bg-tertiary rounded-lg p-1">
          {ranges.map(range => (
            <button
              key={range.value}
              onClick={() => setSelectedRange(range.value)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                selectedRange === range.value
                  ? 'bg-bg-secondary text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {sampled && sampledReason && (
        <p className="text-xs text-text-secondary mb-3">{sampledReason}</p>
      )}

      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
            <XAxis
              dataKey="date"
              stroke="#8b949e"
              fontSize={12}
              interval={step - 1}
              tickFormatter={(value) => {
                const d = new Date(value)
                return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
              }}
            />
            <YAxis stroke="#8b949e" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#161b22',
                border: '1px solid #21262d',
                borderRadius: '8px',
                color: '#f0f6fc',
              }}
              labelFormatter={(value) => new Date(value).toLocaleDateString('zh-CN')}
              formatter={(value: number) => [value.toLocaleString(), '']}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: color }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
