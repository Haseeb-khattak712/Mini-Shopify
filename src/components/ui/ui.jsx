import { useEffect } from 'react'

// ── Buttons ──────────────────────────────────────────────────────────────────

export function Button({ variant = 'primary', size = 'md', children, className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-[10px] cursor-pointer select-none active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none'
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' }
  const variants = {
    primary: 'bg-[#5E8224] text-white hover:bg-[#5E8224]/90 hover:scale-[1.02] shadow-[0_0_20px_rgba(94,130,36,0.3)] border-none shadow-sm',
    secondary: 'bg-[#021612]  text-white/80  border border-white/10  hover:bg-[#000504]  shadow-sm transition-colors',
    ghost: 'text-white/70  hover:bg-white/10  hover:text-white  transition-colors',
    destructive: 'bg-red-500 text-white hover:bg-red-600 shadow-sm',
  }
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────────

export function Input({ label, error, hint, className = '', id, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={inputId} className="text-sm font-medium text-white/80  transition-colors">{label}</label>}
      <input
        id={inputId}
        className={`w-full px-3.5 py-2.5 rounded-[10px] border text-sm text-white  placeholder:text-white/50  outline-none transition-colors
          ${error ? 'border-red-400 ring-1 ring-red-400/40 bg-red-50/30 ' : 'border-white/10  bg-[#021612]  focus:border-shop-accent focus:ring-2 focus:ring-shop-accent/20'}
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{error}</p>}
      {hint && !error && <p className="text-xs text-white/50">{hint}</p>}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────

export function StatusBadge({ status }) {
  const config = {
    pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    processing: { label: 'Processing', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    shipped: { label: 'Shipped', cls: 'bg-white/5 text-shop-primary border-indigo-200' },
    delivered: { label: 'Delivered', cls: 'bg-green-50 text-green-700 border-green-200' },
    cancelled: { label: 'Cancelled', cls: 'bg-red-50 text-red-600 border-red-200' },
  }
  const { label, cls } = config[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border font-mono ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-[#021612]  border border-white/10  rounded-[10px] transition-colors ${className}`}>
      {children}
    </div>
  )
}

// ── StatCard ──────────────────────────────────────────────────────────────────

export function StatCard({ label, value, change, positive, icon, color }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <span className={`w-10 h-10 rounded-[10px] flex items-center justify-center text-lg transition-colors ${color}`}>{icon}</span>
        {change && (
          <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded-full transition-colors ${positive ? 'text-green-700  bg-green-50 ' : 'text-red-600  bg-red-50 '}`}>
            {positive ? '↑' : '↓'} {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white  font-display transition-colors">{value}</p>
      <p className="text-sm text-white/60  mt-0.5 transition-colors">{label}</p>
    </Card>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[#021612]/40 backdrop-blur-sm" />
      <div
        className="relative bg-[#021612]  rounded-[12px] shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto transition-colors"
        style={{ animation: 'slideUp 0.18s ease-out' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5  transition-colors">
          <h2 className="font-semibold text-white  font-display transition-colors">{title}</h2>
          <button onClick={onClose} className="text-white/50  hover:text-white/70  text-xl leading-none cursor-pointer transition-colors">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }`}</style>
    </div>
  )
}

// ── Toast ─────────────────────────────────────────────────────────────────────

export function Toast({ message, type = 'success' }) {
  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-500',
    info: 'bg-shop-primary',
  }
  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] ${colors[type]} text-white text-sm font-medium px-4 py-3 rounded-[10px] shadow-lg flex items-center gap-2`}
      style={{ animation: 'toastIn 0.22s ease-out' }}
    >
      {type === 'success' && '✓'}{type === 'error' && '✕'}{type === 'info' && 'ℹ'}
      {message}
      <style>{`@keyframes toastIn { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }`}</style>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

export function Skeleton({ className = '' }) {
  return <div className={`bg-white/10  rounded-lg animate-pulse transition-colors ${className}`} />
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-[#021612]  border border-white/10  rounded-[10px] overflow-hidden transition-colors">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-8 w-full mt-2" />
      </div>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <Card className="p-5">
      <Skeleton className="w-10 h-10 mb-3" />
      <Skeleton className="h-7 w-24 mb-1" />
      <Skeleton className="h-4 w-32" />
    </Card>
  )
}
