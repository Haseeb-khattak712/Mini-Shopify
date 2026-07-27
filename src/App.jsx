import React, { useState, useEffect, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet, useOutletContext, useParams } from 'react-router-dom'
import { getStoredOrders, isAdmin, getUserContext, getStoredProducts, getStoredReviews } from '@/services/storage'

// Code Splitting with React.lazy
const LandingPage = lazy(() => import('@/pages/Marketing').then(m => ({ default: m.LandingPage })))
const SignupFlow = lazy(() => import('@/pages/Marketing').then(m => ({ default: m.SignupFlow })))
const Pricing = lazy(() => import('@/pages/Pricing').then(m => ({ default: m.Pricing })))
const AdminLayout = lazy(() => import('@/layouts/AdminLayout').then(m => ({ default: m.AdminLayout })))
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })))
const AdminProducts = lazy(() => import('@/pages/AdminProducts').then(m => ({ default: m.AdminProducts })))
const AdminOrders = lazy(() => import('@/pages/AdminOrders').then(m => ({ default: m.AdminOrders })))
const AdminEmpty = lazy(() => import('@/pages/AdminEmpty').then(m => ({ default: m.AdminEmpty })))
const AdminLogin = lazy(() => import('@/pages/AdminLogin').then(m => ({ default: m.AdminLogin })))
const StoreHome = lazy(() => import('@/pages/Storefront').then(m => ({ default: m.StoreHome })))
const ProductDetail = lazy(() => import('@/pages/Storefront').then(m => ({ default: m.ProductDetail })))
const CartCheckout = lazy(() => import('@/pages/Storefront').then(m => ({ default: m.CartCheckout })))
const OrderConfirmation = lazy(() => import('@/pages/Storefront').then(m => ({ default: m.OrderConfirmation })))
const CartSidebar = lazy(() => import('@/pages/Storefront').then(m => ({ default: m.CartSidebar })))
const PrivacyPolicy = lazy(() => import('@/pages/PolicyPages').then(m => ({ default: m.PrivacyPolicy })))
const ReturnsRefunds = lazy(() => import('@/pages/PolicyPages').then(m => ({ default: m.ReturnsRefunds })))
const ContactUs = lazy(() => import('@/pages/PolicyPages').then(m => ({ default: m.ContactUs })))
const AccountPage = lazy(() => import('@/pages/AccountPage').then(m => ({ default: m.AccountPage })))

// Guard for Admin Routes
function ProtectedAdminRoute() {
  if (!isAdmin()) {
    return <Navigate to="/login" replace />
  }
  return <AdminLayout><Suspense fallback={<LoadingSpinner />}><Outlet /></Suspense></AdminLayout>
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
      <Suspense fallback={<LoadingSpinner />}>
        <Outlet context={{ ...dataContext, cart, handleAddToCart, handleUpdateCart, setCart, isCartOpen, setIsCartOpen }} />
      </Suspense>
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
    <div className="min-h-screen bg-[#000806] flex flex-col items-center justify-center font-display">
      <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-[#5E8224] animate-spin mb-4"></div>
      <p className="text-white/60 font-medium">Loading...</p>
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
  return <Suspense fallback={<LoadingSpinner />}><Outlet context={{ orders, setOrders, products, setProducts, reviews, setReviews }} /></Suspense>
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
  return <Suspense fallback={<LoadingSpinner />}><Outlet context={{ orders, setOrders, products, setProducts, reviews, setReviews, subdomain }} /></Suspense>
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Marketing & Signup */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignupFlow />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/account" element={<AccountPage />} />

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

            {/* Policy Pages (outside StoreWrapper — no cart needed) */}
            <Route path="privacy" element={<PrivacyPolicy />} />
            <Route path="returns" element={<ReturnsRefunds />} />
            <Route path="contact" element={<ContactUs />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
