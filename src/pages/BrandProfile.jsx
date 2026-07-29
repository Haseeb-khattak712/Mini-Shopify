import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getStoredProducts } from '@/services/storage'
import { useWishlist } from '@/hooks/useWishlist'
import { WishlistSidebar } from '@/components/shared/WishlistSidebar'

export function BrandProfile() {
  const { subdomain } = useParams()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isWishlistOpen, setIsWishlistOpen] = useState(false)
  const { wishlist, toggleWishlist, isInWishlist } = useWishlist()

  useEffect(() => {
    const loadData = async () => {
      const data = await getStoredProducts(null, subdomain)
      setProducts(data || [])
      setLoading(false)
    }
    loadData()
  }, [subdomain])

  const brandName = products.length > 0 ? products[0].business_name : subdomain
  
  return (
    <div className="min-h-screen bg-zinc-950 font-sans transition-colors selection:bg-white/20">
      {/* Minimal Navbar */}
      <nav className="border-b border-white/5 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/marketplace')}>
            <span className="text-white/60 group-hover:text-white transition-colors text-sm">← Back to Marketplace</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsWishlistOpen(true)} className="text-sm font-medium text-white/70 hover:text-red-400 transition-colors flex items-center gap-1.5 cursor-pointer">
              <span>❤️</span> {wishlist.length > 0 && <span className="font-mono text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full leading-none">{wishlist.length}</span>}
            </button>
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
              <span className="font-logo font-black text-xl tracking-tighter text-white">OwnStore</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Brand Hero */}
      <header className="relative pt-32 pb-32 px-6 overflow-hidden bg-zinc-900 border-b border-white/5">
        <div className="absolute inset-0">
          <img 
            src={`https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80`}
            alt="Brand Cover" 
            className="w-full h-full object-cover opacity-20 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="w-24 h-24 mx-auto bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center text-4xl mb-6 shadow-2xl text-white">
              {brandName ? brandName.charAt(0).toUpperCase() : '?'}
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 tracking-tight">
              {brandName}
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto">
              Curated essentials by {brandName}. Independent creator on the OwnStore marketplace.
            </p>
          </motion.div>
        </div>
      </header>

      {/* Product Grid */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-12">
          <h2 className="text-2xl font-display font-bold text-white">All pieces from {brandName}</h2>
          <span className="text-zinc-500 font-mono text-sm">{products.length} items</span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
             <div className="w-8 h-8 rounded-full border-4 border-white/10 border-t-white animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 bg-zinc-900/30 rounded-3xl border border-zinc-800/50">
            <p className="text-zinc-400 text-lg">This creator has no active products.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
            <AnimatePresence>
              {products.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (i % 10) * 0.05 }}
                  onClick={() => navigate(`/store/${subdomain}/product/${p.id}`)}
                  className="group cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-[4/5] bg-zinc-900 rounded-2xl overflow-hidden mb-5">
                    <img 
                      src={p.image} 
                      alt={p.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    
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

      <footer className="bg-black border-t border-white/5 py-8 text-center text-zinc-500 text-sm">
        <p>© {new Date().getFullYear()} OwnStore Inc. All rights reserved.</p>
      </footer>
      <WishlistSidebar isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} wishlist={wishlist} onRemove={toggleWishlist} />
    </div>
  )
}
