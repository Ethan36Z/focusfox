import { useState } from 'react'
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

function formatTooltipTime(totalSeconds: number) {
  if (totalSeconds < 60) {
    return `${Math.round(totalSeconds)}s`
  }

  return formatHoursMinutes(totalSeconds)
}

export function MonthlyAnalytics({ sessions }: MonthlyAnalyticsProps) {
  const [selectedMonth, setSelectedMonth] = useState(getMonthValue())
  const monthlySessions = sessions.filter(
    (session) => getSessionMonth(session) === selectedMonth,
  )
  const reasonTotals = new Map<string, { count: number; durationSeconds: number }>()
  const dailyTotals = Array.from(
    { length: getDaysInMonth(selectedMonth) },
    (_, index) => ({
      day: String(index + 1),
      distractedSeconds: 0,
      focusSeconds: 0,
      sessionSeconds: 0,
    }),
  )

  let totalSessionSeconds = 0
  let totalFocusSeconds = 0
  let totalPlannedSeconds = 0
  let reportedFocusTotal = 0

  monthlySessions.forEach((session) => {
    const sessionSeconds = getActualDurationSeconds(session)
    const sessionDistractedSeconds = getDistractedSeconds(session)
    const sessionFocusSeconds = getNetFocusSeconds(session)
    const sessionPlannedSeconds = getPlannedDurationSeconds(session)
    const completedAt = new Date(session.completedAt)
    const dayIndex = completedAt.getDate() - 1

    totalSessionSeconds += sessionSeconds
    totalFocusSeconds += sessionFocusSeconds
    totalPlannedSeconds += sessionPlannedSeconds
    reportedFocusTotal += getReportedFocusPercent(session)

    if (dailyTotals[dayIndex]) {
      dailyTotals[dayIndex].sessionSeconds += sessionSeconds
      dailyTotals[dayIndex].focusSeconds += sessionFocusSeconds
      dailyTotals[dayIndex].distractedSeconds += sessionDistractedSeconds
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
      : Math.round((totalSessionSeconds / totalPlannedSeconds) * 100)
  const rankedReasons = Array.from(reasonTotals, ([reason, data]) => ({
    reason,
    count: data.count,
    durationSeconds: data.durationSeconds,
  })).sort((a, b) => b.durationSeconds - a.durationSeconds || b.count - a.count)
  const topReason = rankedReasons[0]
  const topReasonSeconds = Math.max(1, topReason?.durationSeconds ?? 0)
  const maxDailySessionSeconds = Math.max(
    1,
    ...dailyTotals.map((day) => day.sessionSeconds),
  )

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
              <strong>{formatHoursMinutes(totalSessionSeconds)}</strong>
              <span>session time</span>
            </div>
            <div>
              <strong>{formatHoursMinutes(totalFocusSeconds)}</strong>
              <span>focus time</span>
            </div>
            <div title="Based on recorded distraction time.">
              <strong>{averageReportedFocus}%</strong>
              <span>average reported focus</span>
            </div>
          </div>

          <p className="analytics-note">
            Focus time is session time minus recorded distractions. Follow-through
            this month is {followThroughRatio}% of planned time.
          </p>

          <div className="analytics-chart" aria-label="Daily session and focus time">
            <div className="analytics-chart-legend" aria-hidden="true">
              <span className="legend-session">Session time</span>
              <span className="legend-focus">Focus time</span>
            </div>
            <div className="daily-bars">
              {dailyTotals.map((day) => {
                const hasSession = day.sessionSeconds > 0
                const sessionHeight = hasSession
                  ? Math.max(10, (day.sessionSeconds / maxDailySessionSeconds) * 100)
                  : 0
                const focusHeight =
                  day.focusSeconds > 0
                    ? Math.max(6, (day.focusSeconds / day.sessionSeconds) * 100)
                    : 0
                const reportedFocus = hasSession
                  ? Math.round((day.focusSeconds / day.sessionSeconds) * 100)
                  : 0

                return (
                  <div
                    className="daily-bar-item"
                    key={day.day}
                    tabIndex={hasSession ? 0 : -1}
                  >
                    <div className="daily-bar-track">
                      <span
                        aria-hidden="true"
                        className="daily-bar-session"
                        style={{ height: `${sessionHeight}%` }}
                      >
                        <span
                          className="daily-bar-focus"
                          style={{ height: `${focusHeight}%` }}
                        />
                      </span>
                    </div>
                    <span className="daily-bar-label">{day.day}</span>
                    {hasSession && (
                      <div className="daily-bar-tooltip" role="tooltip">
                        <strong>Day {day.day}</strong>
                        <span>Session time: {formatTooltipTime(day.sessionSeconds)}</span>
                        <span>Focus time: {formatTooltipTime(day.focusSeconds)}</span>
                        <span>
                          Distracted time: {formatTooltipTime(day.distractedSeconds)}
                        </span>
                        <span>Reported focus: {reportedFocus}%</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
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
