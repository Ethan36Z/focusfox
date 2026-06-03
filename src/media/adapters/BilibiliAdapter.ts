import type { FocusSource } from '../../types/media'

function createId() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
}

function isBilibiliHost(host: string) {
  return host === 'bilibili.com' || host.endsWith('.bilibili.com')
}

function isBilibiliShortLinkHost(host: string) {
  return host === 'b23.tv' || host.endsWith('.b23.tv')
}

export interface BilibiliVideoInfo {
  bvid: string
  page: number
}

export function getBilibiliVideoInfo(url: string): BilibiliVideoInfo | null {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.toLocaleLowerCase()

    if (!isBilibiliHost(host)) {
      return null
    }

    const bvid = parsed.pathname.match(/\/video\/(BV[A-Za-z0-9]{10})/i)?.[1]

    if (!bvid) {
      return null
    }

    const requestedPage = Number(parsed.searchParams.get('p') ?? '1')
    const page =
      Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1

    return { bvid, page }
  } catch {
    return null
  }
}

export function canHandleBilibiliUrl(url: string) {
  try {
    const host = new URL(url).hostname.toLocaleLowerCase()
    return isBilibiliHost(host) || isBilibiliShortLinkHost(host)
  } catch {
    return false
  }
}

export function canHandleBilibiliLiveUrl(url: string) {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.toLocaleLowerCase()
    return (
      isBilibiliHost(host) &&
      parsed.pathname.startsWith('/live')
    )
  } catch {
    return false
  }
}

export function getBilibiliEmbedUrl(url: string) {
  const videoInfo = getBilibiliVideoInfo(url)

  if (!videoInfo) {
    return null
  }

  const params = new URLSearchParams({
    bvid: videoInfo.bvid,
    page: videoInfo.page.toString(),
    autoplay: '0',
  })

  return `https://player.bilibili.com/player.html?${params.toString()}`
}

export function createBilibiliSource(
  title: string,
  url: string,
): FocusSource | null {
  const now = new Date().toISOString()
  const host = new URL(url).hostname.toLocaleLowerCase()

  if (isBilibiliShortLinkHost(host)) {
    return {
      id: createId(),
      type: 'externalLink',
      title,
      url,
      createdAt: now,
      updatedAt: now,
      notes: 'Bilibili short link saved as an external fallback. Re-open it on Bilibili if needed.',
    }
  }

  const embedUrl = getBilibiliEmbedUrl(url)

  if (!embedUrl) {
    return null
  }

  return {
    id: createId(),
    type: 'bilibili',
    title,
    url,
    embedUrl,
    createdAt: now,
    updatedAt: now,
  }
}

export function getBilibiliAdapterStatus() {
  return 'Bilibili BV video links use official iframe embeds; live support remains future/optional.'
}
