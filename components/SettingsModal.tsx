'use client'

import { X } from 'lucide-react'
import clsx from 'clsx'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: {
    notificationEnabled: boolean
    soundEnabled: boolean
  }
  onUpdateSettings: (settings: { notificationEnabled: boolean; soundEnabled: boolean }) => void
}

export function SettingsModal({ isOpen, onClose, settings, onUpdateSettings }: SettingsModalProps) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-bg-secondary rounded-xl p-6 w-full max-w-md border border-bg-tertiary">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-text-primary">设置</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-bg-tertiary transition-colors text-text-secondary hover:text-text-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-primary font-medium">通知提醒</p>
              <p className="text-text-secondary text-sm">新 Star 或下载量变化时显示通知</p>
            </div>
            <button
              onClick={() => onUpdateSettings({ ...settings, notificationEnabled: !settings.notificationEnabled })}
              className={clsx(
                'w-12 h-6 rounded-full transition-colors relative',
                settings.notificationEnabled ? 'bg-accent-green' : 'bg-bg-tertiary'
              )}
            >
              <span
                className={clsx(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                  settings.notificationEnabled ? 'left-7' : 'left-1'
                )}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-primary font-medium">声音提示</p>
              <p className="text-text-secondary text-sm">变化时播放提示音</p>
            </div>
            <button
              onClick={() => onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              className={clsx(
                'w-12 h-6 rounded-full transition-colors relative',
                settings.soundEnabled ? 'bg-accent-green' : 'bg-bg-tertiary'
              )}
            >
              <span
                className={clsx(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                  settings.soundEnabled ? 'left-7' : 'left-1'
                )}
              />
            </button>
          </div>
          
          <div className="pt-4 border-t border-bg-tertiary">
            <p className="text-text-secondary text-sm mb-2">环境变量配置</p>
            <div className="bg-bg-tertiary rounded-lg p-3 font-mono text-sm">
              <p className="text-text-secondary">GITHUB_REPO=owner/repo</p>
              <p className="text-text-secondary">GITHUB_PAT=ghp_xxx...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
