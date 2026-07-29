'use client'

import { useState, useEffect } from 'react'
import { Settings } from '@/types'

const SETTINGS_KEY = 'gitpulse_settings'

const defaultSettings: Settings = {
  notificationEnabled: true,
  soundEnabled: true,
  refreshInterval: 60,
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [isLoaded, setIsLoaded] = useState(false)
  
  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (stored) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) })
      } catch {
        setSettings(defaultSettings)
      }
    }
    setIsLoaded(true)
  }, [])
  
  const updateSettings = (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
  }
  
  return { settings, updateSettings, isLoaded }
}
