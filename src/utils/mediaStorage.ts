import type { FocusSource } from '../types/media'

const FOCUS_SOURCES_KEY = 'focusfox.focusSources'
const SELECTED_FOCUS_SOURCE_ID_KEY = 'focusfox.selectedFocusSourceId'

function isFocusSource(value: unknown): value is FocusSource {
  if (!value || typeof value !== 'object') {
    return false
  }

  const source = value as Partial<FocusSource>
  return (
    typeof source.id === 'string' &&
    typeof source.type === 'string' &&
    typeof source.title === 'string' &&
    typeof source.createdAt === 'string' &&
    typeof source.updatedAt === 'string'
  )
}

export function loadFocusSources(): FocusSource[] {
  try {
    const raw = localStorage.getItem(FOCUS_SOURCES_KEY)

    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isFocusSource) : []
  } catch {
    return []
  }
}

export function saveFocusSources(sources: FocusSource[]) {
  localStorage.setItem(FOCUS_SOURCES_KEY, JSON.stringify(sources))
}

export function loadSelectedFocusSourceId(): string | null {
  try {
    return localStorage.getItem(SELECTED_FOCUS_SOURCE_ID_KEY)
  } catch {
    return null
  }
}

export function saveSelectedFocusSourceId(sourceId: string) {
  localStorage.setItem(SELECTED_FOCUS_SOURCE_ID_KEY, sourceId)
}

export function clearSelectedFocusSourceId() {
  localStorage.removeItem(SELECTED_FOCUS_SOURCE_ID_KEY)
}
