import React, { useState, useRef, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Toast } from '@/components/ui/ui'

import { useTilt } from '@/hooks/useTilt'
import { Link } from 'react-router-dom'
import Confetti from 'react-confetti'

// ── Cinematic Hero Carousel ───────────────────────────────────────────────────

function HeroCarousel({ images }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!images || images.length <= 1) return
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [images])

  if (!images || images.length === 0) return null

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-zinc-950">
      <AnimatePresence initial={false}>
        <motion.img
          key={index}
          src={images[index]}
          loading={index === 0 ? "eager" : "lazy"}
          decoding="async"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.6, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>
    </div>
  )
}

// ── Store Nav ─────────────────────────────────────────────────────────────────

import { useNavigate, useOutletContext, useParams, useLocation } from 'react-router-dom'
import { 
  addReview, 
  addOrder, 
  isAuthenticated, 
  getUserContext, 
  getStoredOrders
} from '@/services/storage'

export function useStoreTheme() {
  const context = useOutletContext() || {}
  const baseSettings = (context.settings && context.settings.primaryColor) ? context.settings : {}
  const defaultSettings = {
    storeName: '',
    logoUrl: '',
    announcementText: '',
    stickyNav: true,
    primaryColor: '#4f46e5',
    buttonRadius: 'rounded',
    headerLayout: 'left',
    fontFamily: 'Inter',
    heroLayout: 'cinematic',
    heroImage: '',
    heroOpacity: '60',
    heroTitle: 'Crafted with intention,\nbuilt to last.',
    heroSubtitle: 'Carefully curated essentials for everyday living — from wardrobe to workspace.',
    heroButtonText: 'Shop Collection',
    cardStyle: '3d',
    defaultView: 'grid',
    footerText: '© 2026 Acme Goods Co. · Powered by OwnStore',
    socialInstagram: '',
    socialTwitter: '',
    socialTiktok: '',
    ...baseSettings
  }
  
  const [liveSettings, setLiveSettings] = useState(defaultSettings)

  useEffect(() => {
    // If the context changes (e.g. initial load finished), update live settings
    if (context.settings && context.settings.primaryColor) {
      setLiveSettings(context.settings)
    }
  }, [context.settings])

  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'THEME_UPDATE') {
        setLiveSettings(e.data.settings)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  return liveSettings
}

function StoreNav({ cartCount, theme }) {
  const navigate = useNavigate()
  const { subdomain } = useParams()
  const { setIsCartOpen } = useOutletContext()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    setIsCartOpen(false) // Close cart on route changes if necessary, or just rely on context
    setIsMobileMenuOpen(false) // Close menu on route changes
  }, [useLocation().pathname])

  const storeName = theme?.storeName || subdomain?.replace('-', ' ') || 'OwnStore'
  const storeInitial = theme?.storeName ? theme.storeName.charAt(0).toUpperCase() : (subdomain?.charAt(0)?.toUpperCase() || 'S')

  return (
    <>
      {theme?.announcementText && (
        <div className="bg-shop-primary text-white text-center py-2 text-xs font-medium tracking-wide">
          {theme.announcementText}
        </div>
      )}
      <header className={`bg-zinc-900/50 border-b border-white/10 ${theme?.stickyNav !== false ? 'sticky top-0 z-20' : 'relative z-20'} transition-colors`}>
        <div className={`max-w-6xl mx-auto px-6 py-4 flex items-center ${theme?.headerLayout === 'center' ? 'flex-col gap-4 justify-center' : 'justify-between'}`}>
          <button onClick={() => navigate(`/store/${subdomain}`)} className="flex items-center gap-2.5 cursor-pointer">
            {theme?.logoUrl ? (
              <img src={theme.logoUrl} alt={storeName} className="h-8 w-auto object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-shop-primary flex items-center justify-center text-white font-bold text-sm">
                {storeInitial}
              </div>
            )}
            <div className="text-left">
              <p className="font-semibold text-white font-display leading-none text-sm capitalize">{storeName}</p>
              <p className="text-[10px] text-white/50 font-mono mt-0.5">{subdomain || 'demo'}.ownstore.com</p>
            </div>
          </button>
          <div className="hidden sm:flex items-center gap-3">
            <button onClick={() => navigate('/marketplace')} className="px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 transition-colors">
              ← Marketplace
            </button>
            {isAuthenticated() ? (
              <button onClick={() => navigate(`/account`)} className="px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 transition-colors">
                Account
              </button>
            ) : (
              <button onClick={() => navigate(`/login`)} className="px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 transition-colors">
                Login
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-zinc-950 hover:bg-white/10 border border-white/10 rounded-[10px] px-3 md:px-4 py-2 text-sm font-medium text-white/80 cursor-pointer transition-colors"
            >
              🛒 <span className="hidden md:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-shop-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono"
                  style={{ animation: 'badgePop 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-2 text-white/80 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="sm:hidden border-t border-white/10 overflow-hidden bg-zinc-900/95 backdrop-blur-xl"
            >
              <div className="flex flex-col p-4 gap-2">
                <button onClick={() => navigate('/marketplace')} className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 transition-colors">
                  ← Marketplace
                </button>
                {isAuthenticated() ? (
                  <button onClick={() => navigate(`/account`)} className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 transition-colors">
                    Account
                  </button>
                ) : (
                  <button onClick={() => navigate(`/login`)} className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 transition-colors">
                    Login
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      <style>{`@keyframes badgePop { from { transform:scale(0) } to { transform:scale(1) } }`}</style>
      </header>
    </>
  )
}

// ── 3D Product Card ────────────────────────────────────────────────────────────

const ProductCard3D = memo(function ProductCard3D({ product, onAddToCart, onQuickView, isFlat }) {
  const navigate = useNavigate()
  const { subdomain } = useParams()
  const user = getUserContext()
  const isOwnStore = user?.role === 'admin' && user?.subdomain === subdomain
  const tilt = useTilt(14)
  const [justAdded, setJustAdded] = useState(false)

  const handleAdd = (e) => {
    e.stopPropagation()
    onAddToCart(product)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1200)
  }

  return (
    <motion.div
      ref={isFlat ? null : tilt.ref}
      onMouseMove={isFlat ? null : tilt.onMouseMove}
      onMouseLeave={isFlat ? null : tilt.onMouseLeave}
      onClick={() => navigate(`/store/${subdomain}/product/${product.id}`)}
      whileTap={{ scale: 0.98 }}
      className={`bg-zinc-900/50 border border-white/10 rounded-[10px] cursor-pointer group transition-colors ${isFlat ? 'overflow-hidden hover:bg-white/5' : 'overflow-visible'}`}
      style={isFlat ? {} : { transformStyle: 'preserve-3d', willChange: 'transform', transition: 'box-shadow 0.2s, background-color 0.2s, border-color 0.2s' }}
    >
      {/* Image layer — pops forward */}
      <div
        className={`relative overflow-hidden bg-zinc-800 ${isFlat ? '' : 'rounded-t-[10px]'}`}
        style={isFlat ? { aspectRatio: '1' } : { transform: 'translateZ(0)', aspectRatio: '1' }}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1" style={isFlat ? {} : { transform: 'translateZ(30px)' }}>
          {product.badge && (
            <span className={`text-[10px] font-bold uppercase tracking-wider text-white px-2 py-1 rounded-sm shadow-md ${
              product.badge.toLowerCase() === 'sale' ? 'bg-red-500' : 
              product.badge.toLowerCase() === 'new' ? 'bg-blue-500' : 'bg-shop-primary'
            }`}>
              {product.badge}
            </span>
          )}
          {product.stock <= 5 && (
            <span className="text-[10px] font-mono font-medium bg-red-500/90 text-white px-2 py-0.5 rounded-sm shadow-md">
              Only {product.stock} left
            </span>
          )}
        </div>
        
        {/* Quick View Overlay Button */}
        <div 
          className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]"
          style={isFlat ? {} : { transform: 'translateZ(20px)' }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              onQuickView?.(product)
            }}
            className="bg-white/90 hover:bg-white text-black text-xs font-bold px-4 py-2 rounded-full shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
          >
            Quick View
          </button>
        </div>
      </div>

      {/* Info layer */}
      <div className="p-4" style={isFlat ? {} : { transform: 'translateZ(10px)' }}>
        <p className="text-xs font-mono text-white/50  mb-0.5">{product.category}</p>
        <h3 className="font-semibold text-white  text-sm font-display mb-2 group-hover:text-shop-primary " style={isFlat ? {} : { transform: 'translateZ(4px)' }}>
          {product.name}
        </h3>
        <div className="flex items-center justify-between" style={isFlat ? {} : { transform: 'translateZ(6px)' }}>
          <span className="font-bold text-white ">${product.price}</span>
          <button
            onClick={handleAdd}
            className={`text-xs font-medium rounded-lg px-3 py-1.5 cursor-pointer transition-all duration-200
              ${justAdded ? 'bg-green-100  text-green-700  scale-95' : 'text-shop-primary  hover:text-indigo-800  bg-white/5  hover:bg-white/10  hover:scale-105'}`}
          >
            {justAdded ? '✓ Added' : '+ Cart'}
          </button>
        </div>
      </div>
    </motion.div>
  )
})

// ── List View Product Card ──────────────────────────────────────────────────────

const ProductListCard = memo(function ProductListCard({ product, onAddToCart, onQuickView, isFlat }) {
  const navigate = useNavigate()
  const { subdomain } = useParams()
  const user = getUserContext()
  const isOwnStore = user?.role === 'admin' && user?.subdomain === subdomain
  const [justAdded, setJustAdded] = useState(false)

  const handleAdd = (e) => {
    e.stopPropagation()
    onAddToCart(product)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1200)
  }

  return (
    <div
      onClick={() => navigate(`/store/${subdomain}/product/${product.id}`)}
      className="bg-zinc-900/50 border border-white/10 rounded-[10px] overflow-hidden cursor-pointer group flex hover:bg-white/5 transition-colors"
    >
      {/* Image Side */}
      <div className="w-1/3 sm:w-48 shrink-0 bg-zinc-800">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.badge && (
            <span className={`text-[10px] font-bold uppercase tracking-wider text-white px-2 py-1 rounded-sm shadow-md ${
              product.badge.toLowerCase() === 'sale' ? 'bg-red-500' : 
              product.badge.toLowerCase() === 'new' ? 'bg-blue-500' : 'bg-shop-primary'
            }`}>
              {product.badge}
            </span>
          )}
        </div>
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onQuickView?.(product)
            }}
            className="bg-white/90 hover:bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
          >
            Quick View
          </button>
        </div>
      </div>

      {/* Info Side */}
      <div className="p-4 md:p-6 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-xs font-mono text-white/50 mb-1">{product.category}</p>
          <h3 className="font-bold text-white text-base md:text-lg font-display mb-2 group-hover:text-shop-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-white/60 line-clamp-2 md:line-clamp-3 mb-4">{product.description}</p>
        </div>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="font-bold text-white text-lg">${product.price}</span>
            {product.stock <= 5 ? (
              <span className="text-[10px] font-mono text-red-400">Only {product.stock} left</span>
            ) : (
              <span className="text-[10px] font-mono text-green-400">In stock</span>
            )}
          </div>
          {isOwnStore ? (
            <button
              disabled
              className="text-sm font-medium rounded-lg px-4 py-2 transition-all duration-200 bg-white/10 text-white/40 cursor-not-allowed"
            >
              Your Store
            </button>
          ) : (
            <button
              onClick={handleAdd}
              className={`text-sm font-medium rounded-lg px-4 py-2 transition-all duration-200
                ${justAdded ? 'bg-green-100 text-green-700 scale-95' : 'bg-shop-primary hover:bg-shop-accent text-white hover:scale-105 shadow-md'}`}
            >
              {justAdded ? '✓ Added' : 'Add to Cart'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
})

// ── Quick View Modal ────────────────────────────────────────────────────────────

function QuickViewModal({ product, isOpen, onClose, onAddToCart }) {
  const { subdomain } = useParams()
  const user = getUserContext()
  const isOwnStore = user?.role === 'admin' && user?.subdomain === subdomain
  const [qty, setQty] = useState(1)
  
  // Reset state when product changes
  useEffect(() => {
    if (isOpen) setQty(1)
  }, [isOpen, product])

  if (!isOpen || !product) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 transition-colors"
          />
          <motion.div 
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-zinc-900/50 border border-white/10 shadow-2xl rounded-2xl z-50 overflow-hidden flex flex-col md:flex-row transition-colors"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-black/20 hover:bg-black/40 text-white rounded-full z-10 transition-colors"
            >
              ✕
            </button>
            
            {/* Image */}
            <div className="w-full md:w-1/2 h-64 md:h-auto bg-zinc-800 relative">
              <img src={product.image} alt={product.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
              {product.badge && (
                <span className={`absolute top-4 left-4 text-[10px] font-bold uppercase tracking-wider text-white px-2 py-1 rounded-sm shadow-md ${
                  product.badge.toLowerCase() === 'sale' ? 'bg-red-500' : 
                  product.badge.toLowerCase() === 'new' ? 'bg-blue-500' : 'bg-shop-primary'
                }`}>
                  {product.badge}
                </span>
              )}
            </div>

            {/* Details */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col max-h-[80vh] overflow-y-auto custom-scrollbar">
              <span className="text-xs font-mono text-white/50 mb-2">{product.category}</span>
              <h2 className="text-2xl font-bold text-white font-display mb-2">{product.name}</h2>
              <p className="text-2xl font-bold text-shop-primary mb-4">${product.price}</p>
              
              <p className="text-sm text-white/70 leading-relaxed mb-6">
                {product.description}
              </p>

              <div className="mt-auto pt-4 border-t border-white/10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center border border-white/10 rounded-lg overflow-hidden">
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-white/60 hover:bg-white/5 transition-colors">−</button>
                    <span className="w-10 text-center text-sm font-semibold text-white">{qty}</span>
                    <button onClick={() => setQty(q => q + 1)} className="w-10 h-10 flex items-center justify-center text-white/60 hover:bg-white/5 transition-colors">+</button>
                  </div>
                  <span className={`text-xs font-mono ${product.stock > 10 ? 'text-green-500' : 'text-amber-500'}`}>
                    {product.stock} in stock
                  </span>
                </div>
                
                {isOwnStore ? (
                  <button
                    disabled
                    className="w-full py-3 bg-white/5 text-white/40 font-bold rounded-lg cursor-not-allowed border border-white/10"
                  >
                    Your Store
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onAddToCart(product, qty)
                      onClose()
                    }}
                    className="w-full py-3 bg-shop-primary hover:bg-shop-accent text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all active:scale-95"
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Store Home ────────────────────────────────────────────────────────────────

export function StoreHome() {
  const navigate = useNavigate();
  const { cart, handleAddToCart, products, subdomain } = useOutletContext();
  const [toast, setToast] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  
  // Advanced Browsing State
  const theme = useStoreTheme()
  const [viewMode, setViewMode] = useState(theme.defaultView || 'grid')
  const [sortOption, setSortOption] = useState('newest')
  const [priceFilter, setPriceFilter] = useState('all')
  const [visibleCount, setVisibleCount] = useState(4)
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [recentlyViewed, setRecentlyViewed] = useState([])

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0)

  useEffect(() => {
    try {
      const viewedIds = JSON.parse(localStorage.getItem('recently_viewed') || '[]')
      const viewedProducts = viewedIds.map(id => (Array.isArray(products) ? products : PRODUCTS).find(p => p.id === id)).filter(Boolean)
      setRecentlyViewed(viewedProducts)
    } catch (e) {}
  }, [products])

  const filteredProducts = (Array.isArray(products) ? products : PRODUCTS).filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory
    let matchesPrice = true
    if (priceFilter === 'under50') matchesPrice = p.price < 50
    else if (priceFilter === '50to100') matchesPrice = p.price >= 50 && p.price <= 100
    else if (priceFilter === 'over100') matchesPrice = p.price > 100
    
    return matchesSearch && matchesCategory && matchesPrice
  }).sort((a, b) => {
    if (sortOption === 'price-asc') return a.price - b.price
    if (sortOption === 'price-desc') return b.price - a.price
    if (sortOption === 'bestselling') return (b.badge === 'Bestseller' ? 1 : 0) - (a.badge === 'Bestseller' ? 1 : 0)
    // newest (default fallback, just use ID or keep order)
    return 0
  })

  const displayedProducts = filteredProducts.slice(0, visibleCount)

  const addToCart = (p) => {
    handleAddToCart(p)
    setToast(`${p.name} added to cart`)
    setTimeout(() => setToast(''), 2500)
  }

  return (
    <div className="min-h-screen bg-zinc-950 transition-colors storefront-theme">
      <style>{`
        .storefront-theme {
          --color-shop-primary: ${theme.primaryColor};
          --color-shop-accent: ${theme.primaryColor};
          --font-display: '${theme.fontFamily}', system-ui, sans-serif;
          --radius-button: ${theme.buttonRadius === 'pill' ? '9999px' : theme.buttonRadius === 'sharp' ? '0px' : '0.5rem'};
        }
        .storefront-theme h1, .storefront-theme h2, .storefront-theme h3 {
          font-family: var(--font-display) !important;
        }
        .storefront-theme button, .storefront-theme .btn {
          border-radius: var(--radius-button) !important;
        }
      `}</style>
      <StoreNav cartCount={cartCount} theme={theme} />

      {/* Hero Section */}
      {theme.heroLayout !== 'hidden' && (
        <div className={`relative overflow-hidden bg-zinc-950 flex ${theme.heroLayout === 'minimalist' ? 'items-center justify-center text-center' : 'items-end text-left'} pb-24 border-b border-zinc-800/50`} style={{ minHeight: '75vh' }}>
          {theme.heroLayout === 'cinematic' && (
            <HeroCarousel images={filteredProducts.slice(0, 4).map(p => p.image).filter(Boolean)} />
          )}
          {theme.heroLayout === 'static' && theme.heroImage && (
            <div className="absolute inset-0 w-full h-full bg-zinc-950">
              <img src={theme.heroImage} loading="eager" decoding="async" className="absolute inset-0 w-full h-full object-cover" alt="Hero" />
            </div>
          )}
          {(theme.heroLayout === 'cinematic' || theme.heroLayout === 'static') && (
            <div className="absolute inset-0 bg-black pointer-events-none" style={{ opacity: (theme.heroOpacity || 60) / 100 }} />
          )}
          
          <div className={`relative max-w-6xl mx-auto px-6 z-10 w-full pointer-events-none ${theme.heroLayout === 'minimalist' ? 'mt-20 flex flex-col items-center' : ''}`}>
            {theme.heroLayout !== 'minimalist' && (
              <p className="text-zinc-400 text-sm font-mono mb-4 tracking-widest uppercase">New arrivals · Summer 2026</p>
            )}
            <h1 className="text-5xl md:text-7xl font-bold font-display text-white mb-6 whitespace-pre-line tracking-tight leading-tight">{theme.heroTitle}</h1>
            <p className={`text-zinc-300 text-lg md:text-xl max-w-xl mb-10 leading-relaxed pointer-events-auto`}>{theme.heroSubtitle}</p>
            <button 
              className="pointer-events-auto bg-zinc-100 hover:bg-white text-zinc-950 px-8 py-4 rounded-full font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
              onClick={() => window.scrollTo({ top: window.innerHeight * 0.75, behavior: 'smooth' })}
            >
              {theme.heroButtonText || 'Shop Collection'}
            </button>
          </div>
        </div>
      )}

      {/* Products with 3D tilt */}
      <div className="max-w-6xl mx-auto px-6 py-10" style={{ perspective: '1200px' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-bold font-display text-white  text-xl transition-colors">
              {selectedCategory === 'All' ? 'All products' : `${selectedCategory} Collection`}
            </h2>
            <span className="text-sm text-white/50  font-mono transition-colors">{filteredProducts.length} items</span>
          </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 text-sm border border-white/10 bg-zinc-900/50 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-shop-accent/20 focus:border-shop-accent transition-colors"
              />
            </div>
          </div>

          {/* Advanced Toolbar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
              {['All', 'Apparel', 'Accessories', 'Home'].map(cat => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setVisibleCount(4); }}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${selectedCategory === cat ? 'bg-shop-primary text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              {/* Price Filter */}
              <select 
                value={priceFilter} 
                onChange={(e) => { setPriceFilter(e.target.value); setVisibleCount(4); }}
                className="bg-transparent text-sm text-white/80 border-none outline-none cursor-pointer"
              >
                <option value="all" className="bg-zinc-900/50">Any Price</option>
                <option value="under50" className="bg-zinc-900/50">Under $50</option>
                <option value="50to100" className="bg-zinc-900/50">$50 - $100</option>
                <option value="over100" className="bg-zinc-900/50">Over $100</option>
              </select>

              <div className="w-px h-4 bg-white/20"></div>

              {/* Sort By */}
              <select 
                value={sortOption} 
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-transparent text-sm text-white/80 border-none outline-none cursor-pointer"
              >
                <option value="newest" className="bg-zinc-900/50">Newest</option>
                <option value="price-asc" className="bg-zinc-900/50">Price: Low to High</option>
                <option value="price-desc" className="bg-zinc-900/50">Price: High to Low</option>
                <option value="bestselling" className="bg-zinc-900/50">Bestselling</option>
              </select>

              <div className="w-px h-4 bg-white/20 hidden sm:block"></div>

              {/* View Toggle */}
              <div className="hidden sm:flex bg-black/40 rounded-lg p-1 gap-1">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-shop-primary text-white' : 'text-white/50 hover:text-white'}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-shop-primary text-white' : 'text-white/50 hover:text-white'}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                </button>
              </div>
            </div>
          </div>

        {filteredProducts.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 bg-zinc-900/50 rounded-[10px] border border-white/10 transition-colors">
            <h3 className="text-white/90 font-semibold mb-2">No products found</h3>
            <p className="text-sm text-white/60">Try adjusting your search or filters.</p>
          </motion.div>
        ) : (
          <>
            <motion.div layout className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
              <AnimatePresence mode="popLayout">
                {displayedProducts.map((p) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.25, type: 'spring', bounce: 0 }}
                  >
                    {viewMode === 'grid' ? (
                      <ProductCard3D product={p} onAddToCart={addToCart} onQuickView={setQuickViewProduct} isFlat={theme.cardStyle === 'flat'} />
                    ) : (
                      <ProductListCard product={p} onAddToCart={addToCart} onQuickView={setQuickViewProduct} isFlat={theme.cardStyle === 'flat'} />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {filteredProducts.length > visibleCount && (
              <div className="mt-12 text-center">
                <button 
                  onClick={() => setVisibleCount(v => v + 4)}
                  className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white text-sm font-semibold transition-colors"
                >
                  Load More Products
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 py-10 border-t border-white/10 mt-10">
          <h2 className="font-bold font-display text-white text-xl mb-6">Recently Viewed</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
            {recentlyViewed.map(p => (
              <div key={p.id} className="w-48 shrink-0 snap-start">
                <ProductCard3D product={p} onAddToCart={addToCart} onQuickView={setQuickViewProduct} />
              </div>
            ))}
          </div>
        </div>
      )}

      <QuickViewModal 
        product={quickViewProduct} 
        isOpen={!!quickViewProduct} 
        onClose={() => setQuickViewProduct(null)} 
        onAddToCart={(p, qty) => {
          handleAddToCart(p, qty)
          setToast(`Added ${qty}x ${p.name} to cart`)
          setTimeout(() => setToast(''), 2500)
        }} 
      />

      {/* Footer */}
      <footer className="border-t border-white/10  py-8 px-6 mt-4 transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/50 ">
          <p>{theme.footerText || '© 2026 Acme Goods Co. · Powered by OwnStore'}</p>
          <div className="flex gap-4">
            {theme.socialInstagram && <a href={theme.socialInstagram} target="_blank" rel="noreferrer" className="hover:text-white/70 transition-colors">Instagram</a>}
            {theme.socialTwitter && <a href={theme.socialTwitter} target="_blank" rel="noreferrer" className="hover:text-white/70 transition-colors">Twitter (X)</a>}
            {theme.socialTiktok && <a href={theme.socialTiktok} target="_blank" rel="noreferrer" className="hover:text-white/70 transition-colors">TikTok</a>}
            <Link to={`/store/${subdomain}/privacy`} className="hover:text-white/70 transition-colors">Privacy</Link>
            <Link to={`/store/${subdomain}/returns`} className="hover:text-white/70 transition-colors">Returns</Link>
            <Link to={`/store/${subdomain}/contact`} className="hover:text-white/70 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>

      {toast && <Toast message={toast} />}
      <style>{`
        @keyframes cardFadeIn {
          from { opacity:0; transform: perspective(600px) translateY(24px) rotateX(8deg); }
          to { opacity:1; transform: perspective(600px) translateY(0) rotateX(0deg); }
        }
      `}</style>
    </div>
  )
}

// ── Product Detail ─────────────────────────────────────────────────────────────

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, handleAddToCart, products, reviews, setReviews, subdomain } = useOutletContext();
  const user = getUserContext();
  const isOwnStore = user?.role === 'admin' && user?.subdomain === subdomain;
  const product = (Array.isArray(products) ? products : []).find(p => String(p.id) === String(id));

  const productReviews = (Array.isArray(reviews) ? reviews : [])
    .filter(r => (r.product_id === id || r.productId === id) && (r.status || 'approved') === 'approved');
  const averageRating = productReviews.length 
    ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
    : 0;

  const [toast, setToast] = useState('');
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  
  const productImages = product ? (product.image || '').split(',').map(s => s.trim()).filter(Boolean) : [];
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    if (productImages.length > 0) {
      setSelectedImage(productImages[0]);
    }
  }, [product?.id]);
  const tilt = useTilt(7);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    if (product) {
      if (product.sizes?.length > 0) setSelectedSize(product.sizes[0]);
      if (product.colors?.length > 0) setSelectedColor(product.colors[0]);
    }
  }, [product]);

  const location = useLocation();
  useEffect(() => {
    if (product) {
      const searchParams = new URLSearchParams(location.search);
      if (searchParams.get('add_to_cart') === 'true') {
        const size = product.sizes?.length > 0 ? product.sizes[0] : null;
        const color = product.colors?.length > 0 ? product.colors[0] : null;
        handleAddToCart(product, 1, size, color);
        // Remove the query param to prevent re-adding on refresh
        navigate(location.pathname, { replace: true });
      }
    }
  }, [product, location.search]);

  useEffect(() => {
    if (product?.id) {
      try {
        const viewed = JSON.parse(localStorage.getItem('recently_viewed') || '[]')
        const updated = [product.id, ...viewed.filter(id => id !== product.id)].slice(0, 8)
        localStorage.setItem('recently_viewed', JSON.stringify(updated))
      } catch (e) {}
    }
  }, [product?.id]);

  const [reviewForm, setReviewForm] = useState({ rating: 5, author: '', text: '' });

  const submitReview = async () => {
    if (!reviewForm.author.trim() || !reviewForm.text.trim()) {
      setToast('Please fill out your name and review.')
      setTimeout(() => setToast(''), 2500)
      return
    }
    const newReview = {
      id: `r${Date.now()}`,
      product_id: product.id,
      rating: reviewForm.rating,
      author: reviewForm.author,
      text: reviewForm.text,
      date: new Date().toISOString().split('T')[0]
    }
    setReviews(prev => [newReview, ...prev])
    await addReview(newReview, null, subdomain)
    setReviewForm({ rating: 5, author: '', text: '' })
    setToast('Review submitted successfully!')
    setTimeout(() => setToast(''), 2500)
  }

  const add = () => {
    handleAddToCart(product, qty, selectedSize, selectedColor)
    let msg = `Added ${qty}× ${product.name}`
    if (selectedSize || selectedColor) msg += ` (${[selectedSize, selectedColor].filter(Boolean).join(', ')})`
    setToast(msg + ' to cart')
    setTimeout(() => setToast(''), 2500)
  }

  const theme = useStoreTheme()

  if (!product) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white transition-colors storefront-theme">
        <style>{`
          .storefront-theme {
            --color-shop-primary: ${theme.primaryColor};
            --color-shop-accent: ${theme.primaryColor};
            --font-display: '${theme.fontFamily}', system-ui, sans-serif;
            --radius-button: ${theme.buttonRadius === 'pill' ? '9999px' : theme.buttonRadius === 'sharp' ? '0px' : '0.5rem'};
          }
        `}</style>
        <StoreNav cartCount={cartCount} theme={theme} />
        <div className="flex-1 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold font-display mb-4">Product Not Found</h2>
          <button onClick={() => navigate(`/store/${subdomain}`)} className="text-white/60 hover:text-white transition-colors">
            ← Back to store
          </button>
        </div>
      </div>
    );
  }

  const related = (Array.isArray(products) ? products : []).filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);

  const variantKey = [selectedColor, selectedSize].filter(Boolean).join('-');
  let availableStock = product.stock;
  if (variantKey && product.variant_stock) {
      const vStock = typeof product.variant_stock === 'string' ? JSON.parse(product.variant_stock) : product.variant_stock;
      if (vStock[variantKey] !== undefined) {
          availableStock = parseInt(vStock[variantKey], 10);
      }
  }

  return (
    <div className="min-h-screen bg-zinc-950 transition-colors storefront-theme">
      <style>{`
        .storefront-theme {
          --color-shop-primary: ${theme.primaryColor};
          --color-shop-accent: ${theme.primaryColor};
          --font-display: '${theme.fontFamily}', system-ui, sans-serif;
          --radius-button: ${theme.buttonRadius === 'pill' ? '9999px' : theme.buttonRadius === 'sharp' ? '0px' : '0.5rem'};
        }
        .storefront-theme h1, .storefront-theme h2, .storefront-theme h3 {
          font-family: var(--font-display) !important;
        }
        .storefront-theme button, .storefront-theme .btn {
          border-radius: var(--radius-button) !important;
        }
      `}</style>
      <StoreNav cartCount={cartCount} theme={theme} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="max-w-6xl mx-auto px-6 py-8" style={{ perspective: '1200px' }}>
        <button onClick={() => navigate(-1)} className="text-sm text-white/60  hover:text-white/90  flex items-center gap-1.5 mb-6 cursor-pointer transition-colors">
          ← Back to store
        </button>

        <div className="grid md:grid-cols-2 gap-10 bg-zinc-900/50  border border-white/10  rounded-[10px] p-8 transition-colors">
          <div className="flex flex-col gap-4">
            {/* 3D tilting product image */}
            <div
              ref={tilt.ref}
              onMouseMove={tilt.onMouseMove}
              onMouseLeave={tilt.onMouseLeave}
              className="bg-zinc-800 rounded-[10px] overflow-hidden aspect-square transition-colors"
              style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
            >
              <img src={selectedImage || productImages[0]} alt={product.name} loading="eager" decoding="async" className="w-full h-full object-cover" />
            </div>
            
            {productImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {productImages.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === img ? 'border-shop-primary' : 'border-transparent hover:border-white/20'}`}
                  >
                    <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-mono font-medium text-white/50  bg-white/10  px-2 py-0.5 rounded w-fit mb-3 transition-colors">{product.category}</span>
            <h1 className="text-3xl font-bold font-display text-white  mb-2 transition-colors">{product.name}</h1>
            
            {productReviews.length > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-yellow-400 text-sm">{'★'.repeat(Math.round(averageRating))}{'☆'.repeat(5 - Math.round(averageRating))}</span>
                <span className="text-xs text-white/60">({productReviews.length} reviews)</span>
              </div>
            )}

            <p className="text-2xl font-bold text-shop-primary  mb-4 transition-colors">${product.price}</p>
            <p className="text-sm text-white/70  leading-relaxed mb-6 transition-colors">{product.description}</p>

            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-mono ${availableStock > 10 ? 'text-green-600' : availableStock > 0 ? 'text-amber-600' : 'text-red-500'}`}>
                {availableStock > 10 ? '✓ In stock' : availableStock > 0 ? `⚠ Only ${availableStock} left` : '✕ Out of stock'}
              </span>
            </div>

            {product.sizes?.length > 0 && (
              <div className="mb-4">
                <label className="text-sm font-medium text-white/80  block mb-2">Size</label>
                <div className="flex gap-2">
                  {product.sizes.map(s => (
                    <button key={s} onClick={() => setSelectedSize(s)} className={`px-3 py-1 border rounded text-sm transition-colors ${selectedSize === s ? 'border-shop-primary bg-white/5 text-shop-primary  ' : 'border-white/10 text-white/70 hover:border-slate-300  '}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors?.length > 0 && (
              <div className="mb-6">
                <label className="text-sm font-medium text-white/80  block mb-2">Color</label>
                <div className="flex gap-2">
                  {product.colors.map(c => (
                    <button key={c} onClick={() => setSelectedColor(c)} className={`px-3 py-1 border rounded text-sm transition-colors ${selectedColor === c ? 'border-shop-primary bg-white/5 text-shop-primary  ' : 'border-white/10 text-white/70 hover:border-slate-300  '}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 mb-6 mt-2">
              <label className="text-sm font-medium text-white/80 ">Quantity</label>
              <div className="flex items-center border border-white/10  rounded-[10px] overflow-hidden transition-colors">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-9 h-9 flex items-center justify-center text-white/60  hover:bg-zinc-950  cursor-pointer transition-colors">−</button>
                <span className="w-10 text-center text-sm font-semibold text-white  font-mono transition-colors">{qty}</span>
                <button onClick={() => setQty(q => Math.min(availableStock, q + 1))} className="w-9 h-9 flex items-center justify-center text-white/60  hover:bg-zinc-950  cursor-pointer transition-colors">+</button>
              </div>
            </div>

            <div className="flex gap-3 mt-auto">
              {isOwnStore ? (
                <Button disabled className="flex-1 bg-white/5 text-white/40 border border-white/10 cursor-not-allowed" size="lg">
                  Your Store
                </Button>
              ) : (
                <Button className="flex-1 active:scale-95 transition-transform" size="lg" onClick={add} disabled={availableStock === 0}>
                  Add to cart · ${(product.price * qty).toFixed(2)}
                </Button>
              )}
            </div>

            <div className="mt-6 pt-5 border-t border-white/5  flex flex-col gap-2 transition-colors">
              {[['🚚', 'Free shipping on orders over $100'], ['↩', 'Easy 30-day returns'], ['🔒', 'Secure checkout']].map(([icon, text]) => (
                <div key={text} className="flex items-center gap-2 text-xs text-white/60 ">
                  <span>{icon}</span><span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-10 bg-zinc-900/50  border border-white/10  rounded-[10px] p-8 transition-colors">
          <h2 className="font-bold font-display text-white  mb-6 text-xl transition-colors">Customer Reviews</h2>
          
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              {productReviews.length === 0 ? (
                <p className="text-sm text-white/60 ">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-6">
                  {productReviews.map(r => (
                    <div key={r.id} className="border-b border-white/5  pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-yellow-400 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                        <span className="text-sm font-semibold text-white ">{r.author}</span>
                        <span className="text-xs text-white/50">{r.date}</span>
                      </div>
                      <p className="text-sm text-white/70 ">{r.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-zinc-950  p-6 rounded-[10px] border border-white/10 ">
              <h3 className="font-semibold text-white  mb-4 text-sm">Write a review</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-white/70 ">Rating:</label>
                  <select 
                    value={reviewForm.rating} 
                    onChange={e => setReviewForm(f => ({ ...f, rating: +e.target.value }))}
                    className="px-2 py-1 rounded border border-white/10  bg-zinc-900/50  text-sm outline-none "
                  >
                    {[5,4,3,2,1].map(num => <option key={num} value={num}>{num} Stars</option>)}
                  </select>
                </div>
                <input 
                  placeholder="Your Name" 
                  value={reviewForm.author}
                  onChange={e => setReviewForm(f => ({ ...f, author: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded border border-white/10  bg-zinc-900/50  text-white  outline-none focus:border-shop-accent"
                />
                <textarea 
                  placeholder="What did you think about this product?" 
                  rows={3}
                  value={reviewForm.text}
                  onChange={e => setReviewForm(f => ({ ...f, text: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded border border-white/10  bg-zinc-900/50  text-white  outline-none focus:border-shop-accent resize-none"
                />
                <Button onClick={submitReview}>Submit Review</Button>
              </div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="font-bold font-display text-white  mb-4 transition-colors">You might also like</h2>
            <div className="grid grid-cols-3 gap-4">
              {related.map(p => (
                <ProductCard3D key={p.id} product={p} onProduct={() => { }} onAddToCart={() => handleAddToCart(p, 1)} />
              ))}
            </div>
          </div>
        )}
      </motion.div>
      {toast && <Toast message={toast} />}
    </div>
  )
}

// ── Cart & Checkout ────────────────────────────────────────────────────────────

export function CartCheckout() {
  const navigate = useNavigate();
  const { subdomain } = useParams()
  const { cart, handleUpdateCart, setCart, setIsCheckoutModalOpen } = useOutletContext();
  const customer = getUserContext()
  const theme = useStoreTheme()

  const onBack = () => navigate(-1);
  const onConfirm = () => {
    setCart([])
    navigate(`/store/${subdomain}/confirmation`)
  };
  const [form, setForm] = useState({ name: customer?.name || '', email: customer?.email || '', address: '', phone: '' })
  const [paymentForm, setPaymentForm] = useState({ cardName: '', cardNumber: '', expiry: '', cvc: '' })
  const [errors, setErrors] = useState({})
  const [step, setStep] = useState('cart') // 'cart', 'checkout', 'payment'
  const [isProcessing, setIsProcessing] = useState(false)

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0)
  const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0)
  const shipping = subtotal >= 100 ? 0 : 8
  const total = subtotal + shipping

  const updateQty = (idx, qty) => {
    const item = cart[idx]
    if (qty === 0) {
      handleUpdateCart(item.product.id, 0, item.size, item.color)
    } else {
      handleUpdateCart(item.product.id, qty, item.size, item.color)
    }
  }

  const validateCheckout = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    if (!form.address.trim()) e.address = 'Delivery address is required'
    if (!form.phone.trim()) e.phone = 'Phone number is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validatePayment = () => {
    const e = {}
    if (!paymentForm.cardName.trim()) e.cardName = 'Required'
    if (!paymentForm.cardNumber.trim()) e.cardNumber = 'Required'
    if (!paymentForm.expiry.trim()) e.expiry = 'Required'
    if (!paymentForm.cvc.trim()) e.cvc = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleContinueToPayment = () => {
    if (!validateCheckout()) return
    setStep('payment')
  }

  const handlePlaceOrder = async () => {
    if (!validatePayment()) return
    setIsProcessing(true)
    
    const newOrder = {
      customer_id: customer?.id || null,
      customer: form.name,
      email: form.email,
      total: total,
      date: new Date().toISOString().split('T')[0],
      status: 'processing',
      items: cart.map(i => ({ product_id: i.product.id, name: i.product.name, quantity: i.quantity, price: i.product.price, size: i.size, color: i.color }))
    }
    const res = await addOrder(newOrder, null, subdomain)
    
    setTimeout(() => {
      setIsProcessing(false)
      setCart([])
      navigate(`/store/${subdomain}/confirmation`, { state: { orderId: res.id, pastCart: cart, pastTotal: total } })
    }, 2500)
  }

  return (

    <div className="min-h-screen bg-zinc-950 transition-colors storefront-theme">
      <style>{`
        .storefront-theme {
          --color-shop-primary: ${theme.primaryColor};
          --color-shop-accent: ${theme.primaryColor};
          --font-display: '${theme.fontFamily}', system-ui, sans-serif;
          --radius-button: ${theme.buttonRadius === 'pill' ? '9999px' : theme.buttonRadius === 'sharp' ? '0px' : '0.5rem'};
        }
        .storefront-theme h1, .storefront-theme h2, .storefront-theme h3 {
          font-family: var(--font-display) !important;
        }
        .storefront-theme button, .storefront-theme .btn {
          border-radius: var(--radius-button) !important;
        }
      `}</style>
      <StoreNav cartCount={cartCount} theme={theme} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="max-w-5xl mx-auto px-6 py-8">
        <button onClick={() => navigate(-1)} className="text-sm text-white/60  hover:text-white/90  flex items-center gap-1.5 mb-6 cursor-pointer transition-colors">
          ← Continue shopping
        </button>
        <h1 className="text-2xl font-bold font-display text-white  mb-6 transition-colors">
          {step === 'cart' ? 'Your cart' : step === 'checkout' ? 'Delivery Details' : 'Payment Details'}
        </h1>

        {cart.length === 0 ? (
          <div className="bg-zinc-900/50  border border-white/10  rounded-[10px] p-12 text-center transition-colors">
            <p className="text-4xl mb-4">🛒</p>
            <h2 className="font-bold font-display text-white/90  mb-2 transition-colors">Your cart is empty</h2>
            <p className="text-sm text-white/50  mb-6 transition-colors">Add some products to get started.</p>
            <Button onClick={() => navigate(-1)}>Browse products</Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="bg-zinc-900/50 border border-white/10 rounded-[10px] divide-y divide-slate-100">
                {cart.map((item, idx) => (
                  <div key={item.product.id} className="flex items-center gap-4 p-4" style={{ animation: 'cardFadeIn 0.3s ease-out' }}>
                    <img src={item.product.image} alt={item.product.name} className="w-16 h-16 rounded-lg object-cover border border-white/5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">{item.product.name}</p>
                      {(item.size || item.color) && (
                        <p className="text-xs text-white/60 mt-0.5">
                          {[item.size, item.color].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      <p className="text-xs text-white/50 mt-0.5">${item.product.price} each</p>
                    </div>
                    <div className="flex items-center border border-white/10 rounded-lg overflow-hidden">
                      <button onClick={() => updateQty(idx, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-white/60 hover:bg-zinc-950 cursor-pointer text-sm">−</button>
                      <span className="w-8 text-center text-sm font-mono font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQty(idx, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-white/60 hover:bg-zinc-950 cursor-pointer text-sm">+</button>
                    </div>
                    <p className="font-semibold text-white w-12 text-right text-sm">${item.product.price * item.quantity}</p>
                  </div>
                ))}
              </div>

              {step === 'checkout' && (
                <div className="bg-zinc-900/50 border border-white/10 rounded-[10px] p-6" style={{ animation: 'cardFadeIn 0.18s ease-out' }}>
                  <h2 className="font-semibold text-white font-display mb-4">Delivery details</h2>
                  <div className="flex flex-col gap-4">
                    {[
                      { key: 'name', placeholder: 'Full name' },
                      { key: 'email', placeholder: 'Email address', type: 'email' },
                      { key: 'address', placeholder: 'Full delivery address' },
                      { key: 'phone', placeholder: 'Phone number' },
                    ].map(({ key, placeholder, type = 'text' }) => (
                      <div key={key}>
                        <input
                          type={type}
                          placeholder={placeholder}
                          value={form[key]}
                          onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: '' })) }}
                          className={`w-full px-3.5 py-2.5 rounded-[10px] border text-sm outline-none ${errors[key] ? 'border-red-400 bg-red-50/20' : 'border-white/10 focus:border-shop-accent focus:ring-2 focus:ring-shop-accent/20'}`}
                        />
                        {errors[key] && <p className="text-xs text-red-500 mt-1">⚠ {errors[key]}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 'payment' && (
                <div className="bg-zinc-900/50 border border-white/10 rounded-[10px] p-6" style={{ animation: 'cardFadeIn 0.18s ease-out' }}>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-semibold text-white font-display">Payment details</h2>
                    <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded font-mono">Mock Checkout</span>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div>
                      <input
                        placeholder="Name on card"
                        value={paymentForm.cardName}
                        onChange={e => { setPaymentForm(f => ({ ...f, cardName: e.target.value })); setErrors(er => ({ ...er, cardName: '' })) }}
                        className={`w-full px-3.5 py-2.5 rounded-[10px] border text-sm outline-none ${errors.cardName ? 'border-red-400 bg-red-50/20' : 'border-white/10 focus:border-shop-accent'}`}
                      />
                      {errors.cardName && <p className="text-xs text-red-500 mt-1">⚠ {errors.cardName}</p>}
                    </div>
                    <div>
                      <input
                        placeholder="Card number (e.g. 4242 4242 4242 4242)"
                        value={paymentForm.cardNumber}
                        onChange={e => { setPaymentForm(f => ({ ...f, cardNumber: e.target.value })); setErrors(er => ({ ...er, cardNumber: '' })) }}
                        className={`w-full px-3.5 py-2.5 rounded-[10px] border font-mono text-sm outline-none ${errors.cardNumber ? 'border-red-400 bg-red-50/20' : 'border-white/10 focus:border-shop-accent'}`}
                      />
                      {errors.cardNumber && <p className="text-xs text-red-500 mt-1">⚠ {errors.cardNumber}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input
                          placeholder="MM/YY"
                          value={paymentForm.expiry}
                          onChange={e => { setPaymentForm(f => ({ ...f, expiry: e.target.value })); setErrors(er => ({ ...er, expiry: '' })) }}
                          className={`w-full px-3.5 py-2.5 rounded-[10px] border text-sm outline-none ${errors.expiry ? 'border-red-400 bg-red-50/20' : 'border-white/10 focus:border-shop-accent'}`}
                        />
                        {errors.expiry && <p className="text-xs text-red-500 mt-1">⚠ {errors.expiry}</p>}
                      </div>
                      <div>
                        <input
                          placeholder="CVC"
                          value={paymentForm.cvc}
                          onChange={e => { setPaymentForm(f => ({ ...f, cvc: e.target.value })); setErrors(er => ({ ...er, cvc: '' })) }}
                          className={`w-full px-3.5 py-2.5 rounded-[10px] border text-sm outline-none ${errors.cvc ? 'border-red-400 bg-red-50/20' : 'border-white/10 focus:border-shop-accent'}`}
                        />
                        {errors.cvc && <p className="text-xs text-red-500 mt-1">⚠ {errors.cvc}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="bg-zinc-900/50 border border-white/10 rounded-[10px] p-5 sticky top-6">
                <h2 className="font-semibold text-white font-display mb-4">Order summary</h2>
                <div className="flex flex-col gap-2 text-sm mb-4">
                  <div className="flex justify-between text-white/70"><span>Subtotal</span><span>${subtotal}</span></div>
                  <div className="flex justify-between text-white/70">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? <span className="text-green-600">Free</span> : `$${shipping}`}</span>
                  </div>
                  {shipping > 0 && <p className="text-xs text-white/50">Add ${100 - subtotal} more for free shipping</p>}
                </div>
                <div className="border-t border-white/5 pt-3 mb-4 flex justify-between font-bold text-white">
                  <span>Total</span><span>${total}</span>
                </div>
                {step === 'cart' ? (
                  <Button className="w-full" onClick={() => setIsCheckoutModalOpen(true)}>Proceed to checkout →</Button>
                ) : step === 'checkout' ? (
                  <Button className="w-full" onClick={handleContinueToPayment}>Continue to payment →</Button>
                ) : (
                  <Button className="w-full" onClick={handlePlaceOrder} disabled={isProcessing}>
                    {isProcessing ? 'Processing Payment...' : 'Place order →'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>
      <style>{`
        @keyframes cardFadeIn {
          from { opacity:0; transform:translateY(8px); }
          to { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  )
}

// ── Order Confirmation ─────────────────────────────────────────────────────────

export function OrderConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { subdomain } = useParams();
  const { settings: theme } = useOutletContext();
  
  const orderId = location.state?.orderId || 'ORD-' + Math.floor(Math.random() * 10000);
  const cartData = location.state?.pastCart || [];
  const total = location.state?.pastTotal || 0;
  
  const onHome = () => navigate(`/store/${subdomain}`);
  const tilt = useTilt(6)

  const handleDownloadPDF = async () => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    doc.setFontSize(22)
    doc.text('Order Receipt', 20, 20)
    doc.setFontSize(12)
    doc.text(`Order ID: ${orderId}`, 20, 30)
    doc.text(`Store: ${subdomain || 'OwnStore'}`, 20, 40)
    doc.text(`Total: $${total.toFixed(2)}`, 20, 50)
    
    let y = 70
    cartData.forEach((item, idx) => {
      doc.text(`${item.quantity}x ${item.product.name} - $${(item.product.price * item.quantity).toFixed(2)}`, 20, y)
      y += 10
    })

    doc.save(`Receipt_${orderId}.pdf`)
  }

  return (
    <div className="min-h-screen bg-zinc-950  flex items-center justify-center p-6 transition-colors" style={{ perspective: '1200px' }}>
      <Confetti recycle={false} numberOfPieces={400} gravity={0.2} colors={['#ffffff', '#a1a1aa', '#3f3f46', '#27272a', theme?.primaryColor || '#4f46e5']} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
        <div
          ref={tilt.ref}
          onMouseMove={tilt.onMouseMove}
          onMouseLeave={tilt.onMouseLeave}
          className="bg-zinc-900/50  border border-white/10  rounded-[12px] shadow-sm w-full p-8 text-center transition-colors"
          style={{ transformStyle: 'preserve-3d', willChange: 'transform', animation: 'cardIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}
        >
          <div className="w-16 h-16 bg-green-100  rounded-full flex items-center justify-center text-3xl mx-auto mb-5 transition-colors"
            style={{ transform: 'translateZ(24px)', animation: 'bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.2s both' }}>✓</div>
          <h1 className="text-2xl font-bold font-display text-white  mb-1 transition-colors" style={{ transform: 'translateZ(16px)' }}>Order confirmed!</h1>
          <p className="text-sm text-white/60  mb-1 transition-colors" style={{ transform: 'translateZ(10px)' }}>Thank you for your purchase.</p>
          <p className="font-mono text-sm text-shop-primary  bg-white/5  rounded-lg px-3 py-2 inline-block mt-1 mb-6 transition-colors" style={{ transform: 'translateZ(14px)' }}>{orderId}</p>

          {cartData.length > 0 && (
            <div className="border border-white/5  rounded-[10px] divide-y divide-slate-100  text-left mb-6 transition-colors">
              {cartData.map(item => (
                <div key={item.product.id} className="flex items-center gap-3 p-3">
                  <img src={item.product.image} alt={item.product.name} className="w-10 h-10 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white/90  truncate transition-colors">{item.product.name}</p>
                    <p className="text-[11px] text-white/50  font-mono transition-colors">×{item.quantity}</p>
                    {item.product.is_digital && item.product.file_url && (
                      <a href={item.product.file_url} target="_blank" rel="noreferrer" className="text-xs text-shop-primary hover:underline mt-1 inline-block">
                        Download File ↓
                      </a>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-white  transition-colors">${item.product.price * item.quantity}</p>
                </div>
              ))}
              <div className="flex justify-between p-3 font-semibold text-sm text-white  transition-colors">
                <span>Total</span><span>${total}</span>
              </div>
            </div>
          )}

          <div className="bg-zinc-950  rounded-[10px] p-4 mb-6 text-left transition-colors">
            <p className="text-xs font-mono text-white/50  mb-3 transition-colors">Estimated status</p>
            {[
              { label: 'Order received', time: 'Now', done: true },
              { label: 'Processing', time: 'Today', done: false },
              { label: 'Out for delivery', time: '1–3 days', done: false },
              { label: 'Delivered', time: '2–4 days', done: false },
            ].map((s) => (
              <div key={s.label} className="flex items-start gap-3 mb-2 last:mb-0">
                <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 transition-colors ${s.done ? 'bg-green-500 border-green-500  ' : 'bg-zinc-900/50  border-slate-300 '}`} />
                <div className="flex-1">
                  <p className={`text-xs font-medium transition-colors ${s.done ? 'text-green-700 ' : 'text-white/60 '}`}>{s.label}</p>
                </div>
                <p className="text-[11px] font-mono text-white/50  transition-colors">{s.time}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs text-white/50  transition-colors">We'll call you on your phone number to confirm delivery details.</p>
            <Button className="w-full mt-2" onClick={handleDownloadPDF} variant="secondary">
              Download PDF Receipt
            </Button>
            <Button className="w-full" onClick={onHome}>Continue shopping</Button>
          </div>
        </div>
      </motion.div>

      <style>{`
        @keyframes cardIn { from { opacity:0; transform:perspective(600px) translateY(30px) rotateX(6deg) scale(0.96); } to { opacity:1; transform:perspective(600px) translateY(0) rotateX(0deg) scale(1); } }
        @keyframes bounceIn { from { opacity:0; transform:translateZ(24px) scale(0.3); } to { opacity:1; transform:translateZ(24px) scale(1); } }
      `}</style>
    </div>
  )
}

// ── Slide-Out Cart Sidebar ───────────────────────────────────────────────────

export function CartSidebar({ isOpen, onClose, cart, handleUpdateCart, onCheckout }) {
  const navigate = useNavigate();
  const { subdomain } = useParams();
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0)
  const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0)

  const updateQty = (idx, qty) => {
    const item = cart[idx]
    if (qty === 0) {
      handleUpdateCart(item.product.id, 0, item.size, item.color)
    } else {
      handleUpdateCart(item.product.id, qty, item.size, item.color)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            onClick={onClose}
            className="fixed inset-0 bg-zinc-900/50/40 backdrop-blur-sm z-40 transition-colors"
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-zinc-900/50  shadow-2xl z-50 flex flex-col border-l border-white/10  transition-colors"
          >
            <div className="p-6 border-b border-white/5  flex items-center justify-between transition-colors">
              <h2 className="text-xl font-bold font-display text-white  transition-colors">Your Cart ({cartCount})</h2>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10  text-white/60 transition-colors cursor-pointer">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-white/60">
                  <p className="text-4xl mb-3">🛒</p>
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {cart.map((item, idx) => (
                    <div key={`${item?.product?.id}-${item?.size}-${item?.color}`} className="flex gap-4">
                      <img src={item?.product?.image} alt={item?.product?.name} className="w-20 h-20 rounded-[10px] object-cover border border-white/5  transition-colors" />
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-semibold text-white  transition-colors">{item?.product?.name || 'Unknown Product'}</p>
                          <p className="text-sm font-bold text-white  transition-colors">${(item?.product?.price || 0) * item.quantity}</p>
                        </div>
                        {(item.size || item.color) && (
                          <p className="text-xs text-white/60  mb-2 transition-colors">
                            {[item.size, item.color].filter(Boolean).join(' · ')}
                          </p>
                        )}
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center border border-white/10  rounded-lg overflow-hidden transition-colors">
                            <button onClick={() => updateQty(idx, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center text-white/60  hover:bg-zinc-950  cursor-pointer text-xs transition-colors">−</button>
                            <span className="w-7 text-center text-xs font-mono font-semibold text-white  transition-colors">{item.quantity}</span>
                            <button onClick={() => updateQty(idx, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center text-white/60  hover:bg-zinc-950  cursor-pointer text-xs transition-colors">+</button>
                          </div>
                          <button onClick={() => updateQty(idx, 0)} className="text-xs text-white/50 hover:text-red-500 underline transition-colors cursor-pointer">Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="p-6 border-t border-white/5  bg-zinc-950  transition-colors">
                <div className="flex justify-between items-center mb-4 text-white  font-semibold transition-colors">
                  <span>Subtotal</span>
                  <span>${subtotal}</span>
                </div>
                <Button className="w-full" size="lg" onClick={onCheckout ? onCheckout : () => { onClose(); navigate(`/store/${subdomain}/cart`); }}>
                  Proceed to Checkout →
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}


