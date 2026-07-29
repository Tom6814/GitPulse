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
    <div className="space-y-6">
      <div className="bg-bg-secondary rounded-xl p-6 border border-bg-tertiary">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-accent-orange" />
          <h3 className="font-medium text-text-primary">Star 历史统计</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">当前总数</span>
              <span className="text-text-primary font-mono">{stats.stars.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">今日新增</span>
              <span className="text-accent-green font-mono">
                {stats.stars.today > 0 ? `+${stats.stars.today}` : '0'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">历史记录天数</span>
              <span className="text-text-primary font-mono">{stats.stars.history.length} 天</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">首次 Star 时间</span>
              <span className="text-text-primary font-mono">{firstStar}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">近期趋势</span>
              <span className={
                stats.stars.trend === 'up' ? 'text-accent-green' :
                stats.stars.trend === 'down' ? 'text-accent-red' : 'text-text-secondary'
              }>
                {stats.stars.trend === 'up' ? '↑ 上升' : stats.stars.trend === 'down' ? '↓ 下降' : '→ 平稳'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="w-4 h-4 text-accent-orange" />
              <span className="text-text-secondary">历史最高日增速</span>
            </div>
            <div className="text-3xl font-bold text-accent-orange font-mono">
              +{stats.stars.maxDailyGrowth.toLocaleString()}
            </div>
            <div className="text-xs text-accent-orange bg-accent-orange/10 w-fit px-2 py-0.5 rounded">
              {stats.stars.maxDailyGrowthDate || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-bg-secondary rounded-xl p-6 border border-bg-tertiary">
        <div className="flex items-center gap-2 mb-4">
          <Download className="w-5 h-5 text-accent-blue" />
          <h3 className="font-medium text-text-primary">Release 下载量</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">总下载量</span>
              <span className="text-text-primary font-mono">{formatNumber(stats.downloads.total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">最新版本</span>
              <span className="text-accent-blue font-mono">{stats.downloads.latestVersion || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Release 总数</span>
              <span className="text-text-primary font-mono">{stats.releases.length}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm text-text-secondary mb-2">各版本下载量 Top 5</div>
            <div className="space-y-2">
              {stats.downloads.releases.slice(0, 5).map(rel => (
                <div key={rel.tag_name} className="flex justify-between text-xs">
                  <span className="text-text-primary font-mono truncate">{rel.tag_name}</span>
                  <span className="text-accent-blue font-mono ml-2">{formatNumber(rel.total_downloads)}</span>
                </div>
              ))}
              {stats.downloads.releases.length === 0 && (
                <div className="text-xs text-text-secondary">暂无 Release 数据</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-bg-secondary rounded-xl p-6 border border-bg-tertiary">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-accent-purple" />
          <h3 className="font-medium text-text-primary">项目状态</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-text-secondary mb-1">
              <GitFork className="w-4 h-4" />
              <span className="text-xs">Fork</span>
            </div>
            <div className="text-xl font-bold text-text-primary font-mono">{formatNumber(stats.repo.forks_count)}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-text-secondary mb-1">
              <Activity className="w-4 h-4" />
              <span className="text-xs">Watch</span>
            </div>
            <div className="text-xl font-bold text-text-primary font-mono">{formatNumber(stats.repo.watchers_count)}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-text-secondary mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">Open Issues</span>
            </div>
            <div className="text-xl font-bold text-text-primary font-mono">{formatNumber(stats.repo.open_issues_count)}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-text-secondary mb-1">
              <GitCommit className="w-4 h-4" />
              <span className="text-xs">主语言</span>
            </div>
            <div className="text-sm font-bold text-text-primary font-mono truncate">{repo.language || 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
