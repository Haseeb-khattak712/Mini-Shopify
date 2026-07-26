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
  return localStorage.getItem('storekit_admin_auth') === 'true'
}

export function getUserContext() {
  const data = localStorage.getItem('storekit_user_context')
  return data ? JSON.parse(data) : null
}

export async function loginAdmin(email, password) {
  try {
    const res = await fetch(`${API_URL}/auth.php?action=login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' }
    })
    const data = await res.json()
    
    if (res.ok && data.success) {
      localStorage.setItem('storekit_admin_auth', 'true')
      localStorage.setItem('storekit_user_context', JSON.stringify(data.user))
      return { success: true }
    }
    return { success: false, error: data.error || 'Login failed' }
  } catch (err) {
    return { success: false, error: 'Network error' }
  }
}

export async function registerAdmin(email, password, biz, subdomain) {
  try {
    const res = await fetch(`${API_URL}/auth.php?action=register`, {
      method: 'POST',
      body: JSON.stringify({ email, password, biz, subdomain }),
      headers: { 'Content-Type': 'application/json' }
    })
    const data = await res.json()
    
    if (res.ok && data.success) {
      localStorage.setItem('storekit_admin_auth', 'true')
      localStorage.setItem('storekit_user_context', JSON.stringify({ id: data.id, email, business_name: biz, subdomain }))
      return { success: true }
    }
    return { success: false, error: data.error || 'Registration failed' }
  } catch (err) {
    return { success: false, error: 'Network error' }
  }
}

export function logoutAdmin() {
  localStorage.removeItem('storekit_admin_auth')
  localStorage.removeItem('storekit_user_context')
}

// Customer Auth API
export function isCustomerAuthenticated(subdomain) {
  return localStorage.getItem(`storekit_customer_auth_${subdomain}`) === 'true'
}

export function getCustomerContext(subdomain) {
  const data = localStorage.getItem(`storekit_customer_context_${subdomain}`)
  return data ? JSON.parse(data) : null
}

export async function loginCustomer(email, password, subdomain) {
  try {
    const res = await fetch(`${API_URL}/customer_auth.php?action=login`, {
      method: 'POST',
      body: JSON.stringify({ email, password, subdomain }),
      headers: { 'Content-Type': 'application/json' }
    })
    const data = await res.json()
    
    if (res.ok && data.success) {
      localStorage.setItem(`storekit_customer_auth_${subdomain}`, 'true')
      localStorage.setItem(`storekit_customer_context_${subdomain}`, JSON.stringify(data.customer))
      return { success: true }
    }
    return { success: false, error: data.error || 'Login failed' }
  } catch (err) {
    return { success: false, error: 'Network error' }
  }
}

export async function registerCustomer(name, email, password, subdomain) {
  try {
    const res = await fetch(`${API_URL}/customer_auth.php?action=register`, {
      method: 'POST',
      body: JSON.stringify({ name, email, password, subdomain }),
      headers: { 'Content-Type': 'application/json' }
    })
    const data = await res.json()
    
    if (res.ok && data.success) {
      localStorage.setItem(`storekit_customer_auth_${subdomain}`, 'true')
      localStorage.setItem(`storekit_customer_context_${subdomain}`, JSON.stringify(data.customer))
      return { success: true }
    }
    return { success: false, error: data.error || 'Registration failed' }
  } catch (err) {
    return { success: false, error: 'Network error' }
  }
}

export function logoutCustomer(subdomain) {
  localStorage.removeItem(`storekit_customer_auth_${subdomain}`)
  localStorage.removeItem(`storekit_customer_context_${subdomain}`)
}
