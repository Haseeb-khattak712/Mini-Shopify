import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { logout, getUserContext } from '@/services/storage'

const NAV = [
  { id: '/admin/dashboard', label: 'Dashboard', icon: '⬡' },
  { id: '/admin/products', label: 'Products', icon: '□' },
  { id: '/admin/orders', label: 'Orders', icon: '◫' },
  { id: '/admin/customers', label: 'Customers', icon: '👤' },
  { id: '/admin/discounts', label: 'Discounts', icon: '🎟️' },
  { id: '/admin/reviews', label: 'Reviews', icon: '★' },
  { id: '/admin/theme', label: 'Online Store', icon: '✦' }
]

export function AdminLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const user = getUserContext()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-transparent transition-colors md:flex-row flex-col">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-950 text-sm font-bold shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            {user?.business_name?.charAt(0)?.toUpperCase() || 'S'}
          </div>
          <p className="text-sm font-semibold text-zinc-100 font-display tracking-tight">{user?.business_name || 'OwnStore'}</p>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#18181b] md:bg-[#18181b]/40 md:backdrop-blur-xl border-r border-zinc-800/60 flex flex-col shrink-0 transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Brand */}
        <div className="px-6 py-5 border-b border-zinc-800/60 transition-colors flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[10px] bg-zinc-100 flex items-center justify-center text-zinc-950 text-sm font-bold shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-zinc-200/50">
              {user?.business_name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-zinc-100 font-display leading-none truncate tracking-tight">{user?.business_name || 'OwnStore'}</p>
              <p className="text-[11px] text-zinc-500 font-mono mt-1 truncate">{user?.subdomain || 'demo'}.ownstore.com</p>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-1 text-zinc-500 hover:text-white rounded-md">✕</button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1 overflow-y-auto">
          <p className="text-[10px] font-mono font-medium text-zinc-500 uppercase tracking-widest px-2 mb-3">Management</p>
          {NAV.map(item => {
            const isActive = location.pathname === item.id
            return (
              <Link
                key={item.id}
                to={item.id}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-left cursor-pointer transition-all duration-300
                  ${isActive
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border border-transparent'}`}
              >
                <span className={`text-base leading-none transition-colors ${isActive ? 'text-zinc-100' : 'opacity-70'}`}>{item.icon}</span>
                {item.label}
                {item.id === '/admin/orders' && (
                  <span className="ml-auto bg-zinc-100 text-zinc-900 text-[10px] font-mono rounded-full px-2 py-0.5 leading-none shadow-[0_0_10px_rgba(255,255,255,0.1)]">1</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Mode switcher */}
        <div className="p-4 border-t border-zinc-800/60 transition-colors">
          <p className="text-[10px] font-mono font-medium text-zinc-500 uppercase tracking-widest px-2 mb-3">Switch view</p>
          <div className="space-y-1">
            <Link to="/" className="block w-full text-left text-xs text-zinc-400 hover:text-zinc-200 px-3 py-2 rounded-xl hover:bg-zinc-800/50 transition-all">
              ← Marketing site
            </Link>
            <a href={`/store/${user?.subdomain || 'demo'}`} target="_blank" rel="noreferrer" className="block w-full text-left text-xs text-zinc-400 hover:text-zinc-200 px-3 py-2 rounded-xl hover:bg-zinc-800/50 transition-all">
              ↗ Customer storefront
            </a>
          </div>
        </div>

        {/* User */}
        <div className="p-5 border-t border-zinc-800/60 flex items-center justify-between gap-2 transition-colors bg-zinc-900/20">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-100 border border-zinc-700">
              {user?.business_name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-zinc-200 truncate">{user?.business_name || 'Admin User'}</p>
              <p className="text-[10px] text-zinc-500 truncate mt-0.5">{user?.email || 'admin@ownstore.com'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer text-sm"
          >
            🚪
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
