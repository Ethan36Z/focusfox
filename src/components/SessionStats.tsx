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
import { getDistractionReasonLabel } from '../utils/reasons'

interface SessionStatsProps {
  session: CompletedSession
}

export function SessionStats({ session }: SessionStatsProps) {
  const counts = new Map<string, number>(
    DISTRACTION_REASONS.map((reason) => [reason, 0]),
  )

  session.distractions.forEach((event) => {
    const reason = getDistractionReasonLabel(event)
    counts.set(reason, (counts.get(reason) ?? 0) + 1)
  })

  const chartData = Array.from(counts, ([reason, count]) => ({
    reason,
    count,
  }))

  return (
    <section className="panel stats-panel" aria-labelledby="stats-title">
      <div>
        <p className="eyebrow">Details</p>
        <h2 id="stats-title">Distractions by reason</h2>
      </div>

      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="#d7eee9" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="reason" tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: 'rgba(104, 174, 164, 0.12)' }}
              contentStyle={{
                border: '1px solid #cfe7df',
                borderRadius: 14,
                boxShadow: '0 14px 34px rgba(69, 104, 96, 0.16)',
              }}
            />
            <Bar dataKey="count" fill="#68aea4" radius={[10, 10, 4, 4]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
