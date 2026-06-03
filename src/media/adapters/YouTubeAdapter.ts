import type { FocusSource } from '../../types/media'

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function getYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.toLocaleLowerCase()
    let videoId: string | null = null

    if (host === 'youtu.be') {
      videoId = parsed.pathname.split('/').filter(Boolean)[0] ?? null
    }

    if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
      if (parsed.pathname === '/watch') {
        videoId = parsed.searchParams.get('v')
      }

      if (parsed.pathname.startsWith('/embed/')) {
        videoId = parsed.pathname.split('/').filter(Boolean)[1] ?? null
      }
    }

    return videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId) ? videoId : null
  } catch {
    return null
  }
}

export function canHandleYouTubeUrl(url: string) {
  return getYouTubeVideoId(url) !== null
}

export function getYouTubeEmbedUrl(url: string) {
  const videoId = getYouTubeVideoId(url)
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null
}

export function createYouTubeSource(title: string, url: string): FocusSource | null {
  const embedUrl = getYouTubeEmbedUrl(url)

  if (!embedUrl) {
    return null
  }

  const now = new Date().toISOString()

  return {
    id: createId('source'),
    type: 'youtube',
    title,
    createdAt: now,
    updatedAt: now,
    url,
    embedUrl,
    notes: 'User-provided YouTube link using official iframe embed.',
  }
}
