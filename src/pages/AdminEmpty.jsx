import { Button } from '@/components/ui/ui'
import { useTilt } from '@/hooks/useTilt'
import { getUserContext } from '@/services/storage'

function TiltCard({ children }) {
  const tilt = useTilt(9)
  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 flex flex-col items-center text-center shadow-xl"
      style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
    >
      {children}
    </div>
  )
}

function EmptyIllustration({ type }) {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {type === 'products' ? (
        <>
          <rect x="20" y="30" width="80" height="60" rx="8" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
          <rect x="32" y="42" width="22" height="22" rx="4" fill="#71717a" />
          <rect x="62" y="44" width="28" height="4" rx="2" fill="#3f3f46" />
          <rect x="62" y="52" width="20" height="3" rx="1.5" fill="#27272a" />
          <rect x="32" y="72" width="56" height="3" rx="1.5" fill="#27272a" />
          <circle cx="88" cy="36" r="14" fill="#f4f4f5" />
          <text x="88" y="41" textAnchor="middle" fill="#18181b" fontSize="14" fontWeight="bold">+</text>
        </>
      ) : (
        <>
          <rect x="16" y="24" width="88" height="72" rx="8" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
          <rect x="28" y="40" width="64" height="4" rx="2" fill="#3f3f46" />
          <rect x="28" y="52" width="48" height="3" rx="1.5" fill="#27272a" />
          <rect x="28" y="62" width="56" height="3" rx="1.5" fill="#27272a" />
          <rect x="28" y="72" width="40" height="3" rx="1.5" fill="#27272a" />
          <circle cx="60" cy="26" r="18" fill="#09090b" stroke="#3f3f46" strokeWidth="2" />
          <text x="60" y="33" textAnchor="middle" fill="#71717a" fontSize="20">📭</text>
        </>
      )}
    </svg>
  )
}

import { useNavigate } from 'react-router-dom'

export function AdminEmpty() {
  const navigate = useNavigate()
  const user = getUserContext()

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display text-zinc-100 tracking-tight">Empty states</h1>
        <p className="text-sm text-zinc-500 mt-1">Shown to new merchants before they add products or receive orders.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl" style={{ perspective: '1200px' }}>
        {/* No products */}
        <TiltCard>
          <EmptyIllustration type="products" />
          <h2 className="text-lg font-bold font-display text-zinc-100 mt-6 mb-2">No products yet</h2>
          <p className="text-sm text-zinc-500 leading-relaxed mb-6 max-w-52">
            Add your first product to start selling. It only takes a minute.
          </p>
          <Button onClick={() => navigate('/admin/products')}>+ Add your first product</Button>
        </TiltCard>

        {/* No orders */}
        <TiltCard>
          <EmptyIllustration type="orders" />
          <h2 className="text-lg font-bold font-display text-zinc-100 mt-6 mb-2">No orders yet</h2>
          <p className="text-sm text-zinc-500 leading-relaxed mb-6 max-w-52">
            Your orders will appear here once customers start buying from your store.
          </p>
          <Button variant="secondary" onClick={() => navigate(`/store/${user?.subdomain || 'demo'}`)}>
            View your storefront →
          </Button>
        </TiltCard>
      </div>
    </div>
  )
}
