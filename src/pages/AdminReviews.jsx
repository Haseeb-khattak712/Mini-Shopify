import { useState } from 'react'
import { Card, Toast } from '@/components/ui/ui'
import { useOutletContext } from 'react-router-dom'
import { updateReview, deleteReview, getUserContext } from '@/services/storage'

export function AdminReviews() {
  const { reviews, setReviews, products } = useOutletContext();
  const user = getUserContext();
  const [toast, setToast] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredReviews = filterStatus === 'all' 
    ? reviews 
    : reviews.filter(r => (r.status || 'approved') === filterStatus)

  const handleToggleStatus = async (review) => {
    const currentStatus = review.status || 'approved';
    const newStatus = currentStatus === 'approved' ? 'hidden' : 'approved';
    
    await updateReview({ id: review.id, status: newStatus }, user?.id);
    setReviews(prev => prev.map(r => r.id === review.id ? { ...r, status: newStatus } : r));
    setToast(`Review ${newStatus}`);
    setTimeout(() => setToast(''), 3000);
  }

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete this review?`)) return;
    await deleteReview(id, user?.id);
    setReviews(prev => prev.filter(r => r.id !== id));
    setToast(`Review deleted`);
    setTimeout(() => setToast(''), 3000);
  }

  const getProductName = (id) => {
    return products.find(p => p.id === id)?.name || 'Unknown Product'
  }

  const statusOptions = ['all', 'approved', 'hidden']

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display text-zinc-100 tracking-tight">Reviews</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage customer feedback for your products.</p>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {statusOptions.map(s => {
          const count = s === 'all' 
            ? reviews.length 
            : reviews.filter(r => (r.status || 'approved') === s).length;
          
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap
                ${filterStatus === s ? 'bg-zinc-100 text-zinc-900 shadow-sm' : 'bg-zinc-900/50 text-zinc-400 border border-zinc-800 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
            >
              {s === 'all' ? 'All Reviews' : s.charAt(0).toUpperCase() + s.slice(1)}
              <span className={`font-mono rounded-full px-1.5 py-0.5 leading-none text-[10px] ${filterStatus === s ? 'bg-zinc-300/50 text-zinc-900' : 'bg-zinc-800 text-zinc-400'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <Card>
        {filteredReviews.length === 0 ? (
          <div className="py-12 text-center">
            <span className="text-4xl block mb-4 opacity-50">★</span>
            <h3 className="text-lg font-medium text-white mb-2">No reviews found</h3>
            <p className="text-sm text-zinc-500 mb-6">Customer reviews will appear here once submitted.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-medium text-white/50 font-mono uppercase tracking-wide px-5 py-3">Product</th>
                  <th className="text-left text-xs font-medium text-white/50 font-mono uppercase tracking-wide px-5 py-3">Review</th>
                  <th className="text-left text-xs font-medium text-white/50 font-mono uppercase tracking-wide px-5 py-3">Rating</th>
                  <th className="text-left text-xs font-medium text-white/50 font-mono uppercase tracking-wide px-5 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-white/50 font-mono uppercase tracking-wide px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map(r => {
                  const isHidden = (r.status || 'approved') === 'hidden';
                  return (
                    <tr key={r.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-4 w-48">
                        <p className="text-sm font-medium text-zinc-100 truncate">{getProductName(r.product_id)}</p>
                        <p className="text-xs text-zinc-500 font-mono">{r.date}</p>
                      </td>
                      <td className="px-5 py-4 max-w-md">
                        <p className="text-sm font-medium text-zinc-200">{r.author}</p>
                        <p className={`text-sm mt-1 line-clamp-2 ${isHidden ? 'text-zinc-600' : 'text-zinc-400'}`}>"{r.text}"</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-sm ${i < r.rating ? 'text-yellow-400' : 'text-zinc-700'}`}>★</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <button 
                          onClick={() => handleToggleStatus(r)}
                          className={`text-xs font-mono px-2.5 py-1 rounded-full border cursor-pointer transition-colors 
                            ${!isHidden ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20'}`}
                        >
                          {!isHidden ? 'Approved' : 'Hidden'}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button onClick={() => handleDelete(r.id)} className="text-zinc-500 hover:text-red-400 transition-colors text-sm font-medium cursor-pointer">
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
