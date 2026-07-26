import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet, useOutletContext } from 'react-router-dom'
import { getStoredOrders, isAuthenticated, getStoredProducts, getStoredReviews } from './services/storage'

import { LandingPage, SignupFlow } from './components/Marketing'
import { AdminLayout } from './components/AdminLayout'
import { AdminDashboard } from './components/AdminDashboard'
import { AdminProducts } from './components/AdminProducts'
import { AdminOrders } from './components/AdminOrders'
import { AdminEmpty } from './components/AdminEmpty'
import { AdminLogin } from './components/AdminLogin'
import { StoreHome, ProductDetail, CartCheckout, OrderConfirmation, CartSidebar } from './components/Storefront'
import { PrivacyPolicy, ReturnsRefunds, ContactUs } from './components/PolicyPages'

// Guard for Admin Routes
function ProtectedAdminRoute() {
  const context = useOutletContext()
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />
  }
  return <AdminLayout><Outlet context={context} /></AdminLayout>
}

// Wrapper for Storefront to hold cart state
function StoreWrapper() {
  const dataContext = useOutletContext()
  const [cart, setCart] = React.useState([])
  const [isCartOpen, setIsCartOpen] = React.useState(false)
  
  const handleAddToCart = (product, quantity = 1, size = null, color = null) => {
    setCart(prev => {
      const exists = prev.find(i => i.product.id === product.id && i.size === size && i.color === color)
      if (exists) {
        return prev.map(i => (i.product.id === product.id && i.size === size && i.color === color) ? { ...i, quantity: i.quantity + quantity } : i)
      }
      return [...prev, { product, quantity, size, color }]
    })
    setIsCartOpen(true) // Automatically open cart when adding
  }

  const handleUpdateCart = (productId, qty, size = null, color = null) => {
    setCart(prev => {
      if (qty === 0) return prev.filter(i => !(i.product.id === productId && i.size === size && i.color === color))
      return prev.map(i => (i.product.id === productId && i.size === size && i.color === color) ? { ...i, quantity: qty } : i)
    })
  }

  return (
    <>
      <Outlet context={{ ...dataContext, cart, handleAddToCart, handleUpdateCart, setCart, isCartOpen, setIsCartOpen }} />
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart} 
        handleUpdateCart={handleUpdateCart} 
      />
    </>
  )
}

// Global Data Wrapper for Shared State
function DataWrapper({ children }) {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getStoredOrders(),
      getStoredProducts(),
      getStoredReviews()
    ]).then(([o, p, r]) => {
      setOrders(o || [])
      setProducts(p || [])
      setReviews(r || [])
      setLoading(false)
    }).catch(err => {
      console.error('Failed to load data:', err)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-display">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Loading StoreKit Data...</p>
      </div>
    )
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
