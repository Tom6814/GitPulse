'use client'

import { useState, useEffect, useCallback } from 'react'
import { Notification } from '@/types'
import { addNotification, getNotifications, markAsRead, clearNotifications } from '@/lib/notifications'
import { NotificationToast } from '@/components/NotificationToast'

interface UseNotificationsOptions {
  enabled?: boolean
  soundEnabled?: boolean
}

export function useNotifications({ enabled = true, soundEnabled = true }: UseNotificationsOptions = {}) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [currentToast, setCurrentToast] = useState<Notification | null>(null)
  
  useEffect(() => {
    setNotifications(getNotifications())
  }, [])
  
  const showNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    if (!enabled) return
    
    const newNotification = addNotification(notification)
    setNotifications(prev => [newNotification, ...prev])
    setCurrentToast(newNotification)
  }, [enabled])
  
  const closeToast = useCallback(() => {
    if (currentToast) {
      markAsRead(currentToast.id)
      setCurrentToast(null)
    }
  }, [currentToast])
  
  const clear = useCallback(() => {
    clearNotifications()
    setNotifications([])
  }, [])
  
  return {
    notifications,
    showNotification,
    currentToast,
    closeToast,
    clear,
    ToastComponent: currentToast ? (
      <NotificationToast 
        notification={currentToast} 
        onClose={closeToast}
        soundEnabled={soundEnabled}
      />
    ) : null,
  }
}
