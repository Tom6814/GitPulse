import { NextResponse } from 'next/server'
import { fetchRepo, fetchReleases } from '@/lib/github'
import { storeNotificationLog } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

export async function GET() {
  try {
    const repoName = process.env.GITHUB_REPO || 'vercel/next.js'
    const [owner, repo] = repoName.split('/')

    if (!owner || !repo) {
      return NextResponse.json({ error: 'Invalid GITHUB_REPO format' }, { status: 400 })
    }

    const [repoData, releases] = await Promise.all([
      fetchRepo(owner, repo),
      fetchReleases(owner, repo),
    ])

    const totalDownloads = releases.reduce((sum, r) => sum + r.total_downloads, 0)

    return NextResponse.json({
      starsTotal: repoData.stargazers_count,
      forksTotal: repoData.forks_count,
      downloadsTotal: totalDownloads,
      openIssues: repoData.open_issues_count,
      repoFullName: repoName,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error polling stats:', error)
    return NextResponse.json({ error: 'Failed to poll stats' }, { status: 500 })
  }
}
