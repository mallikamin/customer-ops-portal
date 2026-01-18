import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthUser } from '../../lib/auth'
import { createOrder } from '../../lib/db/orders'
import { listCustomers } from '../../lib/db/customers'
import { DUMMY_PRODUCTS } from '../../lib/db/products'

export default function OrderCreate() {
  const navigate = useNavigate()
  const { user, profile } = useAuthUser()
  const isStaff = profile?.role === 'admin' || profile?.role === 'staff'

  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [customerId, setCustomerId] = useState(profile?.customerId || '')
  const [selectedProducts, setSelectedProducts] = useState({}) // { productId: quantity }
  const [productSearch, setProductSearch] = useState('')

  const [customers, setCustomers] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1 = select products, 2 = order details

  useEffect(() => {
    if (isStaff) {
      listCustomers().then(setCustomers)
    }
  }, [isStaff])

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return DUMMY_PRODUCTS
    const q = productSearch.toLowerCase()
    return DUMMY_PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    )
  }, [productSearch])

  const handleQuantityChange = (productId, qty) => {
    const quantity = parseInt(qty) || 0
    setSelectedProducts(prev => {
      if (quantity <= 0) {
        const { [productId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [productId]: quantity }
    })
  }

  const selectedCount = Object.keys(selectedProducts).length
  const totalValue = Object.entries(selectedProducts).reduce((sum, [id, qty]) => {
    const product = DUMMY_PRODUCTS.find(p => p.id === id)
    return sum + (product?.price || 0) * qty
  }, 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (selectedCount === 0) {
      setError('Please select at least one product')
      return
    }
    if (!title.trim()) {
      setError('Please enter an order title')
      return
    }
    const finalCustomerId = isStaff ? customerId : profile?.customerId
    if (!finalCustomerId) {
      setError('Please select a customer')
      return
    }

    setBusy(true)
    try {
      const products = Object.entries(selectedProducts).map(([productId, quantity]) => ({
        productId,
        quantity,
      }))
      
      const orderId = await createOrder({
        customerId: finalCustomerId,
        title: title.trim(),
        summary: summary.trim(),
        products,
        totalValue,
        createdByUid: user.uid,
        createdByName: profile?.name,
      })
      navigate(`/orders/${orderId}`)
    } catch (err) {
      setError('Failed to create order')
      console.error(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="animate-in">
      <button onClick={() => navigate('/orders')} className="text-xs text-neutral-400 hover:text-neutral-900 mb-6">← Back</button>

      <div className="mb-8">
        <p className="section-label mb-2">New Order</p>
        <h1 className="page-title">Create Order</h1>
      </div>

      {/* Progress Steps */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setStep(1)}
          className={`flex items-center gap-2 text-xs tracking-widest uppercase ${step === 1 ? 'text-neutral-900' : 'text-neutral-400'}`}
        >
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 1 ? 'bg-neutral-900 text-white' : 'bg-neutral-200'}`}>1</span>
          Select Products
        </button>
        <span className="text-neutral-300">→</span>
        <button
          onClick={() => selectedCount > 0 && setStep(2)}
          className={`flex items-center gap-2 text-xs tracking-widest uppercase ${step === 2 ? 'text-neutral-900' : 'text-neutral-400'}`}
        >
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 2 ? 'bg-neutral-900 text-white' : 'bg-neutral-200'}`}>2</span>
          Order Details
        </button>
      </div>

      {/* Step 1: Select Products */}
      {step === 1 && (
        <div>
          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search products by name, SKU, or category..."
              className="input-field max-w-md"
            />
          </div>

          {/* Selected Summary */}
          {selectedCount > 0 && (
            <div className="mb-6 p-4 bg-neutral-50 border border-neutral-200 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{selectedCount} product{selectedCount > 1 ? 's' : ''} selected</p>
                <p className="text-xs text-neutral-500">Total: ${totalValue.toFixed(2)}</p>
              </div>
              <button onClick={() => setStep(2)} className="btn-primary btn-sm">Continue →</button>
            </div>
          )}

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => {
              const qty = selectedProducts[product.id] || 0
              const isSelected = qty > 0
              return (
                <div
                  key={product.id}
                  className={`card p-4 ${isSelected ? 'ring-2 ring-neutral-900' : ''}`}
                >
                  {/* Image */}
                  <div className="aspect-[3/4] bg-neutral-100 overflow-hidden mb-3">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <p className="text-2xs text-neutral-400 mb-1">{product.sku}</p>
                  <p className="text-sm font-medium mb-1">{product.name}</p>
                  <p className="text-sm text-neutral-600 mb-2">${product.price.toFixed(2)}</p>

                  {/* Specs Preview */}
                  <div className="text-xs text-neutral-500 space-y-0.5 mb-3">
                    <p>Weight: {product.specs.weight}</p>
                    <p>Fit: {product.specs.fit}</p>
                    <p>Material: {product.specs.material}</p>
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(product.id, qty - 1)}
                      disabled={qty === 0}
                      className="w-8 h-8 border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 disabled:opacity-30"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={qty}
                      onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                      className="w-16 h-8 text-center border border-neutral-200 text-sm"
                    />
                    <button
                      onClick={() => handleQuantityChange(product.id, qty + 1)}
                      className="w-8 h-8 border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-100"
                    >
                      +
                    </button>
                  </div>

                  {isSelected && (
                    <p className="text-xs text-emerald-600 mt-2">
                      Subtotal: ${(product.price * qty).toFixed(2)}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Step 2: Order Details */}
      {step === 2 && (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Form */}
            <div className="space-y-6">
              <div>
                <label className="section-label mb-2 block">Order Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Spring 2025 Restock"
                  className="input-field"
                  disabled={busy}
                />
              </div>

              <div>
                <label className="section-label mb-2 block">Notes</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Special instructions, delivery notes..."
                  rows={3}
                  className="input-field resize-none"
                  disabled={busy}
                />
              </div>

              {isStaff && (
                <div>
                  <label className="section-label mb-2 block">Customer *</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="input-field"
                    disabled={busy}
                  >
                    <option value="">Select customer...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}

              {!isStaff && profile?.customerId && (
                <div className="p-4 bg-neutral-50">
                  <p className="text-xs text-neutral-500">Ordering as: <span className="font-medium text-neutral-900">{profile.customerId}</span></p>
                </div>
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary btn-sm">← Back</button>
                <button type="submit" disabled={busy} className="btn-primary">
                  {busy ? 'Submitting...' : 'Submit Order'}
                </button>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div>
              <div className="p-6 bg-neutral-50 border border-neutral-100">
                <p className="section-label mb-4">Order Summary</p>
                <div className="space-y-3 mb-6">
                  {Object.entries(selectedProducts).map(([productId, qty]) => {
                    const product = DUMMY_PRODUCTS.find(p => p.id === productId)
                    if (!product) return null
                    return (
                      <div key={productId} className="flex gap-3">
                        <div className="w-12 h-14 bg-neutral-200 overflow-hidden flex-shrink-0">
                          <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{product.name}</p>
                          <p className="text-xs text-neutral-500">Qty: {qty} × ${product.price.toFixed(2)}</p>
                        </div>
                        <p className="text-sm font-medium">${(product.price * qty).toFixed(2)}</p>
                      </div>
                    )
                  })}
                </div>
                <div className="pt-4 border-t border-neutral-200">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-500">Products</span>
                    <span>{selectedCount}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-500">Total Units</span>
                    <span>{Object.values(selectedProducts).reduce((a, b) => a + b, 0)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-medium mt-3 pt-3 border-t border-neutral-200">
                    <span>Total</span>
                    <span>${totalValue.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}