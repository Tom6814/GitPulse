export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  owner: {
    login: string
    avatar_url: string
    html_url: string
    type: string
  }
  html_url: string
  fork: boolean
  created_at: string
  updated_at: string
  pushed_at: string
  homepage: string | null
  size: number
  stargazers_count: number
  watchers_count: number
  forks_count: number
  open_issues_count: number
  language: string | null
  default_branch: string
  license: { key: string; name: string; spdx_id: string } | null
  topics: string[]
  subscribers_count: number
  network_count: number
}

export interface LanguageMap {
  [language: string]: number
}

export interface Contributor {
  login: string
  avatar_url: string
  html_url: string
  contributions: number
  type: string
}

export interface StarPoint {
  date: string
  stars: number
  dailyVelocity: number
}

export interface PunchcardHour {
  day: number
  hour: number
  commits: number
}

export interface IssueHealthStats {
  openIssues: number
  closedIssuesEstimate: number
  resolutionRate: number
  avgDaysToClosePr: number
  avgDaysToCloseIssue: number
  staleIssuesPercentage: number
  openPRsEstimate: number
}

export interface AchievementItem {
  id: string
  title: string
  description: string
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary'
  category: 'Velocity' | 'Quality' | 'Community' | 'Engineering' | 'Milestone'
  icon: string
  isUnlocked: boolean
  progress: number
  metricLabel: string
}

export interface ReleaseAsset {
  id: number
  name: string
  size: number
  download_count: number
  created_at: string
  browser_download_url: string
  content_type: string
}

export interface Release {
  id: number
  tag_name: string
  name: string | null
  published_at: string
  html_url: string
  prerelease: boolean
  draft: boolean
  author: { login: string; avatar_url: string } | null
  total_downloads: number
  assets: ReleaseAsset[]
}

export interface StargazerEvent {
  starred_at: string
  user: { login: string }
}

export interface DailyStarRecord {
  date: string
  totalStars: number
  dailyGrowth: number
}

export interface StarStats {
  total: number
  today: number
  history: DailyStarRecord[]
  maxDailyGrowth: number
  maxDailyGrowthDate: string
  trend: 'up' | 'down' | 'stable'
  firstStarDate: string
  sampled: boolean
  sampledReason?: string
}

export interface DownloadStats {
  total: number
  today: number
  byRelease: Record<string, number>
  releases: Array<{
    tag_name: string
    name: string
    published_at: string
    total_downloads: number
    assets: Array<{ name: string; download_count: number }>
  }>
  latestVersion: string | null
}

export interface AIReviewResult {
  healthScore: number
  grade: 'S+' | 'S' | 'A+' | 'A' | 'B' | 'C' | 'D'
  projectPersonality: string
  oneLineSummary: string
  keyStrengths: string[]
  frictionPoints: string[]
  executiveVerdict: string
  recommendedAction: string
  roastComment: string
  provider?: string
}

export type PersonaKey = 'director' | 'vc' | 'roast' | 'champion'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface AIChatResponse {
  reply: string
  provider: string
}

export type GitHubEventType = 'star' | 'fork' | 'pr' | 'issue' | 'push' | 'release' | 'comment'

export interface RealGitHubEvent {
  id: string
  type: string
  actor: {
    login: string
    avatar_url: string
    html_url: string
  }
  repoName: string
  created_at: string
  actionTextEn: string
  actionTextZh: string
  detailText: string
  eventType: GitHubEventType
  targetUrl?: string
}

export interface EventsFetchResult {
  events: RealGitHubEvent[]
  requiresToken: boolean
  errorMsg?: string
}

export interface DailySnapshot {
  repo_full_name: string
  snapshot_date: string
  stars_total: number
  stars_today: number
  forks_total: number
  downloads_total: number
  open_issues: number
  community_health_score: number
  releases_count: number
  contributors_count: number
}

export interface NotificationLog {
  id: string
  repo_full_name: string
  notification_type: string
  message: string
  delta: number
  created_at: string
}

export interface RepoAnalysisData {
  repo: GitHubRepo
  languages: LanguageMap
  contributors: Contributor[]
  starHistory: StarPoint[]
  commitPunchcard: PunchcardHour[]
  issueHealth: IssueHealthStats
  achievements: AchievementItem[]
  communityHealthScore: number
  releases: Release[]
  totalReleaseDownloads: number
  stars: StarStats
  downloads: DownloadStats
  lastUpdated: string
  isFallbackData: boolean
  rateLimitRemaining: number
}

export type LoadingState = 'loading' | 'success' | 'error' | 'offline'
export type TimeRange = '7d' | '30d' | '90d' | 'all'

export interface Settings {
  notificationEnabled: boolean
  soundEnabled: boolean
  refreshInterval: number
}

export interface Notification {
  id: string
  type: 'star' | 'download' | 'info'
  message: string
  timestamp: Date
  read: boolean
}
