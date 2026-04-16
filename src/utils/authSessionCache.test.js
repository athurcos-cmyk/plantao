import { describe, expect, it } from 'vitest'
import { lerSessaoCache, persistirSessaoCache, limparSessaoCache } from './authSessionCache.js'

function createStorageMock() {
  const data = new Map()

  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null
    },
    setItem(key, value) {
      data.set(key, String(value))
    },
    removeItem(key) {
      data.delete(key)
    },
  }
}

describe('authSessionCache', () => {
  it('restaura uma sessao valida do cache local', () => {
    const storage = createStorageMock()

    persistirSessaoCache({
      syncCode: 'ABC123',
      userName: 'Ana',
      userEmail: 'ana@plantao.net',
      uid: 'uid-1',
    }, storage)

    expect(lerSessaoCache(storage)).toEqual({
      syncCode: 'ABC123',
      userName: 'Ana',
      userEmail: 'ana@plantao.net',
      uid: 'uid-1',
      hasSession: true,
    })
  })

  it('nao considera sessao valida quando falta uid', () => {
    const storage = createStorageMock()

    persistirSessaoCache({
      syncCode: 'ABC123',
      userName: 'Ana',
      userEmail: 'ana@plantao.net',
      uid: '',
    }, storage)

    expect(lerSessaoCache(storage)).toEqual({
      syncCode: 'ABC123',
      userName: 'Ana',
      userEmail: 'ana@plantao.net',
      uid: '',
      hasSession: false,
    })
  })

  it('limpa todas as chaves da sessao', () => {
    const storage = createStorageMock()

    persistirSessaoCache({
      syncCode: 'ABC123',
      userName: 'Ana',
      userEmail: 'ana@plantao.net',
      uid: 'uid-1',
    }, storage)
    storage.setItem('login_time', '123')

    limparSessaoCache(storage)

    expect(lerSessaoCache(storage)).toEqual({
      syncCode: '',
      userName: '',
      userEmail: '',
      uid: '',
      hasSession: false,
    })
    expect(storage.getItem('login_time')).toBe(null)
  })
})
