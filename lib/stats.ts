import { StarStats, DownloadStats, Release, DailyStarRecord } from '@/types'
import { StargazerFetchResult } from './github'

function dateKey(iso: string): string {
  return iso.split('T')[0]
}

export function calculateStarStats(
  totalStars: number,
  repoCreatedAt: string,
  starResult: StargazerFetchResult
): StarStats {
  const events = starResult.events
  const todayStr = dateKey(new Date().toISOString())
  const createdAt = repoCreatedAt || new Date().toISOString()
  const firstStarDate = events.length > 0 ? dateKey(events[0].starred_at) : dateKey(createdAt)

  if (events.length === 0) {
    return {
      total: totalStars,
      today: 0,
      history: [],
      maxDailyGrowth: 0,
      maxDailyGrowthDate: '',
      trend: 'stable',
      firstStarDate,
      sampled: true,
    }
  }

  const dailyMap = new Map<string, number>()

  for (const evt of events) {
    const day = dateKey(evt.starred_at)
    dailyMap.set(day, (dailyMap.get(day) || 0) + 1)
  }

  const allDates: string[] = []
  const start = new Date(firstStarDate)
  const end = new Date(todayStr)
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    allDates.push(d.toISOString().split('T')[0])
  }

  const history: DailyStarRecord[] = []
  let cumulative = 0
  let maxDailyGrowth = 0
  let maxDailyGrowthDate = ''

  const offset = totalStars - events.length

  for (const day of allDates) {
    const growth = dailyMap.get(day) || 0
    cumulative += growth
    const totalForDay = offset + cumulative

    if (growth > maxDailyGrowth) {
      maxDailyGrowth = growth
      maxDailyGrowthDate = day
    }

    history.push({
      date: day,
      totalStars: totalForDay,
      dailyGrowth: growth,
    })
  }

  const todayRecord = history.find(h => h.date === todayStr)
  const today = todayRecord?.dailyGrowth || 0

  const last7 = history.slice(-7).map(h => h.dailyGrowth)
  const avgRecent = last7.length > 0 ? last7.reduce((a, b) => a + b, 0) / last7.length : 0
  const trend: 'up' | 'down' | 'stable' =
    today > avgRecent * 1.1 ? 'up' : today < avgRecent * 0.9 ? 'down' : 'stable'

  return {
    total: totalStars,
    today,
    history,
    maxDailyGrowth,
    maxDailyGrowthDate,
    trend,
    firstStarDate,
    sampled: starResult.sampled,
  }
}

export function calculateDownloadStats(releases: Release[]): DownloadStats {
  const byRelease: Record<string, number> = {}
  let total = 0

  const releaseSummaries = releases.map(release => {
    const downloads = release.assets.reduce((sum, asset) => sum + asset.download_count, 0)
    byRelease[release.tag_name] = downloads
    total += downloads
    return {
      tag_name: release.tag_name,
      name: release.name || release.tag_name,
      published_at: release.published_at,
      total_downloads: downloads,
      assets: release.assets.map(a => ({ name: a.name, download_count: a.download_count })),
    }
  })

  const latestVersion = releases.length > 0 ? releases[0].tag_name : null

  return {
    total,
    today: 0,
    byRelease,
    releases: releaseSummaries,
    latestVersion,
  }
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  }
  return num.toString()
}
