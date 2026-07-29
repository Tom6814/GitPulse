import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { RealGitHubEvent, DailySnapshot, NotificationLog } from '@/types'

let serverClient: SupabaseClient | null = null

export function getSupabaseServerClient(): SupabaseClient | null {
  if (serverClient) return serverClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return null
  }

  serverClient = createClient(url, key, {
    auth: { persistSession: false },
  })

  return serverClient
}

export function getSupabaseBrowserClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return null
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  })
}

interface StoredEventRow {
  id: string
  repo_full_name: string
  event_type: string
  actor_login: string
  actor_avatar_url: string | null
  actor_html_url: string | null
  action_text_zh: string
  action_text_en: string
  detail_text: string | null
  target_url: string | null
  created_at: string
  stored_at: string
}

function rowToEvent(row: StoredEventRow): RealGitHubEvent {
  return {
    id: row.id,
    type: row.event_type,
    actor: {
      login: row.actor_login,
      avatar_url: row.actor_avatar_url || '',
      html_url: row.actor_html_url || '',
    },
    repoName: row.repo_full_name,
    created_at: row.created_at,
    actionTextEn: row.action_text_en,
    actionTextZh: row.action_text_zh,
    detailText: row.detail_text || '',
    eventType: row.event_type as RealGitHubEvent['eventType'],
    targetUrl: row.target_url || undefined,
  }
}

export async function storeEvents(
  repoFullName: string,
  events: RealGitHubEvent[]
): Promise<number> {
  const client = getSupabaseServerClient()
  if (!client || events.length === 0) return 0

  const rows = events.map(e => ({
    id: e.id,
    repo_full_name: repoFullName,
    event_type: e.eventType,
    actor_login: e.actor.login,
    actor_avatar_url: e.actor.avatar_url,
    actor_html_url: e.actor.html_url,
    action_text_zh: e.actionTextZh,
    action_text_en: e.actionTextEn,
    detail_text: e.detailText || null,
    target_url: e.targetUrl || null,
    created_at: e.created_at,
  }))

  const { error } = await client
    .from('events_history')
    .upsert(rows, { onConflict: 'id', ignoreDuplicates: true })

  if (error) {
    console.error('storeEvents error:', error.message)
    return 0
  }

  return rows.length
}

export async function fetchStoredEvents(
  repoFullName: string,
  limit = 30
): Promise<RealGitHubEvent[]> {
  const client = getSupabaseServerClient()
  if (!client) return []

  const { data, error } = await client
    .from('events_history')
    .select('*')
    .eq('repo_full_name', repoFullName)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) {
    console.error('fetchStoredEvents error:', error?.message)
    return []
  }

  return (data as StoredEventRow[]).map(rowToEvent)
}

export async function storeDailySnapshot(snapshot: DailySnapshot): Promise<boolean> {
  const client = getSupabaseServerClient()
  if (!client) return false

  const { error } = await client
    .from('daily_snapshots')
    .upsert(snapshot, { onConflict: 'repo_full_name,snapshot_date' })

  if (error) {
    console.error('storeDailySnapshot error:', error.message)
    return false
  }

  return true
}

export async function fetchSnapshots(
  repoFullName: string,
  days = 30
): Promise<DailySnapshot[]> {
  const client = getSupabaseServerClient()
  if (!client) return []

  const { data, error } = await client
    .from('daily_snapshots')
    .select('*')
    .eq('repo_full_name', repoFullName)
    .order('snapshot_date', { ascending: true })
    .limit(days)

  if (error || !data) {
    console.error('fetchSnapshots error:', error?.message)
    return []
  }

  return data as DailySnapshot[]
}

export async function storeNotificationLog(
  repoFullName: string,
  type: string,
  message: string,
  delta: number
): Promise<boolean> {
  const client = getSupabaseServerClient()
  if (!client) return false

  const { error } = await client.from('notification_logs').insert({
    repo_full_name: repoFullName,
    notification_type: type,
    message,
    delta,
  })

  if (error) {
    console.error('storeNotificationLog error:', error.message)
    return false
  }

  return true
}

export async function fetchRecentNotifications(
  repoFullName: string,
  limit = 10
): Promise<NotificationLog[]> {
  const client = getSupabaseServerClient()
  if (!client) return []

  const { data, error } = await client
    .from('notification_logs')
    .select('*')
    .eq('repo_full_name', repoFullName)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) {
    return []
  }

  return data as NotificationLog[]
}
