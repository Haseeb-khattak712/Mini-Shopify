import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet, useOutletContext, useParams, useNavigate, useLocation } from 'react-router-dom'
import { getStoredOrders, isAdmin, getUserContext, getStoredProducts, getStoredReviews, addOrder } from '@/services/storage'

// Code Splitting with React.lazy
const LandingPage = lazy(() => import('@/pages/Marketing').then(m => ({ default: m.LandingPage })))
const SignupFlow = lazy(() => import('@/pages/Marketing').then(m => ({ default: m.SignupFlow })))
const Pricing = lazy(() => import('@/pages/Pricing').then(m => ({ default: m.Pricing })))
const AdminLayout = lazy(() => import('@/layouts/AdminLayout').then(m => ({ default: m.AdminLayout })))
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })))
const AdminProducts = lazy(() => import('@/pages/AdminProducts').then(m => ({ default: m.AdminProducts })))
const AdminOrders = lazy(() => import('@/pages/AdminOrders').then(m => ({ default: m.AdminOrders })))
const AdminTheme = lazy(() => import('@/pages/AdminTheme'))
const AdminDiscounts = lazy(() => import('@/pages/AdminDiscounts').then(m => ({ default: m.AdminDiscounts })))
const AdminReviews = lazy(() => import('@/pages/AdminReviews').then(m => ({ default: m.AdminReviews })))
const AdminCustomers = lazy(() => import('@/pages/AdminCustomers').then(m => ({ default: m.AdminCustomers })))
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
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('ownstore_cart')
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      return []
    }
  })
  
  useEffect(() => {
    localStorage.setItem('ownstore_cart', JSON.stringify(cart))
  }, [cart])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false)
  const { subdomain } = useParams()
  const navigate = useNavigate()

  const handleAddToCart = (product, quantity = 1, size = null, color = null) => {
    const variantKey = [color, size].filter(Boolean).join('-');
    let availableStock = product.stock;
    if (variantKey && product.variant_stock) {
        const vStock = typeof product.variant_stock === 'string' ? JSON.parse(product.variant_stock) : product.variant_stock;
        if (vStock[variantKey] !== undefined) {
            availableStock = parseInt(vStock[variantKey], 10);
        }
    }

    setCart(prev => {
      const exists = prev.find(i => i.product.id === product.id && i.size === size && i.color === color)
      const currentQty = exists ? exists.quantity : 0;
      
      if (currentQty + quantity > availableStock) {
        alert(`Sorry, only ${availableStock} units of this item are available in stock.`);
        return prev;
      }

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
      
      const item = prev.find(i => i.product.id === productId && i.size === size && i.color === color)
      if (item) {
        const variantKey = [color, size].filter(Boolean).join('-');
        let availableStock = item.product.stock;
        if (variantKey && item.product.variant_stock) {
            const vStock = typeof item.product.variant_stock === 'string' ? JSON.parse(item.product.variant_stock) : item.product.variant_stock;
            if (vStock[variantKey] !== undefined) {
                availableStock = parseInt(vStock[variantKey], 10);
            }
        }
        if (qty > availableStock) {
            alert(`Sorry, only ${availableStock} units available.`);
            return prev;
        }
      }
      
      return prev.map(i => (i.product.id === productId && i.size === size && i.color === color) ? { ...i, quantity: qty } : i)
    })
  }

  const calculateTotal = () => {
    const sub = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    const shipping = (sub >= 100 || cart.length === 0) ? 0 : 8
    return sub + shipping
  }

  const storeContextValue = useMemo(() => ({ 
    ...dataContext, cart, handleAddToCart, handleUpdateCart, setCart, isCartOpen, setIsCartOpen, setIsCheckoutModalOpen 
  }), [dataContext, cart, isCartOpen]);

  return (
    <>
      <Suspense fallback={<LoadingSpinner />}>
        <Outlet context={storeContextValue} />
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
    <div className="min-h-screen bg-[#000302] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-shop-accent/5 via-transparent to-transparent opacity-60" />
    </div>
  )
}

function AdminDataWrapper() {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [reviews, setReviews] = useState([])
  const [discounts, setDiscounts] = useState([])
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
        const d = await storage.getStoredDiscounts(user.id)
        
        setOrders(Array.isArray(o) ? o : [])
        setProducts(Array.isArray(p) ? p : [])
        setReviews(Array.isArray(r) ? r : [])
        setDiscounts(Array.isArray(d) ? d : [])
        setSettings(s || null)
        setLoading(false)
      } catch (err) {
        console.error('Failed to load data:', err)
        setLoading(false)
      }
    }
    loadData()
  }, [user?.id])

  const adminContextValue = useMemo(() => ({
    orders, setOrders, products, setProducts, reviews, setReviews, discounts, setDiscounts, settings, setSettings
  }), [orders, products, reviews, discounts, settings]);

  if (loading) return <LoadingSpinner />
  return <Suspense fallback={<LoadingSpinner />}><Outlet context={adminContextValue} /></Suspense>
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

        const p = await getStoredProducts(null, subdomain)
        const r = await getStoredReviews(null, subdomain)
        const storage = await import('@/services/storage')
        const s = await storage.getStoreSettings(null, subdomain)
        

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

  useEffect(() => {
    if (settings) {
      document.title = settings.seoTitle || settings.storeName || `${subdomain} Store`;
      
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = "description";
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = settings.seoDescription || settings.heroSubtitle || '';

      let ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage) {
        ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        document.head.appendChild(ogImage);
      }
      ogImage.content = settings.socialImage || '';
    }
  }, [settings, subdomain])

  const storeContextValue = useMemo(() => ({
    orders, setOrders, products, setProducts, reviews, setReviews, settings, setSettings, subdomain
  }), [orders, products, reviews, settings, subdomain]);

  if (loading) return <LoadingSpinner />
  return <Suspense fallback={<LoadingSpinner />}><Outlet context={storeContextValue} /></Suspense>
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
              <Route path="discounts" element={<AdminDiscounts />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="customers" element={<AdminCustomers />} />
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
