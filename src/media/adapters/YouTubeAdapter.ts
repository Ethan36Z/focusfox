export function canHandleYouTubeUrl(url: string) {
  try {
    const host = new URL(url).hostname.toLocaleLowerCase()
    return host === 'youtube.com' || host.endsWith('.youtube.com') || host === 'youtu.be'
  } catch {
    return false
  }
}

export function getYouTubeAdapterStatus() {
  return 'placeholder: official embed support is planned for a later V2A step'
}
