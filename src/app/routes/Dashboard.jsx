import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthUser } from '../../lib/auth'
import { listOrders } from '../../lib/db/orders'
import { DUMMY_LOOKBOOK } from '../../lib/db/lookbook'

const STATUS_STYLES = {
  submitted: 'bg-neutral-100 text-neutral-600',
  confirmed: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-amber-50 text-amber-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  closed: 'bg-neutral-100 text-neutral-400',
}

// No Account Linked Screen
function NoAccountLinked() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center animate-in">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg className="w-10 h-10 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 className="text-2xl font-light mb-4">No Customer Account Linked</h1>
        <p className="text-sm text-neutral-500 leading-relaxed mb-8">
          Your user account is not linked to a customer profile yet. Please contact support to complete your account setup and start placing orders.
        </p>
        <div className="p-6 bg-neutral-50 border border-neutral-100 mb-8">
          <p className="section-label mb-3">Contact Support</p>
          <p className="text-sm font-medium">support@orbit-denim.com</p>
          <p className="text-sm text-neutral-500 mt-1">+1 (555) 123-4567</p>
        </div>
        <p className="text-xs text-neutral-400 mb-4">You can still browse our catalogue and updates:</p>
        <div className="flex gap-3 justify-center">
          <Link to="/products" className="btn-secondary btn-sm">View Catalogue</Link>
          <Link to="/lookbook" className="btn-ghost">Browse Updates</Link>
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

  // Show No Account screen if customer has no customerId
  if (!loading && !hasCustomerAccount) {
    return <NoAccountLinked />
  }

  const recentOrders = orders.slice(0, 5)
  const activeOrders = orders.filter(o => !['closed', 'cancelled'].includes(o.status))
  const latestPost = DUMMY_LOOKBOOK[0]

  return (
    <div className="animate-in">
      <div className="mb-12">
        <p className="section-label mb-3">Dashboard</p>
        <h1 className="page-title">Welcome back, {profile?.name?.split(' ')[0] || 'there'}</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Orders', value: orders.length },
          { label: 'Active', value: activeOrders.length },
          { label: 'In Progress', value: orders.filter(o => o.status === 'in_progress').length },
          { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length },
        ].map((stat, i) => (
          <div key={i} className="p-6 border border-neutral-100">
            <p className="text-3xl font-extralight">{stat.value}</p>
            <p className="section-label mt-2">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <p className="section-label">Recent Orders</p>
            <Link to="/orders" className="text-xs text-neutral-500 hover:text-neutral-900">View all →</Link>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-neutral-200">
              <p className="text-sm text-neutral-400 mb-4">No orders yet</p>
              <Link to="/orders/new" className="btn-primary btn-sm">Place First Order</Link>
            </div>
          ) : (
            <div className="border border-neutral-100 divide-y divide-neutral-100">
              {recentOrders.map(order => (
                <Link key={order.id} to={`/orders/${order.id}`} className="block p-4 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{order.title}</p>
                      <p className="text-xs text-neutral-400 mt-1">{order.createdAt?.toDate?.().toLocaleDateString()}</p>
                    </div>
                    <span className={`badge ${STATUS_STYLES[order.status] || STATUS_STYLES.submitted}`}>
                      {order.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-4">
            <Link to="/orders/new" className="btn-secondary btn-sm">New Order</Link>
          </div>
        </div>

        {/* Latest Update */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="section-label">Latest Update</p>
            <Link to="/lookbook" className="text-xs text-neutral-500 hover:text-neutral-900">View all →</Link>
          </div>
          {latestPost && (
            <Link to={`/lookbook/${latestPost.id}`} className="block group">
              <div className="aspect-video bg-neutral-100 overflow-hidden mb-3">
                <img src={latestPost.imageUrl} alt={latestPost.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <p className="text-2xs text-neutral-400 uppercase tracking-wider mb-1">{latestPost.type}</p>
              <p className="text-sm font-medium group-hover:text-neutral-600 transition-colors">{latestPost.title}</p>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}