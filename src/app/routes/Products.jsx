import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuthUser } from '../../lib/auth'
import { listProducts, createProduct, updateProduct, deleteProduct, DUMMY_PRODUCTS, FUTURE_PRODUCTS } from '../../lib/db/products'

export default function Products() {
  const { profile } = useAuthUser()
  const isStaff = profile?.role === 'admin' || profile?.role === 'staff'
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)
  const [activeTab, setActiveTab] = useState('current')
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => { loadProducts() }, [])

  const loadProducts = async () => {
    setLoading(true)
    try { const data = await listProducts(!isStaff); setProducts(data.length === 0 ? DUMMY_PRODUCTS : data) }
    catch { setProducts(DUMMY_PRODUCTS) }
    finally { setLoading(false) }
  }

  const resetForm = () => { setName(''); setSku(''); setPrice(''); setCategory(''); setImageUrl(''); setDescription(''); setEditing(null); setShowForm(false) }

  const openEdit = (product) => { setName(product.name || ''); setSku(product.sku || ''); setPrice(product.price?.toString() || ''); setCategory(product.category || ''); setImageUrl(product.imageUrl || ''); setDescription(product.description || ''); setEditing(product); setShowForm(true) }

  const handleSubmit = async (e) => {
    e.preventDefault(); if (!name.trim()) return; setBusy(true)
    try {
      const data = { name: name.trim(), sku: sku.trim(), price: parseFloat(price) || 0, category: category.trim() || 'General', imageUrl: imageUrl.trim(), description: description.trim() }
      if (editing && editing.id && !editing.id.startsWith('denim-')) await updateProduct(editing.id, data)
      else await createProduct(data)
      resetForm(); await loadProducts()
    } finally { setBusy(false) }
  }

  const handleDelete = async (id) => { if (!confirm('Delete this product?') || id.startsWith('denim-')) return; setBusy(true); await deleteProduct(id); await loadProducts(); setBusy(false) }

  const filtered = useMemo(() => {
    const list = activeTab === 'future' ? FUTURE_PRODUCTS : products
    if (!search.trim()) return list
    const q = search.toLowerCase()
    return list.filter(p => p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q))
  }, [products, search, activeTab])

  const categories = useMemo(() => [...new Set(filtered.map(p => p.category).filter(Boolean))].sort(), [filtered])

  return (
    <div className="animate-in">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
        <div><p className="section-label mb-4">{isStaff ? 'Product Management' : 'Catalogue'}</p><h1 className="page-title">Products</h1></div>
        {isStaff && <button onClick={() => { resetForm(); setShowForm(true) }} className="btn-primary">Add Product</button>}
      </div>
      <div className="flex gap-8 mb-8 border-b border-orbit-100">
        <button onClick={() => setActiveTab('current')} className={`pb-4 text-xs tracking-widest uppercase transition-colors ${activeTab === 'current' ? 'text-orbit-900 border-b-2 border-orbit-900' : 'text-orbit-400 hover:text-orbit-600'}`}>Current Collection</button>
        <button onClick={() => setActiveTab('future')} className={`pb-4 text-xs tracking-widest uppercase transition-colors ${activeTab === 'future' ? 'text-orbit-900 border-b-2 border-orbit-900' : 'text-orbit-400 hover:text-orbit-600'}`}>Coming Soon</button>
      </div>
      {showForm && isStaff && (
        <div className="mb-12 p-8 border border-orbit-200 bg-orbit-50">
          <p className="section-label mb-6">{editing ? 'Edit Product' : 'New Product'}</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div><label className="section-label mb-2 block">Name *</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-box" /></div>
              <div><label className="section-label mb-2 block">SKU</label><input type="text" value={sku} onChange={(e) => setSku(e.target.value)} className="input-box" /></div>
              <div><label className="section-label mb-2 block">Price ($)</label><input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="input-box" /></div>
              <div><label className="section-label mb-2 block">Category</label><input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="input-box" placeholder="e.g., Premium Denim" /></div>
              <div className="lg:col-span-2"><label className="section-label mb-2 block">Image URL</label><input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="input-box" placeholder="https://..." /></div>
              <div className="lg:col-span-2"><label className="section-label mb-2 block">Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="input-box resize-none" /></div>
            </div>
            {imageUrl && <div className="mt-4"><p className="section-label mb-2">Preview</p><div className="w-32 h-40 bg-orbit-100 overflow-hidden"><img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} /></div></div>}
            <div className="flex gap-4 pt-4"><button type="submit" disabled={busy} className="btn-primary btn-sm">{editing ? 'Save' : 'Add Product'}</button><button type="button" onClick={resetForm} className="btn-ghost">Cancel</button></div>
          </form>
        </div>
      )}
      <div className="mb-8"><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="input-box max-w-md" /></div>
      {loading ? <div className="py-24 text-center"><div className="w-6 h-6 border border-orbit-900 border-t-transparent rounded-full animate-spin mx-auto" /></div> : filtered.length === 0 ? <div className="py-24 text-center border border-dashed border-orbit-200"><p className="text-sm text-orbit-400">No products found</p></div> : (
        <div className="space-y-16">
          {categories.map(category => (
            <div key={category}>
              <h2 className="section-label mb-6">{category}</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filtered.filter(p => p.category === category).map(product => (
                  <div key={product.id} className="group">
                    <Link to={`/products/${product.id}`} className="block">
                      <div className="aspect-product bg-orbit-100 overflow-hidden mb-4 relative">
                        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center"><span className="text-orbit-300">No image</span></div>}
                        {product.isFuture && <div className="absolute top-3 left-3"><span className="badge bg-orbit-900 text-white">Coming {product.launchDate}</span></div>}
                        {product.active === false && <div className="absolute top-3 left-3"><span className="badge bg-red-100 text-red-600">Inactive</span></div>}
                      </div>
                      <p className="text-xs text-orbit-400 mb-1">{product.sku}</p>
                      <h3 className="text-sm font-medium text-orbit-900 group-hover:text-orbit-600 transition-colors">{product.name}</h3>
                      <p className="text-sm text-orbit-500 mt-1">${product.price?.toFixed(2)}</p>
                    </Link>
                    {isStaff && !product.id.startsWith('denim-') && !product.id.startsWith('future-') && <div className="flex gap-3 mt-3"><button onClick={() => openEdit(product)} className="text-xs text-orbit-400 hover:text-orbit-900">Edit</button><button onClick={() => handleDelete(product.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button></div>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
