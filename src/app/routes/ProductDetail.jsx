import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { DUMMY_PRODUCTS, FUTURE_PRODUCTS } from '../../lib/db/products'

export default function ProductDetail() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const product = [...DUMMY_PRODUCTS, ...FUTURE_PRODUCTS].find(p => p.id === productId)

  if (!product) return <div className="py-24 text-center animate-in"><p className="text-sm text-orbit-500 mb-6">Product not found</p><button onClick={() => navigate('/products')} className="btn-secondary">Back to Products</button></div>

  return (
    <div className="animate-in">
      <button onClick={() => navigate('/products')} className="text-xs text-orbit-400 hover:text-orbit-900 mb-8 transition-colors">← Back to products</button>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        <div className="space-y-4">
          <div className="aspect-product bg-orbit-100 overflow-hidden">
            {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><span className="text-orbit-300">No image</span></div>}
          </div>
        </div>
        <div>
          <p className="section-label mb-4">{product.category}</p>
          <h1 className="text-3xl font-extralight tracking-tight mb-2">{product.name}</h1>
          <p className="text-xs text-orbit-400 mb-6">{product.sku}</p>
          <p className="text-2xl font-light mb-8">${product.price?.toFixed(2)}</p>
          {product.isFuture && <div className="mb-8 p-4 bg-orbit-900 text-white"><p className="text-xs tracking-widest uppercase mb-1">Coming Soon</p><p className="text-sm">{product.launchDate}</p></div>}
          <p className="text-sm text-orbit-600 leading-relaxed mb-8">{product.description}</p>
          {product.specs && (
            <div className="mb-8">
              <p className="section-label mb-4">Specifications</p>
              <div className="border border-orbit-100 divide-y divide-orbit-100">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-3 px-4"><span className="text-xs text-orbit-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span><span className="text-xs text-orbit-900">{value}</span></div>
                ))}
              </div>
            </div>
          )}
          {!product.isFuture && <Link to="/orders/new" className="btn-primary">Add to Order</Link>}
        </div>
      </div>
    </div>
  )
}
