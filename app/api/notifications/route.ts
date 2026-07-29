import { NextResponse } from 'next/server'
import { storeNotificationLog } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const type = body?.type
    const message = body?.message
    const delta = Number(body?.delta) || 0

    if (!type || !message) {
      return NextResponse.json({ error: 'Missing type or message' }, { status: 400 })
    }

    const repoName = process.env.GITHUB_REPO || 'vercel/next.js'
    const stored = await storeNotificationLog(repoName, type, message, delta)

    return NextResponse.json({ stored, timestamp: new Date().toISOString() })
  } catch (error) {
    console.error('Error storing notification:', error)
    return NextResponse.json({ error: 'Failed to store notification' }, { status: 500 })
  }
}
