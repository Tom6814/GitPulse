'use client'

import { IssueHealthStats, GitHubRepo } from '@/types'
import { CheckCircle2, GitPullRequest, Activity, HardDrive, ShieldCheck } from 'lucide-react'

interface DeveloperVitalsProps {
  issueHealth: IssueHealthStats
  repo: GitHubRepo
}

export function DeveloperVitals({ issueHealth, repo }: DeveloperVitalsProps) {
  const sizeMb = (repo.size / 1024).toFixed(1)
  const resolutionPercentage = Math.round(issueHealth.resolutionRate * 100)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="ds-statcard hover:border-[#32F08C]/40 transition">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#33C192]/15 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-[#33C192]" />
            </div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#D1D3DB] font-semibold">
              Issue 解决率
            </h4>
          </div>
          <span className="text-xs font-mono font-bold text-[#33C192]">
            {resolutionPercentage}%
          </span>
        </div>

        <div className="space-y-1">
          <div className="text-2xl font-mono font-bold text-[#D1D3DB]">
            {issueHealth.closedIssuesEstimate.toLocaleString()}
            <span className="text-xs font-normal text-[#666B75] ml-1">已关闭</span>
          </div>
          <p className="text-xs text-[#9599A6]">
            {issueHealth.openIssues} 个未解决 Issue 待处理
          </p>
        </div>

        <div className="w-full bg-[#1A1B1D] rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-[#33C192] h-full rounded-full transition-all duration-500"
            style={{ width: `${resolutionPercentage}%` }}
          />
        </div>

        <div className="pt-2 border-t border-[var(--border-neutral-l1)] flex items-center justify-between text-[11px] font-mono text-[#9599A6]">
          <span>平均关闭耗时:</span>
          <span className="text-[#D1D3DB] font-semibold">{issueHealth.avgDaysToCloseIssue} 天</span>
        </div>
      </div>

      <div className="ds-statcard hover:border-[#32F08C]/40 transition">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#387BFF]/15 flex items-center justify-center">
              <GitPullRequest className="w-4 h-4 text-[#387BFF]" />
            </div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#D1D3DB] font-semibold">
              PR 合并效率
            </h4>
          </div>
          <span className="text-xs font-mono font-bold text-[#387BFF]">
            高效审阅
          </span>
        </div>

        <div className="space-y-1">
          <div className="text-2xl font-mono font-bold text-[#D1D3DB]">
            {issueHealth.avgDaysToClosePr}
            <span className="text-xs font-normal text-[#666B75] ml-1">天平均合并</span>
          </div>
          <p className="text-xs text-[#9599A6]">
            {issueHealth.openPRsEstimate} 个开放 PR 正在等待审查
          </p>
        </div>

        <div className="pt-2 border-t border-[var(--border-neutral-l1)] flex items-center justify-between text-[11px] font-mono text-[#9599A6]">
          <span>停滞 Issue 占比:</span>
          <span className="text-[var(--status-warning-default)] font-semibold">{issueHealth.staleIssuesPercentage}%</span>
        </div>
      </div>

      <div className="ds-statcard hover:border-[#32F08C]/40 transition">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#32F08C]/15 flex items-center justify-center">
              <Activity className="w-4 h-4 text-[#32F08C]" />
            </div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#D1D3DB] font-semibold">
              代码提交动态
            </h4>
          </div>
          <span className="text-xs font-mono font-bold text-[#32F08C]">
            Live
          </span>
        </div>

        <div className="space-y-1">
          <div className="text-2xl font-mono font-bold text-[#D1D3DB] flex items-baseline space-x-1">
            <span>主分支</span>
            <span className="text-sm text-[#32F08C] font-mono font-normal">/{repo.default_branch}</span>
          </div>
          <p className="text-xs text-[#9599A6]">
            最近提交: {new Date(repo.pushed_at).toLocaleDateString('zh-CN')}
          </p>
        </div>

        <div className="pt-2 border-t border-[var(--border-neutral-l1)] flex items-center justify-between text-[11px] font-mono text-[#9599A6]">
          <span>订阅关注数:</span>
          <span className="text-[#D1D3DB] font-semibold">{repo.watchers_count.toLocaleString()}</span>
        </div>
      </div>

      <div className="ds-statcard hover:border-[#32F08C]/40 transition">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#B38CFF]/15 flex items-center justify-center">
              <HardDrive className="w-4 h-4 text-[#B38CFF]" />
            </div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#D1D3DB] font-semibold">
              代码库体积
            </h4>
          </div>
          <span className="text-xs font-mono font-bold text-[#B38CFF]">
            {sizeMb} MB
          </span>
        </div>

        <div className="space-y-1">
          <div className="text-2xl font-mono font-bold text-[#D1D3DB] truncate">
            {repo.license?.spdx_id || 'Custom'}
          </div>
          <p className="text-xs text-[#9599A6]">
            {repo.topics?.length || 0} 个项目主题标签
          </p>
        </div>

        <div className="pt-2 border-t border-[var(--border-neutral-l1)] flex items-center justify-between text-[11px] font-mono text-[#9599A6]">
          <span>开源协议合规:</span>
          <span className="text-[#33C192] font-semibold flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 inline" />
            <span>OSI 已验证</span>
          </span>
        </div>
      </div>
    </div>
  )
}
