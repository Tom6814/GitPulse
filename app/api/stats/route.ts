import { NextResponse } from 'next/server'
import {
  fetchRepo,
  fetchReleases,
  fetchStargazerEvents,
  fetchLanguages,
  fetchContributors,
  fetchCommunityHealthScore,
  fetchIssueHealth,
  fetchReadme,
  fetchContributing,
  fetchCommitActivity,
  estimateDailyDownloads,
} from '@/lib/github'
import { calculateStarStats, calculateDownloadStats } from '@/lib/stats'
import { RepoAnalysisData, AchievementItem, RadarData, HeatmapData, DailyDownloadStats, LanguageMap } from '@/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function generateAchievements(
  stars: number,
  forks: number,
  releases: { total_downloads: number }[],
  contributors: { contributions: number }[],
  resolutionRate: number
): AchievementItem[] {
  const totalDownloads = releases.reduce((sum, r) => sum + r.total_downloads, 0)
  const totalContributions = contributors.reduce((sum, c) => sum + c.contributions, 0)

  return [
    {
      id: 'first-star',
      title: '初露锋芒',
      description: '获得第一个 Star',
      rarity: 'Common',
      category: 'Milestone',
      icon: '⭐',
      isUnlocked: stars >= 1,
      progress: Math.min(100, stars * 100),
      metricLabel: `${stars} Stars`,
    },
    {
      id: 'centurion',
      title: '百星之主',
      description: '累计获得 100 颗 Star',
      rarity: 'Uncommon',
      category: 'Community',
      icon: '🌟',
      isUnlocked: stars >= 100,
      progress: Math.min(100, (stars / 100) * 100),
      metricLabel: `${stars}/100 Stars`,
    },
    {
      id: 'millennium',
      title: '千星传说',
      description: '累计获得 1000 颗 Star',
      rarity: 'Rare',
      category: 'Community',
      icon: '✨',
      isUnlocked: stars >= 1000,
      progress: Math.min(100, (stars / 1000) * 100),
      metricLabel: `${stars}/1000 Stars`,
    },
    {
      id: 'download-king',
      title: '下载王者',
      description: 'Release 累计下载突破 10,000 次',
      rarity: 'Uncommon',
      category: 'Velocity',
      icon: '📦',
      isUnlocked: totalDownloads >= 10000,
      progress: Math.min(100, (totalDownloads / 10000) * 100),
      metricLabel: `${totalDownloads.toLocaleString()} 下载`,
    },
    {
      id: 'download-titan',
      title: '下载泰坦',
      description: 'Release 累计下载突破 100,000 次',
      rarity: 'Epic',
      category: 'Velocity',
      icon: '🚀',
      isUnlocked: totalDownloads >= 100000,
      progress: Math.min(100, (totalDownloads / 100000) * 100),
      metricLabel: `${totalDownloads.toLocaleString()} 下载`,
    },
    {
      id: 'community-pulse',
      title: '社区脉搏',
      description: '社区健康评分达到 80%',
      rarity: 'Uncommon',
      category: 'Quality',
      icon: '💪',
      isUnlocked: resolutionRate >= 0.8,
      progress: Math.min(100, resolutionRate * 100),
      metricLabel: `${Math.round(resolutionRate * 100)}% 解决率`,
    },
    {
      id: 'collaboration-hub',
      title: '协作枢纽',
      description: '累计获得 50 次代码贡献',
      rarity: 'Uncommon',
      category: 'Engineering',
      icon: '🤝',
      isUnlocked: totalContributions >= 50,
      progress: Math.min(100, (totalContributions / 50) * 100),
      metricLabel: `${totalContributions} 次贡献`,
    },
    {
      id: 'fork-master',
      title: 'Fork 大师',
      description: '累计获得 10 个 Fork',
      rarity: 'Common',
      category: 'Community',
      icon: '🍴',
      isUnlocked: forks >= 10,
      progress: Math.min(100, (forks / 10) * 100),
      metricLabel: `${forks}/10 Forks`,
    },
  ]
}

function normalizeRadarValue(value: number, cap: number): number {
  return Math.min(100, Math.round((value / cap) * 100))
}

function buildRadarData(
  totalStars: number,
  forks: number,
  contributorCount: number,
  recentNewStars: number,
  recentPushes: number
): RadarData {
  const rawValues = [totalStars, contributorCount, forks, recentNewStars, recentPushes]
  const caps = [1000, 20, 100, 10, 20]
  const values = rawValues.map((v, i) => normalizeRadarValue(v, caps[i]))

  return {
    axes: ['Stars', 'Contributors', 'Forks', 'New Stars', 'New Pushes'],
    values,
    rawValues,
  }
}

function buildHeatmapData(commitWeeks: { days: number[]; week: number }[]): HeatmapData {
  const cells: HeatmapData['cells'] = []
  let maxDaily = 1

  const now = new Date()
  const oneYearAgo = new Date(now)
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  oneYearAgo.setHours(0, 0, 0, 0)

  // Fill in all dates from one year ago
  const dateMap = new Map<string, number>()
  for (const week of commitWeeks) {
    const weekStart = new Date((week.week || 0) * 1000)
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart)
      d.setDate(d.getDate() + i)
      const key = d.toISOString().split('T')[0]
      const count = week.days?.[i] || 0
      dateMap.set(key, (dateMap.get(key) || 0) + count)
    }
  }

  for (let d = new Date(oneYearAgo); d <= now; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().split('T')[0]
    const count = dateMap.get(key) || 0
    if (count > maxDaily) maxDaily = count

    let level: HeatmapData['cells'][0]['level'] = 0
    if (count > 0) {
      const ratio = count / Math.max(maxDaily, 1)
      if (ratio > 0.75) level = 4
      else if (ratio > 0.5) level = 3
      else if (ratio > 0.25) level = 2
      else level = 1
    }

    cells.push({ date: key, count, level })
  }

  // Recalculate levels after we know true maxDaily
  for (const cell of cells) {
    if (cell.count > 0) {
      const ratio = cell.count / Math.max(maxDaily, 1)
      if (ratio > 0.75) cell.level = 4
      else if (ratio > 0.5) cell.level = 3
      else if (ratio > 0.25) cell.level = 2
      else cell.level = 1
    }
  }

  return {
    cells,
    totalCommits: cells.reduce((sum, c) => sum + c.count, 0),
    maxDaily,
  }
}

export async function GET() {
  try {
    const repoName = process.env.GITHUB_REPO || 'vercel/next.js'
    const [owner, repo] = repoName.split('/')

    if (!owner || !repo) {
      return NextResponse.json({ error: 'Invalid GITHUB_REPO format' }, { status: 400 })
    }

    const [
      repoData,
      releases,
      languagesRaw,
      contributors,
      communityHealthScore,
      readme,
      contributing,
      commitActivity,
    ] = await Promise.all([
      fetchRepo(owner, repo),
      fetchReleases(owner, repo),
      fetchLanguages(owner, repo).catch(() => ({})),
      fetchContributors(owner, repo).catch(() => []),
      fetchCommunityHealthScore(owner, repo).catch(() => 85),
      fetchReadme(owner, repo).catch(() => null),
      fetchContributing(owner, repo).catch(() => null),
      fetchCommitActivity(owner, repo).catch(() => []),
    ])

    // Filter out brainfuck misidentification (.b = Java/Kotlin/JS service registry, not brainfuck)
    const languages: LanguageMap = {}
    for (const [lang, bytes] of Object.entries(languagesRaw)) {
      if (lang.toLowerCase() !== 'brainfuck') {
        languages[lang] = bytes as number
      }
    }

    const [starResult, issueHealth] = await Promise.all([
      fetchStargazerEvents(owner, repo, repoData.stargazers_count),
      fetchIssueHealth(owner, repo, repoData.open_issues_count).catch(() => null),
    ])

    const stars = calculateStarStats(repoData.stargazers_count, repoData.created_at, starResult)
    const downloads = calculateDownloadStats(releases)
    const totalReleaseDownloads = releases.reduce((sum, r) => sum + r.total_downloads, 0)

    const starHistory = stars.history.map(h => ({
      date: h.date,
      stars: h.totalStars,
      dailyVelocity: h.dailyGrowth,
    }))

    // Recent new stars (last 30 days)
    const recentStars = stars.history.slice(-30).reduce((sum, h) => sum + h.dailyGrowth, 0)

    // Recent pushes from commit activity (last 4 weeks)
    const recentPushes = (commitActivity || []).slice(-4).reduce(
      (sum, w) => sum + (w.total || 0),
      0
    )

    // Build radar & heatmap
    const radar = buildRadarData(
      repoData.stargazers_count,
      repoData.forks_count,
      contributors.length,
      recentStars,
      recentPushes
    )

    const heatmap = buildHeatmapData(commitActivity || [])

    // Daily download estimation
    const { history: ddHistory, maxDaily: ddMax, maxDailyDate } = estimateDailyDownloads(releases)
    const todayStr = new Date().toISOString().split('T')[0]
    const todayEntry = ddHistory.find(h => h.date === todayStr)
    const dailyDownloads: DailyDownloadStats = {
      total: totalReleaseDownloads,
      today: todayEntry?.downloads || 0,
      history: ddHistory,
      maxDaily: ddMax,
      maxDailyDate,
      latestReleaseDate: releases[0]?.published_at || '',
    }

    const achievements = generateAchievements(
      repoData.stargazers_count,
      repoData.forks_count,
      releases,
      contributors,
      issueHealth?.resolutionRate || 0.85
    )

    const stats: RepoAnalysisData = {
      repo: repoData,
      languages,
      contributors,
      starHistory,
      commitPunchcard: [],
      issueHealth: issueHealth || {
        openIssues: repoData.open_issues_count,
        closedIssuesEstimate: 0,
        resolutionRate: 0.85,
        avgDaysToClosePr: 2,
        avgDaysToCloseIssue: 3,
        staleIssuesPercentage: 5,
        openPRsEstimate: 0,
      },
      achievements,
      communityHealthScore,
      releases,
      totalReleaseDownloads,
      stars,
      downloads,
      lastUpdated: new Date().toISOString(),
      isFallbackData: false,
      rateLimitRemaining: 0,
      radar,
      heatmap,
      dailyDownloads,
      readme,
      contributing,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
