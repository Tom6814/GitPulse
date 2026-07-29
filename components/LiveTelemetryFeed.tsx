'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import useSWR from 'swr'
import {
  Activity, Star, GitFork, GitPullRequest, AlertCircle, GitCommit,
  Tag, MessageSquare, RefreshCw, Radio, Volume2, VolumeX, X, ExternalLink,
} from 'lucide-react'
import { RealGitHubEvent } from '@/types'
import clsx from 'clsx'

interface LiveTelemetryFeedProps {
  repoFullName: string
  soundEnabled: boolean
  onToggleSound: () => void
}

interface EventsApiResponse {
  events: RealGitHubEvent[]
  requiresToken: boolean
  errorMsg?: string
  count: number
  repoFullName: string
  lastUpdated: string
}

const fetcher = (url: string) =>
  fetch(url).then(res => {
    if (!res.ok) throw new Error('Failed to fetch')
    return res.json()
  })

const eventIcons: Record<string, React.ReactNode> = {
  star: <Star className="w-4 h-4 text-[#32F08C]" fill="#32F08C" fillOpacity={0.2} />,
  fork: <GitFork className="w-4 h-4 text-[#387BFF]" />,
  pr: <GitPullRequest className="w-4 h-4 text-[#33C192]" />,
  issue: <AlertCircle className="w-4 h-4 text-[var(--status-error-default)]" />,
  push: <GitCommit className="w-4 h-4 text-[#B38CFF]" />,
  release: <Tag className="w-4 h-4 text-[#FFB800]" />,
  comment: <MessageSquare className="w-4 h-4 text-[#387BFF]" />,
}

const eventBorderColors: Record<string, string> = {
  star: 'border-l-[#32F08C]',
  fork: 'border-l-[#387BFF]',
  pr: 'border-l-[#33C192]',
  issue: 'border-l-[var(--status-error-default)]',
  push: 'border-l-[#B38CFF]',
  release: 'border-l-[#FFB800]',
  comment: 'border-l-[#387BFF]',
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    gain.gain.setValueAtTime(0.05, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.15)
  } catch (e) {
    console.warn('Audio playback failed:', e)
  }
}

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins} 分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  return `${days} 天前`
}

export function LiveTelemetryFeed({ repoFullName, soundEnabled, onToggleSound }: LiveTelemetryFeedProps) {
  const [isLiveMonitoring, setIsLiveMonitoring] = useState(true)
  const [activeToast, setActiveToast] = useState<RealGitHubEvent | null>(null)
  const [events, setEvents] = useState<RealGitHubEvent[]>([])
  const seenEventIdsRef = useRef<Set<string>>(new Set())
  const isFirstLoadRef = useRef(true)

  const { data, error, isLoading, mutate } = useSWR<EventsApiResponse>(
    isLiveMonitoring ? '/api/events' : null,
    fetcher,
    {
      refreshInterval: isLiveMonitoring ? 15000 : 0,
      revalidateOnFocus: false,
    }
  )

  const handleNewEvents = useCallback((newEvents: RealGitHubEvent[]) => {
    if (newEvents.length === 0) return

    const freshEvents = newEvents.filter(e => !seenEventIdsRef.current.has(e.id))

    if (freshEvents.length === 0) return

    freshEvents.forEach(e => seenEventIdsRef.current.add(e.id))

    setEvents(prev => {
      const merged = [...freshEvents, ...prev].slice(0, 30)
      return merged
    })

    if (!isFirstLoadRef.current && soundEnabled) {
      playBeep()
    }

    if (!isFirstLoadRef.current) {
      setActiveToast(freshEvents[0])
    }

    isFirstLoadRef.current = false
  }, [soundEnabled])

  useEffect(() => {
    if (data?.events) {
      handleNewEvents(data.events)
    }
  }, [data, handleNewEvents])

  useEffect(() => {
    if (!activeToast) return
    const timer = setTimeout(() => setActiveToast(null), 5000)
    return () => clearTimeout(timer)
  }, [activeToast])

  const handleManualRefresh = async () => {
    await mutate()
  }

  const lastUpdated = data?.lastUpdated ? new Date(data.lastUpdated) : null

  return (
    <>
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-slide-in">
          <div className="bg-[#222427] border border-[#32F08C]/40 rounded-lg shadow-2xl p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--bg-brand-popup)] border border-[rgba(50,240,140,0.3)] flex items-center justify-center shrink-0">
              {eventIcons[activeToast.eventType] || <Activity className="w-4 h-4 text-[#32F08C]" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <img
                  src={activeToast.actor.avatar_url}
                  alt={activeToast.actor.login}
                  className="w-4 h-4 rounded-full"
                />
                <span className="text-xs font-mono font-bold text-[#32F08C]">{activeToast.actor.login}</span>
                <span className="text-[10px] text-[#666B75]">{timeAgo(activeToast.created_at)}</span>
              </div>
              <p className="text-xs text-[#D1D3DB] leading-relaxed">{activeToast.actionTextZh}</p>
              {activeToast.detailText && (
                <p className="text-[11px] text-[#9599A6] mt-1 truncate">{activeToast.detailText}</p>
              )}
              {activeToast.targetUrl && (
                <a
                  href={activeToast.targetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-[#32F08C] mt-1 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  查看详情
                </a>
              )}
            </div>
            <button
              onClick={() => setActiveToast(null)}
              className="text-[#666B75] hover:text-[#D1D3DB] transition shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#222427] border border-[var(--border-neutral-l1)] rounded-[10px] p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-[var(--border-neutral-l1)] pb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Activity className={clsx('w-5 h-5 text-[#32F08C]', isLoading && 'animate-spin')} />
              {isLiveMonitoring && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#32F08C] animate-ping" />
              )}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold font-mono text-[#D1D3DB]">
                项目实时遥测动态
              </h3>
              <p className="text-[11px] text-[#9599A6] font-mono mt-0.5">
                {isLiveMonitoring ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#32F08C] animate-pulse" />
                    实时监听中 · 每 15 秒轮询 · 仅检测: {repoFullName}
                  </span>
                ) : (
                  <span className="text-[var(--status-warning-default)]">已暂停监控</span>
                )}
                {lastUpdated && (
                  <span className="ml-2 text-[#666B75]">| 更新于 {lastUpdated.toLocaleTimeString('zh-CN')}</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSound}
              className="p-1.5 rounded-md bg-[var(--bg-overlay-l2)] hover:bg-[var(--bg-overlay-l3)] border border-[var(--border-neutral-l1)] transition"
              title={soundEnabled ? '关闭声音' : '开启声音'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#32F08C]" /> : <VolumeX className="w-4 h-4 text-[#666B75]" />}
            </button>

            <button
              onClick={handleManualRefresh}
              disabled={isLoading}
              className="p-1.5 rounded-md bg-[var(--bg-overlay-l2)] hover:bg-[var(--bg-overlay-l3)] border border-[var(--border-neutral-l1)] transition disabled:opacity-50"
              title="手动刷新"
            >
              <RefreshCw className={clsx('w-4 h-4 text-[#D1D3DB]', isLoading && 'animate-spin')} />
            </button>

            <button
              onClick={() => setIsLiveMonitoring(prev => !prev)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-bold border transition',
                isLiveMonitoring
                  ? 'bg-[var(--bg-brand-popup)] border-[#32F08C] text-[#32F08C]'
                  : 'bg-[var(--bg-overlay-l2)] border-[var(--border-neutral-l1)] text-[#D1D3DB]'
              )}
            >
              <Radio className="w-3.5 h-3.5" />
              {isLiveMonitoring ? '暂停监控' : '恢复监控'}
            </button>
          </div>
        </div>

        {data?.errorMsg && (
          <div className="mb-3 p-2 bg-[var(--status-warning-surface-l1)] border border-[var(--status-warning-surface-l2)] rounded text-[11px] text-[var(--status-warning-default)] font-mono flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{data.errorMsg}</span>
          </div>
        )}

        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Activity className="w-8 h-8 text-[#32F08C] animate-spin mb-3" />
            <p className="text-xs font-mono text-[#9599A6]">
              {isLoading ? '正在从 GitHub Events API 获取最新实时遥测数据...' : '暂无实时动态数据'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
            {events.map(evt => (
              <div
                key={evt.id}
                className={clsx(
                  'flex items-start gap-2.5 p-2.5 bg-[#1A1B1D] border border-[var(--border-neutral-l1)] border-l-2 rounded-md hover:border-[var(--border-neutral-l2)] transition',
                  eventBorderColors[evt.eventType]
                )}
              >
                <div className="w-7 h-7 rounded bg-[var(--bg-overlay-l2)] flex items-center justify-center shrink-0 mt-0.5">
                  {eventIcons[evt.eventType] || <Activity className="w-4 h-4 text-[#9599A6]" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <img
                      src={evt.actor.avatar_url}
                      alt={evt.actor.login}
                      className="w-3.5 h-3.5 rounded-full"
                    />
                    <a
                      href={evt.actor.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-mono font-bold text-[#32F08C] hover:underline truncate"
                    >
                      {evt.actor.login}
                    </a>
                    <span className="text-[10px] text-[#666B75] ml-auto shrink-0">{timeAgo(evt.created_at)}</span>
                  </div>
                  <p className="text-[11px] text-[#D1D3DB] leading-snug line-clamp-2">{evt.actionTextZh}</p>
                  {evt.detailText && (
                    <p className="text-[10px] text-[#9599A6] mt-0.5 truncate">{evt.detailText}</p>
                  )}
                </div>

                {evt.targetUrl && (
                  <a
                    href={evt.targetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#666B75] hover:text-[#32F08C] transition shrink-0 mt-0.5"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {events.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[var(--border-neutral-l1)] flex items-center justify-between text-[10px] font-mono text-[#666B75]">
            <span>共 {events.length} 条事件 · 已持久化到 Supabase</span>
            <span>事件类型: star · fork · pr · issue · push · release · comment</span>
          </div>
        )}
      </div>
    </>
  )
}
