# FocusFox Product Modes

Guiding principle:

> Media is atmosphere, not the product. Focus is the product.

## Focus Player Mode

Focus Player Mode is the main focus/session mode.

It should feel like a calm lofi focus player, not a dashboard. The experience
centers on a media surface, compact timer HUD, subtle progress, and minimal
player chrome. Media should support focus rather than compete with it.

Distraction controls should be available, but not visually dominant. They should
feel like gentle tools at the edge of the focus experience, such as a compact
corner menu.

## Distraction Recording Mode

Distraction Recording Mode begins when the user selects a distraction reason
during an active focus session.

The main focus timer continues. The active reason gets its own running timer so
the user can mark attention drift without breaking the session.

In V2A, the media surface softly darkens/blurs and the active reason/timer
appears in the center with a calm End action. This should feel like gently
marking attention drift, not punishment.

## Review Mode

Review Mode appears after a session or when opening session details.

It contains the completion summary, duration chart, focus timeline, details
table, session history, monthly analytics, focus sources, and data backup. In
V2A these are organized in a tabbed review panel below the player. Review
should be calm and optional: users complete first, then choose whether to
inspect the details.

## Analytics Mode

Analytics Mode covers Monthly Analytics and future yearly analytics.

It helps users observe longer-term focus patterns, including focus time,
distracted time, reported focus, and common distraction reasons. It should be
readable and reflective without feeling like a corporate analytics dashboard.

## Media Source Mode / Focus Source Library

Media Source Mode is an active V2A foundation.

Media is atmosphere, not the product. FocusFox supports local audio/video,
user-provided YouTube official iframe embeds, and user-provided Bilibili BV
video iframe embeds in V2A. Future directions may include Bilibili live support
if safe and optional FreeTube/external player links.

The V2A media source foundation stores source metadata locally, but local file
content remains runtime-only and is not saved. FocusFox does not download,
cache, rip, proxy, or redistribute third-party media.

FocusFox should avoid becoming a general video-watching tool. This mode should
not include search, recommendation, comments, social feed, or entertainment
browsing.

## Browser Overlay Mode

Browser Overlay Mode is a future V3 direction.

FocusFox can overlay a lightweight timer, progress, and distraction UI onto
existing video or livestream websites. The overlay should be minimal,
user-controlled, and easy to dismiss.
