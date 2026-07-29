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
      className="bg-[#18181b]/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-5 cursor-default shadow-xl shadow-black/20 transition-all duration-300"
      style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
    >
      <div className="flex items-start justify-between mb-3" style={{ transform: 'translateZ(20px)' }}>
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border border-white/5 ${color}`}>{icon}</span>
        {change && (
          <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-full border ${positive ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.2)]' : 'text-red-400 bg-red-500/10 border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.2)]'}`}>
            {positive ? '↑' : '↓'} {change}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-zinc-100 font-display tracking-tight" style={{ transform: 'translateZ(14px)' }}>{value}</p>
      <p className="text-sm text-zinc-500 mt-1" style={{ transform: 'translateZ(8px)' }}>{label}</p>
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
  const averageOrderValue = orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : '0.00'

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
        <h1 className="text-3xl font-bold font-display text-zinc-100 tracking-tight transition-colors">{user?.business_name || 'Dashboard'}</h1>
        <p className="text-sm text-zinc-500 mt-1 transition-colors">Welcome back, {user?.email}</p>
      </div>

      {/* Stats — 3D tilt cards */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
        <Stat3DCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} change="18%" positive icon="💰" color="bg-emerald-500/10 text-emerald-400" />
        <Stat3DCard label="Average Order Value" value={`$${averageOrderValue}`} icon="📈" color="bg-indigo-500/10 text-indigo-400" />
        <Stat3DCard label="Orders Today" value={String(ordersToday || '—')} change="5%" positive icon="📦" color="bg-blue-500/10 text-blue-400" />
        <Stat3DCard label="Total Orders" value={String(orders.length)} icon="📋" color="bg-zinc-100/10 text-zinc-100 border-zinc-800" />
        <Stat3DCard label="Low Stock Items" value={String(lowStock.length)} icon="⚠️" color="bg-amber-500/10 text-amber-400" />
      </div>

      {/* Chart + Low stock */}
      <div className="grid xl:grid-cols-3 gap-6 mb-8">
        <Card className="xl:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-zinc-100 font-display tracking-tight">Revenue trend</h2>
              <p className="text-xs text-zinc-500 mt-1 font-mono">Last 7 Days</p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-mono shadow-[0_0_10px_rgba(16,185,129,0.2)]">Live Data</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={salesData} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#71717a', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fontSize: 11, fill: '#71717a', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(1)}k`} dx={-10} />
              <Tooltip
                formatter={(v) => [`$${v.toLocaleString()}`, 'Revenue']}
                contentStyle={{ background: 'rgba(24,24,27,0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f4f4f5', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                itemStyle={{ color: '#ffffff', fontWeight: 600 }}
                labelStyle={{ color: '#a1a1aa', fontFamily: 'JetBrains Mono', fontSize: '11px', marginBottom: '4px' }}
                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#f4f4f5" strokeWidth={3} fill="url(#revGrad)" dot={false} activeDot={{ r: 6, fill: '#ffffff', stroke: '#18181b', strokeWidth: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-zinc-100 font-display tracking-tight mb-4">Low stock alerts</h2>
          <div className="flex flex-col gap-3">
            {lowStock.map(item => (
              <div key={item.name} className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0 group">
                <p className="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors">{item.name}</p>
                <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-full border ${item.stock <= 5 ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.2)]' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                  {item.stock} left
                </span>
              </div>
            ))}
            <div className="pt-2 text-center">
              <span className="text-xs text-zinc-500">All other products are well-stocked</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent orders */}
      <Card>
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/20 rounded-t-2xl">
          <h2 className="font-semibold text-zinc-100 font-display tracking-tight">Recent orders</h2>
          <span className="text-xs text-zinc-500 font-mono bg-zinc-800/50 px-2.5 py-1 rounded-full">{orders.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/10">
                {['Order', 'Customer', 'Date', 'Total', 'Status'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-zinc-500 font-mono uppercase tracking-wide px-6 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 4).map(order => (
                <tr key={order.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors group cursor-pointer last:border-0">
                  <td className="px-6 py-4 text-sm font-mono font-medium text-zinc-100 group-hover:text-white transition-colors">{order.id}</td>
                  <td className="px-6 py-4 text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors">{order.customer}</td>
                  <td className="px-6 py-4 text-sm text-zinc-500 font-mono">{order.date}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-zinc-100">${order.total}</td>
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
