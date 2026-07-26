import { Fragment } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { logoutAdmin, getUserContext } from '../services/storage'

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
    logoutAdmin()
    navigate('/admin/login')
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Sidebar */}
      <aside className="w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 transition-colors">
        {/* Brand */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
              {user?.business_name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white font-display leading-none truncate transition-colors">{user?.business_name || 'StoreKit'}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 truncate transition-colors">{user?.subdomain || 'demo'}.storekit.com</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          <p className="text-[10px] font-mono font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 mb-2 transition-colors">Management</p>
          {NAV.map(item => (
            <Link
              key={item.id}
              to={item.id}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-left cursor-pointer transition-colors
                ${location.pathname === item.id
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}`}
            >
              <span className="text-base leading-none opacity-70">{item.icon}</span>
              {item.label}
              {item.id === '/admin/orders' && (
                <span className="ml-auto bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-mono rounded-full px-1.5 py-0.5 leading-none transition-colors">1</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Mode switcher */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 transition-colors">
          <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 mb-2 transition-colors">Switch view</p>
          <Link to="/" className="block w-full text-left text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 px-3 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            ← Marketing site
          </Link>
          <a href={`/store/${user?.subdomain || 'demo'}`} target="_blank" rel="noreferrer" className="block w-full text-left text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 px-3 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            ↗ Customer storefront
          </a>
        </div>

        {/* User */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-xs font-semibold text-indigo-700 dark:text-indigo-300 transition-colors">
              {user?.business_name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-900 dark:text-white truncate transition-colors">{user?.business_name || 'Admin User'}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate transition-colors">{user?.email || 'admin@storekit.com'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer text-xs"
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
