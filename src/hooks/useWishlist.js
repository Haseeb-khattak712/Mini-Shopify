import { useState, useEffect } from 'react'

export function useWishlist() {
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('ownstore_wishlist')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('ownstore_wishlist', JSON.stringify(wishlist))
  }, [wishlist])

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.find(p => p.id === product.id)
      if (exists) {
        return prev.filter(p => p.id !== product.id)
      }
      return [...prev, product]
    })
  }

  const isInWishlist = (productId) => {
    return wishlist.some(p => p.id === productId)
  }

  return { wishlist, toggleWishlist, isInWishlist }
}
