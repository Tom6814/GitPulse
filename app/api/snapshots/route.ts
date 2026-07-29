import { NextResponse } from 'next/server'
import { fetchRepo, fetchReleases, fetchContributors, fetchCommunityHealthScore } from '@/lib/github'
import { storeDailySnapshot, fetchSnapshots } from '@/lib/supabase'
import { calculateStarStats, calculateDownloadStats } from '@/lib/stats'
import { fetchStargazerEvents } from '@/lib/github'
import { DailySnapshot } from '@/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET() {
  try {
    const repoName = process.env.GITHUB_REPO || 'vercel/next.js'
    const [owner, repo] = repoName.split('/')

    if (!owner || !repo) {
      return NextResponse.json({ error: 'Invalid GITHUB_REPO format' }, { status: 400 })
    }

    const [repoData, releases, contributors, communityHealthScore] = await Promise.all([
      fetchRepo(owner, repo),
      fetchReleases(owner, repo),
      fetchContributors(owner, repo).catch(() => []),
      fetchCommunityHealthScore(owner, repo).catch(() => 85),
    ])

    const starResult = await fetchStargazerEvents(owner, repo, repoData.stargazers_count)
    const stars = calculateStarStats(repoData.stargazers_count, repoData.created_at, starResult)
    const downloads = calculateDownloadStats(releases)
    const totalDownloads = releases.reduce((sum, r) => sum + r.total_downloads, 0)

    const today = new Date().toISOString().split('T')[0]

    const snapshot: DailySnapshot = {
      repo_full_name: repoName,
      snapshot_date: today,
      stars_total: repoData.stargazers_count,
      stars_today: stars.today,
      forks_total: repoData.forks_count,
      downloads_total: totalDownloads,
      open_issues: repoData.open_issues_count,
      community_health_score: communityHealthScore,
      releases_count: releases.length,
      contributors_count: contributors.length,
    }

    const stored = await storeDailySnapshot(snapshot)
    const history = await fetchSnapshots(repoName, 90)

    return NextResponse.json({
      stored,
      snapshot,
      history,
      count: history.length,
    })
  } catch (error) {
    console.error('Error storing snapshot:', error)
    return NextResponse.json({ error: 'Failed to store snapshot' }, { status: 500 })
  }
}
