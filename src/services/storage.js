import { PRODUCTS, ORDERS } from '../data'

const STORAGE_KEYS = {
  PRODUCTS: 'storekit_products',
  ORDERS: 'storekit_orders',
  AUTH: 'storekit_admin_auth',
}

// Initialize LocalStorage with default data if empty
export function initStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(PRODUCTS))
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(ORDERS))
  }
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
