'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import clsx from 'clsx'
import { useEffect, useState } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: number
  trendLabel?: string
  color?: 'green' | 'blue' | 'purple' | 'orange'
  suffix?: string
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  trendLabel,
  color = 'green',
  suffix,
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (value !== displayValue) {
      setIsAnimating(true)
      setTimeout(() => {
        setDisplayValue(value)
        setIsAnimating(false)
      }, 150)
    }
  }, [value])

  const colorMap = {
    green: { accent: '#33C192', bg: 'rgba(51,193,146,0.15)' },
    blue: { accent: '#387BFF', bg: 'rgba(56,123,255,0.15)' },
    purple: { accent: '#B38CFF', bg: 'rgba(179,140,255,0.15)' },
    orange: { accent: '#D29D00', bg: 'rgba(210,157,0,0.15)' },
  }

  const TrendIcon = trend === undefined || trend === 0 ? Minus : trend > 0 ? TrendingUp : TrendingDown
  const trendColor = trend === undefined || trend === 0 ? 'text-[#9599A6]' : trend > 0 ? 'text-[#33C192]' : 'text-[var(--status-error-default)]'

  return (
    <div className="ds-statcard bg-[#1A1B1D] border-[var(--border-neutral-l1)] hover:border-[rgba(50,240,140,0.3)] transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#9599A6] font-medium">{title}</span>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: colorMap[color].bg, color: colorMap[color].accent }}
        >
          {icon}
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <span className={clsx('font-mono font-variant-numeric tabular-nums text-[22px] font-semibold text-[#D1D3DB]', isAnimating && 'animate-number-bounce')}>
            {displayValue}
          </span>
          {suffix && <span className="text-sm text-[#666B75] ml-1">{suffix}</span>}
        </div>

        {trend !== undefined && (
          <div className={clsx('flex items-center gap-1 text-[11px] font-mono', trendColor)}>
            <TrendIcon className="w-3.5 h-3.5" />
            <span>{trend > 0 ? '+' : ''}{trend}{trendLabel || ''}</span>
          </div>
        )}
      </div>
    </div>
  )
}
