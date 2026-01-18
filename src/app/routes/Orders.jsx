import React, { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthUser } from '../../lib/auth'
import { subscribeToOrders, markOrderViewed } from '../../lib/db/orders'

const STATUS_STYLES = {
  submitted: 'bg-orbit-100 text-orbit-600',
  confirmed: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-amber-50 text-amber-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  closed: 'bg-orbit-100 text-orbit-400',
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
    const unsub = subscribeToOrders((data) => { setOrders(data); setLoading(false) }, customerId)
    return () => unsub()
  }, [profile, isStaff])

  const filtered = useMemo(() => {
    let result = orders
    if (statusFilter !== 'all') result = result.filter(o => o.status === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(o => o.title?.toLowerCase().includes(q) || o.customerId?.toLowerCase().includes(q) || o.summary?.toLowerCase().includes(q))
    }
    return result
  }, [orders, search, statusFilter])

  const handleOrderClick = async (order) => {
    if (isStaff && !order.viewed) await markOrderViewed(order.id)
    navigate(`/orders/${order.id}`)
  }

  const newOrdersCount = orders.filter(o => !o.viewed).length

  return (
    <div className="animate-in">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
        <div>
          <p className="section-label mb-4">{isStaff ? 'All Orders' : 'My Orders'}</p>
          <h1 className="page-title">Orders</h1>
          {isStaff && newOrdersCount > 0 && <p className="text-sm text-emerald-600 mt-2">{newOrdersCount} new order{newOrdersCount > 1 ? 's' : ''} pending review</p>}
        </div>
        <Link to="/orders/new" className="btn-primary">New Order</Link>
      </div>
      <div className="flex flex-col lg:flex-row gap-6 mb-8 pb-8 border-b border-orbit-100">
        <div className="flex-1"><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders..." className="input-box" /></div>
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(status => (
            <button key={status} onClick={() => setStatusFilter(status)} className={`px-4 py-2.5 text-2xs tracking-widest uppercase whitespace-nowrap transition-all ${statusFilter === status ? 'bg-orbit-900 text-white' : 'bg-orbit-50 text-orbit-500 hover:bg-orbit-100'}`}>
              {status === 'all' ? 'All' : status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="py-24 text-center"><div className="w-6 h-6 border border-orbit-900 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-orbit-200">
          <p className="text-sm text-orbit-400 mb-6">{search || statusFilter !== 'all' ? 'No orders match your filters' : 'No orders yet'}</p>
          {!search && statusFilter === 'all' && <Link to="/orders/new" className="btn-secondary">Create First Order</Link>}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <div key={order.id} onClick={() => handleOrderClick(order)} className={`card-elite p-6 cursor-pointer ${!order.viewed && isStaff ? 'border-l-4 border-l-emerald-500' : ''}`}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  {!order.viewed && isStaff && <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />}
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-orbit-900">{order.title}</h3>
                    {order.summary && <p className="text-xs text-orbit-400 mt-1 line-clamp-1">{order.summary}</p>}
                    {isStaff && <p className="text-xs text-orbit-500 mt-2">Customer: {order.customerId || '—'}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-4 lg:gap-6">
                  <span className={`badge ${STATUS_STYLES[order.status]}`}>{order.status?.replace(/_/g, ' ')}</span>
                  <span className="text-xs text-orbit-400 whitespace-nowrap">{order.createdAt?.toDate?.()?.toLocaleDateString() || '—'}</span>
                  <span className="text-xs text-orbit-400">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
