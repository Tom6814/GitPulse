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
  suffix
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
  
  const colorClasses = {
    green: 'border-accent-green/30',
    blue: 'border-accent-blue/30',
    purple: 'border-accent-purple/30',
    orange: 'border-accent-orange/30',
  }
  
  const iconBgClasses = {
    green: 'bg-accent-green/20 text-accent-green',
    blue: 'bg-accent-blue/20 text-accent-blue',
    purple: 'bg-accent-purple/20 text-accent-purple',
    orange: 'bg-accent-orange/20 text-accent-orange',
  }
  
  const TrendIcon = trend === undefined || trend === 0 ? Minus : trend > 0 ? TrendingUp : TrendingDown
  const trendColor = trend === undefined || trend === 0 ? 'text-text-secondary' : trend > 0 ? 'text-accent-green' : 'text-accent-red'
  
  return (
    <div className={clsx('bg-bg-secondary rounded-xl p-5 border', colorClasses[color])}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-text-secondary text-sm">{title}</span>
        <div className={clsx('p-2 rounded-lg', iconBgClasses[color])}>
          {icon}
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <span className={clsx('text-3xl font-bold text-text-primary font-mono', isAnimating && 'animate-number-bounce')}>
            {displayValue}
          </span>
          {suffix && <span className="text-lg text-text-secondary ml-1">{suffix}</span>}
        </div>
        
        {trend !== undefined && (
          <div className={clsx('flex items-center gap-1 text-sm', trendColor)}>
            <TrendIcon className="w-4 h-4" />
            <span>{trend > 0 ? '+' : ''}{trend}{trendLabel || ''}</span>
          </div>
        )}
      </div>
    </div>
  )
}
