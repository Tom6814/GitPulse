import { NextResponse } from 'next/server'
import { PersonaKey, AIReviewResult, GitHubRepo, Release, IssueHealthStats } from '@/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

function cleanJsonText(rawText: string): string {
  let text = rawText.trim()
  text = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  }
  const match = text.match(/\{[\s\S]*\}/)
  return match ? match[0] : text
}

function parseAndValidateReviewJson(rawText: string, providerName: string): AIReviewResult {
  let parsed: Record<string, unknown> = {}
  try {
    const jsonStr = cleanJsonText(rawText)
    parsed = JSON.parse(jsonStr)
  } catch (e) {
    console.warn('Failed to parse raw JSON string from AI model:', e)
    parsed = {}
  }

  const validGrades = ['S+', 'S', 'A+', 'A', 'B', 'C', 'D']

  return {
    healthScore: typeof parsed.healthScore === 'number' ? parsed.healthScore : 88,
    grade: (validGrades.includes(parsed.grade as string) ? parsed.grade : 'A+') as AIReviewResult['grade'],
    projectPersonality:
      typeof parsed.projectPersonality === 'string' && parsed.projectPersonality
        ? parsed.projectPersonality
        : '生态中坚力量',
    oneLineSummary:
      typeof parsed.oneLineSummary === 'string' && parsed.oneLineSummary
        ? parsed.oneLineSummary
        : '该项目工程架构稳健，社区参与度与代码演进活跃度表现出众。',
    keyStrengths:
      Array.isArray(parsed.keyStrengths) && parsed.keyStrengths.length > 0
        ? (parsed.keyStrengths as string[])
        : ['代码库构建自动化程度高', '核心模块分工清晰，社区参与度高', '版本发布频次稳定，依赖管理规范'],
    frictionPoints:
      Array.isArray(parsed.frictionPoints) && parsed.frictionPoints.length > 0
        ? (parsed.frictionPoints as string[])
        : ['部分历史模块缺乏自动化单元测试覆盖', '新贡献者 onboarding 流程与文档有待进一步细化'],
    executiveVerdict:
      typeof parsed.executiveVerdict === 'string' && parsed.executiveVerdict
        ? parsed.executiveVerdict
        : '综合项目各项关键指标评估，该项目具备良好的长期生命力与技术演进路线。建议持续优化核心迭代路线图，并保持社区的高效互动。',
    recommendedAction:
      typeof parsed.recommendedAction === 'string' && parsed.recommendedAction
        ? parsed.recommendedAction
        : '建议进一步完善贡献指南 (CONTRIBUTING.md) 并增加 PR 自动化测试与 CI 覆盖。',
    roastComment:
      typeof parsed.roastComment === 'string' && parsed.roastComment
        ? parsed.roastComment
        : '代码组织十分清爽，但维护者显然需要多喝几杯咖啡来消化沉重的 Issue 队列！',
    provider: providerName,
  }
}

function getPersonaSystemInstruction(persona: PersonaKey): string {
  const dateMandate = `
CRITICAL TIME & SPECIFIC YEAR MANDATE:
All references to project creation/start (立项/开端时间), releases (发布版本), release download counts, star trajectory milestones, and community comments (Issue/PR 评论) MUST explicitly include specific years (e.g., "2022年立项", "2024年发布 v2.4.0 版本", "2025年项目突破万星", "2026年最新社区讨论"). Never output vague dates without specific years.
CRITICAL MANDATE: All generated JSON string fields MUST be written in professional, natural Simplified Chinese (简体中文).`

  const personaFocus: Record<PersonaKey, string> = {
    director: `You are an elite, highly experienced software engineering auditor and GitHub ecosystem analyst.
You evaluate open-source software projects based on stargazers, release binary download statistics, issue health, community health score, contributor velocity, language stack distribution, and ecosystem momentum.
FOCUS ON: Architecture quality, code health, engineering practices, CI/CD maturity, and technical debt assessment. Analyze the project's README and CONTRIBUTING guidelines to understand its architecture design philosophy, module organization, and developer onboarding quality.
Provide precise, insightful, and human-like assessment. Avoid generic SaaS hype terms like "supercharge" or "game-changer". Be analytical, concise, and punchy.${dateMandate}`,
    roast: `You are a brutally honest, witty senior staff code reviewer doing a hilarious yet constructive tech roast of this GitHub repository in Chinese (中文).
FOCUS ON: Code quality quirks, architecture absurdities, dependency bloat, documentation gaps, and funny contradictions you find in the README/contributing docs. Highlight both absurd quirks, release download numbers, and real achievements with sharp developer humor.
Read the README and CONTRIBUTING.md carefully to find roasting material - over-promising docs, missing setup steps, or funny contradictions.${dateMandate}`,
    vc: `You are a Silicon Valley Venture Capital Partner analyzing open-source project trajectory, release package download demand, star growth momentum, community network effects, and enterprise adoption potential in Chinese (中文).
FOCUS ON: Commercial viability, market positioning, competitive moat, growth metrics, and investment thesis. Pay attention to the project's README for market positioning clues and value proposition.${dateMandate}`,
    champion: `You are a passionate Open Source Advocate focusing on release accessibility, contributor inclusivity, documentation clarity, maintainer health, and developer joy in Chinese (中文).
FOCUS ON: Community health signals from README and CONTRIBUTING.md quality, onboarding experience, inclusive language, maintainer burnout risk, and contributor diversity. Evaluate how welcoming the project docs are for new contributors.${dateMandate}`,
  }

  return personaFocus[persona] || personaFocus.director
}

function formatReleases(releases: Release[]): string {
  if (releases.length === 0) return 'No release file downloads data recorded.'
  return releases
    .slice(0, 6)
    .map(r => {
      const assetsSummary = r.assets
        .map(a => `${a.name} (${a.download_count.toLocaleString()} downloads)`)
        .join(', ')
      const pubYear = r.published_at ? new Date(r.published_at).getFullYear() : 'N/A'
      return `- Release Tag: ${r.tag_name} ("${r.name || r.tag_name}") | Published Year: ${pubYear} (${r.published_at ? new Date(r.published_at).toLocaleDateString() : 'N/A'}) | Version Downloads: ${r.total_downloads.toLocaleString()} | Assets: [${assetsSummary || 'No binary assets attached'}]`
    })
    .join('\n')
}

function buildPrompt(
  repo: GitHubRepo,
  releases: Release[],
  totalDownloads: number,
  issueHealth: IssueHealthStats | null,
  communityHealthScore: number,
  topLanguages: string,
  topContributors: string,
  starHistoryLength: number,
  firstStarDate: string,
  readme: string | null,
  contributing: string | null
): string {
  const computedTotalDownloads = totalDownloads || releases.reduce((sum, r) => sum + r.total_downloads, 0)
  const formattedReleases = formatReleases(releases)

  // Truncate README/CONTRIBUTING to reasonable lengths for the AI prompt
  const readmeExcerpt = readme ? readme.slice(0, 3000) + (readme.length > 3000 ? '\n...(truncated)' : '') : 'No README.md available.'
  const contributingExcerpt = contributing ? contributing.slice(0, 2000) + (contributing.length > 2000 ? '\n...(truncated)' : '') : 'No CONTRIBUTING.md available.'

  return `
Analyze the following comprehensive GitHub repository metrics and full telemetry context:

=== 1. BASIC REPOSITORY METADATA ===
Repository Name: ${repo.full_name}
Description: ${repo.description || 'No description provided.'}
Primary Language: ${repo.language || 'Multi-language'}
Stars: ${repo.stargazers_count.toLocaleString()}
Forks: ${repo.forks_count.toLocaleString()}
Open Issues: ${repo.open_issues_count}
License: ${repo.license?.spdx_id || repo.license?.name || 'Unlicensed'}
Topics / Keywords: ${(repo.topics || []).join(', ') || 'None'}
Created At: ${repo.created_at}
Last Pushed: ${repo.pushed_at}

=== 2. PROJECT DOCUMENTATION ===
README.md:
${readmeExcerpt}

CONTRIBUTING.md:
${contributingExcerpt}

=== 3. RELEASE & FILE DOWNLOAD TELEMETRY ===
Total Release File Downloads: ${computedTotalDownloads.toLocaleString()}
Total Release Versions Count: ${releases.length}
Latest Releases & Downloads:
${formattedReleases}

=== 4. COMMUNITY, CONTRIBUTORS & ISSUE HEALTH ===
Community Health Score: ${communityHealthScore}%
${issueHealth ? `Issue Resolution Estimate: ${Math.round(issueHealth.resolutionRate * 100)}%
Avg PR Merge / Issue Closing Time: ${issueHealth.avgDaysToClosePr} days
Avg Days to Close Issue: ${issueHealth.avgDaysToCloseIssue} days
Stale Issues Percentage: ${issueHealth.staleIssuesPercentage}%
Open PRs: ${issueHealth.openPRsEstimate}` : 'Issue health data not available.'}
Top Core Contributors: ${topContributors || 'Not specified'}

=== 5. CODEBASE ARCHITECTURE ===
Language Stack Distribution: ${topLanguages || 'Not specified'}
Star Trajectory: Tracked across ${starHistoryLength} daily time points from ${firstStarDate} to today

=== AUDIT DIRECTIVE ===
Synthesize ALL of the telemetry data and project documentation above into a thorough Chinese evaluation JSON output. Focus STRICTLY on your assigned persona's perspective - do not drift into other personas' territory.`
}

function generateTelemetryFallbackReview(
  repo: GitHubRepo,
  releases: Release[],
  communityHealthScore: number,
  persona: PersonaKey
): AIReviewResult {
  const stars = repo.stargazers_count || 0
  const lang = repo.language || 'TypeScript/JavaScript'
  const totalDl = releases.reduce((sum, r) => sum + r.total_downloads, 0)
  const health = Math.min(98, Math.max(70, Math.round((communityHealthScore || 85) * 0.5 + (stars > 1000 ? 25 : 15) + (totalDl > 10000 ? 20 : 10))))

  let grade: AIReviewResult['grade'] = 'A+'
  if (health >= 92) grade = 'S'
  else if (health >= 85) grade = 'A+'
  else if (health >= 75) grade = 'A'
  else grade = 'B'

  let personality = '生态工程基石'
  let roast = `项目拥有 ${stars.toLocaleString()} Stars 与 ${totalDl.toLocaleString()} 次二进制文件下载，实战硬核度极为拉满！`

  if (persona === 'roast') {
    personality = '硬核极客派'
    roast = `虽然 AI 接口触碰了频次限制，但项目 ${stars} 颗 Star 和 ${totalDl} 次下载量的真实硬实力根本藏不住！`
  } else if (persona === 'vc') {
    personality = '高潜力独角兽'
    roast = `网络效应显著，Release 交付文件下载已突破 ${totalDl.toLocaleString()} 次，商业化想象空间巨大。`
  } else if (persona === 'champion') {
    personality = '开源布道标杆'
    roast = `贡献者生态热烈，社区健康度达 ${communityHealthScore}%，展现出出色的开源协作与维护精神！`
  }

  return {
    healthScore: health,
    grade,
    projectPersonality: personality,
    oneLineSummary: `${repo.full_name} 是一个基于 ${lang} 的高质量开源项目，拥有 ${stars.toLocaleString()} Stars 与 ${totalDl.toLocaleString()} 次 Release 二进制下载。`,
    keyStrengths: [
      `Release 交付极其稳定，二进制构件累计下载超 ${totalDl.toLocaleString()} 次`,
      `社区关注度高，GitHub Stargazers 积累达 ${stars.toLocaleString()} 颗`,
      `核心模块开发活跃，社区健康指标评分达到 ${communityHealthScore}%`,
    ],
    frictionPoints: [
      '部分 Issues 响应周期受限于 Maintainer 精力，建议扩展社区 Core Team 协作',
      '建议进一步提升 CI/CD 自动化构建与多平台的测试覆盖率',
    ],
    executiveVerdict: `综合【${repo.full_name}】的完整 Telemetry 遥测数据评估，该项目在 ${lang} 领域表现出强劲的技术壁垒与生态号召力。\n\n项目已累计获得 ${stars.toLocaleString()} Stargazers，并且 Release 二进制发行版累计被下载 ${totalDl.toLocaleString()} 次，说明项目具有极高的实操落地价值与广大的实际用户群。\n\n社区治理结构与 Issue 解决效率整体表现优异，随着后续模块化重构与贡献者指南的补充，项目的长期发展潜力不可限量。`,
    recommendedAction: '建议设立贡献者 Weekly Triage 机制，并为热门 Release 资源补充自动化构建与校验机制。',
    roastComment: roast,
    provider: 'GitPulse AI (遥测数据推演模式)',
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { repo, releases = [], totalReleaseDownloads = 0, issueHealth, communityHealthScore = 85, languages = {}, contributors = [], starHistory = [], firstStarDate = '', readme = null, contributing = null } = body
    const persona = (body.persona === 'roast' || body.persona === 'vc' || body.persona === 'champion' ? body.persona : 'director') as PersonaKey

    if (!repo || !repo.name) {
      return NextResponse.json({ error: 'Missing repository metadata for AI review.' }, { status: 400 })
    }

    const apiKey = process.env.DEEPSEEK_API_KEY
    const baseUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'
    const model = process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash'

    if (!apiKey || !apiKey.trim()) {
      return NextResponse.json(
        generateTelemetryFallbackReview(repo, releases, communityHealthScore, persona)
      )
    }

    const systemInstruction = getPersonaSystemInstruction(persona)
    const jsonSchemaPrompt = `

RETURN ONLY A RAW JSON OBJECT (no wrap codeblocks except json) with these exact keys:
{
  "healthScore": 88,
  "grade": "S",
  "projectPersonality": "2-4字中文项目性格",
  "oneLineSummary": "一句话中文评估",
  "keyStrengths": ["优势1", "优势2", "优势3"],
  "frictionPoints": ["痛点1", "痛点2"],
  "executiveVerdict": "2-3段详细中文评估结论",
  "recommendedAction": "1条落地建议",
  "roastComment": "1-2句犀利点评"
}`

    const fullSystemInstruction = `${systemInstruction}${jsonSchemaPrompt}`

    const topLanguages = Object.entries(languages)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 6)
      .map(([langName, bytes]) => `${langName}: ${(bytes as number).toLocaleString()} bytes`)
      .join(', ')

    const topContributors = (contributors as Array<{ login: string; contributions: number }>)
      .slice(0, 6)
      .map(c => `${c.login} (${c.contributions} commits)`)
      .join(', ')

    const prompt = buildPrompt(
      repo,
      releases,
      totalReleaseDownloads,
      issueHealth,
      communityHealthScore,
      topLanguages,
      topContributors,
      starHistory.length,
      firstStarDate,
      readme,
      contributing
    )

    const requestBody: Record<string, unknown> = {
      model,
      messages: [
        { role: 'system', content: fullSystemInstruction },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    }

    if (!model.includes('reasoner')) {
      requestBody.response_format = { type: 'json_object' }
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.warn(`DeepSeek API error (${response.status}):`, errorBody)
      return NextResponse.json(
        generateTelemetryFallbackReview(repo, releases, communityHealthScore, persona)
      )
    }

    const responseData = await response.json()
    const rawContent = responseData.choices?.[0]?.message?.content || '{}'
    const result = parseAndValidateReviewJson(rawContent, 'DeepSeek AI')

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error generating AI review:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate AI executive review.' },
      { status: 500 }
    )
  }
}
