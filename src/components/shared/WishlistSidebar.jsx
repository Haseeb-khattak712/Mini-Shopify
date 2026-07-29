import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

export function WishlistSidebar({ isOpen, onClose, wishlist, onRemove }) {
  const navigate = useNavigate()
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            onClick={onClose}
            className="fixed inset-0 bg-zinc-900/50/40 backdrop-blur-sm z-[200]"
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-zinc-900/50 shadow-2xl z-[210] flex flex-col border-l border-white/10 backdrop-blur-xl"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold font-display text-white">Your Wishlist ({wishlist.length})</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/10 text-white/60">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {wishlist.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-white/60">
                  <p className="text-4xl mb-3">❤️</p>
                  <p>Your wishlist is empty.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {wishlist.map(item => (
                    <div key={item.id} className="flex gap-4 group cursor-pointer" onClick={() => {
                      onClose()
                      navigate(`/store/${item.subdomain}/product/${item.id}`)
                    }}>
                      <img src={item.image ? item.image.split(',')[0] : ''} alt={item.name} className="w-20 h-20 rounded-[10px] object-cover border border-white/5 group-hover:border-white/20 transition-colors" />
                      <div className="flex-1 flex flex-col justify-center">
                        <p className="text-sm font-semibold text-white group-hover:underline">{item.name}</p>
                        <p className="text-sm font-bold text-white mb-2">${item.price}</p>
                        <div className="flex items-center justify-between">
                          <button onClick={(e) => { e.stopPropagation(); onRemove(item); }} className="text-xs text-white/50 hover:text-red-500 underline text-left w-fit">Remove</button>
                          <button onClick={(e) => { e.stopPropagation(); navigate(`/store/${item.subdomain}/product/${item.id}?add_to_cart=true`); onClose(); }} className="text-xs font-medium bg-white text-zinc-950 px-3 py-1.5 rounded-full hover:bg-zinc-200 transition-colors">Add to Cart</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
