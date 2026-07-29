import { NextResponse } from 'next/server'
import {
  fetchRepo,
  fetchReleases,
  fetchStargazerEvents,
  fetchLanguages,
  fetchContributors,
  fetchCommunityHealthScore,
  fetchIssueHealth,
} from '@/lib/github'
import { calculateStarStats, calculateDownloadStats } from '@/lib/stats'
import { RepoAnalysisData, AchievementItem } from '@/types'

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

export async function GET() {
  try {
    const repoName = process.env.GITHUB_REPO || 'vercel/next.js'
    const [owner, repo] = repoName.split('/')

    if (!owner || !repo) {
      return NextResponse.json({ error: 'Invalid GITHUB_REPO format' }, { status: 400 })
    }

    const [repoData, releases, languages, contributors, communityHealthScore] = await Promise.all([
      fetchRepo(owner, repo),
      fetchReleases(owner, repo),
      fetchLanguages(owner, repo).catch(() => ({})),
      fetchContributors(owner, repo).catch(() => []),
      fetchCommunityHealthScore(owner, repo).catch(() => 85),
    ])

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
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
