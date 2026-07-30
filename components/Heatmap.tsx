'use client'

import { HeatmapData } from '@/types'

interface HeatmapProps {
  data: HeatmapData
}

function getColor(level: 0 | 1 | 2 | 3 | 4): string {
  switch (level) {
    case 0: return '#1A1B1D'
    case 1: return 'rgba(56, 189, 248, 0.15)'
    case 2: return 'rgba(56, 189, 248, 0.30)'
    case 3: return 'rgba(56, 189, 248, 0.55)'
    case 4: return 'rgba(56, 189, 248, 0.80)'
  }
}

function getMonthLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const labels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  return labels[d.getMonth()]
}

export function Heatmap({ data }: HeatmapProps) {
  if (data.cells.length === 0) {
    return (
      <div className="bg-[#222427] border border-[var(--border-neutral-l1)] rounded-[10px] p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-4 border-b border-[var(--border-neutral-l1)] pb-3">
          <div className="w-8 h-8 rounded-lg bg-[rgba(56,189,248,0.15)] flex items-center justify-center">
            <svg className="w-4 h-4 text-[#38BDF8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
          </div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#D1D3DB] font-semibold">
            项目提交日历
          </h3>
        </div>
        <p className="text-xs font-mono text-[#9599A6] text-center py-8">暂无提交活动数据</p>
      </div>
    )
  }

  const cells = data.cells

  // Group by week (7 rows × N columns)
  const startDate = new Date(cells[0].date + 'T00:00:00')
  const startDayOfWeek = startDate.getDay()

  // Pad start of first week
  const padStart: typeof cells[number][] = []
  for (let i = 0; i < startDayOfWeek; i++) {
    padStart.push({ date: '', count: 0, level: 0 })
  }

  const allCells = [...padStart, ...cells]
  const weeks: (typeof cells)[] = []
  for (let i = 0; i < allCells.length; i += 7) {
    weeks.push(allCells.slice(i, i + 7))
  }

  // Month labels - track which week columns start a new month
  const monthLabels: { label: string; weekIdx: number }[] = []
  let lastMonth = ''
  for (let w = 0; w < weeks.length; w++) {
    for (let d = 0; d < weeks[w].length; d++) {
      const cell = weeks[w][d]
      if (cell.date) {
        const m = getMonthLabel(cell.date)
        if (m !== lastMonth) {
          monthLabels.push({ label: m, weekIdx: w })
          lastMonth = m
        }
        break
      }
    }
  }

  // Pad end of last week if incomplete
  const lastWeek = weeks[weeks.length - 1]
  if (lastWeek && lastWeek.length < 7) {
    for (let i = lastWeek.length; i < 7; i++) {
      lastWeek.push({ date: '', count: 0, level: 0 })
    }
  }

  return (
    <div className="bg-[#222427] border border-[var(--border-neutral-l1)] rounded-[10px] p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4 border-b border-[var(--border-neutral-l1)] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[rgba(56,189,248,0.15)] flex items-center justify-center">
            <svg className="w-4 h-4 text-[#38BDF8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
          </div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#D1D3DB] font-semibold">
            项目提交日历
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[#9599A6]">
          {data.totalCommits.toLocaleString()} commits
        </span>
      </div>

      {/* Desktop: GitHub-style grid (7 rows × ~52 cols), fills card */}
      <div className="hidden sm:block">
        {/* Month labels row */}
        <div className="flex mb-1.5">
          <div className="w-5 shrink-0" />
          <div className="flex flex-1">
            {monthLabels.map((ml, i) => {
              const nextIdx = i + 1 < monthLabels.length ? monthLabels[i + 1].weekIdx : weeks.length
              const span = nextIdx - ml.weekIdx
              return (
                <div
                  key={ml.label}
                  className="text-[9px] font-mono text-[#9599A6]"
                  style={{ flex: `0 0 ${span * 100 / weeks.length}%` }}
                >
                  {ml.label}
                </div>
              )
            })}
          </div>
        </div>

        {/* Grid: rows = days, cols = weeks */}
        <div className="flex" style={{ minHeight: 84 }}>
          {/* Day labels column */}
          <div className="flex flex-col gap-[3px] w-5 shrink-0 pt-[2px]">
            {['', '一', '', '三', '', '五', ''].map((label, i) => (
              <span key={i} className="h-3 flex items-center text-[9px] font-mono text-[#9599A6] leading-none">
                {label}
              </span>
            ))}
          </div>

          {/* Cell grid */}
          <div className="flex gap-[3px] flex-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px] flex-1 min-w-0">
                {week.map((cell, di) => (
                  <div
                    key={`${wi}-${di}`}
                    className="w-full rounded-[2px]"
                    style={{
                      height: 12,
                      backgroundColor: cell.date ? getColor(cell.level) : 'transparent',
                    }}
                    title={cell.date ? `${cell.date}: ${cell.count} commits` : ''}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: same grid, larger cells */}
      <div className="sm:hidden">
        {/* Month labels */}
        <div className="flex mb-1">
          <div className="w-4 shrink-0" />
          <div className="flex flex-1">
            {monthLabels.map((ml, i) => {
              const nextIdx = i + 1 < monthLabels.length ? monthLabels[i + 1].weekIdx : weeks.length
              const span = nextIdx - ml.weekIdx
              return (
                <div
                  key={ml.label}
                  className="text-[7px] font-mono text-[#9599A6]"
                  style={{ flex: `0 0 ${span * 100 / weeks.length}%` }}
                >
                  {ml.label}
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex" style={{ minHeight: 64 }}>
          <div className="flex flex-col gap-[2px] w-4 shrink-0 pt-px">
            {['', '一', '', '三', '', '五', ''].map((label, i) => (
              <span key={i} className="h-[8px] flex items-center text-[7px] font-mono text-[#9599A6] leading-none">
                {label}
              </span>
            ))}
          </div>
          <div className="flex gap-[2px] flex-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[2px] flex-1 min-w-0">
                {week.map((cell, di) => (
                  <div
                    key={`${wi}-${di}`}
                    className="w-full rounded-[1px]"
                    style={{
                      height: 8,
                      backgroundColor: cell.date ? getColor(cell.level) : 'transparent',
                    }}
                    title={cell.date ? `${cell.date}: ${cell.count} commits` : ''}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1 mt-3">
        <span className="text-[9px] font-mono text-[#9599A6] mr-1">少</span>
        {[0, 1, 2, 3, 4].map(level => (
          <div
            key={level}
            className="w-2.5 h-2.5 rounded-[1px]"
            style={{ backgroundColor: getColor(level as 0 | 1 | 2 | 3 | 4) }}
            title={`Level ${level}`}
          />
        ))}
        <span className="text-[9px] font-mono text-[#9599A6] ml-1">多</span>
      </div>
    </div>
  )
}
