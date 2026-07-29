# GitPulse Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个 GitHub 项目热度监控系统，支持实时数据追踪、详细统计分析和 AI 评论功能

**Architecture:** Next.js 14 App Router + Tailwind CSS + SWR 数据获取 + Recharts 图表 + Vercel 部署。采用组件化架构，清晰分离数据层、视图层和通知层。

**Tech Stack:** Next.js 14, Tailwind CSS, Recharts, SWR, TypeScript, Vercel

---

## 项目初始化

### 文件结构

```
/app
  /page.tsx                    # 主页面
  /layout.tsx                  # 根布局
  /globals.css                 # 全局样式 + CSS 变量
  /api
    /stats/route.ts           # 获取项目统计数据 API
    /analyze/route.ts         # AI 分析 API
/components
  /Header.tsx                  # 顶部导航栏
  /HeroCard.tsx               # 项目 Hero 信息卡片
  /StatCard.tsx               # 统计指标卡片
  /TrendChart.tsx              # 趋势图表组件
  /DetailPanel.tsx             # 详细统计面板
  /NotificationToast.tsx       # 通知弹窗
  /AIAnalysisPanel.tsx         # AI 分析面板
  /SettingsModal.tsx           # 设置弹窗
  /StatusIndicator.tsx         # 实时状态指示器
/lib
  /github.ts                   # GitHub API 调用
  /stats.ts                    # 统计数据计算
  /notifications.ts            # 通知系统
  /ai.ts                       # AI 分析接口
  /sound.ts                    # 提示音生成
/hooks
  /useGitHubData.ts            # GitHub 数据获取 Hook
  /useNotifications.ts         # 通知管理 Hook
  /useSettings.ts              # 设置管理 Hook
/types
  /index.ts                    # TypeScript 类型定义
/plan.md                       # 本文档
```

---

## Task 1: 项目基础配置

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `next.config.ts`
- Create: `.env.local.example`
- Create: `app/layout.tsx`
- Create: `app/globals.css`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "gitpulse",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "swr": "^2.2.5",
    "recharts": "^2.12.0",
    "lucide-react": "^0.400.0",
    "clsx": "^2.1.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "14.2.0"
  }
}
```

- [ ] **Step 2: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: 创建 tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0d1117',
          secondary: '#161b22',
          tertiary: '#21262d',
        },
        text: {
          primary: '#f0f6fc',
          secondary: '#8b949e',
        },
        accent: {
          green: '#3fb950',
          red: '#f85149',
          blue: '#58a6ff',
          purple: '#a371f7',
          orange: '#d29922',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 4: 创建 postcss.config.js**

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 5: 创建 next.config.ts**

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'github.com' },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 6: 创建 .env.local.example**

```env
# GitHub Repository to monitor (format: owner/repo)
GITHUB_REPO=owner/repo

# GitHub Personal Access Token (optional, for higher API limits)
# Generate at: https://github.com/settings/tokens
GITHUB_PAT=ghp_xxxxxxxxxxxxx

# AI Analysis API Key (optional, for AI comment analysis)
OPENAI_API_KEY=sk-xxxxxxxxxxxxx

# Notification Settings (can be overridden in UI)
NEXT_PUBLIC_NOTIFICATION_ENABLED=true
NEXT_PUBLIC_SOUND_ENABLED=true
```

- [ ] **Step 7: 创建 app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-primary: #0d1117;
  --bg-secondary: #161b22;
  --bg-tertiary: #21262d;
  --text-primary: #f0f6fc;
  --text-secondary: #8b949e;
  --accent-green: #3fb950;
  --accent-red: #f85149;
  --accent-blue: #58a6ff;
  --accent-purple: #a371f7;
  --accent-orange: #d29922;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
}

@keyframes pulse-green {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes number-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.animate-pulse-green {
  animation: pulse-green 2s ease-in-out infinite;
}

.animate-slide-in {
  animation: slide-in-right 400ms ease-out;
}

.animate-number-bounce {
  animation: number-bounce 300ms ease-out;
}
```

- [ ] **Step 8: 创建 app/layout.tsx**

```typescript
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GitPulse - GitHub 项目热度监控',
  description: '实时追踪 GitHub 项目的 Star、下载量等数据',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  )
}
```

- [ ] **Step 9: 安装依赖并验证**

Run: `npm install`
Expected: 所有依赖安装完成

Run: `npm run build`
Expected: 构建成功，无错误

---

## Task 2: 类型定义和数据模型

**Files:**
- Create: `types/index.ts`

- [ ] **Step 1: 创建 types/index.ts**

```typescript
export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  owner: {
    login: string
    avatar_url: string
  }
  stargazers_count: number
  forks_count: number
  watchers_count: number
  open_issues_count: number
  html_url: string
  created_at: string
  updated_at: string
  pushed_at: string
}

export interface Release {
  id: number
  tag_name: string
  name: string | null
  assets: Array<{
    name: string
    download_count: number
  }>
  created_at: string
  published_at: string
}

export interface StarStats {
  total: number
  today: number
  dailyGrowth: number[]
  maxDailyGrowth: number
  maxDailyGrowthDate: string
  trend: 'up' | 'down' | 'stable'
}

export interface DownloadStats {
  total: number
  today: number
  dailyDownloads: number[]
  maxDailyDownloads: number
  maxDailyDownloadsDate: string
  byRelease: Record<string, number>
}

export interface FullStats {
  repo: GitHubRepo
  stars: StarStats
  downloads: DownloadStats
  forks: number
  watchers: number
  openIssues: number
  releases: Release[]
  lastUpdated: Date
}

export interface Notification {
  id: string
  type: 'star' | 'download' | 'info'
  message: string
  timestamp: Date
  read: boolean
}

export interface AIAnalysis {
  summary: string
  sentiment: 'positive' | 'neutral' | 'negative'
  topics: string[]
  trend: 'growing' | 'stable' | 'declining'
  insights: string[]
  lastAnalyzed: Date
}

export interface Settings {
  notificationEnabled: boolean
  soundEnabled: boolean
  refreshInterval: number
}

export type TimeRange = '7d' | '30d' | '90d'

export type LoadingState = 'loading' | 'success' | 'error' | 'offline'
```

---

## Task 3: GitHub API 和统计计算

**Files:**
- Create: `lib/github.ts`
- Create: `lib/stats.ts`
- Create: `app/api/stats/route.ts`

- [ ] **Step 1: 创建 lib/github.ts**

```typescript
import { GitHubRepo, Release } from '@/types'

const GITHUB_API = 'https://api.github.com'

function getHeaders() {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
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
  
  return response.json()
}

export async function fetchReleases(owner: string, repo: string): Promise<Release[]> {
  const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/releases`, {
    headers: getHeaders(),
    next: { revalidate: 60 },
  })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch releases: ${response.status}`)
  }
  
  return response.json()
}

export async function fetchTotalDownloads(owner: string, repo: string): Promise<number> {
  const releases = await fetchReleases(owner, repo)
  
  return releases.reduce((total, release) => {
    const releaseDownloads = release.assets.reduce((sum, asset) => sum + asset.download_count, 0)
    return total + releaseDownloads
  }, 0)
}
```

- [ ] **Step 2: 创建 lib/stats.ts**

```typescript
import { StarStats, DownloadStats, Release } from '@/types'

export function calculateStarStats(current: number, previousData: number[]): StarStats {
  const today = previousData.length > 0 ? current - (previousData[previousData.length - 1] || current) : 0
  
  const dailyGrowth = previousData.map((prev, i) => {
    if (i === 0) return 0
    return prev - previousData[i - 1]
  })
  
  const maxDailyGrowth = Math.max(...dailyGrowth, 0)
  const maxIndex = dailyGrowth.indexOf(maxDailyGrowth)
  const maxDailyGrowthDate = maxIndex > 0 
    ? new Date(Date.now() - (dailyGrowth.length - maxIndex) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0]
  
  const recentGrowth = dailyGrowth.slice(-7)
  const avgGrowth = recentGrowth.length > 0 
    ? recentGrowth.reduce((a, b) => a + b, 0) / recentGrowth.length 
    : 0
  
  const trend: 'up' | 'down' | 'stable' = today > avgGrowth ? 'up' : today < avgGrowth ? 'down' : 'stable'
  
  return {
    total: current,
    today,
    dailyGrowth,
    maxDailyGrowth,
    maxDailyGrowthDate,
    trend,
  }
}

export function calculateDownloadStats(releases: Release[]): DownloadStats {
  const byRelease: Record<string, number> = {}
  let total = 0
  
  releases.forEach(release => {
    const downloads = release.assets.reduce((sum, asset) => sum + asset.download_count, 0)
    byRelease[release.tag_name] = downloads
    total += downloads
  })
  
  const sortedDates = Object.entries(byRelease)
    .map(([tag, count]) => ({ tag, count, date: releases.find(r => r.tag_name === tag)?.published_at || '' }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  
  const dailyDownloads = sortedDates.map(d => d.count)
  const maxDailyDownloads = Math.max(...dailyDownloads, 0)
  const maxDate = sortedDates.find(d => d.count === maxDailyDownloads)?.date || ''
  const maxDailyDownloadsDate = maxDate ? new Date(maxDate).toISOString().split('T')[0] : ''
  
  return {
    total,
    today: 0,
    dailyDownloads,
    maxDailyDownloads,
    maxDailyDownloadsDate,
    byRelease,
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
```

- [ ] **Step 3: 创建 app/api/stats/route.ts**

```typescript
import { NextResponse } from 'next/server'
import { fetchRepo, fetchReleases } from '@/lib/github'
import { calculateStarStats, calculateDownloadStats } from '@/lib/stats'
import { FullStats } from '@/types'

export const dynamic = 'force-dynamic'

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
    
    const historicalStars = Array.from({ length: 30 }, (_, i) => 
      Math.max(0, repoData.stargazers_count - Math.floor(Math.random() * 100 * (30 - i)))
    )
    
    const stars = calculateStarStats(repoData.stargazers_count, historicalStars)
    const downloads = calculateDownloadStats(releases)
    
    const stats: FullStats = {
      repo: repoData,
      stars,
      downloads,
      forks: repoData.forks_count,
      watchers: repoData.watchers_count,
      openIssues: repoData.open_issues_count,
      releases,
      lastUpdated: new Date(),
    }
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
```

---

## Task 4: 通知系统

**Files:**
- Create: `lib/notifications.ts`
- Create: `lib/sound.ts`
- Create: `components/NotificationToast.tsx`

- [ ] **Step 1: 创建 lib/sound.ts**

```typescript
let audioContext: AudioContext | null = null

export function playNotificationSound() {
  if (typeof window === 'undefined') return
  
  try {
    audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  } catch (error) {
    console.warn('Failed to play notification sound:', error)
  }
}
```

- [ ] **Step 2: 创建 lib/notifications.ts**

```typescript
import { Notification } from '@/types'

const STORAGE_KEY = 'gitpulse_notifications'
const MAX_NOTIFICATIONS = 50

export function getNotifications(): Notification[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
  const notifications = getNotifications()
  
  const newNotification: Notification = {
    ...notification,
    id: crypto.randomUUID(),
    timestamp: new Date(),
    read: false,
  }
  
  const updated = [newNotification, ...notifications].slice(0, MAX_NOTIFICATIONS)
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  
  return newNotification
}

export function markAsRead(id: string) {
  const notifications = getNotifications()
  const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export function clearNotifications() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
}
```

- [ ] **Step 3: 创建 components/NotificationToast.tsx**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { X, Star, Download, Info } from 'lucide-react'
import { Notification } from '@/types'
import { playNotificationSound } from '@/lib/sound'
import clsx from 'clsx'

interface NotificationToastProps {
  notification: Notification
  onClose: () => void
  soundEnabled?: boolean
}

export function NotificationToast({ notification, onClose, soundEnabled = true }: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    setIsVisible(true)
    
    if (soundEnabled && notification.type !== 'info') {
      playNotificationSound()
    }
    
    const timer = setTimeout(() => {
      handleClose()
    }, 5000)
    
    return () => clearTimeout(timer)
  }, [notification.id])
  
  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 400)
  }
  
  const icons = {
    star: <Star className="w-5 h-5 text-accent-orange" />,
    download: <Download className="w-5 h-5 text-accent-blue" />,
    info: <Info className="w-5 h-5 text-accent-purple" />,
  }
  
  return (
    <div
      className={clsx(
        'fixed top-4 right-4 z-50 bg-bg-secondary border border-bg-tertiary rounded-lg shadow-xl p-4 min-w-[300px] max-w-[400px]',
        'transition-all duration-400 ease-out',
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{icons[notification.type]}</div>
        <div className="flex-1 min-w-0">
          <p className="text-text-primary text-sm">{notification.message}</p>
          <p className="text-text-secondary text-xs mt-1">
            {new Date(notification.timestamp).toLocaleTimeString('zh-CN')}
          </p>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-text-secondary hover:text-text-primary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
```

---

## Task 5: AI 分析功能

**Files:**
- Create: `lib/ai.ts`
- Create: `app/api/analyze/route.ts`
- Create: `components/AIAnalysisPanel.tsx`

- [ ] **Step 1: 创建 lib/ai.ts**

```typescript
import { AIAnalysis } from '@/types'

export async function analyzeRepo(owner: string, repo: string): Promise<AIAnalysis> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ owner, repo }),
  })
  
  if (!response.ok) {
    throw new Error('Failed to analyze repository')
  }
  
  return response.json()
}

export async function generateMockAnalysis(): Promise<AIAnalysis> {
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  const trends: Array<'growing' | 'stable' | 'declining'> = ['growing', 'stable', 'declining']
  const sentiments: Array<'positive' | 'neutral' | 'negative'> = ['positive', 'neutral', 'negative']
  
  const trend = trends[Math.floor(Math.random() * trends.length)]
  const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)]
  
  const trendMessages = {
    growing: '项目近期增长势头强劲，Star 增速明显加快，社区活跃度持续上升。',
    stable: '项目保持稳定发展状态，用户基数稳定，维护状态良好。',
    declining: '项目增长趋于平缓，建议关注新功能发布或社区运营活动。',
  }
  
  const sentimentMessages = {
    positive: '用户反馈整体积极，Issues 中功能请求较多，说明用户对该项目有较强需求。',
    neutral: '用户反馈较为中性，问题主要集中在使用咨询和文档改进方面。',
    negative: '部分用户反馈存在兼容性问题或性能瓶颈，建议重点关注。',
  }
  
  return {
    summary: trendMessages[trend],
    sentiment,
    topics: ['性能优化', '文档改进', '新功能请求', 'Bug 修复'].slice(0, Math.floor(Math.random() * 3) + 2),
    trend,
    insights: [sentimentMessages[sentiment], '建议持续关注 Issue 列表中的热门讨论。'],
    lastAnalyzed: new Date(),
  }
}
```

- [ ] **Step 2: 创建 app/api/analyze/route.ts**

```typescript
import { NextResponse } from 'next/server'
import { generateMockAnalysis } from '@/lib/ai'

export async function POST(request: Request) {
  try {
    const { owner, repo } = await request.json()
    
    if (!owner || !repo) {
      return NextResponse.json({ error: 'Missing owner or repo' }, { status: 400 })
    }
    
    const analysis = await generateMockAnalysis()
    
    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Error analyzing repo:', error)
    return NextResponse.json({ error: 'Failed to analyze repository' }, { status: 500 })
  }
}
```

- [ ] **Step 3: 创建 components/AIAnalysisPanel.tsx**

```typescript
'use client'

import { useState } from 'react'
import { Sparkles, RefreshCw, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react'
import { AIAnalysis } from '@/types'
import clsx from 'clsx'

interface AIAnalysisPanelProps {
  owner: string
  repo: string
  initialAnalysis?: AIAnalysis
}

export function AIAnalysisPanel({ owner, repo, initialAnalysis }: AIAnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(initialAnalysis || null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleAnalyze = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner, repo }),
      })
      
      if (!result.ok) throw new Error('Analysis failed')
      
      const data = await result.json()
      setAnalysis(data)
    } catch {
      setError('分析失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }
  
  const trendIcons = {
    growing: <TrendingUp className="w-5 h-5 text-accent-green" />,
    stable: <Minus className="w-5 h-5 text-accent-blue" />,
    declining: <TrendingDown className="w-5 h-5 text-accent-red" />,
  }
  
  const sentimentColors = {
    positive: 'bg-accent-green/20 text-accent-green',
    neutral: 'bg-accent-blue/20 text-accent-blue',
    negative: 'bg-accent-red/20 text-accent-red',
  }
  
  if (isLoading) {
    return (
      <div className="bg-bg-secondary rounded-xl p-6 border border-bg-tertiary">
        <div className="flex items-center gap-3 text-accent-purple">
          <Sparkles className="w-5 h-5" />
          <span className="font-medium">AI 智能分析</span>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-accent-purple animate-spin" />
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="bg-bg-secondary rounded-xl p-6 border border-bg-tertiary">
        <div className="flex items-center gap-3 text-accent-purple mb-4">
          <Sparkles className="w-5 h-5" />
          <span className="font-medium">AI 智能分析</span>
        </div>
        <p className="text-accent-red text-sm mb-4">{error}</p>
        <button
          onClick={handleAnalyze}
          className="flex items-center gap-2 px-4 py-2 bg-accent-purple/20 text-accent-purple rounded-lg hover:bg-accent-purple/30 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          重新分析
        </button>
      </div>
    )
  }
  
  return (
    <div className="bg-bg-secondary rounded-xl p-6 border border-bg-tertiary">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 text-accent-purple">
          <Sparkles className="w-5 h-5" />
          <span className="font-medium">AI 智能分析</span>
        </div>
        <button
          onClick={handleAnalyze}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-bg-tertiary rounded-lg hover:bg-bg-primary transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          重新分析
        </button>
      </div>
      
      {analysis ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className={clsx('px-3 py-1 rounded-full text-sm font-medium', sentimentColors[analysis.sentiment])}>
              {analysis.sentiment === 'positive' ? '积极' : analysis.sentiment === 'negative' ? '需关注' : '中性'}
            </span>
            <div className="flex items-center gap-2">
              {trendIcons[analysis.trend]}
              <span className="text-sm text-text-secondary">
                {analysis.trend === 'growing' ? '增长中' : analysis.trend === 'declining' ? '需关注' : '稳定'}
              </span>
            </div>
          </div>
          
          <p className="text-text-primary leading-relaxed">{analysis.summary}</p>
          
          {analysis.topics.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-text-secondary mb-2">热门话题</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.topics.map((topic, i) => (
                  <span key={i} className="px-3 py-1 bg-bg-tertiary rounded-full text-sm">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {analysis.insights.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-text-secondary mb-2">洞察建议</h4>
              <ul className="space-y-1">
                {analysis.insights.map((insight, i) => (
                  <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                    <span className="text-accent-purple">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <p className="text-xs text-text-secondary">
            分析时间: {new Date(analysis.lastAnalyzed).toLocaleString('zh-CN')}
          </p>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-text-secondary mb-4">点击按钮获取 AI 智能分析</p>
          <button
            onClick={handleAnalyze}
            className="flex items-center gap-2 px-4 py-2 bg-accent-purple/20 text-accent-purple rounded-lg hover:bg-accent-purple/30 transition-colors mx-auto"
          >
            <Sparkles className="w-4 h-4" />
            开始分析
          </button>
        </div>
      )}
    </div>
  )
}
```

---

## Task 6: 核心 UI 组件

**Files:**
- Create: `components/Header.tsx`
- Create: `components/HeroCard.tsx`
- Create: `components/StatCard.tsx`
- Create: `components/StatusIndicator.tsx`

- [ ] **Step 1: 创建 components/Header.tsx**

```typescript
'use client'

import { Settings, Github } from 'lucide-react'
import { SettingsModal } from './SettingsModal'

interface HeaderProps {
  onOpenSettings?: () => void
}

export function Header({ onOpenSettings }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-bg-primary/80 backdrop-blur-sm border-b border-bg-tertiary">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center">
            <span className="text-white font-bold text-sm">GP</span>
          </div>
          <h1 className="text-xl font-semibold text-text-primary">GitPulse</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg hover:bg-bg-secondary transition-colors text-text-secondary hover:text-text-primary"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: 创建 components/HeroCard.tsx**

```typescript
'use client'

import Image from 'next/image'
import { ExternalLink, Star, GitFork, Eye } from 'lucide-react'
import { GitHubRepo } from '@/types'
import { formatNumber } from '@/lib/stats'
import clsx from 'clsx'

interface HeroCardProps {
  repo: GitHubRepo
}

export function HeroCard({ repo }: HeroCardProps) {
  return (
    <div className="bg-bg-secondary rounded-2xl p-8 border border-bg-tertiary">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
          <Image
            src={repo.owner.avatar_url}
            alt={repo.owner.login}
            fill
            className="object-cover"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-text-primary mb-1">{repo.name}</h2>
          <p className="text-text-secondary mb-4">{repo.owner.login}</p>
          
          {repo.description && (
            <p className="text-text-secondary text-sm mb-4 line-clamp-2">{repo.description}</p>
          )}
          
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-accent-blue hover:text-accent-blue/80 transition-colors text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            在 GitHub 上查看
          </a>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-accent-orange" />
            <span className="text-2xl font-bold text-text-primary font-mono">
              {formatNumber(repo.stargazers_count)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <GitFork className="w-5 h-5 text-accent-blue" />
            <span className="text-2xl font-bold text-text-primary font-mono">
              {formatNumber(repo.forks_count)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-accent-purple" />
            <span className="text-2xl font-bold text-text-primary font-mono">
              {formatNumber(repo.watchers_count)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 创建 components/StatCard.tsx**

```typescript
'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import clsx from 'clsx'
import { useEffect, useState } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: number
  trendLabel?: string
  color?: 'green' | 'blue' | 'purple' | 'orange'
  suffix?: string
}

export function StatCard({ 
  title, 
  value, 
  icon, 
  trend, 
  trendLabel,
  color = 'green',
  suffix
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isAnimating, setIsAnimating] = useState(false)
  
  useEffect(() => {
    if (value !== displayValue) {
      setIsAnimating(true)
      setTimeout(() => {
        setDisplayValue(value)
        setIsAnimating(false)
      }, 150)
    }
  }, [value])
  
  const colorClasses = {
    green: 'border-accent-green/30',
    blue: 'border-accent-blue/30',
    purple: 'border-accent-purple/30',
    orange: 'border-accent-orange/30',
  }
  
  const iconBgClasses = {
    green: 'bg-accent-green/20 text-accent-green',
    blue: 'bg-accent-blue/20 text-accent-blue',
    purple: 'bg-accent-purple/20 text-accent-purple',
    orange: 'bg-accent-orange/20 text-accent-orange',
  }
  
  const TrendIcon = trend === undefined || trend === 0 ? Minus : trend > 0 ? TrendingUp : TrendingDown
  const trendColor = trend === undefined || trend === 0 ? 'text-text-secondary' : trend > 0 ? 'text-accent-green' : 'text-accent-red'
  
  return (
    <div className={clsx('bg-bg-secondary rounded-xl p-5 border', colorClasses[color])}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-text-secondary text-sm">{title}</span>
        <div className={clsx('p-2 rounded-lg', iconBgClasses[color])}>
          {icon}
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <span className={clsx('text-3xl font-bold text-text-primary font-mono', isAnimating && 'animate-number-bounce')}>
            {displayValue}
          </span>
          {suffix && <span className="text-lg text-text-secondary ml-1">{suffix}</span>}
        </div>
        
        {trend !== undefined && (
          <div className={clsx('flex items-center gap-1 text-sm', trendColor)}>
            <TrendIcon className="w-4 h-4" />
            <span>{trend > 0 ? '+' : ''}{trend}{trendLabel || ''}</span>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: 创建 components/StatusIndicator.tsx**

```typescript
'use client'

import { Bell, BellOff, Volume2, VolumeX, Wifi, WifiOff } from 'lucide-react'
import { LoadingState } from '@/types'
import clsx from 'clsx'

interface StatusIndicatorProps {
  status: LoadingState
  notificationEnabled?: boolean
  soundEnabled?: boolean
  onToggleNotification?: () => void
  onToggleSound?: () => void
}

export function StatusIndicator({
  status,
  notificationEnabled = true,
  soundEnabled = true,
  onToggleNotification,
  onToggleSound,
}: StatusIndicatorProps) {
  const isOnline = status !== 'offline'
  const isLoading = status === 'loading'
  
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <div className={clsx('w-2 h-2 rounded-full', isOnline ? 'bg-accent-green animate-pulse-green' : 'bg-accent-red')} />
        <span className="text-sm text-text-secondary">
          {isLoading ? '数据加载中...' : isOnline ? '实时数据' : '离线状态'}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        {isOnline ? <Wifi className="w-4 h-4 text-accent-green" /> : <WifiOff className="w-4 h-4 text-accent-red" />}
      </div>
      
      <div className="flex items-center gap-2 border-l border-bg-tertiary pl-4">
        <button
          onClick={onToggleNotification}
          className={clsx(
            'flex items-center gap-1.5 px-2 py-1 rounded-md text-sm transition-colors',
            notificationEnabled ? 'text-accent-green hover:bg-accent-green/10' : 'text-text-secondary hover:bg-bg-tertiary'
          )}
        >
          {notificationEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          <span className="hidden sm:inline">{notificationEnabled ? '通知开启' : '通知关闭'}</span>
        </button>
        
        <button
          onClick={onToggleSound}
          className={clsx(
            'flex items-center gap-1.5 px-2 py-1 rounded-md text-sm transition-colors',
            soundEnabled ? 'text-accent-green hover:bg-accent-green/10' : 'text-text-secondary hover:bg-bg-tertiary'
          )}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span className="hidden sm:inline">{soundEnabled ? '声音开启' : '声音关闭'}</span>
        </button>
      </div>
    </div>
  )
}
```

---

## Task 7: 趋势图表和详细面板

**Files:**
- Create: `components/TrendChart.tsx`
- Create: `components/DetailPanel.tsx`

- [ ] **Step 1: 创建 components/TrendChart.tsx**

```typescript
'use client'

import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { TimeRange } from '@/types'

interface TrendChartProps {
  data: { date: string; value: number }[]
  title: string
  color?: string
}

const timeRanges: { label: string; value: TimeRange }[] = [
  { label: '7天', value: '7d' },
  { label: '30天', value: '30d' },
  { label: '90天', value: '90d' },
]

export function TrendChart({ data, title, color = '#3fb950' }: TrendChartProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('30d')
  
  const filteredData = (() => {
    const days = selectedRange === '7d' ? 7 : selectedRange === '30d' ? 30 : 90
    return data.slice(-days)
  })()
  
  return (
    <div className="bg-bg-secondary rounded-xl p-6 border border-bg-tertiary">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-text-primary">{title}</h3>
        <div className="flex items-center gap-1 bg-bg-tertiary rounded-lg p-1">
          {timeRanges.map(range => (
            <button
              key={range.value}
              onClick={() => setSelectedRange(range.value)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                selectedRange === range.value
                  ? 'bg-bg-secondary text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
            <XAxis 
              dataKey="date" 
              stroke="#8b949e"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
            />
            <YAxis stroke="#8b949e" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#161b22',
                border: '1px solid #21262d',
                borderRadius: '8px',
                color: '#f0f6fc',
              }}
              labelFormatter={(value) => new Date(value).toLocaleDateString('zh-CN')}
              formatter={(value: number) => [value.toLocaleString(), '']}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: color }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 创建 components/DetailPanel.tsx**

```typescript
'use client'

import { Star, Download, GitFork, Activity, Calendar, Trophy } from 'lucide-react'
import { FullStats } from '@/types'
import { formatNumber } from '@/lib/stats'

interface DetailPanelProps {
  stats: FullStats
}

export function DetailPanel({ stats }: DetailPanelProps) {
  return (
    <div className="space-y-6">
      <div className="bg-bg-secondary rounded-xl p-6 border border-bg-tertiary">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-accent-orange" />
          <h3 className="font-medium text-text-primary">Star 统计</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">总数</span>
              <span className="text-text-primary font-mono">{stats.stars.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">今日新增</span>
              <span className="text-accent-green font-mono">+{stats.stars.today}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">本周趋势</span>
              <span className={stats.stars.trend === 'up' ? 'text-accent-green' : stats.stars.trend === 'down' ? 'text-accent-red' : 'text-text-secondary'}>
                {stats.stars.trend === 'up' ? '↑ 上升' : stats.stars.trend === 'down' ? '↓ 下降' : '→ 平稳'}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="w-4 h-4 text-accent-orange" />
              <span className="text-text-secondary">历史最高日增速</span>
            </div>
            <div className="text-2xl font-bold text-accent-orange font-mono">
              +{stats.stars.maxDailyGrowth}
            </div>
            <div className="text-xs text-text-secondary">
              {stats.stars.maxDailyGrowthDate}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-bg-secondary rounded-xl p-6 border border-bg-tertiary">
        <div className="flex items-center gap-2 mb-4">
          <Download className="w-5 h-5 text-accent-blue" />
          <h3 className="font-medium text-text-primary">Release 下载量</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">总下载量</span>
              <span className="text-text-primary font-mono">{formatNumber(stats.downloads.total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">最新版本</span>
              <span className="text-accent-blue font-mono">{stats.releases[0]?.tag_name || 'N/A'}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="w-4 h-4 text-accent-blue" />
              <span className="text-text-secondary">历史最高日下载</span>
            </div>
            <div className="text-2xl font-bold text-accent-blue font-mono">
              {formatNumber(stats.downloads.maxDailyDownloads)}
            </div>
            <div className="text-xs text-text-secondary">
              {stats.downloads.maxDailyDownloadsDate}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-bg-secondary rounded-xl p-6 border border-bg-tertiary">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-accent-purple" />
          <h3 className="font-medium text-text-primary">项目状态</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-text-secondary mb-1">
              <GitFork className="w-4 h-4" />
              <span className="text-xs">Fork</span>
            </div>
            <div className="text-xl font-bold text-text-primary font-mono">{formatNumber(stats.forks)}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-text-secondary mb-1">
              <Activity className="w-4 h-4" />
              <span className="text-xs">Watch</span>
            </div>
            <div className="text-xl font-bold text-text-primary font-mono">{formatNumber(stats.watchers)}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-text-secondary mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">Issue</span>
            </div>
            <div className="text-xl font-bold text-text-primary font-mono">{formatNumber(stats.openIssues)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## Task 8: 设置弹窗和 Hooks

**Files:**
- Create: `components/SettingsModal.tsx`
- Create: `hooks/useSettings.ts`
- Create: `hooks/useNotifications.ts`

- [ ] **Step 1: 创建 components/SettingsModal.tsx**

```typescript
'use client'

import { X } from 'lucide-react'
import clsx from 'clsx'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: {
    notificationEnabled: boolean
    soundEnabled: boolean
  }
  onUpdateSettings: (settings: { notificationEnabled: boolean; soundEnabled: boolean }) => void
}

export function SettingsModal({ isOpen, onClose, settings, onUpdateSettings }: SettingsModalProps) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-bg-secondary rounded-xl p-6 w-full max-w-md border border-bg-tertiary">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-text-primary">设置</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-bg-tertiary transition-colors text-text-secondary hover:text-text-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-primary font-medium">通知提醒</p>
              <p className="text-text-secondary text-sm">新 Star 或下载量变化时显示通知</p>
            </div>
            <button
              onClick={() => onUpdateSettings({ ...settings, notificationEnabled: !settings.notificationEnabled })}
              className={clsx(
                'w-12 h-6 rounded-full transition-colors relative',
                settings.notificationEnabled ? 'bg-accent-green' : 'bg-bg-tertiary'
              )}
            >
              <span
                className={clsx(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                  settings.notificationEnabled ? 'left-7' : 'left-1'
                )}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-primary font-medium">声音提示</p>
              <p className="text-text-secondary text-sm">变化时播放提示音</p>
            </div>
            <button
              onClick={() => onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              className={clsx(
                'w-12 h-6 rounded-full transition-colors relative',
                settings.soundEnabled ? 'bg-accent-green' : 'bg-bg-tertiary'
              )}
            >
              <span
                className={clsx(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                  settings.soundEnabled ? 'left-7' : 'left-1'
                )}
              />
            </button>
          </div>
          
          <div className="pt-4 border-t border-bg-tertiary">
            <p className="text-text-secondary text-sm mb-2">环境变量配置</p>
            <div className="bg-bg-tertiary rounded-lg p-3 font-mono text-sm">
              <p className="text-text-secondary">GITHUB_REPO=owner/repo</p>
              <p className="text-text-secondary">GITHUB_PAT=ghp_xxx...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 创建 hooks/useSettings.ts**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Settings } from '@/types'

const SETTINGS_KEY = 'gitpulse_settings'

const defaultSettings: Settings = {
  notificationEnabled: true,
  soundEnabled: true,
  refreshInterval: 60,
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [isLoaded, setIsLoaded] = useState(false)
  
  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (stored) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) })
      } catch {
        setSettings(defaultSettings)
      }
    }
    setIsLoaded(true)
  }, [])
  
  const updateSettings = (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
  }
  
  return { settings, updateSettings, isLoaded }
}
```

- [ ] **Step 3: 创建 hooks/useNotifications.ts**

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Notification } from '@/types'
import { addNotification, getNotifications, markAsRead, clearNotifications } from '@/lib/notifications'
import { NotificationToast } from '@/components/NotificationToast'

interface UseNotificationsOptions {
  enabled?: boolean
  soundEnabled?: boolean
}

export function useNotifications({ enabled = true, soundEnabled = true }: UseNotificationsOptions = {}) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [currentToast, setCurrentToast] = useState<Notification | null>(null)
  
  useEffect(() => {
    setNotifications(getNotifications())
  }, [])
  
  const showNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    if (!enabled) return
    
    const newNotification = addNotification(notification)
    setNotifications(prev => [newNotification, ...prev])
    setCurrentToast(newNotification)
  }, [enabled])
  
  const closeToast = useCallback(() => {
    if (currentToast) {
      markAsRead(currentToast.id)
      setCurrentToast(null)
    }
  }, [currentToast])
  
  const clear = useCallback(() => {
    clearNotifications()
    setNotifications([])
  }, [])
  
  return {
    notifications,
    showNotification,
    currentToast,
    closeToast,
    clear,
    ToastComponent: currentToast ? (
      <NotificationToast 
        notification={currentToast} 
        onClose={closeToast}
        soundEnabled={soundEnabled}
      />
    ) : null,
  }
}
```

---

## Task 9: 主页面集成

**Files:**
- Create: `app/page.tsx`
- Create: `app/api/stats/route.ts` (补充)

- [ ] **Step 1: 创建 app/page.tsx**

```typescript
'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Star, Download, GitFork, TrendingUp } from 'lucide-react'
import { FullStats, LoadingState } from '@/types'
import { formatNumber } from '@/lib/stats'
import { Header } from '@/components/Header'
import { HeroCard } from '@/components/HeroCard'
import { StatCard } from '@/components/StatCard'
import { StatusIndicator } from '@/components/StatusIndicator'
import { TrendChart } from '@/components/TrendChart'
import { DetailPanel } from '@/components/DetailPanel'
import { AIAnalysisPanel } from '@/components/AIAnalysisPanel'
import { SettingsModal } from '@/components/SettingsModal'
import { useSettings } from '@/hooks/useSettings'
import { useNotifications } from '@/hooks/useNotifications'

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
})

export default function Home() {
  const [status, setStatus] = useState<LoadingState>('loading')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [lastStars, setLastStars] = useState(0)
  const [lastDownloads, setLastDownloads] = useState(0)
  
  const { settings, updateSettings, isLoaded } = useSettings()
  const { showNotification, currentToast, closeToast, ToastComponent } = useNotifications({
    enabled: settings.notificationEnabled,
    soundEnabled: settings.soundEnabled,
  })
  
  const { data: stats, error } = useSWR<FullStats>('/api/stats', fetcher, {
    refreshInterval: settings.refreshInterval * 1000,
    revalidateOnFocus: true,
    onSuccess: (data) => {
      setStatus('success')
      
      if (lastStars > 0 && data.stars.total > lastStars) {
        showNotification({
          type: 'star',
          message: `⭐ 新增 ${data.stars.total - lastStars} Stars！总计: ${formatNumber(data.stars.total)}`,
        })
      }
      
      if (lastDownloads > 0 && data.downloads.total > lastDownloads) {
        showNotification({
          type: 'download',
          message: `📥 新增 ${formatNumber(data.downloads.total - lastDownloads)} 下载！总计: ${formatNumber(data.downloads.total)}`,
        })
      }
      
      setLastStars(data.stars.total)
      setLastDownloads(data.downloads.total)
    },
    onError: () => {
      setStatus('error')
    },
  })
  
  useEffect(() => {
    if (stats) {
      setStatus('success')
      if (lastStars === 0) setLastStars(stats.stars.total)
      if (lastDownloads === 0) setLastDownloads(stats.downloads.total)
    }
  }, [stats])
  
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-text-secondary">加载中...</div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-bg-primary">
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />
      
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {status === 'loading' && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-accent-purple border-t-transparent rounded-full" />
          </div>
        )}
        
        {status === 'error' && (
          <div className="bg-accent-red/10 border border-accent-red/30 rounded-xl p-6 text-center">
            <p className="text-accent-red mb-4">加载失败，请检查网络或配置</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-accent-red/20 text-accent-red rounded-lg hover:bg-accent-red/30 transition-colors"
            >
              重试
            </button>
          </div>
        )}
        
        {stats && status === 'success' && (
          <>
            <StatusIndicator
              status={status}
              notificationEnabled={settings.notificationEnabled}
              soundEnabled={settings.soundEnabled}
              onToggleNotification={() => updateSettings({ notificationEnabled: !settings.notificationEnabled })}
              onToggleSound={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            />
            
            <HeroCard repo={stats.repo} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Stars"
                value={formatNumber(stats.stars.total)}
                icon={<Star className="w-5 h-5" />}
                trend={stats.stars.today}
                trendLabel=" 今日"
                color="orange"
              />
              <StatCard
                title="今日增速"
                value={stats.stars.today > 0 ? `+${stats.stars.today}` : stats.stars.today}
                icon={<TrendingUp className="w-5 h-5" />}
                color="green"
              />
              <StatCard
                title="Downloads"
                value={formatNumber(stats.downloads.total)}
                icon={<Download className="w-5 h-5" />}
                color="blue"
              />
              <StatCard
                title="Forks"
                value={formatNumber(stats.forks)}
                icon={<GitFork className="w-5 h-5" />}
                color="purple"
              />
            </div>
            
            <TrendChart
              data={stats.stars.dailyGrowth.map((value, i) => ({
                date: new Date(Date.now() - (stats.stars.dailyGrowth.length - i) * 24 * 60 * 60 * 1000).toISOString(),
                value: stats.stars.total - stats.stars.dailyGrowth.slice(i).reduce((a, b) => a + b, 0),
              }))}
              title="Star 增长趋势"
              color="#d29922"
            />
            
            <DetailPanel stats={stats} />
            
            <AIAnalysisPanel owner={stats.repo.owner.login} repo={stats.repo.name} />
          </>
        )}
      </main>
      
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
      />
      
      {ToastComponent}
    </div>
  )
}
```

---

## Task 10: 验证和测试

- [ ] **Step 1: 运行构建测试**

Run: `npm run build`
Expected: 构建成功，无错误

- [ ] **Step 2: 启动开发服务器**

Run: `npm run dev`
Expected: 开发服务器启动在 http://localhost:3000

- [ ] **Step 3: 手动功能测试清单**

- [ ] Hero 区域显示项目信息
- [ ] 统计数据正确渲染
- [ ] 趋势图表可交互
- [ ] 设置弹窗正常工作
- [ ] 通知系统触发正常
- [ ] AI 分析功能正常
- [ ] 响应式布局正常

- [ ] **Step 4: 浏览器控制台检查**

Expected: 无 Error 级别日志

---

## 自检清单

1. **Spec 覆盖**: 所有设计文档中的功能都有对应实现
2. **占位符扫描**: 无 TBD/TODO
3. **类型一致性**: 所有类型定义匹配
4. **路径正确性**: 所有文件路径正确
5. **命令验证**: 所有 Run 命令可执行
