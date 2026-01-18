import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthUser } from '../../lib/auth'
import { listOrders } from '../../lib/db/orders'
import { DUMMY_LOOKBOOK } from '../../lib/db/lookbook'

const STATUS_STYLES = {
  submitted: 'bg-orbit-100 text-orbit-600',
  confirmed: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-amber-50 text-amber-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  closed: 'bg-orbit-100 text-orbit-400',
  cancelled: 'bg-red-50 text-red-600',
}

function NoAccountLinked() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto animate-in">
        <div className="w-20 h-20 bg-orbit-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg className="w-10 h-10 text-orbit-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 className="text-2xl font-light text-orbit-900 mb-4">No Customer Account Linked</h1>
        <p className="text-sm text-orbit-500 leading-relaxed mb-8">Your user account is not linked to a customer profile. Please contact support to set up your account and start placing orders.</p>
        <div className="p-6 bg-orbit-50 border border-orbit-100">
          <p className="section-label mb-3">Contact Support</p>
          <p className="text-sm text-orbit-700">support@orbit-denim.com</p>
          <p className="text-sm text-orbit-500 mt-1">+1 (555) 123-4567</p>
        </div>
        <div className="mt-8">
          <Link to="/lookbook" className="btn-secondary">Browse Lookbook</Link>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { profile } = useAuthUser()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const hasCustomerAccount = profile?.customerId

  useEffect(() => {
    if (hasCustomerAccount) {
      listOrders(profile.customerId).then(setOrders).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [profile?.customerId, hasCustomerAccount])

  if (!loading && !hasCustomerAccount) return <NoAccountLinked />

  const recentOrders = orders.slice(0, 5)
  const activeOrders = orders.filter(o => !['closed', 'cancelled'].includes(o.status))
  const latestPost = DUMMY_LOOKBOOK[0]

  return (
    <div className="animate-in">
      <div className="mb-16">
        <p className="section-label mb-4">Dashboard</p>
        <h1 className="page-title">Welcome back, {profile?.name?.split(' ')[0] || 'there'}</h1>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {[
          { label: 'Total Orders', value: orders.length },
          { label: 'Active', value: activeOrders.length },
          { label: 'In Progress', value: orders.filter(o => o.status === 'in_progress').length },
          { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length },
        ].map((stat, i) => (
          <div key={i} className="pb-6 border-b border-orbit-100">
            <p className="text-4xl font-extralight text-orbit-900">{stat.value}</p>
            <p className="section-label mt-3">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <p className="section-label">Recent Orders</p>
            <Link to="/orders" className="text-xs text-orbit-500 hover:text-orbit-900 transition-colors">View all →</Link>
          </div>
          {loading ? (
            <div className="py-16 text-center"><div className="w-6 h-6 border border-orbit-900 border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : recentOrders.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-orbit-200">
              <p className="text-sm text-orbit-400 mb-6">No orders yet</p>
              <Link to="/orders/new" className="btn-primary">Place First Order</Link>
            </div>
          ) : (
            <div className="border border-orbit-100 divide-y divide-orbit-100">
              {recentOrders.map(order => (
                <Link key={order.id} to={`/orders/${order.id}`} className="block p-5 hover:bg-orbit-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-orbit-900 truncate">{order.title}</h3>
                      {order.summary && <p className="text-xs text-orbit-500 mt-1 line-clamp-1">{order.summary}</p>}
                    </div>
                    <span className={`badge ${STATUS_STYLES[order.status]}`}>{order.status?.replace(/_/g, ' ')}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="mt-6"><Link to="/orders/new" className="btn-secondary">New Order</Link></div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-6">
            <p className="section-label">Latest Updates</p>
            <Link to="/lookbook" className="text-xs text-orbit-500 hover:text-orbit-900 transition-colors">View all →</Link>
          </div>
          {latestPost && (
            <Link to={`/lookbook/${latestPost.id}`} className="block group">
              <div className="aspect-video overflow-hidden bg-orbit-100 mb-4">
                <img src={latestPost.imageUrl} alt={latestPost.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <p className="text-2xs text-orbit-400 uppercase tracking-wider mb-2">{latestPost.type}</p>
              <h3 className="text-sm font-medium text-orbit-900 group-hover:text-orbit-600 transition-colors">{latestPost.title}</h3>
              <p className="text-xs text-orbit-500 mt-1">{latestPost.date}</p>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
