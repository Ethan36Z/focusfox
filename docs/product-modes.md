# FocusFox Product Modes

Guiding principle:

> Media is atmosphere, not the product. Focus is the product.

## Focus Player Mode

Focus Player Mode is the main focus/session mode.

It should feel like a calm lofi focus player, not a dashboard. The experience
centers on a large timer, subtle progress, and minimal controls. As FocusFox
grows, this mode can include media or an atmospheric background, but the media
surface should support focus rather than compete with it.

Distraction controls should be available, but not visually dominant. They should
feel like gentle tools at the edge of the focus experience.

## Distraction Recording Mode

Distraction Recording Mode begins when the user selects a distraction reason
during an active focus session.

The main focus timer continues. The active reason gets its own running timer so
the user can mark attention drift without breaking the session.

Future V2 direction: the media surface can darken or blur, and the active
reason/timer can appear in the center. This should feel like gently marking
attention drift, not punishment.

## Review Mode

Review Mode appears after a session or when opening session details.

It contains the completion summary, duration chart, focus timeline, details
table, and session history. Review should be calm and optional: users complete
first, then choose whether to inspect the details.

## Analytics Mode

Analytics Mode covers Monthly Analytics and future yearly analytics.

It helps users observe longer-term focus patterns, including focus time,
distracted time, reported focus, and common distraction reasons. It should be
readable and reflective without feeling like a corporate analytics dashboard.

## Media Source Mode / Focus Source Library

Media Source Mode is a future V2 direction.

Media is atmosphere, not the product. FocusFox may support limited focus sources
such as local audio/video, YouTube official embed, Bilibili embed/live if safe,
and optional FreeTube/external player links.

The V2A media source foundation stores source metadata locally, but local file
content remains runtime-only and is not saved.

FocusFox should avoid becoming a general video-watching tool. This mode should
not include search, recommendation, comments, social feed, or entertainment
browsing.

## Browser Overlay Mode

Browser Overlay Mode is a future V3 direction.

FocusFox can overlay a lightweight timer, progress, and distraction UI onto
existing video or livestream websites. The overlay should be minimal,
user-controlled, and easy to dismiss.
