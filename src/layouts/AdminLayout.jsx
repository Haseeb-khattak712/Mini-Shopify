import { Fragment } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { logout, getUserContext } from '@/services/storage'

const NAV = [
  { id: '/admin/dashboard', label: 'Dashboard', icon: '⬡' },
  { id: '/admin/products', label: 'Products', icon: '□' },
  { id: '/admin/orders', label: 'Orders', icon: '◫' },
  { id: '/admin/empty', label: 'Empty States', icon: '◻' },
]

export function AdminLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const user = getUserContext()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-[#000504]  transition-colors">
      {/* Sidebar */}
      <aside className="w-60 bg-[#021612]  border-r border-white/10  flex flex-col shrink-0 transition-colors">
        {/* Brand */}
        <div className="px-5 py-4 border-b border-white/5  transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-shop-primary flex items-center justify-center text-white text-sm font-bold">
              {user?.business_name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white  font-display leading-none truncate transition-colors">{user?.business_name || 'OwnStore'}</p>
              <p className="text-[11px] text-white/50  font-mono mt-0.5 truncate transition-colors">{user?.subdomain || 'demo'}.ownstore.com</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          <p className="text-[10px] font-mono font-medium text-white/50  uppercase tracking-widest px-2 mb-2 transition-colors">Management</p>
          {NAV.map(item => (
            <Link
              key={item.id}
              to={item.id}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-left cursor-pointer transition-colors
                ${location.pathname === item.id
                  ? 'bg-white/5  text-shop-primary '
                  : 'text-white/70  hover:bg-[#000504]  hover:text-white '}`}
            >
              <span className="text-base leading-none opacity-70">{item.icon}</span>
              {item.label}
              {item.id === '/admin/orders' && (
                <span className="ml-auto bg-amber-100  text-amber-700  text-xs font-mono rounded-full px-1.5 py-0.5 leading-none transition-colors">1</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Mode switcher */}
        <div className="p-3 border-t border-white/5  transition-colors">
          <p className="text-[10px] font-mono text-white/50  uppercase tracking-widest px-2 mb-2 transition-colors">Switch view</p>
          <Link to="/" className="block w-full text-left text-xs text-white/60  hover:text-white/90  px-3 py-1.5 rounded hover:bg-[#000504]  transition-colors">
            ← Marketing site
          </Link>
          <a href={`/store/${user?.subdomain || 'demo'}`} target="_blank" rel="noreferrer" className="block w-full text-left text-xs text-white/60  hover:text-white/90  px-3 py-1.5 rounded hover:bg-[#000504]  transition-colors">
            ↗ Customer storefront
          </a>
        </div>

        {/* User */}
        <div className="p-4 border-t border-white/5  flex items-center justify-between gap-2 transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-white/10  flex items-center justify-center text-xs font-semibold text-shop-primary  transition-colors">
              {user?.business_name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white  truncate transition-colors">{user?.business_name || 'Admin User'}</p>
              <p className="text-[10px] text-white/50  truncate transition-colors">{user?.email || 'admin@ownstore.com'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 rounded-lg text-white/50 hover:text-red-600 hover:bg-red-50  transition-colors cursor-pointer text-xs"
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
