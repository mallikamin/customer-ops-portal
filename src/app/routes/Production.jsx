import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { listOrders } from '../../lib/db/orders'

const STATUS_STYLES = { submitted: 'bg-orbit-200', confirmed: 'bg-blue-200', in_progress: 'bg-amber-200', delivered: 'bg-emerald-200', closed: 'bg-orbit-100' }

export default function Production() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [capacity, setCapacity] = useState({ daily: 500, utilized: 0 })
  const [viewMode, setViewMode] = useState('pipeline')

  useEffect(() => {
    listOrders().then(data => {
      setOrders(data)
      setCapacity(c => ({ ...c, utilized: Math.min(data.filter(o => ['confirmed', 'in_progress'].includes(o.status)).length * 50, 500) }))
      setLoading(false)
    })
  }, [])

  const ordersByStatus = useMemo(() => ({
    submitted: orders.filter(o => o.status === 'submitted'),
    confirmed: orders.filter(o => o.status === 'confirmed'),
    in_progress: orders.filter(o => o.status === 'in_progress'),
    delivered: orders.filter(o => o.status === 'delivered'),
  }), [orders])

  const today = new Date()
  const weeks = useMemo(() => {
    const result = []
    const start = new Date(today); start.setDate(start.getDate() - start.getDay())
    for (let w = 0; w < 4; w++) {
      const week = []
      for (let d = 0; d < 7; d++) {
        const date = new Date(start); date.setDate(start.getDate() + w * 7 + d)
        const dayOrders = orders.filter(o => { if (!o.deliveryDate) return false; const delivery = o.deliveryDate?.toDate ? o.deliveryDate.toDate() : new Date(o.deliveryDate); return delivery.toDateString() === date.toDateString() })
        week.push({ date, orders: dayOrders })
      }
      result.push(week)
    }
    return result
  }, [orders])

  const utilizationPercent = Math.min((capacity.utilized / capacity.daily) * 100, 100)

  return (
    <div className="animate-in">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
        <div><p className="section-label mb-4">Planning</p><h1 className="page-title">Production</h1></div>
        <div className="flex gap-2">
          <button onClick={() => setViewMode('pipeline')} className={`px-4 py-2.5 text-2xs tracking-widest uppercase ${viewMode === 'pipeline' ? 'bg-orbit-900 text-white' : 'bg-orbit-100 text-orbit-500'}`}>Pipeline</button>
          <button onClick={() => setViewMode('calendar')} className={`px-4 py-2.5 text-2xs tracking-widest uppercase ${viewMode === 'calendar' ? 'bg-orbit-900 text-white' : 'bg-orbit-100 text-orbit-500'}`}>Calendar</button>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12 pb-12 border-b border-orbit-100">
        {[{ label: 'Pending Review', value: ordersByStatus.submitted.length, color: 'text-orbit-900' }, { label: 'Confirmed', value: ordersByStatus.confirmed.length, color: 'text-blue-600' }, { label: 'In Production', value: ordersByStatus.in_progress.length, color: 'text-amber-600' }, { label: 'Delivered', value: ordersByStatus.delivered.length, color: 'text-emerald-600' }].map((stat, i) => (
          <div key={i}><p className={`text-4xl font-extralight ${stat.color}`}>{stat.value}</p><p className="section-label mt-3">{stat.label}</p></div>
        ))}
      </div>
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4"><p className="section-label">Capacity Utilization</p><p className="text-sm text-orbit-900 font-medium">{Math.round(utilizationPercent)}%</p></div>
        <div className="h-2 bg-orbit-100 overflow-hidden"><div className={`h-full transition-all duration-700 ${utilizationPercent > 80 ? 'bg-red-400' : utilizationPercent > 50 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${utilizationPercent}%` }} /></div>
        <div className="flex justify-between mt-2 text-xs text-orbit-400"><span>0 units</span><span>Daily capacity: {capacity.daily} units</span></div>
      </div>
      {loading ? <div className="py-24 text-center"><div className="w-6 h-6 border border-orbit-900 border-t-transparent rounded-full animate-spin mx-auto" /></div> : viewMode === 'pipeline' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {['submitted', 'confirmed', 'in_progress', 'delivered'].map(status => (
            <div key={status}>
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-orbit-100"><p className="section-label">{status.replace(/_/g, ' ')}</p><span className="text-xs text-orbit-400">{ordersByStatus[status].length}</span></div>
              <div className="space-y-3">
                {ordersByStatus[status].map(order => <Link key={order.id} to={`/orders/${order.id}`} className="block card-elite p-4"><p className="text-sm font-medium text-orbit-900 truncate">{order.title}</p><p className="text-xs text-orbit-400 mt-1">{order.customerId}</p></Link>)}
                {ordersByStatus[status].length === 0 && <div className="border border-dashed border-orbit-200 p-4 text-center"><p className="text-xs text-orbit-400">No orders</p></div>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-px bg-orbit-200 border border-orbit-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="bg-orbit-50 p-3 text-center"><p className="section-label">{day}</p></div>)}
          {weeks.map((week, wi) => week.map((day, di) => {
            const isToday = day.date.toDateString() === today.toDateString()
            const isPast = day.date < today && !isToday
            return (
              <div key={`${wi}-${di}`} className={`bg-white p-3 min-h-[100px] ${isPast ? 'opacity-50' : ''}`}>
                <p className={`text-xs mb-2 ${isToday ? 'text-orbit-900 font-medium' : 'text-orbit-400'}`}>{day.date.getDate()}</p>
                <div className="space-y-1">
                  {day.orders.slice(0, 3).map(order => <Link key={order.id} to={`/orders/${order.id}`} className={`block p-1.5 text-2xs truncate ${STATUS_STYLES[order.status]}`}>{order.title}</Link>)}
                  {day.orders.length > 3 && <p className="text-2xs text-orbit-400">+{day.orders.length - 3} more</p>}
                </div>
              </div>
            )
          }))}
        </div>
      )}
    </div>
  )
}
