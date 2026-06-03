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
- Local audio/video focus player
- Compact player chrome with timer HUD, duration menu, media picker, fullscreen,
  and timer visibility controls
- Active distraction overlay with a calm End action
- Tabbed review panel for session review, history, monthly analytics, and focus
  sources
- Small focus source library for saved source metadata
- YouTube official iframe embed for user-provided public links
- Basic PWA install support
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
7. Optionally choose a local media file or add a user-provided YouTube link as
   focus atmosphere.

## Product Design Notes

- Success-first completion: the app emphasizes finishing the focus session
  before inviting the user into details.
- Local-first privacy: completed sessions and custom reasons are stored in the
  browser with localStorage.
- Reported focus percentage is based only on user-recorded distraction time, so
  it should be read as a reflection aid rather than a perfect measurement.
- Monthly analytics helps users observe longer-term focus patterns without
  leaving the local app.
- YouTube support uses official iframe embeds for user-provided links. Some
  videos may not allow embedded playback.
- FocusFox does not download, cache, rip, proxy, or redistribute third-party
  media.
- FocusFox is not a video browsing app: there is no search, recommendation
  feed, comments, playlist system, or entertainment browsing surface.
- Media is atmosphere. Focus is the product.

## PWA Install Support

FocusFox includes basic web app manifest support, so compatible browsers may
offer an install option. Focus/session data remains local-first in the browser.

This does not mean media works offline: local files must be re-selected after a
refresh, and YouTube embeds require YouTube to be available online.

## Product Docs

- [Product modes](docs/product-modes.md)
- [Design system](docs/design-system.md)

## Current Status

V2A is a local-first web app with a focus player prototype.

## Screenshots

Screenshots are planned at these paths:

- `docs/screenshots/player-empty-or-local-video.png`
- `docs/screenshots/youtube-embed-player.png`
- `docs/screenshots/active-distraction-overlay.png`
- `docs/screenshots/completion-modal.png`
- `docs/screenshots/session-review-timeline.png`
- `docs/screenshots/monthly-analytics.png`
- `docs/screenshots/focus-source-library.png`
- `docs/screenshots/pwa-installed-window.png`

## Future Roadmap

- Yearly analytics
- Export/import for local data
- Broader multi-source lofi player controls
- Bilibili embed/live support if safe
- Optional FreeTube/external player link support
- Browser overlay extension for video and livestream sites
- Optional theme/color controls
- Possible desktop/Tauri version
