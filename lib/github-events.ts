import { RealGitHubEvent, EventsFetchResult, GitHubEventType } from '@/types'

const GITHUB_API = 'https://api.github.com'

interface RawGitHubEvent {
  id: string
  type: string
  actor: { login: string; avatar_url: string; url: string; html_url?: string }
  repo: { name: string }
  created_at: string
  payload: Record<string, unknown>
}

function getActorHtmlUrl(login: string): string {
  return `https://github.com/${login}`
}

function mapEventType(type: string): GitHubEventType | null {
  switch (type) {
    case 'WatchEvent': return 'star'
    case 'ForkEvent': return 'fork'
    case 'PullRequestEvent': return 'pr'
    case 'IssuesEvent': return 'issue'
    case 'PushEvent': return 'push'
    case 'ReleaseEvent': return 'release'
    case 'IssueCommentEvent': return 'comment'
    default: return null
  }
}

function buildEventTexts(
  type: string,
  eventType: GitHubEventType,
  actor: string,
  payload: Record<string, unknown>
): { zh: string; en: string; detail: string; targetUrl?: string } {
  switch (eventType) {
    case 'star':
      return {
        zh: `${actor} 点亮了 Star ⭐`,
        en: `${actor} starred the repository`,
        detail: '',
      }
    case 'fork':
      return {
        zh: `${actor} Fork 了仓库 🔀`,
        en: `${actor} forked the repository`,
        detail: '',
      }
    case 'pr': {
      const pr = payload.pull_request as { title?: string; html_url?: string; number?: number; merged?: boolean } | undefined
      const action = payload.action as string || 'opened'
      const actionZh = action === 'closed' ? (pr?.merged ? '合并' : '关闭') : action === 'opened' ? '开启' : action
      return {
        zh: `${actor} ${actionZh}了 PR #${pr?.number || '?'}: ${pr?.title || ''}`,
        en: `${actor} ${action} PR #${pr?.number || '?'}: ${pr?.title || ''}`,
        detail: pr?.title || '',
        targetUrl: pr?.html_url,
      }
    }
    case 'issue': {
      const issue = payload.issue as { title?: string; html_url?: string; number?: number } | undefined
      const action = payload.action as string || 'opened'
      const actionZh = action === 'opened' ? '开启' : action === 'closed' ? '关闭' : action
      return {
        zh: `${actor} ${actionZh}了 Issue #${issue?.number || '?'}: ${issue?.title || ''}`,
        en: `${actor} ${action} issue #${issue?.number || '?'}: ${issue?.title || ''}`,
        detail: issue?.title || '',
        targetUrl: issue?.html_url,
      }
    }
    case 'push': {
      const ref = (payload.ref as string || '').replace('refs/heads/', '')
      const size = (payload.size as number) || (payload.commits as unknown[])?.length || 0
      return {
        zh: `${actor} 推送了 ${size} 个提交到 ${ref}`,
        en: `${actor} pushed ${size} commit(s) to ${ref}`,
        detail: `${ref} (+${size} commits)`,
      }
    }
    case 'release': {
      const release = payload.release as { name?: string; tag_name?: string; html_url?: string; prerelease?: boolean } | undefined
      const action = payload.action as string || 'published'
      return {
        zh: `${actor} ${action === 'published' ? '发布了' : action} Release: ${release?.tag_name || release?.name || ''}`,
        en: `${actor} ${action} release: ${release?.tag_name || release?.name || ''}`,
        detail: release?.tag_name || release?.name || '',
        targetUrl: release?.html_url,
      }
    }
    case 'comment': {
      const comment = payload.comment as { body?: string; html_url?: string } | undefined
      const issue = payload.issue as { number?: number; title?: string } | undefined
      const body = (comment?.body || '').slice(0, 80)
      return {
        zh: `${actor} 评论了 Issue #${issue?.number || '?'}: ${body}`,
        en: `${actor} commented on issue #${issue?.number || '?'}: ${body}`,
        detail: body,
        targetUrl: comment?.html_url,
      }
    }
    default:
      return { zh: `${actor} 触发了 ${type}`, en: `${actor} triggered ${type}`, detail: '' }
  }
}

export async function fetchRealGitHubEvents(
  owner: string,
  repo: string
): Promise<EventsFetchResult> {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  }

  if (process.env.GITHUB_PAT) {
    headers.Authorization = `Bearer ${process.env.GITHUB_PAT}`
  }

  try {
    const response = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/events?per_page=30`,
      { headers, next: { revalidate: 0 } }
    )

    if (response.status === 401 || response.status === 403 || response.status === 429) {
      return {
        events: [],
        requiresToken: true,
        errorMsg: `GitHub API 速率限制 (${response.status})，建议配置 GITHUB_PAT`,
      }
    }

    if (!response.ok) {
      return {
        events: [],
        requiresToken: false,
        errorMsg: `GitHub API 返回 ${response.status}`,
      }
    }

    const rawData = (await response.json()) as RawGitHubEvent[]

    const events: RealGitHubEvent[] = rawData
      .map(raw => {
        const eventType = mapEventType(raw.type)
        if (!eventType) return null

        const texts = buildEventTexts(raw.type, eventType, raw.actor.login, raw.payload)

        return {
          id: raw.id,
          type: raw.type,
          actor: {
            login: raw.actor.login,
            avatar_url: raw.actor.avatar_url,
            html_url: raw.actor.html_url || getActorHtmlUrl(raw.actor.login),
          },
          repoName: raw.repo.name,
          created_at: raw.created_at,
          actionTextEn: texts.en,
          actionTextZh: texts.zh,
          detailText: texts.detail,
          eventType,
          targetUrl: texts.targetUrl,
        } as RealGitHubEvent
      })
      .filter((e): e is RealGitHubEvent => e !== null)

    return { events, requiresToken: false }
  } catch (error) {
    return {
      events: [],
      requiresToken: false,
      errorMsg: error instanceof Error ? error.message : '获取事件失败',
    }
  }
}
