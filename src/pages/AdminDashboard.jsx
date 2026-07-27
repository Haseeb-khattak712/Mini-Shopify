import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, StatusBadge } from '@/components/ui/ui'
import { useTilt } from '@/hooks/useTilt'
import { useOutletContext } from 'react-router-dom'
import { getUserContext } from '@/services/storage'

function Stat3DCard({ label, value, change, positive, icon, color }) {
  const tilt = useTilt(10)
  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      className="bg-[#021612] border border-white/10 rounded-[10px] p-5 cursor-default"
      style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
    >
      <div className="flex items-start justify-between mb-3" style={{ transform: 'translateZ(20px)' }}>
        <span className={`w-10 h-10 rounded-[10px] flex items-center justify-center text-lg ${color}`}>{icon}</span>
        {change && (
          <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded-full ${positive ? 'text-green-700 bg-green-50' : 'text-red-600 bg-red-50'}`}>
            {positive ? '↑' : '↓'} {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white font-display" style={{ transform: 'translateZ(14px)' }}>{value}</p>
      <p className="text-sm text-white/60 mt-0.5" style={{ transform: 'translateZ(8px)' }}>{label}</p>
    </div>
  )
}

export function AdminDashboard() {
  const { orders, products } = useOutletContext();
  const user = getUserContext();
  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0)
  const today = new Date().toISOString().split('T')[0]
  const ordersToday = orders.filter(o => o.date === today).length
  const lowStock = (products || []).filter(p => p.stock <= 5)

  // Generate 7-day sales data dynamically
  const salesData = [...Array(7)].map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    const shortLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const dayRevenue = orders.filter(o => o.date === dateStr && o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0)
    return { day: shortLabel, revenue: dayRevenue }
  })

  return (
    <div className="p-8" style={{ perspective: '1200px' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-display text-white  transition-colors">{user?.business_name || 'Dashboard'}</h1>
        <p className="text-sm text-white/60 mt-0.5 transition-colors">Welcome back, {user?.email}</p>
      </div>

      {/* Stats — 3D tilt cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <Stat3DCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} change="18%" positive icon="💰" color="bg-green-50 text-green-600" />
        <Stat3DCard label="Orders Today" value={String(ordersToday || '—')} change="5%" positive icon="📦" color="bg-blue-50 text-blue-600" />
        <Stat3DCard label="Total Orders" value={String(orders.length)} icon="📋" color="bg-white/5 text-shop-primary" />
        <Stat3DCard label="Low Stock Items" value={String(lowStock.length)} icon="⚠️" color="bg-amber-50 text-amber-600" />
      </div>

      {/* Chart + Low stock */}
      <div className="grid xl:grid-cols-3 gap-6 mb-8">
        <Card className="xl:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-white font-display">Revenue trend</h2>
              <p className="text-xs text-white/50 mt-0.5 font-mono">Last 7 Days</p>
            </div>
            <span className="text-sm font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full font-mono">Live Data</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={salesData} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(1)}k`} />
              <Tooltip
                formatter={(v) => [`$${v.toLocaleString()}`, 'Revenue']}
                contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#f1f5f9', fontSize: '12px' }}
                itemStyle={{ color: '#a5b4fc' }}
                labelStyle={{ color: '#cbd5e1', fontFamily: 'JetBrains Mono', fontSize: '11px' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: '#4f46e5', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-white font-display mb-4">Low stock alerts</h2>
          <div className="flex flex-col gap-3">
            {lowStock.map(item => (
              <div key={item.name} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <p className="text-sm text-white/80">{item.name}</p>
                <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded-full ${item.stock <= 5 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'}`}>
                  {item.stock} left
                </span>
              </div>
            ))}
            <div className="pt-2 text-center">
              <span className="text-xs text-white/50">All other products are well-stocked</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent orders */}
      <Card>
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-semibold text-white font-display">Recent orders</h2>
          <span className="text-xs text-white/50 font-mono">{orders.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Order', 'Customer', 'Date', 'Total', 'Status'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-white/50 font-mono uppercase tracking-wide px-6 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 4).map(order => (
                <tr key={order.id} className="border-b border-slate-50 hover:bg-[#000504]/50">
                  <td className="px-6 py-3 text-sm font-mono font-medium text-shop-primary">{order.id}</td>
                  <td className="px-6 py-3 text-sm text-white/80">{order.customer}</td>
                  <td className="px-6 py-3 text-sm text-white/50 font-mono">{order.date}</td>
                  <td className="px-6 py-3 text-sm font-semibold text-white">${order.total}</td>
                  <td className="px-6 py-3"><StatusBadge status={order.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
