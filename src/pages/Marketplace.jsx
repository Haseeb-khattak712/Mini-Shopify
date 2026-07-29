import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getMarketplaceProducts, getUserContext } from '@/services/storage'
import { useWishlist } from '@/hooks/useWishlist'
import { Toast } from '@/components/ui/ui'
import { WishlistSidebar } from '@/components/shared/WishlistSidebar'

// ── Dummy Data for Premium Sections ──────────────────────────────────────────
const COLLECTIONS = [
  { id: 'c1', title: 'Minimalist Living', subtitle: 'Curated home essentials', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80', filter: 'Home' },
  { id: 'c2', title: 'Artisan Apparel', subtitle: 'Ethically crafted clothing', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80', filter: 'Apparel' },
  { id: 'c3', title: 'Premium Accessories', subtitle: 'Timeless everyday carry', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80', filter: 'Accessories' }
]

const EDITORIALS = [
  { id: 'e1', category: 'Style', title: 'The Art of Slow Living', snippet: 'Embracing minimalism in a chaotic world.', image: 'https://images.unsplash.com/photo-1490132332152-40b37db8754b?w=800&q=80' },
  { id: 'e2', category: 'Design', title: 'Winter Wardrobe Essentials', snippet: 'Pieces that blend form and function seamlessly.', image: 'https://images.unsplash.com/photo-1434389678369-183427d1421b?w=800&q=80' },
  { id: 'e3', category: 'Culture', title: 'Coffee & Craftsmanship', snippet: 'Meet the artisans reshaping morning rituals.', image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&q=80' }
]

export function Marketplace() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [isWishlistOpen, setIsWishlistOpen] = useState(false)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [toast, setToast] = useState('')
  const { wishlist, toggleWishlist, isInWishlist } = useWishlist()
  const user = getUserContext()

  const handleSubscribe = () => {
    if (!newsletterEmail) return
    setToast('Welcome to the club. Check your inbox.')
    setNewsletterEmail('')
    setTimeout(() => setToast(''), 4000)
  }

  useEffect(() => {
    const loadProducts = async () => {
      const data = await getMarketplaceProducts()
      setProducts(data)
      setLoading(false)
    }
    loadProducts()
  }, [])

  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))]
  
  const uniqueBrandsMap = new Map()
  products.forEach(p => {
    if (p.business_name && p.subdomain) {
      if (!uniqueBrandsMap.has(p.business_name)) {
        uniqueBrandsMap.set(p.business_name, p.subdomain)
      }
    }
  })
  const brands = Array.from(uniqueBrandsMap.entries()).map(([name, subdomain]) => ({ name, subdomain }))

  const filteredProducts = products
    .filter(p => {
      const bName = p.business_name || '';
      const pName = p.name || '';
      const matchesSearch = pName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            bName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return parseFloat(a.price) - parseFloat(b.price);
      if (sortBy === 'price_desc') return parseFloat(b.price) - parseFloat(a.price);
      return 0;
    })

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col font-sans transition-colors selection:bg-white/20">
      {/* 1. Announcement Bar */}
      <div className="bg-zinc-900 border-b border-white/5 py-2 px-4 text-center">
        <p className="text-[11px] font-mono font-medium tracking-widest text-zinc-300 uppercase">
          Free global shipping on premium orders over $150 &nbsp;•&nbsp; Discover independent creators
        </p>
      </div>

      {/* Navbar */}
      <nav className="border-b border-white/5 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <img src="/logo.png" alt="OwnStore" className="w-8 h-8 object-contain mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-300" />
            <span className="font-logo font-black text-xl tracking-tighter text-white">OwnStore</span>
          </div>
          <div className="flex gap-4 items-center">
            <button onClick={() => setIsWishlistOpen(true)} className="text-sm font-medium text-white/70 hover:text-red-400 transition-colors flex items-center gap-1.5 cursor-pointer">
              <span>❤️</span> {wishlist.length > 0 && <span className="font-mono text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full leading-none">{wishlist.length}</span>}
            </button>
            {user ? (
              <button onClick={() => navigate('/account')} className="text-sm font-medium text-white/70 hover:text-white transition-colors cursor-pointer">
                Account
              </button>
            ) : (
              <button onClick={() => navigate('/login')} className="text-sm font-medium text-white/70 hover:text-white transition-colors cursor-pointer">
                Sign In
              </button>
            )}
            <button onClick={() => navigate('/signup')} className="text-sm font-medium bg-white text-zinc-950 px-4 py-1.5 rounded-full hover:bg-zinc-200 transition-colors cursor-pointer">
              Start Selling
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Dynamic Hero Section */}
      <header className="relative pt-32 pb-40 px-6 overflow-hidden flex-shrink-0 group">
        <div className="absolute inset-0 bg-zinc-900">
          <img 
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-30 mix-blend-luminosity group-hover:scale-105 transition-transform duration-[20s]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <span className="text-xs font-mono font-medium tracking-[0.3em] text-white/50 uppercase mb-8 block">The Global Collective</span>
            <h1 className="text-5xl md:text-[6.5rem] font-medium font-display tracking-tight text-white mb-8 leading-[1.05]">
              Shop Independent.<br />
              <span className="text-white/70 italic font-light">Elevate Everyday.</span>
            </h1>
            <p className="text-lg md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-12 font-light leading-relaxed tracking-wide">
              Discover premium products curated by independent sellers and creators from around the world. Direct to you.
            </p>
            <button onClick={() => {
              document.getElementById('shop-grid').scrollIntoView({ behavior: 'smooth' })
            }} className="bg-white text-zinc-950 px-8 py-4 rounded-full font-semibold tracking-wide hover:bg-zinc-200 hover:scale-105 transition-all duration-300 shadow-xl shadow-white/5">
              Explore the Marketplace
            </button>
          </motion.div>
        </div>
      </header>

      {/* 3. Curated Collections */}
      <section className="max-w-7xl mx-auto w-full px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">Curated Collections</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLLECTIONS.map(collection => (
            <div 
              key={collection.id} 
              onClick={() => {
                setSelectedCategory(collection.filter)
                document.getElementById('shop-grid').scrollIntoView({ behavior: 'smooth' })
              }}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer bg-zinc-900"
            >
              <img src={collection.image} alt={collection.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white/60 font-mono text-xs uppercase tracking-wider mb-2">{collection.subtitle}</p>
                <h3 className="text-2xl font-display font-bold text-white">{collection.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Editorials & Journal */}
      <section className="bg-zinc-900 border-y border-white/5 py-20 mb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-sm font-mono tracking-widest text-zinc-500 uppercase mb-3">The Journal</h2>
              <h3 className="text-3xl font-display font-bold text-white tracking-tight">Stories & Editorials</h3>
            </div>
            <button className="hidden md:block text-white hover:underline text-sm font-medium">Read all stories</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {EDITORIALS.map((ed) => (
              <div key={ed.id} className="group cursor-pointer">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-5">
                  <img src={ed.image} alt={ed.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>
                <p className="text-xs font-mono tracking-widest text-zinc-500 uppercase mb-2">{ed.category}</p>
                <h4 className="text-xl font-display font-bold text-white mb-2 group-hover:text-zinc-300 transition-colors">{ed.title}</h4>
                <p className="text-zinc-400 text-sm leading-relaxed">{ed.snippet}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Trending Brands */}
      {!loading && brands.length > 0 && (
        <section className="border-y border-white/5 bg-zinc-900/30 py-12 mb-16 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
             <h2 className="text-sm font-mono tracking-widest text-zinc-500 uppercase">Featured Creators & Brands</h2>
          </div>
          <div className="flex items-center gap-12 overflow-x-auto hide-scrollbar px-6 max-w-7xl mx-auto pb-4">
            {brands.map((brand, i) => (
              <div 
                key={i} 
                onClick={() => navigate(`/marketplace/brand/${brand.subdomain}`)}
                className="flex flex-col items-center gap-4 min-w-[120px] cursor-pointer group"
              >
                <div className="w-20 h-20 rounded-full border border-white/10 bg-zinc-900 flex items-center justify-center text-2xl group-hover:border-white/40 transition-colors shadow-xl text-white">
                  {brand.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">{brand.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Trending Now Carousel */}
      {!loading && products.length > 0 && (
        <section className="max-w-7xl mx-auto w-full px-6 mb-16 overflow-hidden">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-orange-500">🔥</span> Trending Now
            </h2>
          </div>
          <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-4 cursor-grab active:cursor-grabbing">
            {products.slice(0, 8).map((p) => (
              <div 
                key={p.id}
                onClick={() => navigate(`/store/${p.subdomain}/product/${p.id}`)}
                className="flex-shrink-0 w-64 group cursor-pointer flex flex-col"
              >
                <div className="relative aspect-[4/5] bg-zinc-900 rounded-2xl overflow-hidden mb-4">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(p); }}
                    className={`absolute top-3 right-3 w-8 h-8 backdrop-blur-md rounded-full border flex items-center justify-center transition-all duration-300 translate-x-2 group-hover:translate-x-0 cursor-pointer ${isInWishlist(p.id) ? 'bg-white text-red-500 border-white opacity-100' : 'bg-white/10 border-white/20 text-white hover:bg-white hover:text-red-500 opacity-0 group-hover:opacity-100'}`}
                  >
                    {isInWishlist(p.id) ? '❤️' : '♡'}
                  </button>
                  <div className="absolute bottom-3 left-3 bg-zinc-950/80 backdrop-blur-sm border border-white/10 text-white/90 text-[10px] font-mono tracking-wider px-2.5 py-1 rounded-full uppercase shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300">
                    {p.business_name}
                  </div>
                </div>
                <div className="flex justify-between items-start gap-2 px-1">
                  <h3 className="font-medium text-white truncate text-sm">{p.name}</h3>
                  <p className="font-mono text-white text-sm">${p.price}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filters Bar */}
      <div id="shop-grid" className="scroll-mt-32 max-w-7xl mx-auto w-full px-6 mb-8">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">All Products</h2>
          <span className="text-zinc-500 font-mono text-sm">{filteredProducts.length} items</span>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 flex-shrink-0">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">🔍</span>
            <input 
              type="text" 
              placeholder="Search products or brands..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-full pl-11 pr-4 py-3 outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all placeholder:text-zinc-600"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto overflow-x-auto hide-scrollbar pb-2 md:pb-0">
            <div className="flex items-center gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-white text-zinc-950' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-full px-4 py-2 text-sm outline-none focus:border-white/20 appearance-none cursor-pointer min-w-[140px]"
            >
              <option value="newest">Sort by: Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. Enhanced Product Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pb-24">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 rounded-full border-4 border-white/10 border-t-white animate-spin" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-24 bg-zinc-900/30 rounded-3xl border border-zinc-800/50">
            <p className="text-zinc-400 text-lg mb-4">No products found matching your criteria.</p>
            <button onClick={() => {setSearchQuery(''); setSelectedCategory('All')}} className="text-white hover:underline font-medium">Clear all filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
            <AnimatePresence>
              {filteredProducts.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (i % 10) * 0.05 }}
                  onClick={() => navigate(`/store/${p.subdomain}/product/${p.id}`)}
                  className="group cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-[4/5] bg-zinc-900 rounded-2xl overflow-hidden mb-5">
                    <img 
                      src={p.image} 
                      alt={p.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    
                    {/* Hover Badges & Buttons */}
                    <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-sm border border-white/10 text-white/90 text-[10px] font-mono tracking-wider px-2.5 py-1 rounded-full uppercase shadow-lg transform -translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      By {p.business_name}
                    </div>

                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(p); }}
                      className={`absolute top-3 right-3 w-8 h-8 backdrop-blur-md rounded-full border flex items-center justify-center transition-all duration-300 translate-x-2 group-hover:translate-x-0 cursor-pointer ${isInWishlist(p.id) ? 'bg-white text-red-500 border-white opacity-100' : 'bg-white/10 border-white/20 text-white hover:bg-white hover:text-red-500 opacity-0 group-hover:opacity-100'}`}
                    >
                      {isInWishlist(p.id) ? '❤️' : '♡'}
                    </button>

                    <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <button className="w-full bg-white text-zinc-950 py-2.5 rounded-xl font-semibold text-sm shadow-xl hover:bg-zinc-200 transition-colors">
                        View Product
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 px-1">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-medium text-white truncate text-base">{p.name}</h3>
                      <p className="font-mono text-white">${p.price}</p>
                    </div>
                    <p className="text-xs text-zinc-500 font-mono tracking-wide uppercase truncate">{p.category}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* 6. Premium Footer */}
      <footer className="bg-black border-t border-white/5 pt-20 pb-10 mt-auto">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <img src="/logo.png" alt="OwnStore" className="w-8 h-8 object-contain mix-blend-luminosity" />
                <span className="font-logo font-black text-xl tracking-tighter text-white">OwnStore</span>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed mb-6">
                Empowering independent creators and brands to sell beautifully. The global marketplace for premium, curated goods.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-6">Marketplace</h4>
              <ul className="space-y-4 text-sm text-zinc-400">
                <li><a href="#" className="hover:text-white transition-colors">All Products</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Featured Brands</a></li>
                <li><a href="#" className="hover:text-white transition-colors">New Arrivals</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Collections</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-6">Support</h4>
              <ul className="space-y-4 text-sm text-zinc-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Shipping & Returns</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Track Order</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-6">Stay in the loop</h4>
              <p className="text-sm text-zinc-400 mb-4">Subscribe to our newsletter for exclusive releases and creator stories.</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="email" 
                  value={newsletterEmail}
                  onChange={e => setNewsletterEmail(e.target.value)}
                  placeholder="Email address" 
                  className="bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2 text-sm w-full outline-none focus:border-white/20"
                />
                <button onClick={handleSubscribe} className="bg-white text-zinc-950 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-zinc-200 transition-colors whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-500">
              © {new Date().getFullYear()} OwnStore Inc. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-6 text-xs text-zinc-500">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Settings</a>
            </div>
          </div>
        </div>
      </footer>
      <WishlistSidebar isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} wishlist={wishlist} onRemove={toggleWishlist} />
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
