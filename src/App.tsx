import { useEffect, useRef, useState } from 'react'
import { Coffee, Leaf } from 'lucide-react'
import { DataBackup } from './components/DataBackup'
import { DistractionButtons } from './components/DistractionButtons'
import { DurationSelector } from './components/DurationSelector'
import { FocusPlayer } from './components/FocusPlayer'
import { FocusSourceLibrary } from './components/FocusSourceLibrary'
import { MonthlyAnalytics } from './components/MonthlyAnalytics'
import { SessionComplete } from './components/SessionComplete'
import { SessionHistory } from './components/SessionHistory'
import { SessionStats } from './components/SessionStats'
import { TimerControls } from './components/TimerControls'
import { TimerDisplay } from './components/TimerDisplay'
import { useFocusStore } from './store/focusStore'
import { useSoundStore } from './store/soundStore'
import {
  playCompletionChime,
  playCountdownBeep,
  playFinalWarningBeep,
  playStartChime,
} from './utils/audioCues'

type ReviewTab = 'review' | 'history' | 'analytics' | 'sources' | 'data'

function App() {
  const [reviewTab, setReviewTab] = useState<ReviewTab>('review')
  const [startCountdownSeconds, setStartCountdownSeconds] = useState<
    number | null
  >(null)
  const [isDurationOpen, setIsDurationOpen] = useState(false)
  const [isDistractionMenuOpen, setIsDistractionMenuOpen] = useState(false)
  const status = useFocusStore((state) => state.status)
  const countdownIntervalRef = useRef<number | null>(null)
  const countdownRunRef = useRef(0)
  const endWarningSecondRef = useRef<number | null>(null)
  const previousStatusRef = useRef(status)
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
  const stopSession = useFocusStore((state) => state.stopSession)
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
  const startAnotherSession = useFocusStore(
    (state) => state.startAnotherSession,
  )
  const soundEnabled = useSoundStore((state) => state.soundEnabled)
  const soundVolume = useSoundStore((state) => state.soundVolume)
  const soundEnabledRef = useRef(soundEnabled)
  const soundVolumeRef = useRef(soundVolume)
  const isStartCountdownActive = startCountdownSeconds !== null

  const reviewTabs: Array<{ id: ReviewTab; label: string }> = [
    { id: 'review', label: 'Session Review' },
    { id: 'history', label: 'History' },
    { id: 'analytics', label: 'Monthly Analytics' },
    { id: 'sources', label: 'Focus Sources' },
    { id: 'data', label: 'Data' },
  ]

  useEffect(() => {
    soundEnabledRef.current = soundEnabled
  }, [soundEnabled])

  useEffect(() => {
    soundVolumeRef.current = soundVolume
  }, [soundVolume])

  useEffect(() => {
    if (status !== 'running') {
      return
    }

    const intervalId = window.setInterval(tick, 1000)

    return () => window.clearInterval(intervalId)
  }, [status, tick])

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        window.clearInterval(countdownIntervalRef.current)
      }

      countdownRunRef.current += 1
    }
  }, [])

  useEffect(() => {
    if (status !== 'running') {
      endWarningSecondRef.current = null
      return
    }

    if (
      remainingSeconds > 0 &&
      remainingSeconds <= 5 &&
      endWarningSecondRef.current !== remainingSeconds
    ) {
      endWarningSecondRef.current = remainingSeconds
      playFinalWarningBeep(soundEnabled, soundVolume)
    }
  }, [remainingSeconds, soundEnabled, soundVolume, status])

  useEffect(() => {
    if (
      status === 'completed' &&
      previousStatusRef.current === 'running' &&
      completedSession?.status === 'completed'
    ) {
      playCompletionChime(soundEnabled, soundVolume)
    }

    previousStatusRef.current = status
  }, [completedSession, soundEnabled, soundVolume, status])

  function clearStartCountdown() {
    if (countdownIntervalRef.current) {
      window.clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }

    countdownRunRef.current += 1
    setStartCountdownSeconds(null)
  }

  function handleStartRequest() {
    if (isStartCountdownActive) {
      return
    }

    if (status !== 'idle' && status !== 'completed') {
      startSession()
      return
    }

    const runId = countdownRunRef.current + 1
    countdownRunRef.current = runId
    let nextCountdownSecond = 3

    setStartCountdownSeconds(nextCountdownSecond)
    playCountdownBeep(soundEnabledRef.current, soundVolumeRef.current)

    countdownIntervalRef.current = window.setInterval(() => {
      nextCountdownSecond -= 1

      if (nextCountdownSecond > 0) {
        setStartCountdownSeconds(nextCountdownSecond)
        playCountdownBeep(soundEnabledRef.current, soundVolumeRef.current)
        return
      }

      if (countdownIntervalRef.current) {
        window.clearInterval(countdownIntervalRef.current)
        countdownIntervalRef.current = null
      }

      setStartCountdownSeconds(null)

      void playStartChime(
        soundEnabledRef.current,
        soundVolumeRef.current,
      ).then(() => {
        if (countdownRunRef.current === runId) {
          startSession()
        }
      })
    }, 1000)
  }

  function handleResetRequest() {
    clearStartCountdown()
    resetSession()
  }

  const progressPercent =
    totalSeconds === 0
      ? 0
      : Math.min(100, ((totalSeconds - remainingSeconds) / totalSeconds) * 100)
  const activeDistractionDurationSeconds = activeDistractionEpisode
    ? Math.max(
        0,
        totalSeconds -
          remainingSeconds -
          activeDistractionEpisode.startElapsedSeconds,
      )
    : 0
  const statusLabel =
    status === 'running'
      ? 'Focus'
      : status === 'paused'
        ? 'Paused'
        : status === 'completed'
          ? 'Complete'
          : 'Ready'
  const isCompletionVisible = Boolean(completedSession && !isStartCountdownActive)

  function handleViewDetails() {
    viewDetails()
    setReviewTab('review')
  }

  function handleChooseNextSession() {
    clearStartCountdown()
    startAnotherSession()
    setIsDistractionMenuOpen(false)
    setIsDurationOpen(true)
  }

  function handleDurationOpenChange(isOpen: boolean) {
    setIsDurationOpen(isOpen)

    if (isOpen) {
      setIsDistractionMenuOpen(false)
    }
  }

  function handleDistractionMenuOpenChange(isOpen: boolean) {
    setIsDistractionMenuOpen(isOpen)

    if (isOpen) {
      setIsDurationOpen(false)
    }
  }

  function handleMediaPickerOpen() {
    setIsDurationOpen(false)
    setIsDistractionMenuOpen(false)
  }

  function handleOpenSession(sessionId: string) {
    openCompletedSession(sessionId)
    setReviewTab('review')
  }

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

      <div className="workspace-grid">
        <div className="focus-column">
          <FocusPlayer
            activeDistractionDurationSeconds={activeDistractionDurationSeconds}
            activeDistractionLabel={
              activeDistractionEpisode?.reasonLabel ?? null
            }
            isDurationOpen={isCompletionVisible ? false : isDurationOpen}
            onDurationOpenChange={handleDurationOpenChange}
            completion={
              isCompletionVisible && completedSession ? (
                <SessionComplete
                  session={completedSession}
                  onChooseNext={handleChooseNextSession}
                  onViewDetails={handleViewDetails}
                />
              ) : null
            }
            timer={
              <TimerDisplay
                progressPercent={progressPercent}
                remainingSeconds={remainingSeconds}
                statusLabel={statusLabel}
              />
            }
            duration={
              <DurationSelector
                isStartCountdownActive={isStartCountdownActive}
              />
            }
            onEndActiveDistraction={() => {
              if (activeDistractionEpisode) {
                recordDistraction(activeDistractionEpisode.reasonLabel)
              }
            }}
            onMediaPickerOpen={handleMediaPickerOpen}
            onStart={handleStartRequest}
            startCountdownSeconds={startCountdownSeconds}
            status={status}
            distractions={
              <DistractionButtons
                activeDurationSeconds={activeDistractionDurationSeconds}
                activeReasonLabel={
                  activeDistractionEpisode?.reasonLabel ?? null
                }
                customReasons={customReasons}
                disabled={status !== 'running'}
                isOpen={isCompletionVisible ? false : isDistractionMenuOpen}
                onAddCustomReason={addCustomReason}
                onOpenChange={handleDistractionMenuOpenChange}
                onRecord={recordDistraction}
                onRemoveCustomReason={removeCustomReason}
              />
            }
            controls={
              <TimerControls
                status={status}
                isStartCountdownActive={isStartCountdownActive}
                onPause={pauseSession}
                onReset={handleResetRequest}
                onResume={resumeSession}
                onStart={handleStartRequest}
                onStop={stopSession}
              />
            }
          />
        </div>
      </div>

      <section className="review-shell" aria-labelledby="review-shell-title">
        <div className="review-shell-heading">
          <div>
            <p className="eyebrow">After focus</p>
            <h2 id="review-shell-title">Review panel</h2>
          </div>
          <div className="review-tabs" role="tablist" aria-label="Review views">
            {reviewTabs.map((tab) => (
              <button
                aria-selected={reviewTab === tab.id}
                className={
                  reviewTab === tab.id ? 'review-tab active' : 'review-tab'
                }
                key={tab.id}
                onClick={() => setReviewTab(tab.id)}
                role="tab"
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="review-panel-body">
          {reviewTab === 'review' ? (
            completedSession && showDetails ? (
              <SessionStats session={completedSession} />
            ) : (
              <div className="review-empty">
                Complete a session or open one from history to review details.
              </div>
            )
          ) : null}

          {reviewTab === 'history' ? (
            <SessionHistory
              onClearHistory={clearHistory}
              onOpenSession={handleOpenSession}
              selectedSessionId={completedSession?.id ?? null}
              sessions={completedSessions}
            />
          ) : null}

          {reviewTab === 'analytics' ? (
            <MonthlyAnalytics sessions={completedSessions} />
          ) : null}

          {reviewTab === 'sources' ? <FocusSourceLibrary /> : null}

          {reviewTab === 'data' ? <DataBackup /> : null}
        </div>
      </section>
    </main>
  )
}

export default App
