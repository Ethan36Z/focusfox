import { create } from 'zustand'
import type { FocusSource } from '../types/media'
import {
  clearSelectedFocusSourceId,
  loadFocusSources,
  loadSelectedFocusSourceId,
  saveFocusSources,
  saveSelectedFocusSourceId,
} from '../utils/mediaStorage'

interface RuntimeLocalFileMetadata {
  fileName: string
  mimeType?: string
}

interface MediaState {
  focusSources: FocusSource[]
  selectedFocusSourceId: string | null
  selectedLocalFileName: string | null
  runtimeLocalFile: RuntimeLocalFileMetadata | null
  selectedSource: FocusSource | null
  addFocusSource: (source: FocusSource) => void
  removeFocusSource: (sourceId: string) => void
  selectFocusSource: (sourceId: string) => void
  clearSelectedFocusSource: () => void
  setRuntimeLocalFile: (metadata: RuntimeLocalFileMetadata | null) => void
  restoreMediaData: (
    focusSources: FocusSource[],
    selectedFocusSourceId: string | null,
  ) => void
}

function getSelectedSource(
  focusSources: FocusSource[],
  selectedFocusSourceId: string | null,
) {
  return (
    focusSources.find((source) => source.id === selectedFocusSourceId) ?? null
  )
}

const initialFocusSources = loadFocusSources()
const initialSelectedFocusSourceId = loadSelectedFocusSourceId()

export const useMediaStore = create<MediaState>((set, get) => ({
  focusSources: initialFocusSources,
  selectedFocusSourceId: initialSelectedFocusSourceId,
  selectedLocalFileName: null,
  runtimeLocalFile: null,
  selectedSource: getSelectedSource(
    initialFocusSources,
    initialSelectedFocusSourceId,
  ),

  addFocusSource: (source) => {
    const existingSources = get().focusSources.filter(
      (existingSource) => existingSource.id !== source.id,
    )
    const focusSources = [source, ...existingSources]

    saveFocusSources(focusSources)
    saveSelectedFocusSourceId(source.id)
    set({
      focusSources,
      selectedFocusSourceId: source.id,
      selectedSource: source,
    })
  },

  removeFocusSource: (sourceId) => {
    const focusSources = get().focusSources.filter(
      (source) => source.id !== sourceId,
    )
    const selectedFocusSourceId =
      get().selectedFocusSourceId === sourceId
        ? null
        : get().selectedFocusSourceId

    saveFocusSources(focusSources)

    if (selectedFocusSourceId) {
      saveSelectedFocusSourceId(selectedFocusSourceId)
    } else {
      clearSelectedFocusSourceId()
    }

    set({
      focusSources,
      selectedFocusSourceId,
      selectedSource: getSelectedSource(focusSources, selectedFocusSourceId),
    })
  },

  selectFocusSource: (sourceId) => {
    const selectedSource = get().focusSources.find(
      (source) => source.id === sourceId,
    )

    if (!selectedSource) {
      return
    }

    saveSelectedFocusSourceId(sourceId)
    set({
      selectedFocusSourceId: sourceId,
      selectedSource,
    })
  },

  clearSelectedFocusSource: () => {
    clearSelectedFocusSourceId()
    set({
      selectedFocusSourceId: null,
      selectedSource: null,
      selectedLocalFileName: null,
      runtimeLocalFile: null,
    })
  },

  setRuntimeLocalFile: (metadata) =>
    set({
      runtimeLocalFile: metadata,
      selectedLocalFileName: metadata?.fileName ?? null,
    }),

  restoreMediaData: (focusSources, selectedFocusSourceId) => {
    const safeSelectedFocusSourceId = focusSources.some(
      (source) => source.id === selectedFocusSourceId,
    )
      ? selectedFocusSourceId
      : null

    saveFocusSources(focusSources)

    if (safeSelectedFocusSourceId) {
      saveSelectedFocusSourceId(safeSelectedFocusSourceId)
    } else {
      clearSelectedFocusSourceId()
    }

    set({
      focusSources,
      selectedFocusSourceId: safeSelectedFocusSourceId,
      selectedSource: getSelectedSource(focusSources, safeSelectedFocusSourceId),
      selectedLocalFileName: null,
      runtimeLocalFile: null,
    })
  },
}))
