import { NextResponse } from 'next/server'
import { fetchRealGitHubEvents } from '@/lib/github-events'
import { storeEvents, fetchStoredEvents } from '@/lib/supabase'
import { RealGitHubEvent } from '@/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET() {
  try {
    const repoName = process.env.GITHUB_REPO || 'vercel/next.js'
    const [owner, repo] = repoName.split('/')

    if (!owner || !repo) {
      return NextResponse.json({ error: 'Invalid GITHUB_REPO format' }, { status: 400 })
    }

    const fetchResult = await fetchRealGitHubEvents(owner, repo)

    if (fetchResult.events.length > 0) {
      await storeEvents(repoName, fetchResult.events)
    }

    let events: RealGitHubEvent[] = fetchResult.events
    if (events.length === 0) {
      events = await fetchStoredEvents(repoName, 30)
    }

    return NextResponse.json({
      events,
      requiresToken: fetchResult.requiresToken,
      errorMsg: fetchResult.errorMsg,
      count: events.length,
      repoFullName: repoName,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}
