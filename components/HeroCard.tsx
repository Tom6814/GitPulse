'use client'

import Image from 'next/image'
import {
  ExternalLink, Star, GitFork, Download, ShieldCheck, Code2,
  Globe, Clock, Zap, Award, Sparkles, AlertCircle,
} from 'lucide-react'
import { RepoAnalysisData } from '@/types'
import { formatNumber } from '@/lib/stats'

interface HeroCardProps {
  data: RepoAnalysisData
  unlockedCount: number
  totalAchievementsCount: number
  onScrollToAiReview?: () => void
}

export function HeroCard({
  data,
  unlockedCount,
  totalAchievementsCount,
  onScrollToAiReview,
}: HeroCardProps) {
  const { repo, communityHealthScore, isFallbackData, totalReleaseDownloads, releases } = data

  const createdDate = new Date(repo.created_at)
  const nowTime = Date.now()
  const ageYears = Math.max(0.1, (nowTime - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 365)).toFixed(1)
  const trophyPercentage = totalAchievementsCount > 0 ? Math.round((unlockedCount / totalAchievementsCount) * 100) : 0

  return (
    <div className="relative bg-[#222427] border border-[var(--border-neutral-l1)] rounded-[10px] p-6 sm:p-7 shadow-xl overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

      {isFallbackData && (
        <div className="relative z-10 mb-4 bg-[var(--status-warning-surface-l1)] border border-[var(--status-warning-surface-l2)] rounded-md p-3 flex items-center space-x-2 text-xs text-[var(--status-warning-default)]">
          <AlertCircle className="w-4 h-4 text-[var(--status-warning-default)] shrink-0" />
          <span className="font-mono">
            GitHub API 速率限制生效中。当前显示基于项目维度的精细化合成遥测数据（可在服务端环境变量配置 GITHUB_PAT）。
          </span>
        </div>
      )}

      <div className="relative z-10 mb-4 inline-flex items-center space-x-2 px-2.5 py-1 bg-[var(--bg-brand-popup)] border border-[rgba(50,240,140,0.2)] rounded-full text-xs font-mono text-[#32F08C]">
        <span className="w-2 h-2 rounded-full bg-[#32F08C] animate-pulse" />
        <span className="font-semibold">专属项目监控控制台: {repo.full_name}</span>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex items-start space-x-4 flex-1 min-w-0">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-[var(--border-neutral-l2)] bg-[#1A1B1D] shrink-0 shadow-md">
            <Image
              src={repo.owner.avatar_url}
              alt={repo.owner.login}
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
                className="text-xl sm:text-2xl font-bold font-mono text-[#D1D3DB] hover:text-[#32F08C] transition flex items-center space-x-2 group"
              >
                <span className="truncate">{repo.full_name}</span>
                <ExternalLink className="w-4 h-4 text-[#9599A6] group-hover:text-[#32F08C] shrink-0 transition" />
              </a>

              {repo.license && (
                <span className="ds-tag">
                  <ShieldCheck className="w-3 h-3 text-[#33C192] mr-1" />
                  <span>{repo.license.spdx_id || repo.license.name}</span>
                </span>
              )}

              {repo.language && (
                <span className="ds-tag ds-tag--brand">
                  <Code2 className="w-3 h-3 text-[#32F08C] mr-1" />
                  <span>{repo.language}</span>
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-[#9599A6] max-w-3xl leading-relaxed line-clamp-2">
              {repo.description || '该 GitHub 仓库未提供官方描述信息。'}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {repo.homepage && (
                <a
                  href={repo.homepage.startsWith('http') ? repo.homepage : `https://${repo.homepage}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono text-[#9599A6] hover:text-[#32F08C] flex items-center space-x-1 transition underline"
                >
                  <Globe className="w-3.5 h-3.5 text-[#32F08C]" />
                  <span className="truncate max-w-[200px]">{repo.homepage.replace(/^https?:\/\//, '')}</span>
                </a>
              )}

              <span className="text-xs font-mono text-[#666B75] flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>立项年份: {createdDate.getFullYear()}年 ({ageYears} 年开源活跃期)</span>
              </span>

              {repo.topics && repo.topics.length > 0 && (
                <div className="hidden sm:flex flex-wrap gap-1 ml-2">
                  {repo.topics.slice(0, 4).map(topic => (
                    <span
                      key={topic}
                      className="px-2 py-0.5 bg-[#1A1B1D] text-[#9599A6] border border-[var(--border-neutral-l1)] font-mono text-[10px] rounded"
                    >
                      #{topic}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap lg:flex-col gap-2 shrink-0 justify-end">
          <button
            onClick={onScrollToAiReview}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-[#32F08C] hover:bg-[#0FDC78] text-[#0C0C0D] font-bold font-mono text-xs rounded-md shadow-md transition active:scale-95"
          >
            <Sparkles className="w-4 h-4 fill-[#0C0C0D]" />
            <span>AI 深度诊断评估</span>
          </button>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-5 border-t border-[var(--border-neutral-l1)]">
        <div className="ds-statcard bg-[#1A1B1D]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#D1D3DB] font-medium">Star 星标数</span>
            <div className="w-7 h-7 rounded-lg bg-[#32F08C]/15 flex items-center justify-center">
              <Star className="w-4 h-4 text-[#32F08C] fill-[#32F08C]/20" />
            </div>
          </div>
          <div className="font-mono font-variant-numeric tabular-nums text-[22px] font-semibold text-[#D1D3DB]">
            {repo.stargazers_count.toLocaleString()}
          </div>
          <div className="text-[10px] font-mono text-[#32F08C] flex items-center space-x-1">
            <Zap className="w-3 h-3" />
            <span>今日 +{data.stars.today}</span>
          </div>
        </div>

        <div className="ds-statcard bg-[#1A1B1D]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#D1D3DB] font-medium">Fork 派生数</span>
            <div className="w-7 h-7 rounded-lg bg-[#387BFF]/15 flex items-center justify-center">
              <GitFork className="w-4 h-4 text-[#387BFF]" />
            </div>
          </div>
          <div className="font-mono font-variant-numeric tabular-nums text-[22px] font-semibold text-[#D1D3DB]">
            {repo.forks_count.toLocaleString()}
          </div>
          <div className="text-[10px] font-mono text-[#9599A6]">
            生态派生网络
          </div>
        </div>

        <div className="ds-statcard bg-[#1A1B1D]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#D1D3DB] font-medium">Release 下载量</span>
            <div className="w-7 h-7 rounded-lg bg-[#32F08C]/15 flex items-center justify-center">
              <Download className="w-4 h-4 text-[#32F08C]" />
            </div>
          </div>
          <div className="font-mono font-variant-numeric tabular-nums text-[22px] font-semibold text-[#32F08C]">
            {formatNumber(totalReleaseDownloads || 0)}
          </div>
          <div className="text-[10px] font-mono text-[#9599A6]">
            {releases ? `${releases.length} 个发布版本` : 'PAT Telemetry'}
          </div>
        </div>

        <div className="ds-statcard bg-[#1A1B1D]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#D1D3DB] font-medium">社区健康指数</span>
            <div className="w-7 h-7 rounded-lg bg-[#33C192]/15 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#33C192]" />
            </div>
          </div>
          <div className="font-mono font-variant-numeric tabular-nums text-[22px] font-semibold text-[#33C192]">
            <span>{communityHealthScore}%</span>
          </div>
          <div className="w-full bg-[#2A2D31] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#33C192] h-full rounded-full transition-all duration-500"
              style={{ width: `${communityHealthScore}%` }}
            />
          </div>
        </div>

        <div className="ds-statcard bg-[#1A1B1D]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#D1D3DB] font-medium">解锁成就勋章</span>
            <div className="w-7 h-7 rounded-lg bg-[#32F08C]/15 flex items-center justify-center">
              <Award className="w-4 h-4 text-[#32F08C]" />
            </div>
          </div>
          <div className="font-mono font-variant-numeric tabular-nums text-[22px] font-semibold text-[#32F08C]">
            {unlockedCount} <span className="text-xs font-normal text-[#666B75]">/ {totalAchievementsCount}</span>
          </div>
          <div className="text-[10px] font-mono text-[#9599A6]">
            {trophyPercentage}% 里程碑完成度
          </div>
        </div>
      </div>
    </div>
  )
}
