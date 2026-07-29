'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Sparkles, AlertTriangle, RefreshCw, Zap, CheckCircle2,
  Terminal, MessageSquare, Send, Loader2, User, Trash2,
} from 'lucide-react'
import { RepoAnalysisData, AIReviewResult, PersonaKey, ChatMessage } from '@/types'
import clsx from 'clsx'

interface AIExecutiveReviewProps {
  data: RepoAnalysisData
}

const PERSONAS = [
  { key: 'director' as PersonaKey, label: '系统架构师', icon: '🧐', desc: '深度的技术架构与工程健康度审计' },
  { key: 'vc' as PersonaKey, label: '风投投资人', icon: '🚀', desc: '商业增长潜力、增速与生态影响力' },
  { key: 'roast' as PersonaKey, label: '毒舌开发者', icon: '🔥', desc: '犀利且充满建设性的极客式点评' },
  { key: 'champion' as PersonaKey, label: '开源布道师', icon: '💖', desc: '社区关怀、贡献者幸福感与温度' },
]

const PRESET_QUESTIONS: Record<PersonaKey, string[]> = {
  director: [
    '🎯 这个项目代码库最集中的技术债务或死角在何处？',
    '⚡ 如何进一步提高代码审计自动化与 Issue 修复效率？',
    '🏗️ 从架构演进角度看，下一步最大的痛点是什么？',
  ],
  roast: [
    '💥 为什么这个项目有这么多 Star，但代码里有些地方让人啼笑皆非？',
    '🔥 用最犀利的一句话总结这个项目维护者的日常状态。',
    '💩 这个 repo 最容易崩溃或者最黑盒的逻辑是哪一部分？',
  ],
  vc: [
    '🚀 如果这个开源项目进行商业化变现，最顺畅的商业模式是什么？',
    '💰 相比生态中的同类竞争者，它的技术护城河和网络效应在哪里？',
    '📉 投资这个项目时，最需要警惕的下行风险是什么？',
  ],
  champion: [
    '🤝 如何大幅降低新手贡献者提交第一个 PR 的心理门槛？',
    '💖 目前社区对于 Maintainer 的温度和健康度有何建议？',
    '📖 它的 README 和使用文档还有哪些可以大幅改善的地方？',
  ],
}

let msgCounter = 0
function createMessageId(prefix: string): string {
  msgCounter += 1
  return `${prefix}-${msgCounter}`
}

export function AIExecutiveReview({ data }: AIExecutiveReviewProps) {
  const [activePersona, setActivePersona] = useState<PersonaKey>('director')
  const [cachedReviews, setCachedReviews] = useState<Partial<Record<PersonaKey, AIReviewResult>>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const [chatHistories, setChatHistories] = useState<Record<PersonaKey, ChatMessage[]>>({
    director: [], vc: [], roast: [], champion: [],
  })
  const [chatInput, setChatInput] = useState('')
  const [isSendingChat, setIsSendingChat] = useState(false)
  const chatInputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const repoFullName = data.repo?.full_name || data.repo?.name || ''
  const [prevRepo, setPrevRepo] = useState(repoFullName)
  if (prevRepo !== repoFullName) {
    setPrevRepo(repoFullName)
    setCachedReviews({})
    setChatHistories({ director: [], vc: [], roast: [], champion: [] })
  }

  const activeReview = cachedReviews[activePersona] || null
  const activeChatMessages = chatHistories[activePersona] || []

  const parseResponseJson = async (res: Response, fallbackErrMsg: string) => {
    const text = await res.text().catch(() => '')
    let json: Record<string, unknown> | null = null
    try {
      json = JSON.parse(text)
    } catch {
      const match = text.match(/\{[\s\S]*\}/)
      if (match) {
        try { json = JSON.parse(match[0]) } catch { json = null }
      }
    }
    if (json) {
      if (!res.ok) throw new Error(String((json as { error?: string }).error || fallbackErrMsg))
      return json
    }
    const cleanText = text.replace(/<[^>]+>/g, '').trim()
    if (!res.ok) throw new Error(`服务器响应异常 (${res.status}): ${cleanText.slice(0, 150) || fallbackErrMsg}`)
    throw new Error(`服务器响应格式异常 (${cleanText.slice(0, 80) || fallbackErrMsg})`)
  }

  const forceRefresh = async (persona: PersonaKey) => {
    setIsLoading(true)
    setErrorMsg('')
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo: data.repo,
          releases: data.releases,
          totalReleaseDownloads: data.totalReleaseDownloads,
          issueHealth: data.issueHealth,
          communityHealthScore: data.communityHealthScore,
          languages: data.languages,
          contributors: data.contributors,
          starHistory: data.starHistory,
          firstStarDate: data.stars.firstStarDate,
          persona,
        }),
      })
      const jsonResult = await parseResponseJson(res, '生成 AI 报告失败') as unknown as AIReviewResult
      setCachedReviews(prev => ({ ...prev, [persona]: jsonResult }))
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error communicating with AI engine.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (cachedReviews[activePersona]) return
    let ignore = false
    const loadAiReview = async () => {
      setIsLoading(true)
      setErrorMsg('')
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            repo: data.repo,
            releases: data.releases,
            totalReleaseDownloads: data.totalReleaseDownloads,
            issueHealth: data.issueHealth,
            communityHealthScore: data.communityHealthScore,
            languages: data.languages,
            contributors: data.contributors,
            starHistory: data.starHistory,
            firstStarDate: data.stars.firstStarDate,
            persona: activePersona,
          }),
        })
        const jsonResult = await parseResponseJson(res, '生成 AI 评估报告失败') as unknown as AIReviewResult
        if (!ignore) setCachedReviews(prev => ({ ...prev, [activePersona]: jsonResult }))
      } catch (err) {
        if (!ignore) setErrorMsg(err instanceof Error ? err.message : 'Error communicating with AI engine.')
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }
    loadAiReview()
    return () => { ignore = true }
  }, [repoFullName, activePersona, cachedReviews])

  useEffect(() => {
    if (activeChatMessages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [activeChatMessages.length, isSendingChat])

  const handleSendChatMessage = async (presetText?: string) => {
    const textToSend = (presetText || chatInput).trim()
    if (!textToSend || isSendingChat) return

    const timeStr = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    const userMessage: ChatMessage = {
      id: createMessageId('usr'),
      role: 'user',
      content: textToSend,
      timestamp: timeStr,
    }
    const updatedHistory = [...activeChatMessages, userMessage]
    setChatHistories(prev => ({ ...prev, [activePersona]: updatedHistory }))
    setChatInput('')
    setIsSendingChat(true)

    try {
      const res = await fetch('/api/analyze/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo: data.repo,
          persona: activePersona,
          messages: updatedHistory.map(m => ({ role: m.role, content: m.content })),
          initialReview: activeReview,
          totalReleaseDownloads: data.totalReleaseDownloads,
        }),
      })
      const resJson = await parseResponseJson(res, '接收 AI 响应失败') as unknown as { reply: string }
      const assistantMessage: ChatMessage = {
        id: createMessageId('ast'),
        role: 'assistant',
        content: resJson.reply || '分析已生成。',
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      }
      setChatHistories(prev => ({ ...prev, [activePersona]: [...updatedHistory, assistantMessage] }))
    } catch (err) {
      const errorMessage: ChatMessage = {
        id: createMessageId('err'),
        role: 'assistant',
        content: `⚠️ 对话发送失败: ${err instanceof Error ? err.message : '网络通讯异常，请重试。'}`,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      }
      setChatHistories(prev => ({ ...prev, [activePersona]: [...updatedHistory, errorMessage] }))
    } finally {
      setIsSendingChat(false)
    }
  }

  const handleClearChatHistory = () => {
    setChatHistories(prev => ({ ...prev, [activePersona]: [] }))
  }

  const activePersonaObj = PERSONAS.find(p => p.key === activePersona)

  return (
    <div id="ai-review-section" className="bg-[#222427] border border-[var(--border-neutral-l1)] rounded-[10px] p-5 sm:p-6 shadow-xl space-y-5 scroll-mt-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-neutral-l1)] pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold font-mono text-[#D1D3DB] flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#32F08C]" />
            <span>AI 仓库深度评估报告</span>
            {activeReview?.provider && (
              <span className="px-2 py-0.5 text-[10px] font-mono bg-[var(--bg-brand-popup)] border border-[rgba(50,240,140,0.3)] text-[#32F08C] rounded font-semibold ml-2">
                {activeReview.provider}
              </span>
            )}
          </h3>
          <p className="text-xs text-[#9599A6] font-mono mt-0.5">
            由 DeepSeek AI 驱动 — 多维智能分析与项目性格诊断
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => { chatInputRef.current?.focus(); chatInputRef.current?.scrollIntoView({ behavior: 'smooth' }) }}
            className="ds-btn ds-btn--secondary text-xs font-mono flex items-center space-x-1.5"
            title="开启即时追问对话"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#32F08C]" />
            <span>我问一句</span>
          </button>
          <button
            onClick={() => forceRefresh(activePersona)}
            disabled={isLoading}
            className="ds-btn ds-btn--secondary text-xs font-mono flex items-center space-x-1.5"
            title="重新请求 AI 分析当前视角"
          >
            <RefreshCw className={clsx('w-3.5 h-3.5 text-[#32F08C]', isLoading && 'animate-spin')} />
            <span>重新生成评估</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {PERSONAS.map(p => {
          const isActive = activePersona === p.key
          const isAnalyzed = Boolean(cachedReviews[p.key])
          const messageCount = chatHistories[p.key]?.length || 0
          return (
            <button
              key={p.key}
              onClick={() => setActivePersona(p.key)}
              className={clsx(
                'p-3 rounded-md border text-left transition relative',
                isActive
                  ? 'bg-[var(--bg-brand-popup)] border-[#32F08C] text-[#32F08C] font-semibold'
                  : 'bg-[#1A1B1D] hover:bg-[var(--bg-overlay-l2)] border-[var(--border-neutral-l1)] text-[#9599A6] hover:text-[#D1D3DB]'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-base">{p.icon}</span>
                  <span className="text-xs font-mono truncate">{p.label}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {messageCount > 0 && (
                    <span className="px-1.5 py-0.2 text-[9px] bg-[#32F08C] text-[#0C0C0D] font-bold rounded-full">
                      {messageCount}
                    </span>
                  )}
                  {isAnalyzed ? (
                    <span className="w-2 h-2 rounded-full bg-[#32F08C] shadow-[0_0_6px_#32F08C]" title="已分析" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#666B75]" title="未分析" />
                  )}
                </div>
              </div>
              <p className="text-[10px] text-[#666B75] font-mono mt-1 line-clamp-1">{p.desc}</p>
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <div className="p-8 bg-[#1A1B1D] border border-[var(--border-neutral-l1)] rounded-md flex flex-col items-center justify-center space-y-3 text-center">
          <div className="p-3 bg-[var(--bg-brand-popup)] border border-[rgba(50,240,140,0.2)] rounded-full text-[#32F08C] animate-bounce">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-mono font-bold text-[#D1D3DB]">
              DeepSeek AI 正在智能生成项目深度评估报告...
            </h4>
            <p className="text-xs font-mono text-[#9599A6]">
              正在分析项目 Release 下载量、Issue 解决效率与工程健康度...
            </p>
          </div>
        </div>
      ) : errorMsg ? (
        <div className="p-4 bg-[var(--status-error-surface-l1)] border border-[var(--status-error-surface-l2)] rounded-md text-xs font-mono text-[var(--status-error-default)] flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      ) : activeReview ? (
        <div className="space-y-4">
          <div className="p-5 bg-[#1A1B1D] border border-[var(--border-neutral-l2)] rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#32F08C] font-bold">
                  项目性格画像
                </span>
                <span className="text-[#666B75]">•</span>
                <span className="text-xs font-mono text-[#9599A6]">{activeReview.oneLineSummary}</span>
              </div>
              <h4 className="text-xl sm:text-2xl font-bold font-mono text-[#D1D3DB]">
                &ldquo;{activeReview.projectPersonality}&rdquo;
              </h4>
            </div>

            <div className="flex items-center space-x-3 shrink-0 self-start sm:self-auto">
              <div className="text-right">
                <div className="text-[10px] font-mono uppercase text-[#666B75]">评级结果</div>
                <div className="text-xs font-mono text-[#32F08C]">{activeReview.healthScore} / 100 健康评分</div>
              </div>
              <div className="px-4 py-1.5 bg-[#32F08C] text-[#0C0C0D] font-black text-2xl font-mono rounded">
                {activeReview.grade}
              </div>
            </div>
          </div>

          {activeReview.roastComment && (
            <div className="p-4 bg-[#1A1B1D] border border-[var(--border-neutral-l2)] rounded-md text-xs font-mono text-[#D1D3DB] flex items-start space-x-3">
              <Terminal className="w-4 h-4 text-[#32F08C] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-[#32F08C]">评审员即时点评</span>
                <p className="italic text-[#9599A6]">&ldquo;{activeReview.roastComment}&rdquo;</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#1A1B1D] border border-[var(--border-neutral-l1)] rounded-md space-y-2">
              <h5 className="text-xs font-mono font-bold uppercase text-[#33C192] flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>核心优势与亮点</span>
              </h5>
              <ul className="space-y-1.5 text-xs text-[#9599A6] font-mono">
                {activeReview.keyStrengths.map((str, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-[#33C192] font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-[#1A1B1D] border border-[var(--border-neutral-l1)] rounded-md space-y-2">
              <h5 className="text-xs font-mono font-bold uppercase text-[var(--status-error-default)] flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>待改进区域与潜在风险</span>
              </h5>
              <ul className="space-y-1.5 text-xs text-[#9599A6] font-mono">
                {activeReview.frictionPoints.map((fric, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-[var(--status-error-default)] font-bold">•</span>
                    <span>{fric}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-4 bg-[#1A1B1D] border border-[var(--border-neutral-l1)] rounded-md space-y-3">
            <h5 className="text-xs font-mono uppercase tracking-wider text-[#D1D3DB] font-bold">
              AI 执行总监评估结论
            </h5>
            <p className="text-xs text-[#9599A6] leading-relaxed font-mono whitespace-pre-line">
              {activeReview.executiveVerdict}
            </p>

            <div className="pt-3 border-t border-[var(--border-neutral-l1)] flex items-start space-x-2 text-xs font-mono text-[#33C192] bg-[var(--status-success-surface-l1)] p-3 rounded border border-[rgba(0,165,110,0.3)]">
              <Zap className="w-4 h-4 text-[#33C192] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase text-[#33C192]">可落地的优化建议：</span>
                <span>{activeReview.recommendedAction}</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="pt-4 border-t border-[var(--border-neutral-l1)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-[#32F08C]" />
            <h4 className="text-xs font-mono font-bold text-[#D1D3DB]">
              向【{activePersonaObj?.label || '当前视角'}】即时追问 (Q&A)
            </h4>
          </div>

          {activeChatMessages.length > 0 && (
            <button
              onClick={handleClearChatHistory}
              className="text-[10px] font-mono text-[#666B75] hover:text-[var(--status-error-default)] flex items-center space-x-1 transition"
              title="清空当前视角对话记录"
            >
              <Trash2 className="w-3 h-3" />
              <span>清空记录</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {PRESET_QUESTIONS[activePersona]?.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendChatMessage(q)}
              disabled={isSendingChat}
              className="px-2.5 py-1 text-[11px] font-mono bg-[#1A1B1D] hover:bg-[#2A2C30] border border-[var(--border-neutral-l1)] hover:border-[#32F08C] text-[#9599A6] hover:text-[#32F08C] rounded transition text-left line-clamp-1 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        {activeChatMessages.length > 0 && (
          <div className="max-h-72 overflow-y-auto space-y-2.5 p-3 bg-[#1A1B1D] border border-[var(--border-neutral-l1)] rounded-md">
            {activeChatMessages.map(msg => (
              <div
                key={msg.id}
                className={clsx(
                  'flex items-start space-x-2.5 text-xs font-mono',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded bg-[var(--bg-brand-popup)] border border-[rgba(50,240,140,0.3)] text-[#32F08C] flex items-center justify-center shrink-0 mt-0.5 text-xs">
                    {activePersonaObj?.icon || '🤖'}
                  </div>
                )}
                <div
                  className={clsx(
                    'p-3 rounded-lg max-w-[85%] leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-[#32F08C] text-[#0C0C0D] font-medium'
                      : 'bg-[#222427] border border-[var(--border-neutral-l2)] text-[#D1D3DB]'
                  )}
                >
                  <div className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                  <div className={clsx('text-[9px] mt-1 text-right opacity-60', msg.role === 'user' ? 'text-[#0C0C0D]' : 'text-[#666B75]')}>
                    {msg.timestamp}
                  </div>
                </div>
                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded bg-[#2A2C30] border border-[var(--border-neutral-l1)] text-[#D1D3DB] flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-[#32F08C]" />
                  </div>
                )}
              </div>
            ))}
            {isSendingChat && (
              <div className="flex items-center space-x-2 text-xs font-mono text-[#32F08C] p-2 bg-[#222427] rounded-md border border-[var(--border-neutral-l1)] w-fit">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>【{activePersonaObj?.label}】思考思考中...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSendChatMessage() }} className="flex items-center space-x-2">
          <input
            ref={chatInputRef}
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={`问问【${activePersonaObj?.label}】：例如"这个项目的架构还有哪些隐患？"`}
            disabled={isSendingChat}
            className="flex-1 bg-[#1A1B1D] border border-[var(--border-neutral-l1)] focus:border-[#32F08C] rounded-md px-3 py-2 text-xs font-mono text-[#D1D3DB] placeholder-[#666B75] outline-none transition disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!chatInput.trim() || isSendingChat}
            className="ds-btn ds-btn--primary text-xs font-mono flex items-center space-x-1.5 px-4 py-2 shrink-0 disabled:opacity-50"
          >
            {isSendingChat ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>发送提问</span>
          </button>
        </form>
      </div>
    </div>
  )
}
