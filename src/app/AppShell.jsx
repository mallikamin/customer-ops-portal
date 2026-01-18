import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthUser, signOut } from '../lib/auth'
import { getUnviewedOrdersCount, subscribeToOrders } from '../lib/db/orders'

function NotificationModal({ isOpen, onClose, orders }) {
  if (!isOpen) return null
  const newOrders = orders.filter(o => !o.viewed)
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative bg-white border border-orbit-200 shadow-xl w-full max-w-md mx-4 animate-slide-up">
        <div className="p-6 border-b border-orbit-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-orbit-900">New Orders</h3>
            <button onClick={onClose} className="text-orbit-400 hover:text-orbit-900"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {newOrders.length === 0 ? <div className="p-8 text-center"><p className="text-sm text-orbit-400">No new orders</p></div> : (
            <div className="divide-y divide-orbit-100">
              {newOrders.slice(0, 10).map(order => (
                <NavLink key={order.id} to={`/orders/${order.id}`} onClick={onClose} className="block p-4 hover:bg-orbit-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1"><p className="text-sm font-medium text-orbit-900 truncate">{order.title}</p><p className="text-xs text-orbit-400 mt-0.5">{order.customerId}</p></div>
                    <span className="text-2xs text-orbit-400">New</span>
                  </div>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AppShell() {
  const { user, profile } = useAuthUser()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [orders, setOrders] = useState([])
  const [newOrderCount, setNewOrderCount] = useState(0)
  const role = profile?.role || 'customer'
  const isStaff = role === 'admin' || role === 'staff'

  useEffect(() => {
    if (!isStaff) return
    const unsub = subscribeToOrders((allOrders) => {
      setOrders(allOrders)
      const unviewed = allOrders.filter(o => !o.viewed).length
      setNewOrderCount(unviewed)
      if (unviewed > 0 && orders.length === 0) setNotifOpen(true)
    })
    return () => unsub()
  }, [isStaff])

  const handleSignOut = async () => { await signOut(); navigate('/login') }

  const NavItem = ({ to, children, badge }) => (
    <NavLink to={to} onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `relative flex items-center gap-2 text-xs tracking-widest uppercase transition-colors duration-200 ${isActive ? 'text-orbit-900' : 'text-orbit-400 hover:text-orbit-900'}`}>
      {children}
      {badge > 0 && <span className="inline-flex items-center justify-center w-5 h-5 text-2xs font-medium bg-orbit-900 text-white rounded-full">{badge}</span>}
    </NavLink>
  )

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-orbit-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <NavLink to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orbit-900 rounded-full flex items-center justify-center"><span className="text-white text-sm font-semibold">O</span></div>
              <span className="text-xl font-light tracking-tight">Orbit</span>
            </NavLink>
            <nav className="hidden lg:flex items-center gap-10">
              {isStaff ? (
                <><NavItem to="/orders" badge={newOrderCount}>Orders</NavItem><NavItem to="/products">Products</NavItem><NavItem to="/lookbook">Lookbook</NavItem><NavItem to="/production">Production</NavItem><NavItem to="/customers">Customers</NavItem></>
              ) : (
                <><NavItem to="/dashboard">Dashboard</NavItem><NavItem to="/orders">My Orders</NavItem><NavItem to="/products">Catalogue</NavItem><NavItem to="/lookbook">Lookbook</NavItem></>
              )}
            </nav>
            <div className="flex items-center gap-6">
              {isStaff && (
                <button onClick={() => setNotifOpen(true)} className="relative p-2 text-orbit-400 hover:text-orbit-900 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  {newOrderCount > 0 && <span className="notification-dot" />}
                </button>
              )}
              <div className="hidden sm:block text-right"><p className="text-xs text-orbit-900">{profile?.name || user?.email}</p><p className="text-2xs text-orbit-400 uppercase tracking-wider">{role}</p></div>
              <button onClick={handleSignOut} className="text-xs tracking-widest uppercase text-orbit-400 hover:text-orbit-900 transition-colors">Exit</button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2">
                <div className="w-5 h-4 flex flex-col justify-between">
                  <span className={`h-px bg-orbit-900 transition-all origin-center ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                  <span className={`h-px bg-orbit-900 transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                  <span className={`h-px bg-orbit-900 transition-all origin-center ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
                </div>
              </button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <nav className="lg:hidden border-t border-orbit-100 py-6 px-6 space-y-4 bg-white">
            {isStaff ? (<><NavItem to="/orders" badge={newOrderCount}>Orders</NavItem><NavItem to="/products">Products</NavItem><NavItem to="/lookbook">Lookbook</NavItem><NavItem to="/production">Production</NavItem><NavItem to="/customers">Customers</NavItem></>) : (<><NavItem to="/dashboard">Dashboard</NavItem><NavItem to="/orders">My Orders</NavItem><NavItem to="/products">Catalogue</NavItem><NavItem to="/lookbook">Lookbook</NavItem></>)}
          </nav>
        )}
      </header>
      <NotificationModal isOpen={notifOpen} onClose={() => setNotifOpen(false)} orders={orders} />
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16"><Outlet /></main>
      <footer className="border-t border-orbit-100 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-2xs tracking-widest text-orbit-400 uppercase">Orbit — Premium B2B Platform</p>
          <p className="text-2xs text-orbit-300">© 2025</p>
        </div>
      </footer>
    </div>
  )
}
