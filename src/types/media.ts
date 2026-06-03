export type FocusSourceType =
  | 'localAudio'
  | 'localVideo'
  | 'youtube'
  | 'bilibili'
  | 'bilibiliLive'
  | 'externalLink'
  | 'freeTubeExternal'

export interface FocusSource {
  id: string
  type: FocusSourceType
  title: string
  createdAt: string
  updatedAt: string
  url?: string
  embedUrl?: string
  fileName?: string
  mimeType?: string
  durationSeconds?: number
  thumbnailUrl?: string
  notes?: string
}
