// Use environment variable if available (local dev), otherwise fallback to relative path (production)
const API_URL = import.meta.env.VITE_API_URL || '/backend/api'

function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' }
  let token = localStorage.getItem('ownstore_token')
  if (!token) {
    const ctx = localStorage.getItem('ownstore_user_context')
    if (ctx) {
      try {
        const parsed = JSON.parse(ctx)
        if (parsed && parsed.token) {
          token = parsed.token
          localStorage.setItem('ownstore_token', token)
        }
      } catch (e) {}
    }
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

function getQuery(subdomain) {
  return subdomain ? `?subdomain=${subdomain}` : ''
}

// Reviews API
export async function getStoredReviews(adminId = null, subdomain = null) {
  try {
    const res = await fetch(`${API_URL}/reviews.php${getQuery(subdomain)}`, { headers: getAuthHeaders(adminId) })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch (err) { return [] }
}

export async function addReview(review, adminId = null, subdomain = null) {
  const res = await fetch(`${API_URL}/reviews.php${getQuery(subdomain)}`, {
    method: 'POST',
    body: JSON.stringify(review),
    headers: getAuthHeaders(adminId)
  })
  return await res.json()
}

export async function updateReview(review, adminId = null) {
  const res = await fetch(`${API_URL}/reviews.php`, {
    method: 'PUT',
    body: JSON.stringify(review),
    headers: getAuthHeaders(adminId)
  })
  return await res.json()
}

export async function deleteReview(id, adminId = null) {
  const headers = getAuthHeaders(adminId)
  const res = await fetch(`${API_URL}/reviews.php?id=${id}`, {
    method: 'DELETE',
    headers
  })
  return await res.json()
}

export async function validateDiscount(code) {
  const res = await fetch(`${API_URL}/discounts.php`, {
    method: 'POST',
    body: JSON.stringify({ code }),
    headers: getAuthHeaders()
  })
  return await res.json()
}

export async function getStoredDiscounts(adminId = null) {
  try {
    const res = await fetch(`${API_URL}/discounts.php`, { headers: getAuthHeaders(adminId) })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch (err) { return [] }
}

export async function addDiscount(discount, adminId = null) {
  const res = await fetch(`${API_URL}/discounts.php`, {
    method: 'POST',
    body: JSON.stringify(discount),
    headers: getAuthHeaders(adminId)
  })
  return await res.json()
}

export async function updateDiscount(discount, adminId = null) {
  const res = await fetch(`${API_URL}/discounts.php`, {
    method: 'PUT',
    body: JSON.stringify(discount),
    headers: getAuthHeaders(adminId)
  })
  return await res.json()
}

export async function deleteDiscount(id, adminId = null) {
  const headers = getAuthHeaders(adminId)
  const res = await fetch(`${API_URL}/discounts.php?id=${id}`, {
    method: 'DELETE',
    headers
  })
  return await res.json()
}

// Settings API
export async function getStoreSettings(adminId = null, subdomain = null) {
  const res = await fetch(`${API_URL}/settings.php${getQuery(subdomain)}`, { headers: getAuthHeaders(adminId) })
  return await res.json()
}

export async function saveStoreSettings(settings, adminId) {
  const res = await fetch(`${API_URL}/settings.php`, {
    method: 'POST',
    body: JSON.stringify(settings),
    headers: getAuthHeaders(adminId)
  })
  return await res.json()
}

// Products API
export async function getStoredProducts(adminId = null, subdomain = null) {
  try {
    const res = await fetch(`${API_URL}/products.php${getQuery(subdomain)}`, { headers: getAuthHeaders(adminId) })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch (err) { return [] }
}

export async function addProduct(product, adminId = null) {
  const res = await fetch(`${API_URL}/products.php`, {
    method: 'POST',
    body: JSON.stringify(product),
    headers: getAuthHeaders(adminId)
  })
  return await res.json()
}

export async function updateProduct(product, adminId = null) {
  const res = await fetch(`${API_URL}/products.php`, {
    method: 'PUT',
    body: JSON.stringify(product),
    headers: getAuthHeaders(adminId)
  })
  return await res.json()
}

export async function deleteProduct(id, adminId = null) {
  const headers = getAuthHeaders(adminId)
  delete headers['Content-Type']
  const res = await fetch(`${API_URL}/products.php?id=${id}`, {
    method: 'DELETE',
    headers
  })
  return await res.json()
}

// Orders API
export async function getStoredOrders(adminId = null, subdomain = null) {
  try {
    const res = await fetch(`${API_URL}/orders.php${getQuery(subdomain)}`, { headers: getAuthHeaders(adminId) })
    if (!res.ok) {
      if (res.status === 401) {
        // Force logout on 401 if we were trying to fetch our own data without a subdomain
        if (!subdomain && localStorage.getItem('ownstore_auth')) {
          logout()
          window.location.href = '/login'
        }
      }
      return []
    }
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch (err) { return [] }
}

export async function addOrder(order, adminId = null, subdomain = null) {
  const res = await fetch(`${API_URL}/orders.php${getQuery(subdomain)}`, {
    method: 'POST',
    body: JSON.stringify(order),
    headers: getAuthHeaders(adminId)
  })
  return await res.json()
}

export async function updateOrder(order, adminId = null) {
  const res = await fetch(`${API_URL}/orders.php`, {
    method: 'PUT',
    body: JSON.stringify(order),
    headers: getAuthHeaders(adminId)
  })
  return await res.json()
}

// Auth API
export function isAuthenticated() {
  return localStorage.getItem('ownstore_auth') === 'true'
}

export function getUserContext() {
  const data = localStorage.getItem('ownstore_user_context')
  if (!data) return null
  try {
    return JSON.parse(data)
  } catch (e) {
    return null
  }
}

export function isAdmin() {
  const user = getUserContext()
  return user?.role === 'admin'
}

// Multi-user account chooser functions
export function getSavedAccounts() {
  const accounts = localStorage.getItem('ownstore_saved_accounts')
  if (!accounts) return []
  try {
    return JSON.parse(accounts)
  } catch (e) {
    return []
  }
}

function saveAccountToHistory(userObj) {
  let accounts = getSavedAccounts()
  // Remove if exists to update with fresh data and put at front
  accounts = accounts.filter(a => a.email !== userObj.email)
  accounts.unshift(userObj)
  localStorage.setItem('ownstore_saved_accounts', JSON.stringify(accounts))
}

export function switchAccount(userObj) {
  localStorage.setItem('ownstore_auth', 'true')
  localStorage.setItem('ownstore_user_context', JSON.stringify(userObj))
  // Wait, switchAccount doesn't have the token. 
  // Let's modify saveAccountToHistory to save the token too?
  // Actually, we can just save the token in userObj if we want, but let's just 
  // say switchAccount also needs the token if we want true multi-account.
  if (userObj.token) localStorage.setItem('ownstore_token', userObj.token)
  saveAccountToHistory(userObj)
}

export function removeSavedAccount(email) {
  let accounts = getSavedAccounts()
  accounts = accounts.filter(a => a.email !== email)
  localStorage.setItem('ownstore_saved_accounts', JSON.stringify(accounts))
}

export async function login(email, password) {
  try {
    const res = await fetch(`${API_URL}/auth.php?action=login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' }
    })
    const data = await res.json()

    if (res.ok && data.success) {
      localStorage.setItem('ownstore_auth', 'true')
      if (data.token) localStorage.setItem('ownstore_token', data.token)
      const userToSave = { ...data.user, token: data.token }
      localStorage.setItem('ownstore_user_context', JSON.stringify(userToSave))
      saveAccountToHistory(userToSave)
      return { success: true }
    }
    return { success: false, error: data.error || 'Login failed' }
  } catch (err) {
    return { success: false, error: 'Network error' }
  }
}

export async function register(name, email, password, role = 'customer', business_name = '', subdomain = '') {
  try {
    const res = await fetch(`${API_URL}/auth.php?action=register`, {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role, business_name, subdomain }),
      headers: { 'Content-Type': 'application/json' }
    })
    const data = await res.json()

    if (res.ok && data.success) {
      localStorage.setItem('ownstore_auth', 'true')
      if (data.token) localStorage.setItem('ownstore_token', data.token)
      const userObj = { id: data.id, name, email, role, token: data.token }
      if (role === 'admin') {
        userObj.business_name = business_name
        userObj.subdomain = subdomain
      }
      localStorage.setItem('ownstore_user_context', JSON.stringify(userObj))
      saveAccountToHistory(userObj)
      return { success: true }
    }
    return { success: false, error: data.error || 'Registration failed' }
  } catch (err) {
    return { success: false, error: 'Network error' }
  }
}

export function logout() {
  localStorage.removeItem('ownstore_auth')
  localStorage.removeItem('ownstore_token')
  localStorage.removeItem('ownstore_user_context')
}

export async function getMarketplaceProducts() {
  try {
    const res = await fetch(`${API_URL}/marketplace.php`)
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch (err) {
    console.error('Failed to fetch marketplace products:', err)
    return []
  }
}

