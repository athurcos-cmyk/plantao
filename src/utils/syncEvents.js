const EVENT_NAME = 'plantao-sync-state'
const STORAGE_KEY = '__plantao_sync_state__'
const CHANNEL_NAME = 'plantao-sync-channel'

let channel = null

function getChannel() {
  if (typeof BroadcastChannel === 'undefined') return null
  if (!channel) channel = new BroadcastChannel(CHANNEL_NAME)
  return channel
}

export function emitSyncState(detail = {}) {
  const payload = { ...detail, ts: Date.now() }

  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: payload }))

  try { getChannel()?.postMessage(payload) } catch {}
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)) } catch {}
}

export function subscribeSyncState(handler) {
  const onCustom = (event) => handler(event.detail)
  const onStorage = (event) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return
    try { handler(JSON.parse(event.newValue)) } catch {}
  }

  const bc = getChannel()
  const onChannel = (event) => handler(event.data)

  window.addEventListener(EVENT_NAME, onCustom)
  window.addEventListener('storage', onStorage)
  bc?.addEventListener('message', onChannel)

  return () => {
    window.removeEventListener(EVENT_NAME, onCustom)
    window.removeEventListener('storage', onStorage)
    bc?.removeEventListener('message', onChannel)
  }
}
