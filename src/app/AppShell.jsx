import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthUser, signOut } from '../lib/auth'
import { subscribeToOrders, subscribeToNotifications, markNotificationRead, markAllNotificationsRead, exportNotificationsToCSV } from '../lib/db/orders'

// Notification Panel
function NotificationPanel({ isOpen, onClose, notifications, onExport }) {
  if (!isOpen) return null
  
  const unread = notifications.filter(n => !n.read)
  
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="absolute right-4 top-20 w-96 max-w-[calc(100vw-2rem)] bg-white border border-neutral-200 shadow-xl animate-in">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Notifications</h3>
            <p className="text-xs text-neutral-400">{unread.length} unread</p>
          </div>
          <div className="flex gap-2">
            <button onClick={onExport} className="text-xs text-neutral-500 hover:text-neutral-900">
              Export CSV
            </button>
            <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-neutral-400">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {notifications.slice(0, 20).map(notif => {
                const date = notif.createdAt?.toDate ? notif.createdAt.toDate() : new Date()
                return (
                  <div
                    key={notif.id}
                    className={`p-4 hover:bg-neutral-50 transition-colors ${!notif.read ? 'bg-blue-50/50' : ''}`}
                    onClick={() => !notif.read && markNotificationRead(notif.id)}
                  >
                    <div className="flex items-start gap-3">
                      {!notif.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-neutral-900">{notif.message}</p>
                        <p className="text-xs text-neutral-400 mt-1">
                          {date.toLocaleDateString()} · {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        {notifications.length > 0 && unread.length > 0 && (
          <div className="p-3 border-t border-neutral-100">
            <button
              onClick={() => markAllNotificationsRead()}
              className="text-xs text-neutral-500 hover:text-neutral-900 w-full text-center"
            >
              Mark all as read
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// New Orders Popup (shown on login)
function NewOrdersPopup({ orders, onClose }) {
  const newOrders = orders.filter(o => !o.viewed)
  if (newOrders.length === 0) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg shadow-2xl animate-in">
        <div className="p-6 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-medium">New Orders Received</h2>
              <p className="text-sm text-neutral-500">{newOrders.length} new order{newOrders.length > 1 ? 's' : ''} since last visit</p>
            </div>
          </div>
        </div>
        <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100">
          {newOrders.slice(0, 5).map(order => (
            <NavLink
              key={order.id}
              to={`/orders/${order.id}`}
              onClick={onClose}
              className="block p-4 hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-neutral-900 truncate">{order.title}</p>
                  <p className="text-xs text-neutral-500">{order.customerId}</p>
                </div>
                <span className="text-xs text-neutral-400">
                  {order.createdAt?.toDate?.().toLocaleDateString()}
                </span>
              </div>
            </NavLink>
          ))}
        </div>
        <div className="p-4 border-t border-neutral-100 flex justify-between">
          <NavLink to="/orders" onClick={onClose} className="text-sm text-neutral-600 hover:text-neutral-900">
            View all orders →
          </NavLink>
          <button onClick={onClose} className="btn-primary btn-sm">
            Got it
          </button>
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
  const [showNewOrdersPopup, setShowNewOrdersPopup] = useState(false)
  const [orders, setOrders] = useState([])
  const [notifications, setNotifications] = useState([])
  const [initialLoad, setInitialLoad] = useState(true)
  
  const role = profile?.role || 'customer'
  const isStaff = role === 'admin' || role === 'staff'
  const unreadNotifs = notifications.filter(n => !n.read).length
  const unviewedOrders = orders.filter(o => !o.viewed).length

  // Subscribe to orders (staff only)
  useEffect(() => {
    if (!isStaff) return
    const unsub = subscribeToOrders((data) => {
      setOrders(data)
      // Show popup on initial load if there are new orders
      if (initialLoad && data.some(o => !o.viewed)) {
        setShowNewOrdersPopup(true)
        setInitialLoad(false)
      }
    })
    return () => unsub()
  }, [isStaff, initialLoad])

  // Subscribe to notifications (staff only)
  useEffect(() => {
    if (!isStaff) return
    const unsub = subscribeToNotifications(setNotifications)
    return () => unsub()
  }, [isStaff])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleExportNotifications = () => {
    exportNotificationsToCSV(notifications)
  }

  const NavItem = ({ to, children, badge }) => (
    <NavLink
      to={to}
      onClick={() => setMobileMenuOpen(false)}
      className={({ isActive }) =>
        `relative flex items-center gap-2 text-xs tracking-widest uppercase transition-colors ${
          isActive ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-900'
        }`
      }
    >
      {children}
      {badge > 0 && (
        <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-2xs font-medium bg-red-500 text-white rounded-full">
          {badge}
        </span>
      )}
    </NavLink>
  )

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">O</span>
              </div>
              <span className="text-xl font-light tracking-tight">Orbit</span>
            </NavLink>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-10">
              {isStaff ? (
                <>
                  <NavItem to="/orders" badge={unviewedOrders}>Orders</NavItem>
                  <NavItem to="/products">Products</NavItem>
                  <NavItem to="/lookbook">Lookbook</NavItem>
                  <NavItem to="/production">Production</NavItem>
                  <NavItem to="/customers">Customers</NavItem>
                </>
              ) : (
                <>
                  <NavItem to="/dashboard">Dashboard</NavItem>
                  <NavItem to="/orders">My Orders</NavItem>
                  <NavItem to="/products">Catalogue</NavItem>
                  <NavItem to="/lookbook">Updates</NavItem>
                </>
              )}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Notification Bell (Staff) */}
              {isStaff && (
                <button
                  onClick={() => setNotifOpen(true)}
                  className="relative p-2 text-neutral-400 hover:text-neutral-900 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadNotifs > 0 && <span className="notification-dot" />}
                </button>
              )}

              {/* User */}
              <div className="hidden sm:block text-right">
                <p className="text-xs text-neutral-900">{profile?.name || user?.email}</p>
                <p className="text-2xs text-neutral-400 uppercase tracking-wider">{role}</p>
              </div>
              
              <button onClick={handleSignOut} className="text-xs tracking-widest uppercase text-neutral-400 hover:text-neutral-900 transition-colors">
                Exit
              </button>

              {/* Mobile menu */}
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2">
                <div className="w-5 h-4 flex flex-col justify-between">
                  <span className={`h-px bg-neutral-900 transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                  <span className={`h-px bg-neutral-900 transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                  <span className={`h-px bg-neutral-900 transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="lg:hidden border-t border-neutral-100 py-4 px-6 space-y-3 bg-white">
            {isStaff ? (
              <>
                <NavItem to="/orders" badge={unviewedOrders}>Orders</NavItem>
                <NavItem to="/products">Products</NavItem>
                <NavItem to="/lookbook">Lookbook</NavItem>
                <NavItem to="/production">Production</NavItem>
                <NavItem to="/customers">Customers</NavItem>
              </>
            ) : (
              <>
                <NavItem to="/dashboard">Dashboard</NavItem>
                <NavItem to="/orders">My Orders</NavItem>
                <NavItem to="/products">Catalogue</NavItem>
                <NavItem to="/lookbook">Updates</NavItem>
              </>
            )}
          </nav>
        )}
      </header>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notifications}
        onExport={handleExportNotifications}
      />

      {/* New Orders Popup */}
      {showNewOrdersPopup && isStaff && (
        <NewOrdersPopup orders={orders} onClose={() => setShowNewOrdersPopup(false)} />
      )}

      {/* Main */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-8 py-12">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-100 py-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          <p className="text-2xs tracking-widest text-neutral-400 uppercase">Orbit B2B Platform</p>
          <p className="text-2xs text-neutral-300">© 2026</p>
        </div>
      </footer>
    </div>
  )
}