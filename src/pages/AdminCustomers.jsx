import { useState, useMemo } from 'react'
import { Card, Button } from '@/components/ui/ui'
import { useOutletContext } from 'react-router-dom'

export function AdminCustomers() {
  const { orders } = useOutletContext();
  const [search, setSearch] = useState('')

  const customers = useMemo(() => {
    const map = orders.reduce((acc, order) => {
      const email = order.email || 'unknown@example.com'
      if (!acc[email]) {
        acc[email] = {
          name: order.customer || 'Unknown Customer',
          email: email,
          orderCount: 0,
          ltv: 0,
          lastOrderDate: order.date
        }
      }
      acc[email].orderCount += 1
      acc[email].ltv += parseFloat(order.total || 0)
      if (new Date(order.date) > new Date(acc[email].lastOrderDate)) {
        acc[email].lastOrderDate = order.date
      }
      return acc
    }, {})
    return Object.values(map).sort((a, b) => b.ltv - a.ltv)
  }, [orders])

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  const downloadCSV = () => {
    if (customers.length === 0) return;
    
    const headers = ['Name', 'Email', 'Total Orders', 'Lifetime Value', 'Last Order Date'];
    const rows = customers.map(c => [
      `"${c.name}"`, 
      `"${c.email}"`, 
      c.orderCount, 
      c.ltv.toFixed(2), 
      c.lastOrderDate
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(',') + "\n" 
      + rows.map(e => e.join(',')).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "customers.csv");
    document.body.appendChild(link); 
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-zinc-100 tracking-tight">Customers</h1>
          <p className="text-sm text-zinc-500 mt-1">{customers.length} unique customers</p>
        </div>
        <Button onClick={downloadCSV} variant="secondary">Export CSV</Button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2 outline-none focus:border-white/20"
        />
      </div>

      <Card>
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <span className="text-4xl block mb-4 opacity-50">👤</span>
            <h3 className="text-lg font-medium text-white mb-2">No customers found</h3>
            <p className="text-sm text-zinc-500">When you receive orders, customer data will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-medium text-white/50 font-mono uppercase tracking-wide px-5 py-3">Customer</th>
                  <th className="text-left text-xs font-medium text-white/50 font-mono uppercase tracking-wide px-5 py-3">Orders</th>
                  <th className="text-left text-xs font-medium text-white/50 font-mono uppercase tracking-wide px-5 py-3">Lifetime Value</th>
                  <th className="text-left text-xs font-medium text-white/50 font-mono uppercase tracking-wide px-5 py-3">Last Order</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-zinc-100">{c.name}</p>
                      <p className="text-xs text-zinc-500">{c.email}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-zinc-300 font-mono">
                      {c.orderCount}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-emerald-400 font-mono">
                      ${c.ltv.toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-sm text-zinc-400 font-mono">
                      {c.lastOrderDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
