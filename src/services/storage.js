const API_URL = 'http://localhost:8000/api'

// Reviews API
export async function getStoredReviews() {
  const res = await fetch(`${API_URL}/reviews.php`)
  return await res.json()
}

export async function addReview(review) {
  const res = await fetch(`${API_URL}/reviews.php`, {
    method: 'POST',
    body: JSON.stringify(review),
    headers: { 'Content-Type': 'application/json' }
  })
  return await res.json()
}

// Products API
export async function getStoredProducts() {
  const res = await fetch(`${API_URL}/products.php`)
  return await res.json()
}

export async function addProduct(product) {
  const res = await fetch(`${API_URL}/products.php`, {
    method: 'POST',
    body: JSON.stringify(product),
    headers: { 'Content-Type': 'application/json' }
  })
  return await res.json()
}

export async function updateProduct(product) {
  const res = await fetch(`${API_URL}/products.php`, {
    method: 'PUT',
    body: JSON.stringify(product),
    headers: { 'Content-Type': 'application/json' }
  })
  return await res.json()
}

export async function deleteProduct(id) {
  const res = await fetch(`${API_URL}/products.php?id=${id}`, {
    method: 'DELETE'
  })
  return await res.json()
}

// Orders API
export async function getStoredOrders() {
  const res = await fetch(`${API_URL}/orders.php`)
  return await res.json()
}

export async function addOrder(order) {
  const res = await fetch(`${API_URL}/orders.php`, {
    method: 'POST',
    body: JSON.stringify(order),
    headers: { 'Content-Type': 'application/json' }
  })
  return await res.json()
}

export async function updateOrder(order) {
  const res = await fetch(`${API_URL}/orders.php`, {
    method: 'PUT',
    body: JSON.stringify(order),
    headers: { 'Content-Type': 'application/json' }
  })
  return await res.json()
}

// Auth API
export function isAuthenticated() {
  return localStorage.getItem('storekit_admin_auth') === 'true'
}

export function loginAdmin(username, password) {
  if (username === 'admin' && password === 'admin123') {
    localStorage.setItem('storekit_admin_auth', 'true')
    return { success: true }
  }
  return { success: false, error: 'Invalid username or password' }
}

export function logoutAdmin() {
  localStorage.removeItem('storekit_admin_auth')
}
