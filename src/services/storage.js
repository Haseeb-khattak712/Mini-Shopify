import { PRODUCTS, ORDERS } from '../data'

const STORAGE_KEYS = {
  PRODUCTS: 'storekit_products',
  ORDERS: 'storekit_orders',
  AUTH: 'storekit_admin_auth',
  REVIEWS: 'storekit_reviews',
}

const INITIAL_REVIEWS = [
  { id: 'r1', productId: 'p1', author: 'Sarah J.', rating: 5, text: 'Absolutely love this shirt! The fabric is so soft and it fits perfectly.', date: '2026-06-15' },
  { id: 'r2', productId: 'p1', author: 'Mike T.', rating: 4, text: 'Great quality, but runs slightly small.', date: '2026-06-10' },
  { id: 'r3', productId: 'p3', author: 'Emily R.', rating: 5, text: 'Beautiful mug, holds heat really well.', date: '2026-06-02' }
]

// Initialize LocalStorage with default data if empty
export function initStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(PRODUCTS))
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(ORDERS))
  }
  if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS))
  }
}

// Reviews API
export function getStoredReviews() {
  initStorage()
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '[]')
}

export function saveStoredReviews(reviews) {
  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews))
}

// Products API
export function getStoredProducts() {
  initStorage()
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]')
}

export function saveStoredProducts(products) {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products))
}

// Orders API
export function getStoredOrders() {
  initStorage()
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]')
}

export function saveStoredOrders(orders) {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders))
}

// Auth API
export function isAuthenticated() {
  return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true'
}

export function loginAdmin(username, password) {
  // Demo authentication check
  if (username === 'admin' && password === 'admin123') {
    localStorage.setItem(STORAGE_KEYS.AUTH, 'true')
    return { success: true }
  }
  return { success: false, error: 'Invalid username or password' }
}

export function logoutAdmin() {
  localStorage.removeItem(STORAGE_KEYS.AUTH)
}
