const SESSION_KEYS = {
  syncCode: 'sync_code',
  userName: 'user_name',
  userEmail: 'user_email',
  uid: 'auth_uid',
}

function getStorageItem(storage, key) {
  try {
    return storage?.getItem(key) || ''
  } catch {
    return ''
  }
}

export function lerSessaoCache(storage = globalThis.localStorage) {
  const session = {
    syncCode: getStorageItem(storage, SESSION_KEYS.syncCode),
    userName: getStorageItem(storage, SESSION_KEYS.userName),
    userEmail: getStorageItem(storage, SESSION_KEYS.userEmail),
    uid: getStorageItem(storage, SESSION_KEYS.uid),
  }

  return {
    ...session,
    hasSession: !!session.syncCode && !!session.uid,
  }
}

export function persistirSessaoCache(session, storage = globalThis.localStorage) {
  if (!storage) return

  try {
    if (session.syncCode) storage.setItem(SESSION_KEYS.syncCode, session.syncCode)
    if (session.userName !== undefined) storage.setItem(SESSION_KEYS.userName, session.userName || '')
    if (session.userEmail !== undefined) storage.setItem(SESSION_KEYS.userEmail, session.userEmail || '')
    if (session.uid) storage.setItem(SESSION_KEYS.uid, session.uid)
  } catch {}
}

export function limparSessaoCache(storage = globalThis.localStorage) {
  if (!storage) return

  try {
    Object.values(SESSION_KEYS).forEach((key) => storage.removeItem(key))
    storage.removeItem('login_time')
  } catch {}
}
