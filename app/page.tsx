'use client'

import { useState, useEffect, useRef } from 'react'
import useSWR from 'swr'
import { Star, Download, GitFork, TrendingUp, Trophy, Settings } from 'lucide-react'
import { RepoAnalysisData, LoadingState } from '@/types'
import { formatNumber } from '@/lib/stats'
import { HeroCard } from '@/components/HeroCard'
import { StatCard } from '@/components/StatCard'
import { TrendChart } from '@/components/TrendChart'
import { DetailPanel } from '@/components/DetailPanel'
import { DeveloperVitals } from '@/components/DeveloperVitals'
import { AIExecutiveReview } from '@/components/AIExecutiveReview'
import { LiveTelemetryFeed } from '@/components/LiveTelemetryFeed'
import { SettingsModal } from '@/components/SettingsModal'
import { useSettings } from '@/hooks/useSettings'
import { useNotifications } from '@/hooks/useNotifications'

const fetcher = (url: string) =>
  fetch(url).then(res => {
    if (!res.ok) throw new Error('Failed to fetch')
    return res.json()
  })

export default function Home() {
  const [status, setStatus] = useState<LoadingState>('loading')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const lastStarsRef = useRef<number | null>(null)
  const lastDownloadsRef = useRef<number | null>(null)
  const pollInitializedRef = useRef(false)

  const { settings, updateSettings, isLoaded } = useSettings()
  const { showNotification, ToastComponent } = useNotifications({
    enabled: settings.notificationEnabled,
    soundEnabled: settings.soundEnabled,
  })

  const { data: stats } = useSWR<RepoAnalysisData>('/api/stats', fetcher, {
    refreshInterval: settings.refreshInterval * 1000,
    revalidateOnFocus: true,
    onSuccess: data => {
      setStatus('success')
      if (lastStarsRef.current === null) lastStarsRef.current = data.stars.total
      if (lastDownloadsRef.current === null) lastDownloadsRef.current = data.totalReleaseDownloads
    },
    onError: () => {
      setStatus('error')
    },
  })

  const { data: pollData } = useSWR<{ starsTotal: number; downloadsTotal: number }>(
    '/api/poll',
    fetcher,
    {
      refreshInterval: 15000,
      revalidateOnFocus: false,
      onSuccess: data => {
        if (!pollInitializedRef.current) {
          lastStarsRef.current = data.starsTotal
          lastDownloadsRef.current = data.downloadsTotal
          pollInitializedRef.current = true
          return
        }

        const prevStars = lastStarsRef.current
        const prevDownloads = lastDownloadsRef.current

        if (prevStars !== null && data.starsTotal > prevStars) {
          const delta = data.starsTotal - prevStars
          showNotification({
            type: 'star',
            message: `⭐ 新增 ${delta} Stars！总计: ${formatNumber(data.starsTotal)}`,
          })
          fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'star',
              message: `新增 ${delta} Stars，总计 ${formatNumber(data.starsTotal)}`,
              delta,
            }),
          }).catch(() => {})
        }

        if (prevDownloads !== null && data.downloadsTotal > prevDownloads) {
          const delta = data.downloadsTotal - prevDownloads
          showNotification({
            type: 'download',
            message: `📥 新增 ${formatNumber(delta)} 下载！总计: ${formatNumber(data.downloadsTotal)}`,
          })
          fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'download',
              message: `新增 ${formatNumber(delta)} 下载，总计 ${formatNumber(data.downloadsTotal)}`,
              delta,
            }),
          }).catch(() => {})
        }

        lastStarsRef.current = data.starsTotal
        lastDownloadsRef.current = data.downloadsTotal
      },
    }
  )

  useEffect(() => {
    if (stats) setStatus('success')
  }, [stats])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[var(--bg-base-default)] flex items-center justify-center">
        <div className="text-[#9599A6] font-mono text-sm">加载中...</div>
      </div>
    )
  }

  const starHistoryData =
    stats?.stars.history.map(h => ({
      date: h.date,
      value: h.totalStars,
    })) || []

  const unlockedAchievements = stats?.achievements.filter(a => a.isUnlocked) || []

  return (
    <div className="min-h-screen bg-[var(--bg-base-default)] bg-grid-pattern">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#32F08C] animate-pulse" />
            <span className="text-xs font-mono text-[#9599A6]">
              {status === 'loading' ? '连接中...' : status === 'error' ? '连接失败' : '实时监控中'}
            </span>
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-md bg-[var(--bg-overlay-l2)] hover:bg-[var(--bg-overlay-l3)] border border-[var(--border-neutral-l1)] text-[#D1D3DB] transition"
            title="设置"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="animate-spin w-10 h-10 border-2 border-[#32F08C] border-t-transparent rounded-full" />
            <p className="text-xs font-mono text-[#9599A6]">正在加载项目遥测数据...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-[var(--status-error-surface-l1)] border border-[var(--status-error-surface-l2)] rounded-[10px] p-6 text-center">
            <p className="text-[var(--status-error-default)] mb-4 font-mono text-sm">加载失败，请检查网络或配置</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[var(--status-error-surface-l2)] text-[var(--status-error-default)] rounded-lg hover:opacity-80 transition-opacity font-mono text-xs"
            >
              重试
            </button>
          </div>
        )}

        {stats && status === 'success' && (
          <>
            <HeroCard
              data={stats}
              unlockedCount={unlockedAchievements.length}
              totalAchievementsCount={stats.achievements.length}
              onScrollToAiReview={() => {
                document.getElementById('ai-review-section')?.scrollIntoView({ behavior: 'smooth' })
              }}
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard
                title="Stars"
                value={formatNumber(stats.stars.total)}
                icon={<Star className="w-5 h-5" />}
                trend={stats.stars.today}
                trendLabel=" 今日"
                color="orange"
              />
              <StatCard
                title="今日增速"
                value={stats.stars.today > 0 ? `+${stats.stars.today}` : '0'}
                icon={<TrendingUp className="w-5 h-5" />}
                color="green"
              />
              <StatCard
                title="Downloads"
                value={formatNumber(stats.totalReleaseDownloads)}
                icon={<Download className="w-5 h-5" />}
                color="blue"
              />
              <StatCard
                title="Forks"
                value={formatNumber(stats.repo.forks_count)}
                icon={<GitFork className="w-5 h-5" />}
                color="purple"
              />
            </div>

            <DeveloperVitals issueHealth={stats.issueHealth} repo={stats.repo} />

            <LiveTelemetryFeed
              repoFullName={stats.repo.full_name}
              soundEnabled={settings.soundEnabled}
              onToggleSound={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            />

            <TrendChart
              data={starHistoryData}
              title="Star 增长趋势（每日精确数据）"
              color="#32F08C"
              showAllOption
              sampled={stats.stars.sampled}
              sampledReason={
                stats.stars.sampled
                  ? 'Star 历史为采样数据（受 GitHub API 分页限制或 PAT 配置影响）'
                  : undefined
              }
            />

            <DetailPanel stats={stats} />

            {unlockedAchievements.length > 0 && (
              <div className="bg-[#222427] border border-[var(--border-neutral-l1)] rounded-[10px] p-5 shadow-xl">
                <div className="flex items-center gap-2 mb-4 border-b border-[var(--border-neutral-l1)] pb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#D29D00]/15 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-[#D29D00]" />
                  </div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#D1D3DB] font-semibold">
                    成就徽章（已解锁 {unlockedAchievements.length} / {stats.achievements.length}）
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                  {stats.achievements.map(ach => (
                    <div
                      key={ach.id}
                      className={`p-3 rounded-md border text-center transition-all duration-300 ${
                        ach.isUnlocked
                          ? 'bg-[var(--bg-brand-popup)] border-[rgba(50,240,140,0.3)] hover:border-[#32F08C]/50'
                          : 'bg-[#1A1B1D] border-[var(--border-neutral-l1)] opacity-50'
                      }`}
                    >
                      <div className="text-2xl mb-1">{ach.icon}</div>
                      <div className="text-[11px] font-mono font-bold text-[#D1D3DB] truncate">{ach.title}</div>
                      <div className="text-[10px] text-[#9599A6] mt-1 font-mono">{ach.metricLabel}</div>
                      {!ach.isUnlocked && (
                        <div className="mt-2 w-full bg-[#2A2D31] rounded-full h-1">
                          <div className="bg-[#32F08C] h-1 rounded-full transition-all duration-500" style={{ width: `${ach.progress}%` }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <AIExecutiveReview data={stats} />
          </>
        )}
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
      />

      {ToastComponent}
    </div>
  )
}
