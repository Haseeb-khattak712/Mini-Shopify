const API_URL = 'http://localhost:8000/api'

function getAuthHeaders(adminId) {
  const headers = { 'Content-Type': 'application/json' }
  if (adminId) headers['X-User-Id'] = adminId
  return headers
}

function getQuery(subdomain) {
  return subdomain ? `?subdomain=${subdomain}` : ''
}

// Reviews API
export async function getStoredReviews(adminId = null, subdomain = null) {
  const res = await fetch(`${API_URL}/reviews.php${getQuery(subdomain)}`, { headers: getAuthHeaders(adminId) })
  return await res.json()
}

export async function addReview(review, adminId = null, subdomain = null) {
  const res = await fetch(`${API_URL}/reviews.php${getQuery(subdomain)}`, {
    method: 'POST',
    body: JSON.stringify(review),
    headers: getAuthHeaders(adminId)
  })
  return await res.json()
}

// Products API
export async function getStoredProducts(adminId = null, subdomain = null) {
  const res = await fetch(`${API_URL}/products.php${getQuery(subdomain)}`, { headers: getAuthHeaders(adminId) })
  return await res.json()
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
  const res = await fetch(`${API_URL}/orders.php${getQuery(subdomain)}`, { headers: getAuthHeaders(adminId) })
  return await res.json()
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
  return data ? JSON.parse(data) : null
}

export function isAdmin() {
  const user = getUserContext()
  return user?.role === 'admin'
}

// Multi-user account chooser functions
export function getSavedAccounts() {
  const accounts = localStorage.getItem('ownstore_saved_accounts')
  return accounts ? JSON.parse(accounts) : []
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
  saveAccountToHistory(userObj)
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
      localStorage.setItem('ownstore_user_context', JSON.stringify(data.user))
      saveAccountToHistory(data.user)
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
      const userObj = { id: data.id, name, email, role }
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
  localStorage.removeItem('ownstore_user_context')
}
