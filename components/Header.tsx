'use client'

import { Settings, Github } from 'lucide-react'
import { SettingsModal } from './SettingsModal'

interface HeaderProps {
  onOpenSettings?: () => void
}

export function Header({ onOpenSettings }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-bg-primary/80 backdrop-blur-sm border-b border-bg-tertiary">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center">
            <span className="text-white font-bold text-sm">GP</span>
          </div>
          <h1 className="text-xl font-semibold text-text-primary">GitPulse</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg hover:bg-bg-secondary transition-colors text-text-secondary hover:text-text-primary"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
