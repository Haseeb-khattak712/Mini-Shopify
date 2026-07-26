import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, StatusBadge } from './ui'
import { SALES_DATA } from '../data'
import { useTilt } from '../hooks/useTilt'
import { useOutletContext } from 'react-router-dom'

function Stat3DCard({ label, value, change, positive, icon, color }) {
  const tilt = useTilt(10)
  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      className="bg-white border border-slate-200 rounded-[10px] p-5 cursor-default"
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
      <p className="text-2xl font-bold text-slate-900 font-display" style={{ transform: 'translateZ(14px)' }}>{value}</p>
      <p className="text-sm text-slate-500 mt-0.5" style={{ transform: 'translateZ(8px)' }}>{label}</p>
    </div>
  )
}

export function AdminDashboard() {
  const { orders } = useOutletContext();
  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0)
  const ordersToday = orders.filter(o => o.date === '2026-07-23').length
  const lowStock = [{ name: 'Leather Wallet', stock: 7 }, { name: 'Desk Lamp', stock: 3 }]

  return (
    <div className="p-8" style={{ perspective: '1200px' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-display text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Wednesday, July 23, 2026</p>
      </div>

      {/* Stats — 3D tilt cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <Stat3DCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} change="18%" positive icon="💰" color="bg-green-50 text-green-600" />
        <Stat3DCard label="Orders Today" value={String(ordersToday || '—')} change="5%" positive icon="📦" color="bg-blue-50 text-blue-600" />
        <Stat3DCard label="Total Orders" value={String(orders.length)} icon="📋" color="bg-indigo-50 text-indigo-600" />
        <Stat3DCard label="Low Stock Items" value={String(lowStock.length)} icon="⚠️" color="bg-amber-50 text-amber-600" />
      </div>

      {/* Chart + Low stock */}
      <div className="grid xl:grid-cols-3 gap-6 mb-8">
        <Card className="xl:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-slate-900 font-display">Revenue trend</h2>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">Jul 16 – Jul 23, 2026</p>
            </div>
            <span className="text-sm font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full font-mono">↑ 18.4%</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={SALES_DATA} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
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
          <h2 className="font-semibold text-slate-900 font-display mb-4">Low stock alerts</h2>
          <div className="flex flex-col gap-3">
            {lowStock.map(item => (
              <div key={item.name} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <p className="text-sm text-slate-700">{item.name}</p>
                <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded-full ${item.stock <= 5 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'}`}>
                  {item.stock} left
                </span>
              </div>
            ))}
            <div className="pt-2 text-center">
              <span className="text-xs text-slate-400">All other products are well-stocked</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent orders */}
      <Card>
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 font-display">Recent orders</h2>
          <span className="text-xs text-slate-400 font-mono">{orders.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {['Order', 'Customer', 'Date', 'Total', 'Status'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-slate-400 font-mono uppercase tracking-wide px-6 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 4).map(order => (
                <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-6 py-3 text-sm font-mono font-medium text-indigo-600">{order.id}</td>
                  <td className="px-6 py-3 text-sm text-slate-700">{order.customer}</td>
                  <td className="px-6 py-3 text-sm text-slate-400 font-mono">{order.date}</td>
                  <td className="px-6 py-3 text-sm font-semibold text-slate-900">${order.total}</td>
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
