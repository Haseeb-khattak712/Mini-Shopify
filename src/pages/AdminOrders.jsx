import { useState } from 'react'
import { StatusBadge, Card, Button, Toast } from '@/components/ui/ui'
import { useOutletContext } from 'react-router-dom'
import { updateOrder } from '@/services/storage'

const STATUS_FLOW = ['pending', 'processing', 'shipped', 'delivered']

export function AdminOrders() {
  const { orders, setOrders } = useOutletContext();
  const [selected, setSelected] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [toast, setToast] = useState('')

  const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus)

  const advanceStatus = async (orderId) => {
    const order = orders.find(o => o.id === orderId)
    if (!order) return
    const idx = STATUS_FLOW.indexOf(order.status)
    if (idx >= 0 && idx < STATUS_FLOW.length - 1) {
      const next = STATUS_FLOW[idx + 1]
      await updateOrder({ id: orderId, status: next })
      setOrders(os => os.map(o => o.id === orderId ? { ...o, status: next } : o))
      setToast(`Order ${orderId} marked as ${next}`)
      setTimeout(() => setToast(''), 3000)
      if (selected?.id === orderId) {
        setSelected(prev => prev ? { ...prev, status: next } : null)
      }
    }
  }

  const cancelOrder = async (orderId) => {
    await updateOrder({ id: orderId, status: 'cancelled' })
    setOrders(os => os.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o))
    setToast(`Order ${orderId} cancelled`)
    setTimeout(() => setToast(''), 3000)
    if (selected?.id === orderId) {
      setSelected(prev => prev ? { ...prev, status: 'cancelled' } : null)
    }
  }

  const statusOptions = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled']

  return (
    <div className="p-8 flex gap-6 min-h-full">
      {/* List */}
      <div className="flex-1 min-w-0">
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-display text-white">Orders</h1>
          <p className="text-sm text-white/60 mt-0.5">{orders.length} total orders</p>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {statusOptions.map(s => {
            const count = s === 'all' ? orders.length : orders.filter(o => o.status === s).length
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap
                  ${filterStatus === s ? 'bg-shop-primary text-white' : 'bg-[#021612] text-white/70 border border-white/10 hover:bg-[#000504]'}`}
              >
                {s === 'all' ? 'All orders' : s.charAt(0).toUpperCase() + s.slice(1)}
                <span className={`font-mono rounded-full px-1.5 py-0.5 leading-none text-[10px] ${filterStatus === s ? 'bg-shop-accent/30' : 'bg-white/10 text-white/60'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Order', 'Customer', 'Date', 'Items', 'Total', 'Status'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-white/50 font-mono uppercase tracking-wide px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <tr
                    key={order.id}
                    className={`border-b border-slate-50 cursor-pointer
                      ${selected?.id === order.id ? 'bg-white/5/50' : 'hover:bg-[#000504]/50'}`}
                    onClick={() => setSelected(order)}
                  >
                    <td className="px-5 py-3.5 text-sm font-mono font-medium text-shop-primary">{order.id}</td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-white">{order.customer}</p>
                      <p className="text-xs text-white/50">{order.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-white/50 font-mono">{order.date}</td>
                    <td className="px-5 py-3.5 text-sm text-white/70">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-white">${order.total}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={order.status} /></td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-white/50">No orders match this filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="w-80 shrink-0" style={{ animation: 'slideUp 0.15s ease-out' }}>
          <Card className="p-5 sticky top-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white font-display text-sm">{selected.id}</h2>
              <button onClick={() => setSelected(null)} className="text-white/50 hover:text-white/70 text-lg leading-none cursor-pointer">×</button>
            </div>

            <StatusBadge status={selected.status} />

            {/* Progress bar */}
            {selected.status !== 'cancelled' && (
              <div className="mt-4">
                <div className="flex justify-between mb-1">
                  {STATUS_FLOW.map((s, i) => (
                    <div key={s} className="flex flex-col items-center gap-1">
                      <div className={`w-4 h-4 rounded-full border-2 ${STATUS_FLOW.indexOf(selected.status) >= i ? 'bg-shop-primary border-shop-primary' : 'bg-[#021612] border-slate-300'}`} />
                    </div>
                  ))}
                </div>
                <div className="relative h-1 bg-white/10 rounded-full mb-2">
                  <div
                    className="absolute h-full bg-shop-primary rounded-full"
                    style={{ width: `${(STATUS_FLOW.indexOf(selected.status) / (STATUS_FLOW.length - 1)) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between">
                  {STATUS_FLOW.map(s => (
                    <span key={s} className="text-[9px] font-mono text-white/50 capitalize">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Customer */}
            <div className="mt-5 pt-4 border-t border-white/5">
              <p className="text-xs font-mono text-white/50 uppercase tracking-wide mb-2">Customer</p>
              <p className="text-sm font-medium text-white">{selected.customer}</p>
              <p className="text-xs text-white/60 mt-0.5">{selected.email}</p>
              <p className="text-xs text-white/60 mt-0.5">{selected.phone}</p>
              <p className="text-xs text-white/60 mt-0.5">{selected.address}</p>
            </div>

            {/* Items */}
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-xs font-mono text-white/50 uppercase tracking-wide mb-2">Items</p>
              {selected.items.map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 py-2 border-b border-slate-50 last:border-0">
                  <img src={item.product.image} alt={item.product.name} className="w-8 h-8 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white/90 truncate">{item.product.name}</p>
                    <p className="text-[11px] text-white/50 font-mono">×{item.quantity} · ${item.product.price * item.quantity}</p>
                  </div>
                </div>
              ))}
              <div className="flex justify-between pt-2 mt-1">
                <span className="text-xs font-medium text-white/60">Total</span>
                <span className="text-sm font-bold text-white">${selected.total}</span>
              </div>
            </div>

            {/* Actions */}
            {selected.status !== 'delivered' && selected.status !== 'cancelled' && (
              <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-2">
                <Button
                  className="w-full"
                  size="sm"
                  onClick={() => advanceStatus(selected.id)}
                >
                  Mark as {STATUS_FLOW[STATUS_FLOW.indexOf(selected.status) + 1]}
                </Button>
                <Button variant="ghost" size="sm" className="w-full !text-red-500" onClick={() => cancelOrder(selected.id)}>
                  Cancel order
                </Button>
              </div>
            )}
          </Card>
          <style>{`@keyframes slideUp { from { opacity:0; transform:translateX(8px) } to { opacity:1; transform:translateX(0) } }`}</style>
        </div>
      )}

      {toast && <Toast message={toast} />}
    </div>
  )
}
