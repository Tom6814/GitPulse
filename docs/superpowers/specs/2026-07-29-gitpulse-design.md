# GitHub Pulse - 项目热度监控系统设计文档

**日期**: 2026-07-29
**项目名称**: GitPulse
**状态**: 设计中

---

## 1. 项目概述

GitPulse 是一个专注于单个 GitHub 项目的数据监控系统，提供详尽的项目热度追踪功能，包括 Star、Release 下载量等多维度统计，并集成 AI 评论分析能力。设计风格参考 Uptime Kuma，呈现简洁、实时、专业的监控仪表板体验。

### 核心价值
- **实时追踪**: 毫秒级数据刷新，实时反映项目热度变化
- **详尽统计**: 从多个维度深度分析项目数据趋势
- **智能提醒**: 新增 Star/下载量时主动通知
- **AI 洞察**: 利用 AI 分析项目评论和趋势

---

## 2. 设计语言

### 2.1 视觉风格
参考 **Uptime Kuma** 的设计美学：
- 暗色调主题，减少视觉疲劳
- 卡片式布局，清晰的视觉层级
- 状态指示器醒目（绿色=健康/上升，红色=下降）
- 数字大而清晰，数据优先
- 圆角卡片，微妙阴影

### 2.2 配色方案
```css
--bg-primary: #0d1117;        /* 深色背景 */
--bg-secondary: #161b22;      /* 卡片背景 */
--bg-tertiary: #21262d;      /* 悬停/选中状态 */
--text-primary: #f0f6fc;     /* 主文字 */
--text-secondary: #8b949e;   /* 次要文字 */
--accent-green: #3fb950;      /* 正向/增长 */
--accent-red: #f85149;       /* 负向/下降 */
--accent-blue: #58a6ff;      /* 链接/强调 */
--accent-purple: #a371f7;    /* AI 功能 */
--accent-orange: #d29922;     /* 警告/特殊 */
```

### 2.3 字体
- 主字体: `Inter` (数字清晰、现代感强)
- 等宽字体: `JetBrains Mono` (代码/数字)
- Fallback: `-apple-system, BlinkMacSystemFont, sans-serif`

### 2.4 间距系统
- 基础单位: 4px
- 卡片间距: 16px
- 区块间距: 32px
- 页面边距: 24px (移动端: 16px)

### 2.5 动效
- 数据变化: 数字跳动动画 (300ms)
- 状态变化: 颜色渐变过渡 (200ms)
- 卡片悬停: 轻微上浮 + 阴影增强 (150ms)
- 通知弹窗: 从右侧滑入 (400ms ease-out)

---

## 3. 页面结构

### 3.1 整体布局

```
┌─────────────────────────────────────────────────────────────┐
│  Header: Logo + 设置按钮                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    HERO 区域                          │   │
│  │  ┌──────┐                                            │   │
│  │  │ Logo │  项目名称                                   │   │
│  │  └──────┘  [⭐ 45.2K]  [🔀 3.2K]  [📥 12.5M]          │   │
│  │           [View on GitHub →]                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  实时数据指示器                        │   │
│  │  🟢 实时数据流    🔊 通知已开启                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  │   STAR 统计   │ │  下载量统计   │ │   FORK 统计   │       │
│  │   ⭐ 45.2K    │ │   📥 12.5M   │ │   🔀 3.2K    │       │
│  │   ↑ +23 today │ │   ↑ +1.2K    │ │   ↑ +5 today │       │
│  └──────────────┘ └──────────────┘ └──────────────┘       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    数据趋势图表                       │   │
│  │  [7天] [30天] [90天]                                 │   │
│  │  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~           │   │
│  │  Star 增长趋势线                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   详细统计面板                         │   │
│  │                                                       │   │
│  │  Star 历史记录                                        │   │
│  │  ├─ 总数: 45,234                                     │   │
│  │  ├─ 今日新增: +23                                    │   │
│  │  ├─ 本周最高日增速: +156                             │   │
│  │  ├─ 历史最高日增速: +523 (2024-03-15)                │   │
│  │  └─ 当前排名: #128 (Trending)                       │   │
│  │                                                       │   │
│  │  Release 下载量                                        │   │
│  │  ├─ 最新版本: v2.1.0                                 │   │
│  │  ├─ 总下载量: 12,567,890                             │   │
│  │  ├─ 今日新增: +1,234                                 │   │
│  │  ├─ 历史最高日下载: +45,678 (2024-06-01)             │   │
│  │  └─ 平均日下载: ~3,200                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   AI 分析面板                        │   │
│  │  🤖 AI 评论分析                                      │   │
│  │                                                       │   │
│  │  最近趋势: 该项目本周 Star 增长加速，                 │   │
│  │  主要增长来源为亚洲地区用户...                        │   │
│  │                                                       │   │
│  │  [重新分析] [查看详细报告]                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 响应式策略
- **桌面 (>1024px)**: 三列指标卡片，图表全宽
- **平板 (768-1024px)**: 双列卡片，图表保持
- **手机 (<768px)**: 单列堆叠，紧凑间距

---

## 4. 功能模块

### 4.1 配置模块
- **项目配置**: 在环境变量中设置 `GITHUB_REPO=owner/repo`
- **GitHub Token**: `GITHUB_PAT` 环境变量（可选，用于提升 API 限制）
- **通知设置**: 本地存储 `notification_enabled`, `sound_enabled`

### 4.2 数据获取模块
| 数据源 | API | 频率 |
|--------|-----|------|
| 项目基础信息 | `GET /repos/{owner}/{repo}` | 60秒 |
| Star 历史 | `GET /repos/{owner}/{repo}/stargazers` | 60秒 |
| Release 信息 | `GET /repos/{owner}/{repo}/releases` | 60秒 |
| 下载量统计 | `GET /repos/{owner}/{repo}/releases/totals` | 60秒 |

### 4.3 统计计算模块
```typescript
interface StarStats {
  total: number;
  today: number;
  dailyGrowth: number[];
  maxDailyGrowth: number;
  maxDailyGrowthDate: string;
  trend: 'up' | 'down' | 'stable';
}

interface DownloadStats {
  total: number;
  today: number;
  dailyDownloads: number[];
  maxDailyDownloads: number;
  maxDailyDownloadsDate: string;
  byRelease: Record<string, number>;
}

interface FullStats {
  stars: StarStats;
  downloads: DownloadStats;
  forks: number;
  watchers: number;
  openIssues: number;
  lastUpdated: Date;
}
```

### 4.4 通知模块
- **通知触发**: 当 `currentStar - lastKnownStar > 0` 或 `currentDownload - lastKnownDownload > 0`
- **通知内容**: `[GitPulse] ⭐ +{count} New stars! Total: {total}`
- **声音提醒**: 使用 Web Audio API 生成短提示音
- **控制选项**: 通知开关、音效开关

### 4.5 AI 分析模块
- **评论来源**: 通过 GitHub API 获取最新评论/Issues
- **分析维度**:
  - 情感分析 (正面/负面/中性)
  - 主题提取 (功能请求、Bug 报告、疑问等)
  - 趋势判断 (增长/下降/平稳)
- **实现方式**: 集成 OpenAI API 或本地模型

---

## 5. 组件设计

### 5.1 HeroCard
```
属性:
- avatarUrl: string
- repoName: string
- description: string
- stars: number
- forks: number
- watchers: number
- githubUrl: string

状态:
- loading: 显示骨架屏
- error: 显示错误重试按钮
- loaded: 显示完整信息
```

### 5.2 StatCard
```
属性:
- title: string
- value: number | string
- icon: ReactNode
- trend: number (百分比变化)
- trendDirection: 'up' | 'down' | 'stable'
- color: 'green' | 'blue' | 'purple' | 'orange'

动效:
- 数值变化时触发数字跳动
- 方向指示器颜色变化
```

### 5.3 TrendChart
```
属性:
- data: number[]
- labels: string[]
- color: string
- timeRange: '7d' | '30d' | '90d'

交互:
- 悬停显示具体数值
- 点击切换时间范围
```

### 5.4 NotificationToast
```
属性:
- message: string
- type: 'star' | 'download' | 'info'
- onClose: () => void

行为:
- 从右侧滑入
- 3秒后自动消失
- 支持手动关闭
```

### 5.5 AIAnalysisPanel
```
属性:
- analysis: AIAnalysis | null
- isLoading: boolean
- onRefresh: () => void

状态:
- loading: 显示加载动画
- error: 显示错误和重试
- empty: 无数据提示
- success: 显示分析结果
```

---

## 6. 技术架构

### 6.1 技术栈
- **框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS
- **图表**: Recharts
- **状态管理**: React Hooks + Context
- **API 调用**: SWR (数据获取和缓存)
- **部署**: Vercel

### 6.2 项目结构
```
/app
  /page.tsx              # 主页面
  /layout.tsx            # 布局
  /globals.css           # 全局样式
/components
  /HeroCard.tsx
  /StatCard.tsx
  /TrendChart.tsx
  /NotificationToast.tsx
  /AIAnalysisPanel.tsx
  /Header.tsx
  /Settings.tsx
/lib
  /github.ts             # GitHub API 调用
  /stats.ts              # 统计数据计算
  /notifications.ts      # 通知系统
  /ai.ts                 # AI 分析接口
/hooks
  /useGitHubData.ts      # 数据获取 Hook
  /useNotifications.ts   # 通知 Hook
  /useStats.ts           # 统计计算 Hook
/types
  /index.ts              # TypeScript 类型定义
```

### 6.3 环境变量
```env
# .env.local
GITHUB_REPO=owner/repo
GITHUB_PAT=ghp_xxxxxxxxxxxxx  # 可选
NEXT_PUBLIC_NOTIFICATION_ENABLED=true
NEXT_PUBLIC_SOUND_ENABLED=true
OPENAI_API_KEY=sk-xxxxxxxxxxxxx  # 可选
```

### 6.4 API 路由
```
/api/stats
  GET: 获取完整统计数据
  Response: { stars, downloads, forks, ... }

/api/analyze
  POST: 触发 AI 分析
  Body: { repoUrl }
  Response: { summary, sentiment, topics }
```

---

## 7. 数据流

### 7.1 初始加载
1. 页面加载 → 显示骨架屏
2. 调用 `/api/stats` 获取初始数据
3. 计算统计数据 (每日增速、历史最高等)
4. 渲染组件，显示数据

### 7.2 实时更新
1. SWR 自动轮询 (60秒间隔)
2. 获取最新数据
3. 对比上次数据:
   - 如果有变化 → 更新 UI + 触发通知
   - 如果无变化 → 仅更新 `lastUpdated` 时间

### 7.3 通知流程
```
新数据检测到变化
    ↓
检查 notification_enabled
    ↓
显示 Toast 通知
    ↓
如果 sound_enabled → 播放提示音
```

---

## 8. 错误处理

### 8.1 API 错误
- **401/403**: 提示配置 GitHub PAT
- **404**: 提示项目不存在
- **429**: 显示限流提示，增加轮询间隔
- **网络错误**: 显示离线状态，自动重试

### 8.2 UI 状态
```typescript
type Status = 'loading' | 'success' | 'error' | 'offline';

// loading: 骨架屏
// success: 正常显示数据
// error: 错误提示 + 重试按钮
// offline: 离线提示 + 缓存数据显示
```

---

## 9. 性能优化

- **SWR 缓存**: 减少 API 调用
- **增量更新**: 只更新变化的数据
- **图片优化**: 使用 Next.js Image 组件
- **代码分割**: 动态导入 AI 分析组件
- **数据持久化**: LocalStorage 缓存上次数据

---

## 10. 后续迭代 (MVP 之后)

1. **多项目支持**: 切换不同的 GitHub 项目
2. **数据导出**: 导出历史数据为 CSV/JSON
3. **自定义指标**: 用户可添加自定义追踪指标
4. **历史回放**: 查看任意时间点的数据快照
5. **邮件通知**: 支持邮件推送
6. **Widget 支持**: 可嵌入的 Embeddable Widget

---

## 11. 验收标准

- [ ] Hero 区域正确显示项目信息
- [ ] 统计数据实时更新 (60秒间隔)
- [ ] 新增 Star/下载量时显示通知
- [ ] 通知音效可正常播放且可关闭
- [ ] 趋势图表正确渲染
- [ ] AI 分析面板返回有效分析
- [ ] 响应式布局适配手机/平板/桌面
- [ ] 页面加载性能 < 2s
- [ ] 无 console error
