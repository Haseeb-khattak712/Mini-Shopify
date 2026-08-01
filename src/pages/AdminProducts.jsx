import { useState } from 'react'
import { Button, Input, Modal, Toast, Card } from '@/components/ui/ui'
import { useOutletContext } from 'react-router-dom'
import { addProduct, updateProduct, deleteProduct, getUserContext } from '@/services/storage'

export function AdminProducts() {
  const { products, setProducts } = useOutletContext()
  const user = getUserContext()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState('')
  const [editProduct, setEditProduct] = useState(null)
  const [form, setForm] = useState({ name: '', price: '', stock: '', category: 'Apparel', description: '', sizes: '', colors: '', image: '', is_digital: false, file_url: '', variant_stock: {} })
  const [formErrors, setFormErrors] = useState({})

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))]

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || p.category === category
    return matchSearch && matchCat
  })

  const openAdd = () => {
    setEditProduct(null)
    setForm({ name: '', price: '', stock: '', category: 'Apparel', description: '', sizes: '', colors: '', image: '', is_digital: false, file_url: '', variant_stock: {} })
    setFormErrors({})
    setShowModal(true)
  }

  const openEdit = (p) => {
    setEditProduct(p)
    setForm({ 
      name: p.name, 
      price: String(p.price), 
      stock: String(p.stock), 
      category: p.category, 
      description: p.description,
      sizes: p.sizes ? p.sizes.join(', ') : '',
      colors: p.colors ? p.colors.join(', ') : '',
      image: p.image || '',
      is_digital: !!p.is_digital,
      file_url: p.file_url || '',
      variant_stock: (typeof p.variant_stock === 'string' ? JSON.parse(p.variant_stock) : p.variant_stock) || {}
    })
    setFormErrors({})
    setShowModal(true)
  }

  const handleUpload = async (e, field) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const token = localStorage.getItem('ownstore_token') || ''
      const API_URL = import.meta.env.VITE_API_URL || '/backend/api'
      const res = await fetch(`${API_URL}/upload.php`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
      const data = await res.json()
      if (data.success) {
        setForm(f => ({ ...f, [field]: data.url }))
        setToast('File uploaded successfully')
        setTimeout(() => setToast(''), 3000)
      } else {
        alert(data.error)
      }
    } catch(err) {
      alert('Upload failed')
    }
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Product name is required'
    if (!form.price || isNaN(+form.price) || +form.price <= 0) e.price = 'Enter a valid price'
    if (!form.stock || isNaN(+form.stock) || +form.stock < 0) e.stock = 'Enter valid stock count'
    setFormErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    const parsedSizes = form.sizes.split(',').map(s => s.trim()).filter(Boolean)
    const parsedColors = form.colors.split(',').map(c => c.trim()).filter(Boolean)

    if (editProduct) {
      const updated = { ...editProduct, ...form, price: +form.price, stock: +form.stock, sizes: parsedSizes, colors: parsedColors, is_digital: form.is_digital ? 1 : 0 }
      await updateProduct(updated, user?.id)
      setProducts(ps => ps.map(p => p.id === editProduct.id ? updated : p))
      setToast('Product updated successfully')
    } else {
      const newP = {
        name: form.name,
        price: +form.price,
        stock: +form.stock,
        category: form.category,
        description: form.description,
        sizes: parsedSizes,
        colors: parsedColors,
        image: form.image || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop&auto=format',
        is_digital: form.is_digital ? 1 : 0,
        file_url: form.file_url || '',
        variant_stock: form.variant_stock
      }
      const res = await addProduct(newP, user?.id)
      setProducts(ps => [{ ...newP, id: res.id }, ...ps])
      setToast('Product added successfully')
    }
    setShowModal(false)
    setTimeout(() => setToast(''), 3000)
  }

  const handleDelete = async (id) => {
    await deleteProduct(id, user?.id)
    setProducts(ps => ps.filter(p => p.id !== id))
    setToast('Product removed')
    setTimeout(() => setToast(''), 3000)
  }

  // Variant combinations
  const sizesList = form.sizes.split(',').map(s => s.trim()).filter(Boolean)
  const colorsList = form.colors.split(',').map(c => c.trim()).filter(Boolean)
  let variants = []
  if (sizesList.length > 0 && colorsList.length > 0) {
    sizesList.forEach(s => colorsList.forEach(c => variants.push(`${c}-${s}`)))
  } else if (sizesList.length > 0) {
    variants = sizesList
  } else if (colorsList.length > 0) {
    variants = colorsList
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-zinc-100 tracking-tight">Products</h1>
          <p className="text-sm text-zinc-500 mt-1">{products.length} products in your catalog</p>
        </div>
        <Button onClick={openAdd}>+ Add product</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-48 max-w-72">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-sm">⌕</span>
          <input
            className="w-full pl-8 pr-3 py-2 rounded-[10px] border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-100 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer
                ${category === cat ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-900/50 text-zinc-400 border border-zinc-800 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Product', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-white/50 font-mono uppercase tracking-wide px-6 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-white/50">No products match your search.</td>
                </tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors last:border-0">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-white/5" />
                      <div>
                        <p className="text-sm font-medium text-zinc-100">{p.name}</p>
                        <p className="text-xs text-zinc-500 truncate max-w-48">{p.description.slice(0, 50)}…</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono font-medium text-white/60 bg-white/10 px-2 py-0.5 rounded">{p.category}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-white">${p.price}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded-full
                      ${p.stock <= 5 ? 'bg-red-50 text-red-600' : p.stock <= 15 ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>
                      {p.stock} units
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>Edit</Button>
                      <Button variant="ghost" size="sm" className="!text-red-500 hover:!bg-red-50" onClick={() => handleDelete(p.id)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      {showModal && (
        <Modal title={editProduct ? 'Edit product' : 'Add new product'} onClose={() => setShowModal(false)}>
          <div className="flex flex-col gap-4">
            <Input label="Product name" placeholder="e.g. Cotton Oxford Shirt" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} error={formErrors.name} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Price ($)" type="number" placeholder="0.00" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} error={formErrors.price} />
              <Input label="Stock units" type="number" placeholder="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} error={formErrors.stock} />
            </div>
            <div>
              <label className="text-sm font-medium text-white/80 block mb-1.5">Category</label>
              <select
                className="w-full px-3.5 py-2.5 rounded-[10px] border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-100 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20"
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              >
                {['Apparel', 'Accessories', 'Home', 'Electronics', 'Other'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Input label="Sizes (comma separated)" placeholder="S, M, L" value={form.sizes} onChange={e => setForm(f => ({ ...f, sizes: e.target.value }))} />
              <Input label="Colors (comma separated)" placeholder="Red, Blue" value={form.colors} onChange={e => setForm(f => ({ ...f, colors: e.target.value }))} />
            </div>

            {variants.length > 0 && (
              <div className="bg-zinc-900/50 rounded-[10px] border border-zinc-800 p-4">
                <label className="text-sm font-medium text-white/80 block mb-3">Variant Stock</label>
                <div className="grid grid-cols-2 gap-3">
                  {variants.map(v => (
                    <div key={v} className="flex items-center gap-2">
                      <span className="text-sm text-zinc-400 flex-1 truncate" title={v}>{v}</span>
                      <input
                        type="number"
                        className="w-20 px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-sm text-zinc-100 outline-none"
                        placeholder="0"
                        value={form.variant_stock[v] || ''}
                        onChange={e => setForm(f => ({ ...f, variant_stock: { ...f.variant_stock, [v]: e.target.value } }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-white/80 block mb-1.5">Description</label>
              <textarea
                className="w-full px-3.5 py-2.5 rounded-[10px] border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-100 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 resize-none"
                rows={3}
                placeholder="Brief product description…"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div>
              <Input label="Image URLs (comma separated)" placeholder="https://..., https://..." value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} />
              <input type="file" accept="image/*" onChange={(e) => handleUpload(e, 'image')} className="mt-2 text-xs text-zinc-500" />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                id="is_digital" 
                checked={form.is_digital} 
                onChange={e => setForm(f => ({ ...f, is_digital: e.target.checked }))}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-900/50 text-shop-primary"
              />
              <label htmlFor="is_digital" className="text-sm font-medium text-white/80">Digital Product</label>
            </div>
            {form.is_digital && (
              <div className="pl-6 border-l-2 border-shop-primary/30">
                <Input 
                  label="File URL (for digital download)" 
                  placeholder="https://..." 
                  value={form.file_url} 
                  onChange={e => setForm(f => ({ ...f, file_url: e.target.value }))} 
                />
                <input type="file" onChange={(e) => handleUpload(e, 'file_url')} className="mt-2 text-xs text-zinc-500" />
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSave}>{editProduct ? 'Save changes' : 'Add product'}</Button>
            </div>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast} />}
    </div>
  )
}
