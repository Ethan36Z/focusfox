export function canHandleBilibiliUrl(url: string) {
  try {
    const host = new URL(url).hostname.toLocaleLowerCase()
    return host === 'bilibili.com' || host.endsWith('.bilibili.com')
  } catch {
    return false
  }
}

export function canHandleBilibiliLiveUrl(url: string) {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.toLocaleLowerCase()
    return (
      (host === 'bilibili.com' || host.endsWith('.bilibili.com')) &&
      parsed.pathname.startsWith('/live')
    )
  } catch {
    return false
  }
}

export function getBilibiliAdapterStatus() {
  return 'placeholder: safe embed/live support is planned for a later V2A step'
}
