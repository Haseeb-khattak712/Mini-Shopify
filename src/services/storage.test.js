import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { isAuthenticated, logout, getStoreSettings } from './storage'

describe('storage.js auth functions', () => {
  beforeEach(() => {
    localStorage.clear()
    // Mock global fetch
    global.fetch = vi.fn()
  })
  
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('isAuthenticated returns false when not logged in', () => {
    expect(isAuthenticated()).toBe(false)
  })

  it('isAuthenticated returns true when auth token is present', () => {
    localStorage.setItem('ownstore_auth', 'true')
    expect(isAuthenticated()).toBe(true)
  })

  it('logout clears all relevant storage keys', () => {
    localStorage.setItem('ownstore_auth', 'true')
    localStorage.setItem('ownstore_token', '12345')
    localStorage.setItem('ownstore_user_context', '{}')
    
    logout()
    
    expect(localStorage.getItem('ownstore_auth')).toBeNull()
    expect(localStorage.getItem('ownstore_token')).toBeNull()
    expect(localStorage.getItem('ownstore_user_context')).toBeNull()
  })
})
