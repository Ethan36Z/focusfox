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
import { DISTRACTION_REASONS } from '../types/focus'
import {
  getDistractionDurationSeconds,
  getDistractionEndSeconds,
  getDistractionReasonLabel,
  getDistractionStartSeconds,
} from '../utils/reasons'
import { formatTime } from '../utils/time'

interface SessionStatsProps {
  session: CompletedSession
}

export function SessionStats({ session }: SessionStatsProps) {
  const normalizedDistractions = session.distractions.map((distraction) => ({
    id: distraction.id,
    reason: getDistractionReasonLabel(distraction),
    startSeconds: getDistractionStartSeconds(distraction),
    endSeconds: getDistractionEndSeconds(distraction),
    durationSeconds: getDistractionDurationSeconds(distraction),
  }))
  const totals = new Map<string, { count: number; durationSeconds: number }>(
    DISTRACTION_REASONS.map((reason) => [
      reason,
      { count: 0, durationSeconds: 0 },
    ]),
  )

  normalizedDistractions.forEach((distraction) => {
    const current = totals.get(distraction.reason) ?? {
      count: 0,
      durationSeconds: 0,
    }

    totals.set(distraction.reason, {
      count: current.count + 1,
      durationSeconds: current.durationSeconds + distraction.durationSeconds,
    })
  })

  const chartData = Array.from(totals, ([reason, data]) => ({
    reason,
    count: data.count,
    durationSeconds: data.durationSeconds,
    duration: formatTime(data.durationSeconds),
  }))
  const timelineDistractions = normalizedDistractions.filter(
    (distraction) => distraction.durationSeconds > 0,
  )

  return (
    <section className="panel stats-panel" aria-labelledby="stats-title">
      <div>
        <p className="eyebrow">Details</p>
        <h2 id="stats-title">Distraction time by reason</h2>
      </div>

      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="#d7eee9" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="reason" tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: 'rgba(104, 174, 164, 0.12)' }}
              formatter={(value, name, item) => {
                if (name === 'durationSeconds') {
                  return [
                    `${formatTime(Number(value))} across ${item.payload.count} episodes`,
                    'Duration',
                  ]
                }

                return [value, name]
              }}
              contentStyle={{
                border: '1px solid #cfe7df',
                borderRadius: 14,
                boxShadow: '0 14px 34px rgba(69, 104, 96, 0.16)',
              }}
            />
            <Bar dataKey="durationSeconds" fill="#68aea4" radius={[10, 10, 4, 4]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="timeline-section">
        <div className="timeline-heading">
          <h3>Focus timeline</h3>
          <span>
            {formatTime(0)} - {formatTime(session.totalSeconds)}
          </span>
        </div>

        <div className="focus-timeline" aria-label="Focus timeline">
          {timelineDistractions.length === 0 ? (
            <p className="timeline-empty">No timed episodes for this session.</p>
          ) : (
            timelineDistractions.map((distraction) => {
              const left = Math.min(
                100,
                Math.max(0, (distraction.startSeconds / session.totalSeconds) * 100),
              )
              const width = Math.min(
                100 - left,
                Math.max(
                  1.5,
                  (distraction.durationSeconds / session.totalSeconds) * 100,
                ),
              )

              return (
                <span
                  className="timeline-segment"
                  key={distraction.id}
                  style={{ left: `${left}%`, width: `${width}%` }}
                  title={`${distraction.reason}: ${formatTime(
                    distraction.startSeconds,
                  )} - ${formatTime(distraction.endSeconds)}`}
                >
                  {distraction.reason}
                </span>
              )
            })
          )}
        </div>
      </div>

      <div className="details-table-wrap">
        <table className="details-table">
          <thead>
            <tr>
              <th>Reason</th>
              <th>Start</th>
              <th>End</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {normalizedDistractions.length === 0 ? (
              <tr>
                <td colSpan={4}>No distraction episodes recorded.</td>
              </tr>
            ) : (
              normalizedDistractions.map((distraction) => (
                <tr key={distraction.id}>
                  <td>{distraction.reason}</td>
                  <td>{formatTime(distraction.startSeconds)}</td>
                  <td>{formatTime(distraction.endSeconds)}</td>
                  <td>{formatTime(distraction.durationSeconds)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
