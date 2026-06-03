# FocusFox

A calm Pomodoro timer and distraction tracker for lofi focus sessions.

## Problem Statement

Many focus tools only measure time, but FocusFox helps users record what pulls
their attention away and review it after the session.

## Features

- Custom focus duration
- Start / pause / resume / reset
- Custom distraction reasons
- Timed distraction episodes
- Completion-first session summary
- Distraction duration chart
- Multi-lane focus timeline
- Details table
- Session history
- Reported focus percentage
- Monthly analytics dashboard
- Month selector
- Monthly totals for sessions, focus time, and distracted time
- Monthly average reported focus
- Top distraction reason
- Daily focus minutes chart
- Ranked distraction reason summary
- Local-first data storage with localStorage

## Tech Stack

- React
- TypeScript
- Vite
- Zustand
- Recharts
- localStorage
- CSS

## Local Setup

```bash
npm install
npm run dev
npm run build
```

## How to Use

1. Choose a focus duration.
2. Start a session.
3. Click a distraction reason when attention is pulled away.
4. Click the same reason again when returning to focus.
5. Review the completion summary, individual session timeline, chart, and
   history.
6. Use Monthly Analytics to review longer-term focus patterns by month.

## Product Design Notes

- Success-first completion: the app emphasizes finishing the focus session
  before inviting the user into details.
- Local-first privacy: completed sessions and custom reasons are stored in the
  browser with localStorage.
- Reported focus percentage is based only on user-recorded distraction time, so
  it should be read as a reflection aid rather than a perfect measurement.
- Monthly analytics helps users observe longer-term focus patterns without
  leaving the local app.

## Product Docs

- [Product modes](docs/product-modes.md)
- [Design system](docs/design-system.md)

## Current Status

V1 is a local web app.

## Screenshots

Screenshots are planned at these paths:

- `docs/screenshots/timer.png`
- `docs/screenshots/completion.png`
- `docs/screenshots/stats-timeline.png`
- `docs/screenshots/history.png`
- `docs/screenshots/monthly-analytics.png`

## Future Roadmap

- Yearly analytics
- Multi-source lofi player
- Local audio/video support
- YouTube official embed support
- Optional FreeTube/external player link support
- Browser overlay extension for video and livestream sites
- Optional theme/color controls
