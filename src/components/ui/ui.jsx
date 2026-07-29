import { useEffect } from 'react'

// ── Buttons ──────────────────────────────────────────────────────────────────

export function Button({ variant = 'primary', size = 'md', children, className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl cursor-pointer select-none active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none transition-all duration-300 ease-out'
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' }
  const variants = {
    primary: 'bg-zinc-100 text-zinc-950 hover:bg-white shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-transparent',
    secondary: 'bg-zinc-900/80 text-zinc-300 border border-zinc-800 hover:bg-zinc-800 hover:text-white shadow-sm hover:border-zinc-700',
    ghost: 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white',
    destructive: 'bg-gradient-to-b from-red-500 to-red-600 text-white hover:from-red-400 hover:to-red-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] border border-red-700/50',
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
      {label && <label htmlFor={inputId} className="text-sm font-medium text-zinc-300 transition-colors">{label}</label>}
      <input
        id={inputId}
        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition-all duration-300 ease-out
          ${error ? 'border-red-500/50 ring-1 ring-red-500/20 bg-red-950/20' : 'border-zinc-800 bg-zinc-900/50 focus:bg-zinc-900 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 shadow-sm'}
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400 flex items-center gap-1"><span>⚠</span>{error}</p>}
      {hint && !error && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────

export function StatusBadge({ status }) {
  const config = {
    pending: { label: 'Pending', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    processing: { label: 'Processing', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    shipped: { label: 'Shipped', cls: 'bg-zinc-100/10 text-zinc-300 border-zinc-500/20' },
    delivered: { label: 'Delivered', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    cancelled: { label: 'Cancelled', cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
  }
  const { label, cls } = config[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border font-mono tracking-wide ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 shadow-[0_0_8px_currentColor]" />
      {label}
    </span>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-[#18181b]/80 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-xl shadow-black/20 transition-all duration-300 ${className}`}>
      {children}
    </div>
  )
}

// ── StatCard ──────────────────────────────────────────────────────────────────

export function StatCard({ label, value, change, positive, icon, color }) {
  return (
    <Card className="p-5 hover:bg-[#18181b] hover:border-zinc-700/50 cursor-default">
      <div className="flex items-start justify-between mb-3">
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-colors border border-white/5 ${color}`}>{icon}</span>
        {change && (
          <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded-full transition-colors border ${positive ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
            {positive ? '↑' : '↓'} {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-zinc-100 font-display tracking-tight transition-colors">{value}</p>
      <p className="text-sm text-zinc-500 mt-0.5 transition-colors">{label}</p>
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-[#18181b] border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transition-all"
        style={{ animation: 'slideUp 0.18s ease-out' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/50 transition-colors">
          <h2 className="font-semibold text-zinc-100 font-display tracking-tight transition-colors">{title}</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-xl leading-none cursor-pointer transition-colors">×</button>
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
    <div className="bg-[#18181b]/80 border border-zinc-800 rounded-2xl overflow-hidden transition-colors">
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
