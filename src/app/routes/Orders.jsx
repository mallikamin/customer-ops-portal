import React, { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthUser } from '../../lib/auth'
import { subscribeToOrders, markOrderViewed } from '../../lib/db/orders'

const STATUS_STYLES = {
  submitted: 'bg-neutral-100 text-neutral-600',
  confirmed: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-amber-50 text-amber-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  closed: 'bg-neutral-100 text-neutral-400',
  cancelled: 'bg-red-50 text-red-600',
}

const STATUSES = ['all', 'submitted', 'confirmed', 'in_progress', 'delivered', 'closed']

export default function Orders() {
  const navigate = useNavigate()
  const { profile } = useAuthUser()
  const isStaff = profile?.role === 'admin' || profile?.role === 'staff'
  
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const customerId = isStaff ? null : profile?.customerId
    const unsub = subscribeToOrders((data) => {
      setOrders(data)
      setLoading(false)
    }, customerId)
    return () => unsub()
  }, [profile, isStaff])

  const filtered = useMemo(() => {
    let result = orders
    if (statusFilter !== 'all') result = result.filter(o => o.status === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(o => 
        o.title?.toLowerCase().includes(q) ||
        o.customerId?.toLowerCase().includes(q)
      )
    }
    return result
  }, [orders, search, statusFilter])

  const handleClick = async (order) => {
    if (isStaff && !order.viewed) {
      await markOrderViewed(order.id)
    }
    navigate(`/orders/${order.id}`)
  }

  const newCount = orders.filter(o => !o.viewed).length

  return (
    <div className="animate-in">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
        <div>
          <p className="section-label mb-2">{isStaff ? 'All Orders' : 'My Orders'}</p>
          <h1 className="page-title">Orders</h1>
          {isStaff && newCount > 0 && (
            <p className="text-sm text-emerald-600 mt-2">{newCount} new order{newCount > 1 ? 's' : ''}</p>
          )}
        </div>
        <Link to="/orders/new" className="btn-primary">New Order</Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search orders..."
          className="input-field flex-1"
        />
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 text-2xs tracking-widest uppercase ${
                statusFilter === s ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
              }`}
            >
              {s === 'all' ? 'All' : s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-neutral-200">
          <p className="text-sm text-neutral-400 mb-4">No orders found</p>
          {!search && statusFilter === 'all' && (
            <Link to="/orders/new" className="btn-secondary btn-sm">Create Order</Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(order => (
            <div
              key={order.id}
              onClick={() => handleClick(order)}
              className={`card p-5 cursor-pointer ${!order.viewed && isStaff ? 'border-l-4 border-l-emerald-500' : ''}`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {!order.viewed && isStaff && (
                    <span className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{order.title}</p>
                    {isStaff && <p className="text-xs text-neutral-400 mt-0.5">{order.customerId}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`badge ${STATUS_STYLES[order.status]}`}>{order.status?.replace(/_/g, ' ')}</span>
                  <span className="text-xs text-neutral-400 hidden sm:block">
                    {order.createdAt?.toDate?.().toLocaleDateString()}
                  </span>
                  <span className="text-neutral-300">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}