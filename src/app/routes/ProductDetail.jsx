import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { DUMMY_PRODUCTS, FUTURE_PRODUCTS } from '../../lib/db/products'

export default function ProductDetail() {
  const { productId } = useParams()
  const navigate = useNavigate()

  const product = [...DUMMY_PRODUCTS, ...FUTURE_PRODUCTS].find(p => p.id === productId)

  if (!product) {
    return (
      <div className="py-16 text-center animate-in">
        <p className="text-sm text-neutral-500 mb-4">Product not found</p>
        <button onClick={() => navigate('/products')} className="btn-secondary btn-sm">Back to Products</button>
      </div>
    )
  }

  return (
    <div className="animate-in">
      <button onClick={() => navigate('/products')} className="text-xs text-neutral-400 hover:text-neutral-900 mb-6">← Back to products</button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div>
          <div className="aspect-[3/4] bg-neutral-100 overflow-hidden">
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Details */}
        <div>
          <p className="section-label mb-2">{product.category}</p>
          <h1 className="text-3xl font-light mb-1">{product.name}</h1>
          <p className="text-xs text-neutral-400 mb-6">{product.sku}</p>

          <p className="text-2xl font-light mb-6">${product.price.toFixed(2)}</p>

          {product.isFuture && (
            <div className="mb-6 p-4 bg-neutral-900 text-white">
              <p className="text-xs tracking-widest uppercase mb-1">Coming Soon</p>
              <p className="text-sm">{product.launchDate}</p>
            </div>
          )}

          <p className="text-sm text-neutral-600 leading-relaxed mb-8">{product.description}</p>

          {/* Specifications */}
          <div className="mb-8">
            <p className="section-label mb-3">Specifications</p>
            <div className="border border-neutral-100 divide-y divide-neutral-100">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="flex justify-between py-3 px-4">
                  <span className="text-xs text-neutral-500 capitalize">{key}</span>
                  <span className="text-xs text-neutral-900">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {!product.isFuture && (
            <Link to="/orders/new" className="btn-primary">Add to Order</Link>
          )}
        </div>
      </div>
    </div>
  )
}