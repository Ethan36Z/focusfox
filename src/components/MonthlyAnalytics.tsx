import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { CompletedSession } from '../types/focus'
import {
  getDistractionDurationSeconds,
  getDistractionReasonLabel,
} from '../utils/reasons'
import {
  getActualDurationSeconds,
  getDistractedSeconds,
  getNetFocusSeconds,
  getPlannedDurationSeconds,
  getReportedFocusPercent,
} from '../utils/sessionMetrics'
import { formatTime } from '../utils/time'

interface MonthlyAnalyticsProps {
  sessions: CompletedSession[]
}

function getMonthValue(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function getSessionMonth(session: CompletedSession) {
  return getMonthValue(new Date(session.completedAt))
}

function getDaysInMonth(monthValue: string) {
  const [year, month] = monthValue.split('-').map(Number)
  return new Date(year, month, 0).getDate()
}

function formatHoursMinutes(totalSeconds: number) {
  const totalMinutes = Math.round(totalSeconds / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) {
    return `${minutes}m`
  }

  return `${hours}h ${minutes}m`
}

export function MonthlyAnalytics({ sessions }: MonthlyAnalyticsProps) {
  const [selectedMonth, setSelectedMonth] = useState(getMonthValue())
  const monthlySessions = sessions.filter(
    (session) => getSessionMonth(session) === selectedMonth,
  )
  const reasonTotals = new Map<string, { count: number; durationSeconds: number }>()
  const dailyFocusSeconds = Array.from(
    { length: getDaysInMonth(selectedMonth) },
    (_, index) => ({
      day: String(index + 1),
      focusMinutes: 0,
    }),
  )

  let totalActualFocusSeconds = 0
  let totalNetFocusSeconds = 0
  let totalDistractedSeconds = 0
  let totalPlannedSeconds = 0
  let totalEpisodes = 0
  let reportedFocusTotal = 0

  monthlySessions.forEach((session) => {
    const sessionActualSeconds = getActualDurationSeconds(session)
    const sessionDistractedSeconds = getDistractedSeconds(session)
    const sessionNetSeconds = getNetFocusSeconds(session)
    const sessionPlannedSeconds = getPlannedDurationSeconds(session)
    const completedAt = new Date(session.completedAt)
    const dayIndex = completedAt.getDate() - 1

    totalActualFocusSeconds += sessionActualSeconds
    totalNetFocusSeconds += sessionNetSeconds
    totalDistractedSeconds += sessionDistractedSeconds
    totalPlannedSeconds += sessionPlannedSeconds
    totalEpisodes += session.distractions.length
    reportedFocusTotal += getReportedFocusPercent(session)

    if (dailyFocusSeconds[dayIndex]) {
      dailyFocusSeconds[dayIndex].focusMinutes += Math.round(
        sessionActualSeconds / 60,
      )
    }

    session.distractions.forEach((distraction) => {
      const reason = getDistractionReasonLabel(distraction)
      const current = reasonTotals.get(reason) ?? {
        count: 0,
        durationSeconds: 0,
      }

      reasonTotals.set(reason, {
        count: current.count + 1,
        durationSeconds:
          current.durationSeconds + getDistractionDurationSeconds(distraction),
      })
    })
  })

  const averageReportedFocus =
    monthlySessions.length === 0
      ? 0
      : Math.round(reportedFocusTotal / monthlySessions.length)
  const followThroughRatio =
    totalPlannedSeconds === 0
      ? 0
      : Math.round((totalActualFocusSeconds / totalPlannedSeconds) * 100)
  const rankedReasons = Array.from(reasonTotals, ([reason, data]) => ({
    reason,
    count: data.count,
    durationSeconds: data.durationSeconds,
  })).sort((a, b) => b.durationSeconds - a.durationSeconds || b.count - a.count)
  const topReason = rankedReasons[0]
  const topReasonSeconds = Math.max(1, topReason?.durationSeconds ?? 0)

  return (
    <section className="panel analytics-panel" aria-labelledby="analytics-title">
      <div className="analytics-heading">
        <div>
          <p className="eyebrow">Monthly rhythm</p>
          <h2 id="analytics-title">Monthly analytics</h2>
        </div>
        <label className="month-selector">
          <span>Month</span>
          <input
            onChange={(event) =>
              setSelectedMonth(event.target.value || getMonthValue())
            }
            type="month"
            value={selectedMonth}
          />
        </label>
      </div>

      {monthlySessions.length === 0 ? (
        <p className="analytics-empty">
          No completed focus sessions for this month yet.
        </p>
      ) : (
        <>
          <div className="analytics-metrics">
            <div>
              <strong>{monthlySessions.length}</strong>
              <span>sessions</span>
            </div>
            <div>
              <strong>{formatHoursMinutes(totalActualFocusSeconds)}</strong>
              <span>actual focus time</span>
            </div>
            <div>
              <strong>{formatHoursMinutes(totalNetFocusSeconds)}</strong>
              <span>net focus time</span>
            </div>
            <div>
              <strong>{formatTime(totalDistractedSeconds)}</strong>
              <span>distracted time</span>
            </div>
            <div title="Based on recorded distraction time.">
              <strong>{averageReportedFocus}%</strong>
              <span>average reported focus</span>
            </div>
            <div>
              <strong>{followThroughRatio}%</strong>
              <span>follow-through</span>
            </div>
            <div>
              <strong>{totalEpisodes}</strong>
              <span>episodes</span>
            </div>
          </div>

          <p className="analytics-note">
            Actual focus time powers the chart and reported focus uses actual
            time minus recorded distraction time.
          </p>

          <div className="analytics-chart">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={dailyFocusSeconds}
                margin={{ top: 12, right: 12, left: -18, bottom: 0 }}
              >
                <CartesianGrid stroke="#d7eee9" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis
                  allowDecimals={false}
                  tickFormatter={(value) => `${value}m`}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(104, 174, 164, 0.12)' }}
                  formatter={(value) => [`${value} minutes`, 'Focus time']}
                  labelFormatter={(label) => `Day ${label}`}
                  contentStyle={{
                    border: '1px solid #cfe7df',
                    borderRadius: 14,
                    boxShadow: '0 14px 34px rgba(69, 104, 96, 0.16)',
                  }}
                />
                <Bar dataKey="focusMinutes" fill="#8bbfd6" radius={[8, 8, 3, 3]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="reason-summary">
            <h3>Top distraction reasons</h3>
            {rankedReasons.length === 0 ? (
              <p>No distraction episodes recorded this month.</p>
            ) : (
              <ol>
                {rankedReasons.slice(0, 5).map((reason) => (
                  <li key={reason.reason}>
                    <span
                      aria-hidden="true"
                      className="reason-summary-fill"
                      style={{
                        width: `${Math.max(
                          6,
                          (reason.durationSeconds / topReasonSeconds) * 100,
                        )}%`,
                      }}
                    />
                    <span className="reason-summary-name">{reason.reason}</span>
                    <span className="reason-summary-value">
                      {formatTime(reason.durationSeconds)} - {reason.count}{' '}
                      episodes
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </>
      )}
    </section>
  )
}
