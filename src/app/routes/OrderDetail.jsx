import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuthUser } from '../../lib/auth'
import { getOrder, updateOrder, addOrderUpdate, listOrderUpdates, markOrderViewed } from '../../lib/db/orders'
import { listTasks, createTask, updateTask } from '../../lib/db/tasks'
import { listComments, addComment } from '../../lib/db/comments'
import { listStaffUsers } from '../../lib/db/users'
import { DUMMY_PRODUCTS } from '../../lib/db/products'

const STATUSES = ['submitted', 'confirmed', 'in_progress', 'delivered', 'closed', 'cancelled']
const TASK_STATUSES = ['todo', 'doing', 'blocked', 'done']

const STATUS_STYLES = {
  submitted: 'bg-neutral-100 text-neutral-600',
  confirmed: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-amber-50 text-amber-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  closed: 'bg-neutral-100 text-neutral-400',
  cancelled: 'bg-red-50 text-red-600',
  todo: 'bg-neutral-100 text-neutral-600',
  doing: 'bg-blue-50 text-blue-700',
  blocked: 'bg-red-50 text-red-600',
  done: 'bg-emerald-50 text-emerald-700',
}

export default function OrderDetail() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuthUser()
  const isStaff = profile?.role === 'admin' || profile?.role === 'staff'

  const [order, setOrder] = useState(null)
  const [tasks, setTasks] = useState([])
  const [comments, setComments] = useState([])
  const [updates, setUpdates] = useState([])
  const [staffUsers, setStaffUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('products')

  const [newTask, setNewTask] = useState('')
  const [newComment, setNewComment] = useState('')
  const [busy, setBusy] = useState(false)

  const refresh = async () => {
    const [o, t, c, u, staff] = await Promise.all([
      getOrder(orderId),
      listTasks(orderId),
      listComments(orderId),
      listOrderUpdates(orderId),
      isStaff ? listStaffUsers() : Promise.resolve([])
    ])
    setOrder(o)
    setTasks(t)
    setComments(c)
    setUpdates(u)
    setStaffUsers(staff)
    setLoading(false)
    if (isStaff && o && !o.viewed) markOrderViewed(orderId)
  }

  useEffect(() => { refresh() }, [orderId])

  // Get ordered products
  const orderedProducts = useMemo(() => {
    if (!order?.products) return []
    return order.products.map(p => {
      const product = DUMMY_PRODUCTS.find(dp => dp.id === p.productId)
      return { ...p, ...product }
    })
  }, [order?.products])

  const handleStatusChange = async (newStatus) => {
    if (!isStaff || newStatus === order.status) return
    setBusy(true)
    await updateOrder(orderId, { status: newStatus })
    await addOrderUpdate(orderId, {
      type: 'status_change',
      message: `Status changed to ${newStatus.replace(/_/g, ' ')}`,
      createdByUid: user.uid,
      createdByName: profile?.name
    })
    await refresh()
    setBusy(false)
  }

  const handleAddTask = async () => {
    if (!newTask.trim()) return
    setBusy(true)
    await createTask(orderId, { title: newTask.trim(), createdByUid: user.uid })
    setNewTask('')
    await refresh()
    setBusy(false)
  }

  const handleTaskStatus = async (taskId, status) => {
    setBusy(true)
    await updateTask(orderId, taskId, { status })
    await refresh()
    setBusy(false)
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    setBusy(true)
    await addComment(orderId, {
      message: newComment.trim(),
      createdByUid: user.uid,
      createdByName: profile?.name
    })
    setNewComment('')
    await refresh()
    setBusy(false)
  }

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-neutral-500 mb-4">Order not found</p>
        <button onClick={() => navigate('/orders')} className="btn-secondary btn-sm">Back to Orders</button>
      </div>
    )
  }

  const totalValue = orderedProducts.reduce((sum, p) => sum + (p.price || 0) * (p.quantity || 0), 0)

  return (
    <div className="animate-in">
      <button onClick={() => navigate('/orders')} className="text-xs text-neutral-400 hover:text-neutral-900 mb-6">← Back to orders</button>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-8 pb-8 border-b border-neutral-100">
        <div>
          <p className="section-label mb-2">Order</p>
          <h1 className="text-2xl font-light mb-2">{order.title}</h1>
          {order.summary && <p className="text-sm text-neutral-500 max-w-lg">{order.summary}</p>}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <span className={`badge ${STATUS_STYLES[order.status]}`}>{order.status?.replace(/_/g, ' ')}</span>
            <span className="text-xs text-neutral-400">Customer: {order.customerId}</span>
            <span className="text-xs text-neutral-400">Total: ${totalValue.toFixed(2)}</span>
          </div>
        </div>
        {isStaff && (
          <select
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={busy}
            className="input-field w-auto"
          >
            {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-6 border-b border-neutral-100">
        {['products', 'tasks', 'comments', 'activity'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-xs tracking-widest uppercase ${
              activeTab === tab ? 'text-neutral-900 border-b-2 border-neutral-900' : 'text-neutral-400'
            }`}
          >
            {tab} {tab === 'products' && `(${orderedProducts.length})`}
            {tab === 'tasks' && `(${tasks.length})`}
            {tab === 'comments' && `(${comments.length})`}
          </button>
        ))}
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div>
          {orderedProducts.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-neutral-200">
              <p className="text-sm text-neutral-400">No products in this order</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orderedProducts.map((product, i) => (
                <div key={i} className="card p-4 flex gap-4">
                  <div className="w-20 h-24 bg-neutral-100 flex-shrink-0 overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-300 text-xs">No img</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name || product.productId}</p>
                    <p className="text-xs text-neutral-400">{product.sku}</p>
                    <p className="text-xs text-neutral-500 mt-2">Qty: {product.quantity}</p>
                    <p className="text-sm font-medium mt-1">${((product.price || 0) * (product.quantity || 0)).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              placeholder="Add task..."
              className="input-field flex-1"
              disabled={busy}
            />
            <button onClick={handleAddTask} disabled={busy || !newTask.trim()} className="btn-primary btn-sm">Add</button>
          </div>
          {tasks.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-neutral-200">
              <p className="text-sm text-neutral-400">No tasks</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map(task => (
                <div key={task.id} className="card p-4 flex items-center justify-between">
                  <p className="text-sm">{task.title}</p>
                  <select
                    value={task.status}
                    onChange={(e) => handleTaskStatus(task.id, e.target.value)}
                    disabled={busy}
                    className={`badge cursor-pointer border-0 ${STATUS_STYLES[task.status]}`}
                  >
                    {TASK_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Comments Tab */}
      {activeTab === 'comments' && (
        <div>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              placeholder="Add comment..."
              className="input-field flex-1"
              disabled={busy}
            />
            <button onClick={handleAddComment} disabled={busy || !newComment.trim()} className="btn-primary btn-sm">Post</button>
          </div>
          {comments.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-neutral-200">
              <p className="text-sm text-neutral-400">No comments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map(comment => (
                <div key={comment.id} className={`p-4 ${comment.createdByUid === user?.uid ? 'bg-neutral-900 text-white' : 'bg-neutral-50'}`}>
                  <p className={`text-xs mb-1 ${comment.createdByUid === user?.uid ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    {comment.createdByName || 'Unknown'}
                  </p>
                  <p className="text-sm">{comment.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div>
          {updates.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-neutral-200">
              <p className="text-sm text-neutral-400">No activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {updates.map(u => (
                <div key={u.id} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-neutral-300 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm">{u.message}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {u.createdByName || 'System'} · {u.createdAt?.toDate?.().toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}