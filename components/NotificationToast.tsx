'use client'

import { useEffect, useState } from 'react'
import { X, Star, Download, Info } from 'lucide-react'
import { Notification } from '@/types'
import { playNotificationSound } from '@/lib/sound'
import clsx from 'clsx'

interface NotificationToastProps {
  notification: Notification
  onClose: () => void
  soundEnabled?: boolean
}

export function NotificationToast({ notification, onClose, soundEnabled = true }: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    setIsVisible(true)
    
    if (soundEnabled && notification.type !== 'info') {
      playNotificationSound()
    }
    
    const timer = setTimeout(() => {
      handleClose()
    }, 5000)
    
    return () => clearTimeout(timer)
  }, [notification.id])
  
  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 400)
  }
  
  const icons = {
    star: <Star className="w-5 h-5 text-accent-orange" />,
    download: <Download className="w-5 h-5 text-accent-blue" />,
    info: <Info className="w-5 h-5 text-accent-purple" />,
  }
  
  return (
    <div
      className={clsx(
        'fixed top-4 right-4 z-50 bg-bg-secondary border border-bg-tertiary rounded-lg shadow-xl p-4 min-w-[300px] max-w-[400px]',
        'transition-all duration-400 ease-out',
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{icons[notification.type]}</div>
        <div className="flex-1 min-w-0">
          <p className="text-text-primary text-sm">{notification.message}</p>
          <p className="text-text-secondary text-xs mt-1">
            {new Date(notification.timestamp).toLocaleTimeString('zh-CN')}
          </p>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-text-secondary hover:text-text-primary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
