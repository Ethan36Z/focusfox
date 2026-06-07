import type { CompletedSession } from '../types/focus'
import { DISTRACTION_REASONS } from '../types/focus'
import {
  getDistractionDurationSeconds,
  getDistractionEndSeconds,
  getDistractionReasonLabel,
  getDistractionStartSeconds,
} from '../utils/reasons'
import {
  getPlannedDurationSeconds,
} from '../utils/sessionMetrics'
import { formatTime } from '../utils/time'

interface SessionStatsProps {
  session: CompletedSession
}

export function SessionStats({ session }: SessionStatsProps) {
  const totalSeconds = Math.max(
    1,
    session.actualDurationSeconds ?? getPlannedDurationSeconds(session),
  )
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

  const reasonSummaries = Array.from(totals, ([reason, data]) => ({
    reason,
    count: data.count,
    durationSeconds: data.durationSeconds,
  })).filter((item) => item.durationSeconds > 0)
  reasonSummaries.sort(
    (a, b) => b.durationSeconds - a.durationSeconds || b.count - a.count,
  )
  const distractedSeconds = normalizedDistractions.reduce(
    (total, distraction) => total + distraction.durationSeconds,
    0,
  )
  const netFocusSeconds = Math.max(0, totalSeconds - distractedSeconds)
  const reportedFocus = Math.round((netFocusSeconds / totalSeconds) * 100)
  const focusedPercent = Math.max(
    0,
    Math.min(100, (netFocusSeconds / totalSeconds) * 100),
  )
  const distractedPercent = Math.max(0, Math.min(100, 100 - focusedPercent))
  const topReason = reasonSummaries[0]?.reason ?? 'None'
  const timelineDistractions = normalizedDistractions.filter(
    (distraction) => distraction.durationSeconds > 0,
  )
  const timelineLanes = Array.from(
    timelineDistractions.reduce((lanes, distraction) => {
      const distractions = lanes.get(distraction.reason) ?? []
      distractions.push(distraction)
      lanes.set(distraction.reason, distractions)
      return lanes
    }, new Map<string, typeof timelineDistractions>()),
    ([reason, distractions]) => ({ reason, distractions }),
  )
  const timelineTicks = [0, 0.25, 0.5, 0.75, 1].map((position) => ({
    position,
    label: formatTime(totalSeconds * position),
  }))

  return (
    <section className="panel stats-panel" aria-labelledby="stats-title">
      <div>
        <p className="eyebrow">Details</p>
        <h2 id="stats-title">Session overview</h2>
        <p className="helper-copy">
          {session.status === 'stopped' ? 'Stopped' : 'Completed'} session -{' '}
          {formatTime(totalSeconds)} actual duration
        </p>
      </div>

      <div className="session-overview">
        <div className="overview-metrics" aria-label="Session overview metrics">
          <span>
            <strong>{formatTime(totalSeconds)}</strong>
            actual duration
          </span>
          <span>
            <strong>{formatTime(netFocusSeconds)}</strong>
            net focus
          </span>
          <span>
            <strong>{formatTime(distractedSeconds)}</strong>
            distracted
          </span>
          <span>
            <strong>{reportedFocus}%</strong>
            reported focus
          </span>
          <span>
            <strong>{topReason}</strong>
            top reason
          </span>
        </div>

        <div
          aria-label={`Focus composition: ${formatTime(
            netFocusSeconds,
          )} focused, ${formatTime(distractedSeconds)} distracted.`}
          className="focus-composition"
          role="img"
        >
          <span
            className="focus-composition-net"
            style={{ width: `${focusedPercent}%` }}
          />
          <span
            className="focus-composition-distracted"
            style={{ width: `${distractedPercent}%` }}
          />
        </div>

        {reasonSummaries.length === 0 ? (
          <p className="overview-empty">
            No distractions recorded for this session.
          </p>
        ) : (
          <div className="overview-reason-list" aria-label="Distraction reasons">
            {reasonSummaries.map((reason) => (
              <span className="overview-reason-chip" key={reason.reason}>
                <strong>{reason.reason}</strong>
                {formatTime(reason.durationSeconds)} - {reason.count}{' '}
                {reason.count === 1 ? 'episode' : 'episodes'}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="timeline-section">
        <div className="timeline-heading">
          <h3>Focus timeline</h3>
          <span>
            {formatTime(0)} - {formatTime(totalSeconds)}
          </span>
        </div>

        <div className="timeline-lanes" aria-label="Focus timeline by reason">
          {timelineLanes.length === 0 ? (
            <p className="timeline-empty">
              No distraction episodes recorded for this session.
            </p>
          ) : (
            timelineLanes.map((lane) => (
              <div className="timeline-lane" key={lane.reason}>
                <span className="timeline-lane-label">{lane.reason}</span>
                <div className="timeline-lane-track">
                  {timelineTicks.map((tick) => (
                    <span
                      className="timeline-tick"
                      key={tick.position}
                      style={{ left: `${tick.position * 100}%` }}
                    />
                  ))}
                  {lane.distractions.map((distraction) => {
                    const left = Math.min(
                      100,
                      Math.max(
                        0,
                        (distraction.startSeconds / totalSeconds) * 100,
                      ),
                    )
                    const naturalWidth =
                      (distraction.durationSeconds / totalSeconds) * 100
                    const width = Math.min(
                      100 - left,
                      Math.max(1.5, naturalWidth),
                    )
                    const isMarker = naturalWidth < 3

                    return (
                      <span
                        aria-label={`${distraction.reason}, ${formatTime(
                          distraction.startSeconds,
                        )} to ${formatTime(distraction.endSeconds)}, ${formatTime(
                          distraction.durationSeconds,
                        )}`}
                        className={
                          isMarker
                            ? 'timeline-segment timeline-marker'
                            : 'timeline-segment'
                        }
                        key={distraction.id}
                        style={{ left: `${left}%`, width: `${width}%` }}
                        title={`${distraction.reason}: ${formatTime(
                          distraction.startSeconds,
                        )} - ${formatTime(distraction.endSeconds)} (${formatTime(
                          distraction.durationSeconds,
                        )})`}
                      />
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="timeline-scale" aria-hidden="true">
          {timelineTicks.map((tick) => (
            <span key={tick.position}>{tick.label}</span>
          ))}
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
                <td colSpan={4}>
                  No distraction episodes recorded for this session.
                </td>
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
