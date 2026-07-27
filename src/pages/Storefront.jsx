import { useState, Suspense, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Toast } from '@/components/ui/ui'
import { PRODUCTS } from '@/data' // fallback if needed
import { useTilt } from '@/hooks/useTilt'
import { Link } from 'react-router-dom'

// ── Mini 3D scene for storefront hero ────────────────────────────────────────

function ShopOrb() {
  const mesh = useRef(null)
  useFrame(({ clock }) => {
    if (!mesh.current) return
    mesh.current.rotation.y = clock.getElapsedTime() * 0.2
    mesh.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.4) * 0.15
  })
  return (
    <Float speed={1.2} floatIntensity={0.8}>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[1, 1]} />
        <MeshDistortMaterial color="#4338ca" distort={0.3} speed={1.5} roughness={0} metalness={0.8} transparent opacity={0.85} />
      </mesh>
    </Float>
  )
}

function StorefrontMiniScene() {
  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 50 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[3, 3, 3]} intensity={2} color="#818cf8" />
      <pointLight position={[-3, -2, 2]} intensity={1.2} color="#c7d2fe" />
      <ShopOrb />
    </Canvas>
  )
}

// ── Store Nav ─────────────────────────────────────────────────────────────────

import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { 
  addReview, 
  addOrder, 
  isAuthenticated, 
  getUserContext, 
  getStoredOrders
} from '@/services/storage'

function StoreNav({ cartCount }) {
  const navigate = useNavigate()
  const { subdomain } = useParams()
  const { setIsCartOpen } = useOutletContext()
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsCartOpen(false) // Close cart on route changes if necessary, or just rely on context
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggleDark = () => {
    const next = !isDark
    setIsDark(next)
    if (next) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }

  return (
    <header className="bg-[#021612]  border-b border-white/10  sticky top-0 z-20 transition-colors">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate(`/store/${subdomain}`)} className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-shop-primary flex items-center justify-center text-white font-bold text-sm">
            {subdomain?.charAt(0)?.toUpperCase() || 'S'}
          </div>
          <div className="text-left">
            <p className="font-semibold text-white  font-display leading-none text-sm capitalize">{subdomain?.replace('-', ' ') || 'OwnStore'}</p>
            <p className="text-[10px] text-white/50  font-mono mt-0.5">{subdomain || 'demo'}.ownstore.com</p>
          </div>
        </button>
        <div className="flex items-center gap-3">
          <button onClick={toggleDark} className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10  text-white/70  hover:bg-white/10  transition-colors cursor-pointer">
            {isDark ? '🌙' : '☀️'}
          </button>
          {isAuthenticated() ? (
            <button onClick={() => navigate(`/account`)} className="px-4 py-2 rounded-lg text-sm font-medium text-white/70  hover:bg-white/10  transition-colors">
              Account
            </button>
          ) : (
            <button onClick={() => navigate(`/login`)} className="px-4 py-2 rounded-lg text-sm font-medium text-white/70  hover:bg-white/10  transition-colors">
              Login
            </button>
          )}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 bg-[#000504]  hover:bg-white/10  border border-white/10  rounded-[10px] px-4 py-2 text-sm font-medium text-white/80  cursor-pointer transition-colors"
          >
            🛒 Cart
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-shop-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono"
                style={{ animation: 'badgePop 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
      <style>{`@keyframes badgePop { from { transform:scale(0) } to { transform:scale(1) } }`}</style>
    </header>
  )
}

// ── 3D Product Card ────────────────────────────────────────────────────────────

function ProductCard3D({ product, onAddToCart }) {
  const navigate = useNavigate()
  const tilt = useTilt(14)
  const [justAdded, setJustAdded] = useState(false)

  const handleAdd = (e) => {
    e.stopPropagation()
    onAddToCart(product)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1200)
  }

  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      onClick={() => navigate(`/store/product/${product.id}`)}
      className="bg-[#021612]  border border-white/10  rounded-[10px] overflow-visible cursor-pointer group transition-colors"
      style={{ transformStyle: 'preserve-3d', willChange: 'transform', transition: 'box-shadow 0.2s, background-color 0.2s, border-color 0.2s' }}
    >
      {/* Image layer — pops forward */}
      <div
        className="relative overflow-hidden bg-white/10  rounded-t-[10px]"
        style={{ transform: 'translateZ(0)', aspectRatio: '1' }}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.stock <= 5 && (
          <span className="absolute top-2 left-2 text-xs font-mono font-medium bg-red-500 text-white px-2 py-0.5 rounded-full"
            style={{ transform: 'translateZ(30px)' }}>
            Only {product.stock} left
          </span>
        )}
      </div>

      {/* Info layer */}
      <div className="p-4" style={{ transform: 'translateZ(10px)' }}>
        <p className="text-xs font-mono text-white/50  mb-0.5">{product.category}</p>
        <h3 className="font-semibold text-white  text-sm font-display mb-2 group-hover:text-shop-primary " style={{ transform: 'translateZ(4px)' }}>
          {product.name}
        </h3>
        <div className="flex items-center justify-between" style={{ transform: 'translateZ(6px)' }}>
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
    </div>
  )
}

// ── Store Home ────────────────────────────────────────────────────────────────

export function StoreHome() {
  const navigate = useNavigate();
  const { cart, handleAddToCart, products } = useOutletContext();
  const [toast, setToast] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0)

  const filteredProducts = (products || PRODUCTS).filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const addToCart = (p) => {
    handleAddToCart(p)
    setToast(`${p.name} added to cart`)
    setTimeout(() => setToast(''), 2500)
  }

  return (
    <div className="min-h-screen bg-[#000504]  transition-colors">
      <StoreNav cartCount={cartCount} />

      {/* Hero banner with 3D scene */}
      <div className="relative bg-gradient-to-br from-shop-primary to-indigo-900 overflow-hidden" style={{ minHeight: 260 }}>
        {/* 3D orb in background */}
        <div className="absolute right-0 top-0 bottom-0 w-80 opacity-70 pointer-events-none">
          <Suspense fallback={null}><StorefrontMiniScene /></Suspense>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-800/80 via-shop-primary/40 to-transparent pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6 py-14 z-10">
          <p className="text-indigo-300 text-sm font-mono mb-2">New arrivals · Summer 2026</p>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-white mb-4">Crafted with intention,<br />built to last.</h1>
          <p className="text-indigo-200 text-base max-w-md">Carefully curated essentials for everyday living — from wardrobe to workspace.</p>
        </div>
      </div>

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
              className="w-full sm:w-64 px-4 py-2 text-sm border border-white/10  bg-[#021612]  text-white  rounded-full focus:outline-none focus:ring-2 focus:ring-shop-accent/20 focus:border-shop-accent transition-colors"
            />
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              {['All', 'Apparel', 'Accessories', 'Home'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${selectedCategory === cat ? 'bg-shop-primary text-white' : 'bg-white/10  text-white/70  hover:bg-white/10 '}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 bg-[#021612]  rounded-[10px] border border-white/10  transition-colors">
            <h3 className="text-white/90  font-semibold mb-2">No products found</h3>
            <p className="text-sm text-white/60 ">Try adjusting your search or filters.</p>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((p, i) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.25, type: 'spring', bounce: 0 }}
                >
                  <ProductCard3D product={p} onAddToCart={addToCart} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10  py-8 px-6 mt-4 transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/50 ">
          <p>© 2026 Acme Goods Co. · Powered by <span className="text-shop-primary ">OwnStore</span></p>
          <div className="flex gap-4">
            <Link to="/store/privacy" className="hover:text-white/70 transition-colors">Privacy Policy</Link>
            <Link to="/store/returns" className="hover:text-white/70 transition-colors">Returns & Refunds</Link>
            <Link to="/store/contact" className="hover:text-white/70 transition-colors">Contact Us</Link>
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
  const { cart, handleAddToCart, products, reviews, setReviews, addReview } = useOutletContext();
  const product = (products || []).find(p => p.id === id);

  const productReviews = (reviews || []).filter(r => r.productId === id);
  const averageRating = productReviews.length 
    ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
    : 0;

  const [toast, setToast] = useState('');
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const tilt = useTilt(7);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    if (product) {
      if (product.sizes?.length > 0) setSelectedSize(product.sizes[0]);
      if (product.colors?.length > 0) setSelectedColor(product.colors[0]);
    }
  }, [product]);

  const [reviewForm, setReviewForm] = useState({ rating: 5, author: '', text: '' });

  const submitReview = async () => {
    if (!reviewForm.author.trim() || !reviewForm.text.trim()) {
      setToast('Please fill out your name and review.')
      setTimeout(() => setToast(''), 2500)
      return
    }
    const newReview = {
      id: `r${Date.now()}`,
      productId: product.id,
      ...reviewForm,
      date: new Date().toISOString().split('T')[0]
    }
    setReviews(prev => [newReview, ...prev])
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

  if (!product) return null;

  const related = (products || []).filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#000504]  transition-colors">
      <StoreNav cartCount={cartCount} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="max-w-6xl mx-auto px-6 py-8" style={{ perspective: '1200px' }}>
        <button onClick={() => navigate(-1)} className="text-sm text-white/60  hover:text-white/90  flex items-center gap-1.5 mb-6 cursor-pointer transition-colors">
          ← Back to store
        </button>

        <div className="grid md:grid-cols-2 gap-10 bg-[#021612]  border border-white/10  rounded-[10px] p-8 transition-colors">
          {/* 3D tilting product image */}
          <div
            ref={tilt.ref}
            onMouseMove={tilt.onMouseMove}
            onMouseLeave={tilt.onMouseLeave}
            className="bg-white/10  rounded-[10px] overflow-hidden aspect-square transition-colors"
            style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
          >
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
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
              <span className={`text-xs font-mono ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-amber-600' : 'text-red-500'}`}>
                {product.stock > 10 ? '✓ In stock' : product.stock > 0 ? `⚠ Only ${product.stock} left` : '✕ Out of stock'}
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
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-9 h-9 flex items-center justify-center text-white/60  hover:bg-[#000504]  cursor-pointer transition-colors">−</button>
                <span className="w-10 text-center text-sm font-semibold text-white  font-mono transition-colors">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="w-9 h-9 flex items-center justify-center text-white/60  hover:bg-[#000504]  cursor-pointer transition-colors">+</button>
              </div>
            </div>

            <div className="flex gap-3 mt-auto">
              <Button className="flex-1 active:scale-95 transition-transform" size="lg" onClick={add} disabled={product.stock === 0}>
                Add to cart · ${(product.price * qty).toFixed(2)}
              </Button>
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
        <div className="mt-10 bg-[#021612]  border border-white/10  rounded-[10px] p-8 transition-colors">
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

            <div className="bg-[#000504]  p-6 rounded-[10px] border border-white/10 ">
              <h3 className="font-semibold text-white  mb-4 text-sm">Write a review</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-white/70 ">Rating:</label>
                  <select 
                    value={reviewForm.rating} 
                    onChange={e => setReviewForm(f => ({ ...f, rating: +e.target.value }))}
                    className="px-2 py-1 rounded border border-white/10  bg-[#021612]  text-sm outline-none "
                  >
                    {[5,4,3,2,1].map(num => <option key={num} value={num}>{num} Stars</option>)}
                  </select>
                </div>
                <input 
                  placeholder="Your Name" 
                  value={reviewForm.author}
                  onChange={e => setReviewForm(f => ({ ...f, author: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded border border-white/10  bg-[#021612]  text-white  outline-none focus:border-shop-accent"
                />
                <textarea 
                  placeholder="What did you think about this product?" 
                  rows={3}
                  value={reviewForm.text}
                  onChange={e => setReviewForm(f => ({ ...f, text: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded border border-white/10  bg-[#021612]  text-white  outline-none focus:border-shop-accent resize-none"
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
  const { cart, handleUpdateCart, setCart } = useOutletContext();
  const customer = getUserContext()

  const onBack = () => navigate(-1);
  const onConfirm = () => {
    setCart([])
    navigate(`/store/${subdomain}/confirmation`)
  };
  const [form, setForm] = useState({ name: customer?.name || '', address: '', phone: '' })
  const [paymentForm, setPaymentForm] = useState({ cardName: '', cardNumber: '', expiry: '', cvc: '' })
  const [errors, setErrors] = useState({})
  const [step, setStep] = useState('cart') // 'cart', 'checkout', 'payment'

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
    
    const newOrder = {
      customer_id: customer?.id || null,
      customer: form.name,
      total: total,
      date: new Date().toISOString().split('T')[0],
      status: 'processing',
      items: cart.map(i => ({ product_id: i.product.id, quantity: i.quantity, price: i.product.price, size: i.size, color: i.color }))
    }
    const res = await addOrder(newOrder, null, subdomain)
    
    setCart([])
    navigate(`/store/${subdomain}/confirmation`, { state: { orderId: res.id } })
  }

  return (

    <div className="min-h-screen bg-[#000504]  transition-colors">
      <StoreNav cartCount={cartCount} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="max-w-5xl mx-auto px-6 py-8">
        <button onClick={() => navigate(-1)} className="text-sm text-white/60  hover:text-white/90  flex items-center gap-1.5 mb-6 cursor-pointer transition-colors">
          ← Continue shopping
        </button>
        <h1 className="text-2xl font-bold font-display text-white  mb-6 transition-colors">
          {step === 'cart' ? 'Your cart' : step === 'checkout' ? 'Delivery Details' : 'Payment Details'}
        </h1>

        {cart.length === 0 ? (
          <div className="bg-[#021612]  border border-white/10  rounded-[10px] p-12 text-center transition-colors">
            <p className="text-4xl mb-4">🛒</p>
            <h2 className="font-bold font-display text-white/90  mb-2 transition-colors">Your cart is empty</h2>
            <p className="text-sm text-white/50  mb-6 transition-colors">Add some products to get started.</p>
            <Button onClick={() => navigate(-1)}>Browse products</Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="bg-[#021612] border border-white/10 rounded-[10px] divide-y divide-slate-100">
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
                      <button onClick={() => updateQty(idx, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-white/60 hover:bg-[#000504] cursor-pointer text-sm">−</button>
                      <span className="w-8 text-center text-sm font-mono font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQty(idx, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-white/60 hover:bg-[#000504] cursor-pointer text-sm">+</button>
                    </div>
                    <p className="font-semibold text-white w-12 text-right text-sm">${item.product.price * item.quantity}</p>
                  </div>
                ))}
              </div>

              {step === 'checkout' && (
                <div className="bg-[#021612] border border-white/10 rounded-[10px] p-6" style={{ animation: 'cardFadeIn 0.18s ease-out' }}>
                  <h2 className="font-semibold text-white font-display mb-4">Delivery details</h2>
                  <div className="flex flex-col gap-4">
                    {[
                      { key: 'name', placeholder: 'Full name' },
                      { key: 'address', placeholder: 'Full delivery address' },
                      { key: 'phone', placeholder: 'Phone number' },
                    ].map(({ key, placeholder }) => (
                      <div key={key}>
                        <input
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
                <div className="bg-[#021612] border border-white/10 rounded-[10px] p-6" style={{ animation: 'cardFadeIn 0.18s ease-out' }}>
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
              <div className="bg-[#021612] border border-white/10 rounded-[10px] p-5 sticky top-6">
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
                  <Button className="w-full" onClick={() => setStep('checkout')}>Proceed to checkout →</Button>
                ) : step === 'checkout' ? (
                  <Button className="w-full" onClick={handleContinueToPayment}>Continue to payment →</Button>
                ) : (
                  <Button className="w-full" onClick={handlePlaceOrder}>Place order →</Button>
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
  const { subdomain } = useParams();
  const { cart } = useOutletContext();
  const onHome = () => navigate(`/store/${subdomain}`);
  const orderId = 'ORD-' + Math.floor(Math.random() * 10000);
  const total = cart.reduce((s, i) => s + i.product.price * i.quantity, 0)
  const tilt = useTilt(6)

  return (
    <div className="min-h-screen bg-[#000504]  flex items-center justify-center p-6 transition-colors" style={{ perspective: '1200px' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
        <div
          ref={tilt.ref}
          onMouseMove={tilt.onMouseMove}
          onMouseLeave={tilt.onMouseLeave}
          className="bg-[#021612]  border border-white/10  rounded-[12px] shadow-sm w-full p-8 text-center transition-colors"
          style={{ transformStyle: 'preserve-3d', willChange: 'transform', animation: 'cardIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}
        >
          <div className="w-16 h-16 bg-green-100  rounded-full flex items-center justify-center text-3xl mx-auto mb-5 transition-colors"
            style={{ transform: 'translateZ(24px)', animation: 'bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.2s both' }}>✓</div>
          <h1 className="text-2xl font-bold font-display text-white  mb-1 transition-colors" style={{ transform: 'translateZ(16px)' }}>Order confirmed!</h1>
          <p className="text-sm text-white/60  mb-1 transition-colors" style={{ transform: 'translateZ(10px)' }}>Thank you for your purchase.</p>
          <p className="font-mono text-sm text-shop-primary  bg-white/5  rounded-lg px-3 py-2 inline-block mt-1 mb-6 transition-colors" style={{ transform: 'translateZ(14px)' }}>{orderId}</p>

          {cart.length > 0 && (
            <div className="border border-white/5  rounded-[10px] divide-y divide-slate-100  text-left mb-6 transition-colors">
              {cart.map(item => (
                <div key={item.product.id} className="flex items-center gap-3 p-3">
                  <img src={item.product.image} alt={item.product.name} className="w-10 h-10 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white/90  truncate transition-colors">{item.product.name}</p>
                    <p className="text-[11px] text-white/50  font-mono transition-colors">×{item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-white  transition-colors">${item.product.price * item.quantity}</p>
                </div>
              ))}
              <div className="flex justify-between p-3 font-semibold text-sm text-white  transition-colors">
                <span>Total</span><span>${total}</span>
              </div>
            </div>
          )}

          <div className="bg-[#000504]  rounded-[10px] p-4 mb-6 text-left transition-colors">
            <p className="text-xs font-mono text-white/50  mb-3 transition-colors">Estimated status</p>
            {[
              { label: 'Order received', time: 'Now', done: true },
              { label: 'Processing', time: 'Today', done: false },
              { label: 'Out for delivery', time: '1–3 days', done: false },
              { label: 'Delivered', time: '2–4 days', done: false },
            ].map((s) => (
              <div key={s.label} className="flex items-start gap-3 mb-2 last:mb-0">
                <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 transition-colors ${s.done ? 'bg-green-500 border-green-500  ' : 'bg-[#021612]  border-slate-300 '}`} />
                <div className="flex-1">
                  <p className={`text-xs font-medium transition-colors ${s.done ? 'text-green-700 ' : 'text-white/60 '}`}>{s.label}</p>
                </div>
                <p className="text-[11px] font-mono text-white/50  transition-colors">{s.time}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs text-white/50  transition-colors">We'll call you on your phone number to confirm delivery details.</p>
            <Button className="w-full mt-2" onClick={onHome}>Continue shopping</Button>
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

export function CartSidebar({ isOpen, onClose, cart, handleUpdateCart }) {
  const navigate = useNavigate();
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
            className="fixed inset-0 bg-[#021612]/40 backdrop-blur-sm z-40 transition-colors"
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#021612]  shadow-2xl z-50 flex flex-col border-l border-white/10  transition-colors"
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
                    <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-4">
                      <img src={item.product.image} alt={item.product.name} className="w-20 h-20 rounded-[10px] object-cover border border-white/5  transition-colors" />
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-semibold text-white  transition-colors">{item.product.name}</p>
                          <p className="text-sm font-bold text-white  transition-colors">${item.product.price * item.quantity}</p>
                        </div>
                        {(item.size || item.color) && (
                          <p className="text-xs text-white/60  mb-2 transition-colors">
                            {[item.size, item.color].filter(Boolean).join(' · ')}
                          </p>
                        )}
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center border border-white/10  rounded-lg overflow-hidden transition-colors">
                            <button onClick={() => updateQty(idx, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center text-white/60  hover:bg-[#000504]  cursor-pointer text-xs transition-colors">−</button>
                            <span className="w-7 text-center text-xs font-mono font-semibold text-white  transition-colors">{item.quantity}</span>
                            <button onClick={() => updateQty(idx, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center text-white/60  hover:bg-[#000504]  cursor-pointer text-xs transition-colors">+</button>
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
              <div className="p-6 border-t border-white/5  bg-[#000504]  transition-colors">
                <div className="flex justify-between items-center mb-4 text-white  font-semibold transition-colors">
                  <span>Subtotal</span>
                  <span>${subtotal}</span>
                </div>
                <Button className="w-full" size="lg" onClick={() => { onClose(); navigate('/store/cart'); }}>
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


