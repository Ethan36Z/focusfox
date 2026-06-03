import { useEffect } from 'react'
import { Coffee, Leaf } from 'lucide-react'
import { DistractionButtons } from './components/DistractionButtons'
import { DurationSelector } from './components/DurationSelector'
import { FocusPlayer } from './components/FocusPlayer'
import { MonthlyAnalytics } from './components/MonthlyAnalytics'
import { SessionComplete } from './components/SessionComplete'
import { SessionHistory } from './components/SessionHistory'
import { SessionStats } from './components/SessionStats'
import { TimerControls } from './components/TimerControls'
import { TimerDisplay } from './components/TimerDisplay'
import { useFocusStore } from './store/focusStore'

function App() {
  const status = useFocusStore((state) => state.status)
  const totalSeconds = useFocusStore((state) => state.totalSeconds)
  const remainingSeconds = useFocusStore((state) => state.remainingSeconds)
  const activeDistractionEpisode = useFocusStore(
    (state) => state.activeDistractionEpisode,
  )
  const completedSession = useFocusStore((state) => state.completedSession)
  const completedSessions = useFocusStore((state) => state.completedSessions)
  const customReasons = useFocusStore((state) => state.customReasons)
  const showDetails = useFocusStore((state) => state.showDetails)
  const startSession = useFocusStore((state) => state.startSession)
  const pauseSession = useFocusStore((state) => state.pauseSession)
  const resumeSession = useFocusStore((state) => state.resumeSession)
  const resetSession = useFocusStore((state) => state.resetSession)
  const tick = useFocusStore((state) => state.tick)
  const recordDistraction = useFocusStore((state) => state.recordDistraction)
  const addCustomReason = useFocusStore((state) => state.addCustomReason)
  const removeCustomReason = useFocusStore(
    (state) => state.removeCustomReason,
  )
  const openCompletedSession = useFocusStore(
    (state) => state.openCompletedSession,
  )
  const clearHistory = useFocusStore((state) => state.clearHistory)
  const viewDetails = useFocusStore((state) => state.viewDetails)
  const startAnotherSession = useFocusStore((state) => state.startAnotherSession)

  useEffect(() => {
    if (status !== 'running') {
      return
    }

    const intervalId = window.setInterval(tick, 1000)

    return () => window.clearInterval(intervalId)
  }, [status, tick])

  const progressPercent =
    totalSeconds === 0
      ? 0
      : Math.min(100, ((totalSeconds - remainingSeconds) / totalSeconds) * 100)
  const statusLabel =
    status === 'running'
      ? 'Fox mode is on'
      : status === 'paused'
        ? 'Paused, still peaceful'
        : status === 'completed'
          ? 'Finished gently'
          : 'Ready when you are'

  return (
    <main className="app-shell">
      <section className="hero-band" aria-labelledby="app-title">
        <div className="brand-mark" aria-hidden="true">
          <Leaf size={22} />
          <Coffee size={22} />
        </div>
        <p className="eyebrow">Lofi focus sessions</p>
        <h1 id="app-title">FocusFox</h1>
        <p className="hero-copy">
          Settle in, finish one calm block, and only look at the details when
          you feel ready.
        </p>
      </section>

      {completedSession ? (
        <SessionComplete
          session={completedSession}
          onStartAnother={startAnotherSession}
          onViewDetails={viewDetails}
        />
      ) : null}

      <div className="workspace-grid">
        <div className="focus-column">
          <DurationSelector />
          <FocusPlayer
            timer={
              <TimerDisplay
                progressPercent={progressPercent}
                remainingSeconds={remainingSeconds}
                statusLabel={statusLabel}
              />
            }
            distractions={
              <DistractionButtons
                activeDurationSeconds={
                  activeDistractionEpisode
                    ? Math.max(
                        0,
                        totalSeconds -
                          remainingSeconds -
                          activeDistractionEpisode.startElapsedSeconds,
                      )
                    : 0
                }
                activeReasonLabel={
                  activeDistractionEpisode?.reasonLabel ?? null
                }
                customReasons={customReasons}
                disabled={status !== 'running'}
                onAddCustomReason={addCustomReason}
                onRecord={recordDistraction}
                onRemoveCustomReason={removeCustomReason}
              />
            }
            controls={
              <TimerControls
                status={status}
                onPause={pauseSession}
                onReset={resetSession}
                onResume={resumeSession}
                onStart={startSession}
              />
            }
          />
        </div>
      </div>

      {completedSession && showDetails ? (
        <SessionStats session={completedSession} />
      ) : null}

      <SessionHistory
        onClearHistory={clearHistory}
        onOpenSession={openCompletedSession}
        selectedSessionId={completedSession?.id ?? null}
        sessions={completedSessions}
      />

      <MonthlyAnalytics sessions={completedSessions} />
    </main>
  )
}

export default App
