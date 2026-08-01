import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, FunnelChart, Funnel, LabelList, BarChart, Bar } from 'recharts'
import { Card, StatusBadge } from '@/components/ui/ui'
import { useTilt } from '@/hooks/useTilt'
import { useOutletContext } from 'react-router-dom'
import { getUserContext } from '@/services/storage'

function Stat3DCard({ label, value, change, positive, icon, color }) {
  const tilt = useTilt(10)
  return (
    <motion.div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      whileTap={{ scale: 0.95 }}
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
    </motion.div>
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
  const salesData = useMemo(() => [...Array(7)].map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    const shortLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const dayRevenue = orders.filter(o => o.date === dateStr && o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0)
    return { day: shortLabel, revenue: dayRevenue }
  }), [orders])

  // Leaderboard logic
  const topProducts = useMemo(() => {
    const productSales = orders.flatMap(o => o.items).reduce((acc, item) => {
      const id = item.product_id || item.product?.id;
      const name = item.name || item.product?.name || `Product ${id}`;
      if (!acc[id]) acc[id] = { name, revenue: 0, sold: 0 };
      acc[id].revenue += (item.price || 0) * (item.quantity || 1);
      acc[id].sold += (item.quantity || 1);
      return acc;
    }, {});
    return Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [orders])

  // Mock Funnel Data
  const funnelData = useMemo(() => [
    { name: 'Visitors', value: 12450, fill: '#3f3f46' },
    { name: 'Added to Cart', value: 3150, fill: '#52525b' },
    { name: 'Checkout', value: 1820, fill: '#71717a' },
    { name: 'Purchased', value: Math.max(orders.length, 120), fill: '#10b981' }
  ], [orders.length])

  return (
    <div className="p-4 md:p-8 overflow-x-hidden" style={{ perspective: '1200px' }}>
      {/* Header */}
      <div className="mb-6 md:mb-8 pt-14 md:pt-0">
        <h1 className="text-2xl md:text-3xl font-bold font-display text-zinc-100 tracking-tight transition-colors">{user?.business_name || 'Dashboard'}</h1>
        <p className="text-xs md:text-sm text-zinc-500 mt-1 transition-colors">Welcome back, {user?.email}</p>
      </div>

      {/* Stats — 3D tilt cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 md:gap-6 mb-8">
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

      {/* Advanced Analytics Row */}
      <div className="grid xl:grid-cols-3 gap-6 mt-8">

        {/* Globe Placeholder */}
        <Card className="p-6 flex flex-col items-center justify-center min-h-[300px] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-950/80 z-10 pointer-events-none" />
          <h2 className="font-semibold text-zinc-100 font-display tracking-tight absolute top-6 left-6 z-20">Global Reach</h2>
          <div className="w-48 h-48 rounded-full border border-zinc-700/50 relative animate-[spin_20s_linear_infinite] flex items-center justify-center opacity-80" style={{ transformStyle: 'preserve-3d', backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1), transparent)' }}>
            <div className="absolute inset-0 border border-zinc-700/30 rounded-full" style={{ transform: 'rotateX(60deg)' }} />
            <div className="absolute inset-0 border border-zinc-700/30 rounded-full" style={{ transform: 'rotateY(60deg)' }} />
            <div className="absolute w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_#10b981]" style={{ top: '30%', left: '20%' }} />
            <div className="absolute w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_10px_#10b981]" style={{ top: '60%', right: '30%' }} />
            <div className="absolute w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_#10b981]" style={{ bottom: '40%', left: '60%' }} />
          </div>
          <p className="absolute bottom-6 text-xs text-zinc-500 z-20">Sales span 12 countries</p>
        </Card>

        {/* Funnel */}
        <Card className="p-6">
          <h2 className="font-semibold text-zinc-100 font-display tracking-tight mb-4">Conversion Funnel</h2>
          <ResponsiveContainer width="100%" height={240}>
            <FunnelChart>
              <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }} />
              <Funnel dataKey="value" data={funnelData} isAnimationActive>
                <LabelList position="center" fill="#fff" stroke="none" dataKey="name" fontSize={12} fontWeight={600} />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </Card>

        {/* Leaderboard */}
        <Card className="p-6">
          <h2 className="font-semibold text-zinc-100 font-display tracking-tight mb-4">Top Products</h2>
          <div className="flex flex-col gap-4">
            {topProducts.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-8">No product sales yet.</p>
            ) : topProducts.map((p, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-500/20 text-yellow-500' : i === 1 ? 'bg-zinc-300/20 text-zinc-300' : i === 2 ? 'bg-amber-700/20 text-amber-600' : 'bg-zinc-800 text-zinc-500'}`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-200 truncate">{p.name}</p>
                  <p className="text-xs text-zinc-500">{p.sold} units sold</p>
                </div>
                <p className="text-sm font-semibold text-emerald-400">${p.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
