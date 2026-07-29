'use client'

import {
  Radar,
  RadarChart as ReRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

interface RadarChartProps {
  axes: string[]
  values: number[]
  rawValues: number[]
}

export function RadarChart({ axes, values, rawValues }: RadarChartProps) {
  const data = axes.map((label, i) => ({
    label,
    value: values[i],
    raw: rawValues[i],
  }))

  const CustomTooltip = ({ active, payload }: Record<string, unknown>) => {
    if (active && Array.isArray(payload) && payload.length > 0) {
      const entry = payload[0] as Record<string, unknown>
      const rawVal = (entry?.payload as { raw?: number })?.raw ?? 0
      return (
        <div style={{
          background: '#1A1B1D',
          border: '1px solid #2A2D31',
          borderRadius: '8px',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: '#D1D3DB',
          padding: '6px 10px',
        }}>
          {rawVal.toLocaleString()}
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-[#222427] border border-[var(--border-neutral-l1)] rounded-[10px] p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4 border-b border-[var(--border-neutral-l1)] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#387BFF]/15 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-[#387BFF]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="12,2 22,21 2,21" />
            </svg>
          </div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#D1D3DB] font-semibold">
            项目六边形能力面板
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[#9599A6]">近30日活跃数据</span>
      </div>

      <div className="h-[320px] sm:h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <ReRadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
            <PolarGrid stroke="#2A2D31" strokeWidth={0.5} />
            <PolarAngleAxis
              dataKey="label"
              tick={{
                fill: '#9599A6',
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
              }}
            />
            <PolarRadiusAxis
              angle={18}
              domain={[0, 100]}
              tick={{ fill: '#2A2D31', fontSize: 9 }}
              axisLine={false}
              tickCount={5}
            />
            <Tooltip content={<CustomTooltip />} />
            <Radar
              name="能力值"
              dataKey="value"
              stroke="#32F08C"
              strokeWidth={1.5}
              fill="#32F08C"
              fillOpacity={0.15}
              dot={{
                r: 3,
                fill: '#32F08C',
                stroke: '#222427',
                strokeWidth: 1.5,
              }}
              activeDot={{
                r: 5,
                fill: '#32F08C',
                stroke: '#222427',
                strokeWidth: 2,
              }}
            />
          </ReRadarChart>
        </ResponsiveContainer>
      </div>

      {/* Metric summary */}
      <div className="grid grid-cols-6 gap-1 mt-2">
        {data.map((item, i) => (
          <div key={item.label} className="text-center">
            <div className="text-[11px] font-mono text-[#9599A6] truncate">{item.label}</div>
            <div className="text-xs font-mono font-bold text-[#D1D3DB] tabular-nums">
              {item.raw.toLocaleString()}
            </div>
            <div className="w-full bg-[#1A1B1D] rounded-full h-1 mt-1">
              <div
                className="bg-[#32F08C] h-1 rounded-full transition-all duration-500"
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
