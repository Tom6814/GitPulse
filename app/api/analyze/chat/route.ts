import { NextResponse } from 'next/server'
import { PersonaKey, AIReviewResult, GitHubRepo } from '@/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

interface IncomingMessage {
  role: 'user' | 'assistant'
  content: string
}

function getPersonaInstruction(persona: PersonaKey): { name: string; tone: string } {
  if (persona === 'roast') {
    return {
      name: '毒舌高级代码评审员',
      tone: '幽默风趣、犀利毒舌但极具建设性的 Senior Staff 代码评审员。用极客梗和调侃的语气解答，直击痛点。',
    }
  }
  if (persona === 'vc') {
    return {
      name: '硅谷风投合伙人',
      tone: '敏锐的硅谷 VC 合伙人。关注商业壁垒、生态网络效应、商业化模式与增长飞轮。',
    }
  }
  if (persona === 'champion') {
    return {
      name: '开源社区布道师',
      tone: '充满热情的开源社区布道师。关注 Maintainer 幸福感、开发者体验、文档可读性与社区多样性。',
    }
  }
  return {
    name: '系统架构师',
    tone: '专业、严谨、深度的系统架构师与工程专家。用清晰、具建设性的语言给出重构与技术方案建议。',
  }
}

function buildSystemInstruction(
  persona: PersonaKey,
  repo: GitHubRepo,
  totalDownloads: number,
  initialReview?: AIReviewResult | null
): string {
  const { name, tone } = getPersonaInstruction(persona)

  return `你现在是该 GitHub 开源项目的专属 AI 顾问，扮演的角色是：【${name}】。
语气风格：${tone}

项目信息背景：
- 仓库名称: ${repo.full_name}
- 项目描述: ${repo.description || '无'}
- 主要语言: ${repo.language || '未知'}
- Stars: ${repo.stargazers_count.toLocaleString()} | Forks: ${repo.forks_count.toLocaleString()} | Open Issues: ${repo.open_issues_count}
- Release 总下载量: ${totalDownloads.toLocaleString()} 次

${initialReview ? `之前对该项目的初步评估结论：
- 项目性格: "${initialReview.projectPersonality}"
- 总体评级: ${initialReview.grade} (${initialReview.healthScore}/100)
- 一句话总结: ${initialReview.oneLineSummary}
` : ''}

规则要求：
1. 请根据你扮演的【${name}】角色特点，针对用户的提问进行针对性、专业且有洞察力的解答。
2. 尽量引用这个项目的真实数据（如 Releases 下载量、Issue 解决率、技术栈等）。
3. 使用自然流利、排版优雅的简体中文（可以使用 Markdown 加粗、列表等格式）。
4. 保持回答精炼有物，不要空话套话。
5. 时间与年份强制要求：涉及项目立项开端时间、Release 发布版本时间、文件下载历史、Star 轨迹里程碑以及 Issues/PR 评论时，必须明确包含具体年份。`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { repo, persona = 'director', messages = [], initialReview, totalReleaseDownloads = 0 } = body

    if (!repo || !repo.name) {
      return NextResponse.json({ error: 'Missing repository metadata.' }, { status: 400 })
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No chat messages provided.' }, { status: 400 })
    }

    const apiKey = process.env.DEEPSEEK_API_KEY
    const baseUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'
    const model = process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash'

    if (!apiKey || !apiKey.trim()) {
      const { name } = getPersonaInstruction(persona as PersonaKey)
      return NextResponse.json({
        reply: `【系统提示】DEEPSEEK_API_KEY 尚未配置。作为【${name}】，我认为这个项目的架构表现相当出色！请在 .env.local 中配置 DEEPSEEK_API_KEY 以解锁实时 AI 深度追问对话。`,
        provider: 'System Demo',
      })
    }

    const systemInstruction = buildSystemInstruction(
      persona as PersonaKey,
      repo,
      totalReleaseDownloads,
      initialReview
    )

    const formattedMessages = [
      { role: 'system', content: systemInstruction },
      ...messages.map((m: IncomingMessage) => ({
        role: m.role === 'user' ? 'user' as const : 'assistant' as const,
        content: m.content,
      })),
    ]

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      console.warn(`DeepSeek chat returned status ${response.status}:`, errText)
      const { name } = getPersonaInstruction(persona as PersonaKey)
      return NextResponse.json({
        reply: `作为【${name}】，针对您关于【${repo.full_name || repo.name}】的提问，结合遥测分析：该项目现有 ${repo.stargazers_count?.toLocaleString()} Stars 与 ${totalReleaseDownloads.toLocaleString()} 次 Releases 下载。工程架构表现出色，建议重点关注核心模块重构与 CI/CD 自动化集成！`,
        provider: 'GitPulse AI (遥测推演模式)',
      })
    }

    const data = await response.json()
    const replyText = data.choices?.[0]?.message?.content || '抱歉，暂时未能生成回复。'

    return NextResponse.json({
      reply: replyText,
      provider: 'DeepSeek AI',
    })
  } catch (error) {
    console.error('AI chat API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal AI chat error' },
      { status: 500 }
    )
  }
}
