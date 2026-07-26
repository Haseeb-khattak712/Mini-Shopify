import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet, useOutletContext, useParams } from 'react-router-dom'
import { getStoredOrders, isAuthenticated, getUserContext, getStoredProducts, getStoredReviews } from './services/storage'

import { LandingPage, SignupFlow } from './components/Marketing'
import { AdminLayout } from './components/AdminLayout'
import { AdminDashboard } from './components/AdminDashboard'
import { AdminProducts } from './components/AdminProducts'
import { AdminOrders } from './components/AdminOrders'
import { AdminEmpty } from './components/AdminEmpty'
import { AdminLogin } from './components/AdminLogin'
import { StoreHome, ProductDetail, CartCheckout, OrderConfirmation, CartSidebar, CustomerLogin, CustomerAccount } from './components/Storefront'
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
  const [isCartOpen, setIsCartOpen] = React.useState(false)
  
  const handleAddToCart = (product, quantity = 1, size = null, color = null) => {
    setCart(prev => {
      const exists = prev.find(i => i.product.id === product.id && i.size === size && i.color === color)
      if (exists) {
        return prev.map(i => (i.product.id === product.id && i.size === size && i.color === color) ? { ...i, quantity: i.quantity + quantity } : i)
      }
      return [...prev, { product, quantity, size, color }]
    })
    setIsCartOpen(true)
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

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-display">
      <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-4"></div>
      <p className="text-slate-500 font-medium">Loading StoreKit Data...</p>
    </div>
  )
}

function AdminDataWrapper() {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const user = getUserContext()

  useEffect(() => {
    if (!user) return
    Promise.all([
      getStoredOrders(user.id),
      getStoredProducts(user.id),
      getStoredReviews(user.id)
    ]).then(([o, p, r]) => {
      setOrders(o || [])
      setProducts(p || [])
      setReviews(r || [])
      setLoading(false)
    }).catch(err => {
      console.error('Failed to load data:', err)
      setLoading(false)
    })
  }, [user?.id])

  if (loading) return <LoadingSpinner />
  return <Outlet context={{ orders, setOrders, products, setProducts, reviews, setReviews }} />
}

function StoreDataWrapper() {
  const { subdomain } = useParams()
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!subdomain) return
    Promise.all([
      getStoredOrders(null, subdomain),
      getStoredProducts(null, subdomain),
      getStoredReviews(null, subdomain)
    ]).then(([o, p, r]) => {
      setOrders(o || [])
      setProducts(p || [])
      setReviews(r || [])
      setLoading(false)
    }).catch(err => {
      console.error('Failed to load data:', err)
      setLoading(false)
    })
  }, [subdomain])

  if (loading) return <LoadingSpinner />
  return <Outlet context={{ orders, setOrders, products, setProducts, reviews, setReviews, subdomain }} />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Marketing & Signup */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupFlow />} />

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Dashboard */}
        <Route path="/admin" element={<ProtectedAdminRoute />}>
          <Route element={<AdminDataWrapper />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="empty" element={<AdminEmpty />} />
          </Route>
        </Route>

        {/* Storefront */}
        <Route path="/store/:subdomain" element={<StoreDataWrapper />}>
          <Route element={<StoreWrapper />}>
            <Route index element={<StoreHome />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="cart" element={<CartCheckout />} />
            <Route path="confirmation" element={<OrderConfirmation />} />
          </Route>

          {/* Customer Auth & Account (No cart wrapper needed here if we don't want cart sidebar, but they use StoreNav which expects it. Let's wrap them in StoreWrapper or let StoreNav handle missing cart context. Wait, StoreNav requires setIsCartOpen. We should put them inside StoreWrapper) */}
          <Route element={<StoreWrapper />}>
            <Route path="login" element={<CustomerLogin />} />
            <Route path="account" element={<CustomerAccount />} />
          </Route>

          {/* Policy Pages (outside StoreWrapper — no cart needed) */}
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="returns" element={<ReturnsRefunds />} />
          <Route path="contact" element={<ContactUs />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
