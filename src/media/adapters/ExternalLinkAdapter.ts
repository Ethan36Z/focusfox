import type { FocusSource } from '../../types/media'

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function canHandleExternalLink(url: string) {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export function createExternalLinkSource(url: string): FocusSource {
  const now = new Date().toISOString()

  return {
    id: createId('source'),
    type: 'externalLink',
    title: url,
    createdAt: now,
    updatedAt: now,
    url,
  }
}
