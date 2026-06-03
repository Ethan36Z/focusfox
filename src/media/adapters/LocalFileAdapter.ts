import type { FocusSource } from '../../types/media'

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function canHandleLocalFile(file: File) {
  return file.type.startsWith('audio/') || file.type.startsWith('video/')
}

export function createLocalFileSource(file: File): FocusSource {
  const now = new Date().toISOString()
  const type = file.type.startsWith('video/') ? 'localVideo' : 'localAudio'

  return {
    id: createId('source'),
    type,
    title: file.name,
    createdAt: now,
    updatedAt: now,
    fileName: file.name,
    mimeType: file.type || undefined,
    notes: 'Runtime local file metadata only. File content is not stored.',
  }
}
