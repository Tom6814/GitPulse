import { Notification } from '@/types'

const STORAGE_KEY = 'gitpulse_notifications'
const MAX_NOTIFICATIONS = 50

export function getNotifications(): Notification[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
  const notifications = getNotifications()
  
  const newNotification: Notification = {
    ...notification,
    id: crypto.randomUUID(),
    timestamp: new Date(),
    read: false,
  }
  
  const updated = [newNotification, ...notifications].slice(0, MAX_NOTIFICATIONS)
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  
  return newNotification
}

export function markAsRead(id: string) {
  const notifications = getNotifications()
  const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export function clearNotifications() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
}
