import { useState } from 'react'
import { Button, Input, Modal, Toast, Card } from './ui'
import { useOutletContext } from 'react-router-dom'
import { addProduct, updateProduct, deleteProduct } from '../services/storage'

export function AdminProducts() {
  const { products, setProducts } = useOutletContext()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState('')
  const [editProduct, setEditProduct] = useState(null)
  const [form, setForm] = useState({ name: '', price: '', stock: '', category: 'Apparel', description: '', sizes: '', colors: '' })
  const [formErrors, setFormErrors] = useState({})

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))]

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || p.category === category
    return matchSearch && matchCat
  })

  const openAdd = () => {
    setEditProduct(null)
    setForm({ name: '', price: '', stock: '', category: 'Apparel', description: '', sizes: '', colors: '' })
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
      colors: p.colors ? p.colors.join(', ') : ''
    })
    setFormErrors({})
    setShowModal(true)
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
      const updated = { ...editProduct, ...form, price: +form.price, stock: +form.stock, sizes: parsedSizes, colors: parsedColors }
      await updateProduct(updated)
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
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop&auto=format',
      }
      const res = await addProduct(newP)
      setProducts(ps => [{ ...newP, id: res.id }, ...ps])
      setToast('Product added successfully')
    }
    setShowModal(false)
    setTimeout(() => setToast(''), 3000)
  }

  const handleDelete = async (id) => {
    await deleteProduct(id)
    setProducts(ps => ps.filter(p => p.id !== id))
    setToast('Product removed')
    setTimeout(() => setToast(''), 3000)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">Products</h1>
          <p className="text-sm text-slate-500 mt-0.5">{products.length} products in your catalog</p>
        </div>
        <Button onClick={openAdd}>+ Add product</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-48 max-w-72">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">⌕</span>
          <input
            className="w-full pl-8 pr-3 py-2 rounded-[10px] border border-slate-200 bg-white text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
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
                ${category === cat ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
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
              <tr className="border-b border-slate-100">
                {['Product', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-slate-400 font-mono uppercase tracking-wide px-6 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400">No products match your search.</td>
                </tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-slate-100" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{p.name}</p>
                        <p className="text-xs text-slate-400 truncate max-w-48">{p.description.slice(0, 50)}…</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{p.category}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">${p.price}</td>
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
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Category</label>
              <select
                className="w-full px-3.5 py-2.5 rounded-[10px] border border-slate-200 bg-white text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
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
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Description</label>
              <textarea
                className="w-full px-3.5 py-2.5 rounded-[10px] border border-slate-200 bg-white text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
                rows={3}
                placeholder="Brief product description…"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="border-2 border-dashed border-slate-200 rounded-[10px] p-6 text-center hover:border-indigo-300 hover:bg-indigo-50/20">
              <p className="text-slate-400 text-sm">📷 Drop an image here, or <span className="text-indigo-600 cursor-pointer">browse</span></p>
              <p className="text-xs text-slate-300 mt-1">PNG, JPG up to 5MB</p>
            </div>
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
