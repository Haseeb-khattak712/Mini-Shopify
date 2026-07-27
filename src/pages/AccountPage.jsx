import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button, Input } from '@/components/ui/ui'
import { isAuthenticated, getUserContext, logout, getStoredOrders } from '@/services/storage'

export function AccountPage() {
  const navigate = useNavigate()
  const user = getUserContext()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated() || !user) {
      navigate('/login')
      return
    }

    // Fetch personal orders
    getStoredOrders(user.id)
      .then(data => {
        setOrders(data || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load orders', err)
        setLoading(false)
      })
  }, [user, navigate])

  const handleLogout = () => {
    logout()
    navigate('/')
  }


  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#000504]  flex flex-col items-center justify-center transition-colors">
        <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-shop-primary animate-spin mb-4"></div>
        <p className="text-white/60 font-medium">Loading your account...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#000504]  flex flex-col transition-colors">
      <header className="bg-[#021612]  border-b border-white/10  py-4 px-6 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-3 cursor-pointer group" style={{ perspective: '1000px' }}>
            <img src="/logo.png" alt="OwnStore Logo" className="w-8 h-8 object-contain drop-shadow-md opacity-80 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100 transition-all duration-500" style={{ transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', transformStyle: 'preserve-3d' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15) rotateY(15deg) rotateX(10deg) translateZ(10px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1) rotateY(0deg) rotateX(0deg) translateZ(0px)'} />
            <span className="font-black text-shop-accent font-logo text-lg tracking-tighter transition-colors duration-300">OwnStore</span>
          </button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>Sign out</Button>
        </div>
      </header>
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display text-white  transition-colors">My Account</h1>
          <p className="text-white/60  transition-colors">Welcome back, {user.name || user.email}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <div className="bg-[#021612]  rounded-2xl shadow-sm border border-white/10  p-6 transition-colors">
              <h2 className="text-xl font-semibold text-white  mb-6 transition-colors">Order History</h2>
              
              {orders.length === 0 ? (
                <div className="text-center py-8 text-white/60  transition-colors">
                  <p>You haven't placed any orders yet.</p>
                  <Button variant="outline" className="mt-4" onClick={() => navigate('/')}>Discover Stores</Button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {orders.map(order => (
                    <div key={order.id} className="p-4 border border-white/5  rounded-xl flex items-center justify-between transition-colors">
                      <div>
                        <p className="font-semibold text-white  transition-colors">{order.id}</p>
                        <p className="text-sm text-white/60  transition-colors">{new Date(order.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white  transition-colors">${order.total}</p>
                        <span className={`inline-block px-2.5 py-1 mt-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          order.status === 'processing' ? 'bg-amber-100 text-amber-700  ' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-700  ' :
                          'bg-emerald-100 text-emerald-700  '
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-1 space-y-6">
            <div className="bg-[#021612]  rounded-2xl shadow-sm border border-white/10  p-6 transition-colors">
              <h3 className="font-semibold text-white  mb-4">Profile</h3>
              <div className="space-y-3 text-sm text-white/70 ">
                <p><strong>Name:</strong> {user.name || 'N/A'}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> <span className="capitalize">{user.role}</span></p>
              </div>
            </div>

            {user.role === 'admin' && (
              <div className="bg-green-50  border border-green-200  rounded-2xl p-6 text-center transition-colors">
                <div className="w-12 h-12 bg-green-100  rounded-full flex items-center justify-center text-2xl mx-auto mb-3">🎉</div>
                <h3 className="font-bold text-white  mb-2">You are a Seller!</h3>
                <p className="text-sm text-white/70  mb-4">Manage your store products and orders in the dashboard.</p>
                <Button className="w-full" onClick={() => navigate('/admin')}>Go to Dashboard</Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
