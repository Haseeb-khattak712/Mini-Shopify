import React, { useState, useEffect, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet, useOutletContext, useParams, useNavigate, useLocation } from 'react-router-dom'
import { getStoredOrders, isAdmin, getUserContext, getStoredProducts, getStoredReviews, addOrder } from '@/services/storage'
import { CheckoutModal } from '@/components/shared/CheckoutModal'

// Code Splitting with React.lazy
const LandingPage = lazy(() => import('@/pages/Marketing').then(m => ({ default: m.LandingPage })))
const SignupFlow = lazy(() => import('@/pages/Marketing').then(m => ({ default: m.SignupFlow })))
const Pricing = lazy(() => import('@/pages/Pricing').then(m => ({ default: m.Pricing })))
const AdminLayout = lazy(() => import('@/layouts/AdminLayout').then(m => ({ default: m.AdminLayout })))
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })))
const AdminProducts = lazy(() => import('@/pages/AdminProducts').then(m => ({ default: m.AdminProducts })))
const AdminOrders = lazy(() => import('@/pages/AdminOrders').then(m => ({ default: m.AdminOrders })))
const AdminEmpty = lazy(() => import('@/pages/AdminEmpty').then(m => ({ default: m.AdminEmpty })))
const AdminTheme = lazy(() => import('@/pages/AdminTheme'))
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
const Marketplace = lazy(() => import('@/pages/Marketplace').then(m => ({ default: m.Marketplace })))
const BrandProfile = lazy(() => import('@/pages/BrandProfile').then(m => ({ default: m.BrandProfile })))

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
  const [cart, setCart] = React.useState(() => {
    try {
      const saved = localStorage.getItem('ownstore_cart')
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      return []
    }
  })
  
  React.useEffect(() => {
    localStorage.setItem('ownstore_cart', JSON.stringify(cart))
  }, [cart])
  const [isCartOpen, setIsCartOpen] = React.useState(false)
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = React.useState(false)
  const { subdomain } = useParams()
  const navigate = useNavigate()

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

  const calculateTotal = () => {
    const sub = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    const shipping = (sub >= 100 || cart.length === 0) ? 0 : 8
    return sub + shipping
  }

  return (
    <>
      <Suspense fallback={<LoadingSpinner />}>
        <Outlet context={{ ...dataContext, cart, handleAddToCart, handleUpdateCart, setCart, isCartOpen, setIsCartOpen, setIsCheckoutModalOpen }} />
      </Suspense>
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        handleUpdateCart={handleUpdateCart}
        onCheckout={() => {
          setIsCartOpen(false)
          setIsCheckoutModalOpen(true)
        }}
      />
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        cart={cart}
        total={calculateTotal()}
        onCheckoutComplete={async (finalTotal, email, address) => {
          const customer = await import('@/services/storage').then(m => m.getUserContext())
          const newOrder = {
            id: `ORD-${Date.now()}`,
            customer_id: customer?.id || null,
            customer: address ? address.split(',')[0] : (customer?.name || 'Guest User'),
            email: email || customer?.email || 'guest@example.com',
            total: finalTotal,
            date: new Date().toISOString().split('T')[0],
            status: 'pending',
            items: cart.map(i => ({ product_id: i.product.id, quantity: i.quantity, price: i.product.price, size: i.size, color: i.color }))
          }
          const res = await addOrder(newOrder, null, subdomain)
          setCart([])
          navigate(`/store/${subdomain}/confirmation`, { state: { orderId: res.id, pastCart: cart, pastTotal: finalTotal } })
        }}
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
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const user = getUserContext()

  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      try {
        const o = await getStoredOrders(user.id)
        const p = await getStoredProducts(user.id)
        const r = await getStoredReviews(user.id)
        const storage = await import('@/services/storage')
        const s = await storage.getStoreSettings(user.id, user.subdomain)
        
        setOrders(Array.isArray(o) ? o : [])
        setProducts(Array.isArray(p) ? p : [])
        setReviews(Array.isArray(r) ? r : [])
        setSettings(s || null)
        setLoading(false)
      } catch (err) {
        console.error('Failed to load data:', err)
        setLoading(false)
      }
    }
    loadData()
  }, [user?.id])

  if (loading) return <LoadingSpinner />
  return <Suspense fallback={<LoadingSpinner />}><Outlet context={{ orders, setOrders, products, setProducts, reviews, setReviews, settings, setSettings }} /></Suspense>
}

function StoreDataWrapper() {
  const { subdomain } = useParams()
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [reviews, setReviews] = useState([])
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!subdomain) return
    
    const loadData = async () => {
      try {
        const o = await getStoredOrders(null, subdomain)
        const p = await getStoredProducts(null, subdomain)
        const r = await getStoredReviews(null, subdomain)
        const storage = await import('@/services/storage')
        const s = await storage.getStoreSettings(null, subdomain)
        
        setOrders(o || [])
        setProducts(p || [])
        setReviews(r || [])
        setSettings(s || null)
        setLoading(false)
      } catch (err) {
        console.error('Failed to load data:', err)
        setLoading(false)
      }
    }
    loadData()
  }, [subdomain])

  if (loading) return <LoadingSpinner />
  return <Suspense fallback={<LoadingSpinner />}><Outlet context={{ orders, setOrders, products, setProducts, reviews, setReviews, settings, subdomain }} /></Suspense>
}

function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Marketing & Signup */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignupFlow />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/brand/:subdomain" element={<BrandProfile />} />

          {/* Protected Admin Dashboard */}
          <Route path="/admin" element={<ProtectedAdminRoute />}>
            <Route element={<AdminDataWrapper />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="empty" element={<AdminEmpty />} />
              <Route path="theme" element={<AdminTheme />} />
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
