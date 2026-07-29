import { useState } from 'react'
import { Card, Button, Toast } from '@/components/ui/ui'
import { useOutletContext } from 'react-router-dom'
import { addDiscount, updateDiscount, deleteDiscount, getUserContext } from '@/services/storage'

export function AdminDiscounts() {
  const { discounts, setDiscounts } = useOutletContext();
  const user = getUserContext();
  const [toast, setToast] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({ code: '', type: 'percentage', value: '', active: true })
  
  const handleToggle = async (discount) => {
    const newActive = discount.active ? 0 : 1;
    await updateDiscount({ id: discount.id, active: newActive }, user?.id);
    setDiscounts(prev => prev.map(d => d.id === discount.id ? { ...d, active: newActive } : d));
    setToast(`Discount ${discount.code} ${newActive ? 'activated' : 'deactivated'}`);
    setTimeout(() => setToast(''), 3000);
  }

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete discount code ${code}?`)) return;
    await deleteDiscount(id, user?.id);
    setDiscounts(prev => prev.filter(d => d.id !== id));
    setToast(`Discount ${code} deleted`);
    setTimeout(() => setToast(''), 3000);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.value) return;
    
    const res = await addDiscount({
      code: formData.code,
      type: formData.type,
      value: parseFloat(formData.value),
      active: formData.active ? 1 : 0
    }, user?.id);
    
    if (res.success) {
      setDiscounts(prev => [...prev, res.discount]);
      setToast('Discount created');
      setIsAdding(false);
      setFormData({ code: '', type: 'percentage', value: '', active: true });
      setTimeout(() => setToast(''), 3000);
    } else {
      setToast(res.error || 'Failed to create discount');
      setTimeout(() => setToast(''), 3000);
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-zinc-100 tracking-tight">Discounts & Promos</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage promo codes and discounts for your store.</p>
        </div>
        <Button onClick={() => setIsAdding(true)} variant="primary">+ Create Code</Button>
      </div>

      {isAdding && (
        <Card className="p-6 mb-8 bg-zinc-900/50 border border-zinc-800">
          <h3 className="text-lg font-medium text-white mb-4">Create New Discount</h3>
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-zinc-400 mb-1">Promo Code</label>
              <input 
                type="text" 
                required 
                value={formData.code} 
                onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                placeholder="e.g. SUMMER20"
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2 outline-none focus:border-white/20 uppercase"
              />
            </div>
            <div className="w-40">
              <label className="block text-xs font-medium text-zinc-400 mb-1">Type</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2 outline-none focus:border-white/20"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div className="w-32">
              <label className="block text-xs font-medium text-zinc-400 mb-1">Value</label>
              <input 
                type="number" 
                required 
                step="0.01"
                min="0"
                value={formData.value} 
                onChange={(e) => setFormData({...formData, value: e.target.value})}
                placeholder="e.g. 20"
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2 outline-none focus:border-white/20"
              />
            </div>
            <div className="flex items-center gap-2 h-10 px-2">
              <input 
                type="checkbox" 
                checked={formData.active}
                onChange={(e) => setFormData({...formData, active: e.target.checked})}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 accent-white cursor-pointer"
              />
              <span className="text-sm text-zinc-300">Active</span>
            </div>
            <div className="flex gap-2 h-10">
              <Button type="button" variant="secondary" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Save</Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        {discounts.length === 0 ? (
          <div className="py-12 text-center">
            <span className="text-4xl block mb-4 opacity-50">🎟️</span>
            <h3 className="text-lg font-medium text-white mb-2">No discounts yet</h3>
            <p className="text-sm text-zinc-500 mb-6">Create promo codes to run sales and offer special deals.</p>
            <Button onClick={() => setIsAdding(true)} variant="secondary">Create your first code</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-medium text-white/50 font-mono uppercase tracking-wide px-5 py-3">Code</th>
                  <th className="text-left text-xs font-medium text-white/50 font-mono uppercase tracking-wide px-5 py-3">Type</th>
                  <th className="text-left text-xs font-medium text-white/50 font-mono uppercase tracking-wide px-5 py-3">Value</th>
                  <th className="text-left text-xs font-medium text-white/50 font-mono uppercase tracking-wide px-5 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-white/50 font-mono uppercase tracking-wide px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {discounts.map(d => (
                  <tr key={d.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <span className="bg-zinc-800 text-zinc-100 font-mono px-2 py-1 rounded text-sm tracking-wide">{d.code}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-zinc-300 capitalize">{d.type}</td>
                    <td className="px-5 py-4 text-sm text-zinc-100 font-medium">
                      {d.type === 'percentage' ? `${d.value}%` : `$${d.value.toFixed(2)}`}
                    </td>
                    <td className="px-5 py-4">
                      <button 
                        onClick={() => handleToggle(d)}
                        className={`text-xs font-mono px-2.5 py-1 rounded-full border cursor-pointer transition-colors ${d.active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700 hover:text-white'}`}
                      >
                        {d.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => handleDelete(d.id, d.code)} className="text-zinc-500 hover:text-red-400 transition-colors text-sm font-medium cursor-pointer">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
