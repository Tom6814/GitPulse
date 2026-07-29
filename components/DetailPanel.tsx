'use client'

import { Star, Download, GitFork, Activity, Calendar, Trophy, GitCommit } from 'lucide-react'
import { RepoAnalysisData } from '@/types'
import { formatNumber } from '@/lib/stats'

interface DetailPanelProps {
  stats: RepoAnalysisData
}

export function DetailPanel({ stats }: DetailPanelProps) {
  const repo = stats.repo
  const firstStar = stats.stars.firstStarDate
    ? new Date(stats.stars.firstStarDate).toLocaleDateString('zh-CN')
    : 'N/A'

  return (
    <div className="space-y-4">
      <div className="bg-[#222427] border border-[var(--border-neutral-l1)] rounded-[10px] p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-4 border-b border-[var(--border-neutral-l1)] pb-3">
          <div className="w-8 h-8 rounded-lg bg-[#32F08C]/15 flex items-center justify-center">
            <Star className="w-4 h-4 text-[#32F08C] fill-[#32F08C]/20" />
          </div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#D1D3DB] font-semibold">Star 历史统计</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#9599A6]">当前总数</span>
              <span className="text-[#D1D3DB]">{stats.stars.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#9599A6]">今日新增</span>
              <span className="text-[#33C192]">{stats.stars.today > 0 ? `+${stats.stars.today}` : '0'}</span>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#9599A6]">历史记录天数</span>
              <span className="text-[#D1D3DB]">{stats.stars.history.length} 天</span>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#9599A6]">首次 Star 时间</span>
              <span className="text-[#D1D3DB]">{firstStar}</span>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#9599A6]">近期趋势</span>
              <span className={
                stats.stars.trend === 'up' ? 'text-[#33C192]' :
                stats.stars.trend === 'down' ? 'text-[var(--status-error-default)]' : 'text-[#9599A6]'
              }>
                {stats.stars.trend === 'up' ? '↑ 上升' : stats.stars.trend === 'down' ? '↓ 下降' : '→ 平稳'}
              </span>
            </div>
          </div>

          <div className="bg-[#1A1B1D] border border-[var(--border-neutral-l1)] rounded-md p-4">
            <div className="flex items-center gap-2 text-xs font-mono mb-2">
              <Trophy className="w-4 h-4 text-[#D29D00]" />
              <span className="text-[#9599A6]">历史最高日增速</span>
            </div>
            <div className="text-3xl font-bold text-[#D29D00] font-mono">
              +{stats.stars.maxDailyGrowth.toLocaleString()}
            </div>
            <div className="text-[10px] text-[#D29D00] bg-[rgba(210,157,0,0.15)] w-fit px-2 py-0.5 rounded font-mono mt-2">
              {stats.stars.maxDailyGrowthDate || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#222427] border border-[var(--border-neutral-l1)] rounded-[10px] p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-4 border-b border-[var(--border-neutral-l1)] pb-3">
          <div className="w-8 h-8 rounded-lg bg-[#32F08C]/15 flex items-center justify-center">
            <Download className="w-4 h-4 text-[#32F08C]" />
          </div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#D1D3DB] font-semibold">Release 下载量</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#9599A6]">总下载量</span>
              <span className="text-[#32F08C]">{formatNumber(stats.downloads.total)}</span>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#9599A6]">最新版本</span>
              <span className="text-[#387BFF]">{stats.downloads.latestVersion || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#9599A6]">Release 总数</span>
              <span className="text-[#D1D3DB]">{stats.releases.length}</span>
            </div>
          </div>

          <div className="bg-[#1A1B1D] border border-[var(--border-neutral-l1)] rounded-md p-4">
            <div className="text-[10px] font-mono uppercase text-[#9599A6] mb-2">各版本下载量 Top 5</div>
            <div className="space-y-1.5">
              {stats.downloads.releases.slice(0, 5).map(rel => (
                <div key={rel.tag_name} className="flex justify-between text-[11px] font-mono">
                  <span className="text-[#D1D3DB] truncate">{rel.tag_name}</span>
                  <span className="text-[#32F08C] ml-2 shrink-0">{formatNumber(rel.total_downloads)}</span>
                </div>
              ))}
              {stats.downloads.releases.length === 0 && (
                <div className="text-[11px] text-[#9599A6]">暂无 Release 数据</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#222427] border border-[var(--border-neutral-l1)] rounded-[10px] p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-4 border-b border-[var(--border-neutral-l1)] pb-3">
          <div className="w-8 h-8 rounded-lg bg-[#B38CFF]/15 flex items-center justify-center">
            <Activity className="w-4 h-4 text-[#B38CFF]" />
          </div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#D1D3DB] font-semibold">项目状态</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#1A1B1D] border border-[var(--border-neutral-l1)] rounded-md p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-[#9599A6] mb-1.5">
              <GitFork className="w-3.5 h-3.5 text-[#387BFF]" />
              <span className="text-[10px] font-mono">Fork</span>
            </div>
            <div className="text-xl font-bold text-[#D1D3DB] font-mono">{formatNumber(stats.repo.forks_count)}</div>
          </div>
          <div className="bg-[#1A1B1D] border border-[var(--border-neutral-l1)] rounded-md p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-[#9599A6] mb-1.5">
              <Activity className="w-3.5 h-3.5 text-[#32F08C]" />
              <span className="text-[10px] font-mono">Watch</span>
            </div>
            <div className="text-xl font-bold text-[#D1D3DB] font-mono">{formatNumber(stats.repo.watchers_count)}</div>
          </div>
          <div className="bg-[#1A1B1D] border border-[var(--border-neutral-l1)] rounded-md p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-[#9599A6] mb-1.5">
              <Calendar className="w-3.5 h-3.5 text-[var(--status-warning-default)]" />
              <span className="text-[10px] font-mono">Open Issues</span>
            </div>
            <div className="text-xl font-bold text-[#D1D3DB] font-mono">{formatNumber(stats.repo.open_issues_count)}</div>
          </div>
          <div className="bg-[#1A1B1D] border border-[var(--border-neutral-l1)] rounded-md p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-[#9599A6] mb-1.5">
              <GitCommit className="w-3.5 h-3.5 text-[#B38CFF]" />
              <span className="text-[10px] font-mono">主语言</span>
            </div>
            <div className="text-sm font-bold text-[#D1D3DB] font-mono truncate">{repo.language || 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
