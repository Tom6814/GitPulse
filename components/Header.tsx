'use client'

import { Settings, Activity } from 'lucide-react'

interface HeaderProps {
  onOpenSettings?: () => void
}

export function Header({ onOpenSettings }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-neutral-l1)] bg-[#222427]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5 shrink-0">
            <div className="relative p-2 bg-[#2A2D31] border border-[var(--border-neutral-l2)] rounded-lg text-[#32F08C]">
              <Activity className="w-5 h-5 animate-pulse" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#32F08C]" />
            </div>
            <div>
              <span className="font-mono text-base font-bold tracking-tight text-[#D1D3DB] flex items-center space-x-1.5">
                <span className="text-[#32F08C] font-black">GitPulse</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-[var(--bg-brand-popup)] border border-[rgba(50,240,140,0.2)] text-[#32F08C] rounded">
                  Telemetry
                </span>
              </span>
              <p className="text-[11px] text-[#9599A6] font-mono leading-none mt-0.5">
                GitHub 深度数据与勋章报告
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-md bg-[var(--bg-overlay-l2)] hover:bg-[var(--bg-overlay-l3)] border border-[var(--border-neutral-l1)] text-[#D1D3DB] transition"
              title="设置"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
