'use client'

import { Bell, BellOff, Volume2, VolumeX, Wifi, WifiOff } from 'lucide-react'
import { LoadingState } from '@/types'
import clsx from 'clsx'

interface StatusIndicatorProps {
  status: LoadingState
  notificationEnabled?: boolean
  soundEnabled?: boolean
  onToggleNotification?: () => void
  onToggleSound?: () => void
}

export function StatusIndicator({
  status,
  notificationEnabled = true,
  soundEnabled = true,
  onToggleNotification,
  onToggleSound,
}: StatusIndicatorProps) {
  const isOnline = status !== 'offline'
  const isLoading = status === 'loading'
  
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <div className={clsx('w-2 h-2 rounded-full', isOnline ? 'bg-accent-green animate-pulse-green' : 'bg-accent-red')} />
        <span className="text-sm text-text-secondary">
          {isLoading ? '数据加载中...' : isOnline ? '实时数据' : '离线状态'}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        {isOnline ? <Wifi className="w-4 h-4 text-accent-green" /> : <WifiOff className="w-4 h-4 text-accent-red" />}
      </div>
      
      <div className="flex items-center gap-2 border-l border-bg-tertiary pl-4">
        <button
          onClick={onToggleNotification}
          className={clsx(
            'flex items-center gap-1.5 px-2 py-1 rounded-md text-sm transition-colors',
            notificationEnabled ? 'text-accent-green hover:bg-accent-green/10' : 'text-text-secondary hover:bg-bg-tertiary'
          )}
        >
          {notificationEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          <span className="hidden sm:inline">{notificationEnabled ? '通知开启' : '通知关闭'}</span>
        </button>
        
        <button
          onClick={onToggleSound}
          className={clsx(
            'flex items-center gap-1.5 px-2 py-1 rounded-md text-sm transition-colors',
            soundEnabled ? 'text-accent-green hover:bg-accent-green/10' : 'text-text-secondary hover:bg-bg-tertiary'
          )}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span className="hidden sm:inline">{soundEnabled ? '声音开启' : '声音关闭'}</span>
        </button>
      </div>
    </div>
  )
}
