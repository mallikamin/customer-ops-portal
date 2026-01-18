import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuthUser } from '../../lib/auth'
import { DUMMY_PRODUCTS, FUTURE_PRODUCTS } from '../../lib/db/products'

export default function Products() {
  const { profile } = useAuthUser()
  const isStaff = profile?.role === 'admin' || profile?.role === 'staff'
  
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('current')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const products = activeTab === 'future' ? FUTURE_PRODUCTS : DUMMY_PRODUCTS

  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category))]
    return ['all', ...cats.sort()]
  }, [products])

  const filtered = useMemo(() => {
    let result = products
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      )
    }
    return result
  }, [products, search, selectedCategory])

  return (
    <div className="animate-in">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
        <div>
          <p className="section-label mb-2">{isStaff ? 'Product Management' : 'Catalogue'}</p>
          <h1 className="page-title">Products</h1>
        </div>
        {!isStaff && (
          <Link to="/orders/new" className="btn-primary">Start Order</Link>
        )}
      </div>

      {/* Tabs: Current / Coming Soon */}
      <div className="flex gap-6 mb-6 border-b border-neutral-100">
        <button
          onClick={() => { setActiveTab('current'); setSelectedCategory('all') }}
          className={`pb-3 text-xs tracking-widest uppercase ${
            activeTab === 'current' ? 'text-neutral-900 border-b-2 border-neutral-900' : 'text-neutral-400'
          }`}
        >
          Current Collection ({DUMMY_PRODUCTS.length})
        </button>
        <button
          onClick={() => { setActiveTab('future'); setSelectedCategory('all') }}
          className={`pb-3 text-xs tracking-widest uppercase ${
            activeTab === 'future' ? 'text-neutral-900 border-b-2 border-neutral-900' : 'text-neutral-400'
          }`}
        >
          Coming Soon ({FUTURE_PRODUCTS.length})
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="input-field flex-1 max-w-md"
        />
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 text-2xs tracking-widest uppercase ${
                selectedCategory === cat ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-neutral-200">
          <p className="text-sm text-neutral-400">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(product => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="group"
            >
              {/* Image */}
              <div className="aspect-[3/4] bg-neutral-100 overflow-hidden mb-3 relative">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {product.isFuture && (
                  <div className="absolute top-2 left-2">
                    <span className="badge bg-neutral-900 text-white text-2xs">{product.launchDate}</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <p className="text-2xs text-neutral-400 mb-1">{product.sku}</p>
              <p className="text-sm font-medium group-hover:text-neutral-600 transition-colors">{product.name}</p>
              <p className="text-sm text-neutral-500 mt-1">${product.price.toFixed(2)}</p>
              
              {/* Quick Specs */}
              <div className="mt-2 text-xs text-neutral-400">
                <p>{product.specs.weight} · {product.specs.fit}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}