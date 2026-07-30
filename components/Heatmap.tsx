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

const DAY_LABELS = ['', '一', '', '三', '', '五', '']

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

  // Pad start of first week
  const startDate = new Date(cells[0].date + 'T00:00:00')
  const startDayOfWeek = startDate.getDay()
  const padStart: typeof cells[number][] = []
  for (let i = 0; i < startDayOfWeek; i++) {
    padStart.push({ date: '', count: 0, level: 0 })
  }

  const allCells = [...padStart, ...cells]

  // Group into weeks
  const weeks: (typeof cells)[] = []
  for (let i = 0; i < allCells.length; i += 7) {
    const week = allCells.slice(i, i + 7)
    // Pad incomplete weeks
    while (week.length < 7) {
      week.push({ date: '', count: 0, level: 0 })
    }
    weeks.push(week)
  }

  // Split weeks into 2 bands (first half / second half)
  const mid = Math.ceil(weeks.length / 2)
  const bands = [weeks.slice(0, mid), weeks.slice(mid)]

  // Month labels for each band
  const bandMonthLabels = bands.map(bandWeeks => {
    const labels: { label: string; weekIdx: number }[] = []
    let lastMonth = ''
    for (let w = 0; w < bandWeeks.length; w++) {
      for (let d = 0; d < bandWeeks[w].length; d++) {
        const cell = bandWeeks[w][d]
        if (cell.date) {
          const m = getMonthLabel(cell.date)
          if (m !== lastMonth) {
            labels.push({ label: m, weekIdx: w })
            lastMonth = m
          }
          break
        }
      }
    }
    return labels
  })

  function renderBand(bandWeeks: typeof weeks, monthLabels: { label: string; weekIdx: number }[], bandSize: number) {
    return (
      <div className="space-y-1">
        {/* Month labels row */}
        <div className="flex">
          <div className="w-5 shrink-0 sm:w-6" />
          <div className="flex flex-1">
            {monthLabels.map((ml, i) => {
              const nextIdx = i + 1 < monthLabels.length ? monthLabels[i + 1].weekIdx : bandWeeks.length
              const span = Math.max(1, nextIdx - ml.weekIdx)
              return (
                <div
                  key={ml.label}
                  className="text-[9px] sm:text-[10px] font-mono text-[#9599A6]"
                  style={{ flex: `0 0 ${(span / bandWeeks.length) * 100}%` }}
                >
                  {ml.label}
                </div>
              )
            })}
          </div>
        </div>

        {/* Grid: 7 rows × N columns */}
        <div className="flex">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] w-5 shrink-0 sm:w-6 pt-[1px]">
            {DAY_LABELS.map((label, i) => (
              <div key={i} className="flex-1 flex items-center">
                <span className="text-[8px] sm:text-[9px] font-mono text-[#9599A6] leading-none">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Cells */}
          <div className="flex gap-[3px] flex-1">
            {bandWeeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px] flex-1 min-w-0">
                {week.map((cell, di) => (
                  <div
                    key={`${wi}-${di}`}
                    className="w-full aspect-square rounded-[2px]"
                    style={{
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
    )
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

      {/* Desktop */}
      <div className="hidden sm:flex flex-col gap-5 flex-1">
        {bands.map((bandWeeks, bi) => (
          <div key={bi}>
            {renderBand(bandWeeks, bandMonthLabels[bi], bands[bi].length)}
          </div>
        ))}
      </div>

      {/* Mobile */}
      <div className="sm:hidden flex flex-col gap-3 flex-1">
        {bands.map((bandWeeks, bi) => (
          <div key={bi}>
            {renderBand(bandWeeks, bandMonthLabels[bi], bands[bi].length)}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 mt-4 pt-3 border-t border-[var(--border-neutral-l1)]">
        <span className="text-[9px] font-mono text-[#9599A6] mr-1">少</span>
        {[0, 1, 2, 3, 4].map(level => (
          <div
            key={level}
            className="w-3 h-3 rounded-[1px]"
            style={{ backgroundColor: getColor(level as 0 | 1 | 2 | 3 | 4) }}
            title={`Level ${level}`}
          />
        ))}
        <span className="text-[9px] font-mono text-[#9599A6] ml-1">多</span>
      </div>
    </div>
  )
}
