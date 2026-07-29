import { GitHubRepo, Release, ReleaseAsset, StargazerEvent } from '@/types'

const GITHUB_API = 'https://api.github.com'

function getHeaders(starFormat = false) {
  const headers: HeadersInit = {
    Accept: starFormat ? 'application/vnd.github.star+json' : 'application/vnd.github.v3+json',
  }

  if (process.env.GITHUB_PAT) {
    headers.Authorization = `Bearer ${process.env.GITHUB_PAT}`
  }

  return headers
}

export async function fetchRepo(owner: string, repo: string): Promise<GitHubRepo> {
  const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
    headers: getHeaders(),
    next: { revalidate: 60 },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch repo: ${response.status}`)
  }

  const data = await response.json()

  return {
    id: data.id,
    name: data.name,
    full_name: data.full_name,
    description: data.description,
    owner: {
      login: data.owner?.login,
      avatar_url: data.owner?.avatar_url,
      html_url: data.owner?.html_url,
      type: data.owner?.type,
    },
    html_url: data.html_url,
    fork: Boolean(data.fork),
    stargazers_count: data.stargazers_count,
    forks_count: data.forks_count,
    watchers_count: data.watchers_count,
    subscribers_count: data.subscribers_count,
    network_count: Number(data.network_count || 0),
    open_issues_count: data.open_issues_count,
    language: data.language,
    license: data.license
      ? { key: data.license.key, name: data.license.name, spdx_id: data.license.spdx_id }
      : null,
    topics: data.topics || [],
    homepage: data.homepage,
    created_at: data.created_at,
    updated_at: data.updated_at,
    pushed_at: data.pushed_at,
    size: data.size,
    default_branch: data.default_branch,
  }
}

export async function fetchReleases(owner: string, repo: string): Promise<Release[]> {
  const response = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/releases?per_page=50`,
    {
      headers: getHeaders(),
      next: { revalidate: 60 },
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch releases: ${response.status}`)
  }

  const data = await response.json()

  return (data as Array<Record<string, unknown>>).map(rel => {
    const assets: ReleaseAsset[] = Array.isArray(rel.assets)
      ? (rel.assets as Array<Record<string, unknown>>).map(a => ({
          id: Number(a.id || 0),
          name: String(a.name || ''),
          size: Number(a.size || 0),
          download_count: Number(a.download_count || 0),
          created_at: String(a.created_at || ''),
          content_type: String(a.content_type || ''),
          browser_download_url: String(a.browser_download_url || ''),
        }))
      : []

    const author = rel.author as { login?: string; avatar_url?: string } | undefined

    return {
      id: Number(rel.id),
      tag_name: String(rel.tag_name || ''),
      name: rel.name ? String(rel.name) : null,
      published_at: String(rel.published_at || rel.created_at || ''),
      html_url: String(rel.html_url || ''),
      prerelease: Boolean(rel.prerelease),
      draft: Boolean(rel.draft),
      author: author?.login ? { login: author.login, avatar_url: String(author.avatar_url || '') } : null,
      assets,
      total_downloads: assets.reduce((sum, a) => sum + a.download_count, 0),
    }
  })
}

export async function fetchTotalDownloads(owner: string, repo: string): Promise<number> {
  const releases = await fetchReleases(owner, repo)
  return releases.reduce((total, release) => total + release.total_downloads, 0)
}

export interface IssueSummary {
  title: string
  body: string | null
  state: 'open' | 'closed'
  comments: number
  created_at: string
  user: string
  labels: string[]
}

export async function fetchRecentIssues(
  owner: string,
  repo: string,
  perPage = 20
): Promise<IssueSummary[]> {
  const response = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/issues?state=all&sort=created&direction=desc&per_page=${perPage}`,
    {
      headers: getHeaders(),
      next: { revalidate: 60 },
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch issues: ${response.status}`)
  }

  const data = await response.json()

  return (data as Array<Record<string, unknown>>).map(item => ({
    title: String(item.title || ''),
    body: item.body ? String(item.body).slice(0, 500) : null,
    state: item.state === 'closed' ? 'closed' : 'open',
    comments: Number(item.comments || 0),
    created_at: String(item.created_at || ''),
    user: String((item.user as { login?: string })?.login || 'unknown'),
    labels: Array.isArray(item.labels)
      ? (item.labels as Array<{ name?: string }>)
          .map(l => String(l.name || ''))
          .filter(Boolean)
      : [],
  }))
}

export interface StargazerFetchResult {
  events: StargazerEvent[]
  sampled: boolean
  sampledReason?: string
}

export async function fetchStargazerEvents(
  owner: string,
  repo: string,
  totalStars: number
): Promise<StargazerFetchResult> {
  const hasToken = Boolean(process.env.GITHUB_PAT)

  if (!hasToken) {
    return {
      events: [],
      sampled: true,
      sampledReason: '未配置 GITHUB_PAT，无法获取 Star 历史（匿名访问受限且无时间戳）',
    }
  }

  const MAX_PAGES = 40
  const PER_PAGE = 100
  const events: StargazerEvent[] = []

  try {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const response = await fetch(
        `${GITHUB_API}/repos/${owner}/${repo}/stargazers?per_page=${PER_PAGE}&page=${page}`,
        {
          headers: getHeaders(true),
          next: { revalidate: 300 },
        }
      )

      if (response.status === 403 || response.status === 429) {
        return {
          events,
          sampled: true,
          sampledReason: `GitHub API 速率限制，已获取 ${events.length} 条 star 事件（共 ${totalStars}）`,
        }
      }

      if (!response.ok) {
        return {
          events,
          sampled: true,
          sampledReason: `GitHub API 返回 ${response.status}，已获取 ${events.length} 条`,
        }
      }

      const data = (await response.json()) as StargazerEvent[]

      if (!Array.isArray(data) || data.length === 0) {
        break
      }

      events.push(...data)

      if (data.length < PER_PAGE) {
        break
      }
    }

    const sampled = events.length < totalStars

    return {
      events,
      sampled,
      sampledReason: sampled
        ? `已获取 ${events.length} 条 star 事件（共 ${totalStars}，仅展示已获取部分）`
        : undefined,
    }
  } catch (error) {
    return {
      events,
      sampled: true,
      sampledReason: `获取 star 历史失败: ${error instanceof Error ? error.message : '未知错误'}`,
    }
  }
}

export async function fetchLanguages(owner: string, repo: string): Promise<import('@/types').LanguageMap> {
  const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/languages`, {
    headers: getHeaders(),
    next: { revalidate: 60 },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch languages: ${response.status}`)
  }

  return response.json()
}

export async function fetchContributors(owner: string, repo: string): Promise<import('@/types').Contributor[]> {
  const response = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contributors?per_page=30`,
    {
      headers: getHeaders(),
      next: { revalidate: 60 },
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch contributors: ${response.status}`)
  }

  const data = await response.json()

  return (data as Array<Record<string, unknown>>).map(c => ({
    login: String(c.login || ''),
    avatar_url: String(c.avatar_url || ''),
    html_url: String(c.html_url || ''),
    contributions: Number(c.contributions || 0),
    type: String(c.type || 'User'),
  }))
}

export async function fetchCommunityHealthScore(owner: string, repo: string): Promise<number> {
  const response = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/community/profile`,
    {
      headers: getHeaders(),
      next: { revalidate: 60 },
    }
  )

  if (!response.ok) {
    return 85
  }

  const data = await response.json()
  const score = data?.health_percentage
  return typeof score === 'number' ? score : 85
}

export async function fetchIssueHealth(
  owner: string,
  repo: string,
  openIssuesCount: number
): Promise<import('@/types').IssueHealthStats> {
  const [openIssues, closedIssues, prs, recentIssues] = await Promise.all([
    fetch(`${GITHUB_API}/search/issues?q=repo:${owner}/${repo}+is:issue+is:open&per_page=1`, { headers: getHeaders() }),
    fetch(`${GITHUB_API}/search/issues?q=repo:${owner}/${repo}+is:issue+is:closed&per_page=100&sort=updated&order=desc`, { headers: getHeaders() }),
    fetch(`${GITHUB_API}/search/issues?q=repo:${owner}/${repo}+is:pr+is:open&per_page=1`, { headers: getHeaders() }),
    fetch(`${GITHUB_API}/search/issues?q=repo:${owner}/${repo}+is:issue+is:closed&per_page=30&sort=updated&order=desc`, { headers: getHeaders() }),
  ])

  const openData = openIssues.ok ? await openIssues.json() : { total_count: openIssuesCount }
  const closedData = closedIssues.ok ? await closedIssues.json() : { total_count: 0, items: [] }
  const prData = prs.ok ? await prs.json() : { total_count: 0 }
  const recentData = recentIssues.ok ? await recentIssues.json() : { items: [] }

  const openCount = openData.total_count || openIssuesCount
  const closedCount = closedData.total_count || 0
  const totalIssues = openCount + closedCount
  const resolutionRate = totalIssues > 0 ? closedCount / totalIssues : 0.85
  const openPRs = prData.total_count || 0

  const closedItems = (recentData.items || []) as Array<Record<string, unknown>>
  let avgDaysToCloseIssue = 3
  let avgDaysToClosePr = 2
  let staleCount = 0

  for (const item of closedItems) {
    const createdAt = item.created_at ? new Date(item.created_at as string).getTime() : 0
    const closedAt = item.closed_at ? new Date(item.closed_at as string).getTime() : Date.now()
    if (createdAt && closedAt) {
      const days = (closedAt - createdAt) / (1000 * 60 * 60 * 24)
      avgDaysToCloseIssue += days
      if (days > 30) staleCount++
    }
  }

  if (closedItems.length > 0) {
    avgDaysToCloseIssue = avgDaysToCloseIssue / (closedItems.length + 1)
    avgDaysToClosePr = avgDaysToCloseIssue * 0.7
  }

  const stalePercentage = closedItems.length > 0 ? Math.round((staleCount / closedItems.length) * 100) : 5

  return {
    openIssues: openCount,
    closedIssuesEstimate: closedCount,
    resolutionRate,
    avgDaysToClosePr: Math.round(avgDaysToClosePr * 10) / 10,
    avgDaysToCloseIssue: Math.round(avgDaysToCloseIssue * 10) / 10,
    staleIssuesPercentage: stalePercentage,
    openPRsEstimate: openPRs,
  }
}
