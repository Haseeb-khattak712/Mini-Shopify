import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet, useOutletContext } from 'react-router-dom'
import { getStoredOrders, saveStoredOrders, isAuthenticated, getStoredProducts, saveStoredProducts, getStoredReviews, saveStoredReviews } from './services/storage'

import { LandingPage, SignupFlow } from './components/Marketing'
import { AdminLayout } from './components/AdminLayout'
import { AdminDashboard } from './components/AdminDashboard'
import { AdminProducts } from './components/AdminProducts'
import { AdminOrders } from './components/AdminOrders'
import { AdminEmpty } from './components/AdminEmpty'
import { AdminLogin } from './components/AdminLogin'
import { StoreHome, ProductDetail, CartCheckout, OrderConfirmation } from './components/Storefront'
import { PrivacyPolicy, ReturnsRefunds, ContactUs } from './components/PolicyPages'

// Guard for Admin Routes
function ProtectedAdminRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />
  }
  return <AdminLayout><Outlet /></AdminLayout>
}

// Wrapper for Storefront to hold cart state
function StoreWrapper() {
  const dataContext = useOutletContext()
  const [cart, setCart] = React.useState([])
  
  const handleAddToCart = (product, quantity = 1) => {
    setCart(prev => {
      const exists = prev.find(i => i.product.id === product.id)
      if (exists) {
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i)
      }
      return [...prev, { product, quantity }]
    })
  }

  const handleUpdateCart = (productId, qty) => {
    setCart(prev => {
      if (qty === 0) return prev.filter(i => i.product.id !== productId)
      return prev.map(i => i.product.id === productId ? { ...i, quantity: qty } : i)
    })
  }

  return <Outlet context={{ ...dataContext, cart, handleAddToCart, handleUpdateCart, setCart }} />
}

// Global Data Wrapper for Shared State
function DataWrapper({ children }) {
  const [orders, setOrdersState] = useState(() => getStoredOrders())
  const [products, setProductsState] = useState(() => getStoredProducts())
  const [reviews, setReviewsState] = useState(() => getStoredReviews())

  const setOrders = (newOrders) => {
    const updated = typeof newOrders === 'function' ? newOrders(orders) : newOrders
    setOrdersState(updated)
    saveStoredOrders(updated)
  }

  const setProducts = (newProducts) => {
    const updated = typeof newProducts === 'function' ? newProducts(products) : newProducts
    setProductsState(updated)
    saveStoredProducts(updated)
  }

  const setReviews = (newReviews) => {
    const updated = typeof newReviews === 'function' ? newReviews(reviews) : newReviews
    setReviewsState(updated)
    saveStoredReviews(updated)
  }

  return (
    <Outlet context={{ orders, setOrders, products, setProducts, reviews, setReviews }} />
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DataWrapper />}>
        {/* Marketing & Signup */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupFlow />} />

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Dashboard */}
        <Route path="/admin" element={<ProtectedAdminRoute />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="empty" element={<AdminEmpty />} />
        </Route>

        {/* Storefront */}
        <Route path="/store" element={<StoreWrapper />}>
          <Route index element={<StoreHome />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<CartCheckout />} />
          <Route path="confirmation" element={<OrderConfirmation />} />
        </Route>

        {/* Policy Pages (outside StoreWrapper — no cart needed) */}
        <Route path="/store/privacy" element={<PrivacyPolicy />} />
        <Route path="/store/returns" element={<ReturnsRefunds />} />
        <Route path="/store/contact" element={<ContactUs />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
