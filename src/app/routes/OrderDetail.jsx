import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthUser } from '../../lib/auth'
import { getOrder, updateOrder, addOrderUpdate, listOrderUpdates, markOrderViewed } from '../../lib/db/orders'
import { listTasks, createTask, updateTask } from '../../lib/db/tasks'
import { listComments, addComment } from '../../lib/db/comments'
import { listStaffUsers } from '../../lib/db/users'

const STATUSES = ['submitted', 'confirmed', 'in_progress', 'delivered', 'closed', 'cancelled']
const TASK_STATUSES = ['todo', 'doing', 'blocked', 'done']
const STATUS_STYLES = {
  submitted: 'bg-orbit-100 text-orbit-600', confirmed: 'bg-blue-50 text-blue-700', in_progress: 'bg-amber-50 text-amber-700',
  delivered: 'bg-emerald-50 text-emerald-700', closed: 'bg-orbit-100 text-orbit-400', cancelled: 'bg-red-50 text-red-600',
  todo: 'bg-orbit-100 text-orbit-600', doing: 'bg-blue-50 text-blue-700', blocked: 'bg-red-50 text-red-600', done: 'bg-emerald-50 text-emerald-700',
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
  const [newTask, setNewTask] = useState('')
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [busy, setBusy] = useState(false)
  const [activeTab, setActiveTab] = useState('tasks')

  const refresh = async () => {
    const [o, t, c, u, staff] = await Promise.all([getOrder(orderId), listTasks(orderId), listComments(orderId), listOrderUpdates(orderId), isStaff ? listStaffUsers() : Promise.resolve([])])
    setOrder(o); setTasks(t); setComments(c); setUpdates(u); setStaffUsers(staff); setLoading(false)
    if (isStaff && o && !o.viewed) markOrderViewed(orderId)
  }

  useEffect(() => { refresh() }, [orderId])

  const threadedComments = useMemo(() => {
    const top = comments.filter(c => !c.parentId)
    const replies = comments.filter(c => c.parentId)
    return top.map(c => ({ ...c, replies: replies.filter(r => r.parentId === c.id) }))
  }, [comments])

  const handleStatusChange = async (newStatus) => {
    if (!isStaff || newStatus === order.status) return
    setBusy(true)
    await updateOrder(orderId, { status: newStatus })
    await addOrderUpdate(orderId, { type: 'status_change', message: `Status changed to ${newStatus.replace(/_/g, ' ')}`, createdByUid: user.uid, createdByName: profile?.name })
    await refresh(); setBusy(false)
  }

  const handleAssignmentChange = async (uid) => {
    if (!isStaff) return
    setBusy(true)
    const name = staffUsers.find(s => s.id === uid)?.name || 'Unassigned'
    await updateOrder(orderId, { assignedToUid: uid || null })
    await addOrderUpdate(orderId, { type: 'assignment', message: uid ? `Assigned to ${name}` : 'Unassigned', createdByUid: user.uid, createdByName: profile?.name })
    await refresh(); setBusy(false)
  }

  const handleAddTask = async () => { if (!newTask.trim()) return; setBusy(true); await createTask(orderId, { title: newTask.trim(), createdByUid: user.uid }); setNewTask(''); await refresh(); setBusy(false) }
  const handleTaskStatus = async (taskId, status) => { setBusy(true); await updateTask(orderId, taskId, { status }); await refresh(); setBusy(false) }
  const handleAddComment = async () => { if (!newComment.trim()) return; setBusy(true); await addComment(orderId, { message: newComment.trim(), createdByUid: user.uid, createdByName: profile?.name, parentId: replyTo }); setNewComment(''); setReplyTo(null); await refresh(); setBusy(false) }

  if (loading) return <div className="py-24 text-center"><div className="w-6 h-6 border border-orbit-900 border-t-transparent rounded-full animate-spin mx-auto" /></div>
  if (!order) return <div className="py-24 text-center"><p className="text-sm text-orbit-500 mb-6">Order not found</p><button onClick={() => navigate(-1)} className="btn-secondary">Go Back</button></div>

  return (
    <div className="animate-in">
      <button onClick={() => navigate('/orders')} className="text-xs text-orbit-400 hover:text-orbit-900 mb-8 transition-colors">← Back to orders</button>
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-12 pb-12 border-b border-orbit-100">
        <div>
          <p className="section-label mb-4">Order</p>
          <h1 className="text-3xl font-extralight tracking-tight mb-3">{order.title}</h1>
          {order.summary && <p className="text-sm text-orbit-500 max-w-xl">{order.summary}</p>}
          <div className="flex flex-wrap items-center gap-4 mt-6">
            <span className={`badge ${STATUS_STYLES[order.status]}`}>{order.status?.replace(/_/g, ' ')}</span>
            <span className="text-xs text-orbit-400">Customer: {order.customerId}</span>
          </div>
        </div>
        {isStaff && (
          <div className="flex flex-col gap-3">
            <select value={order.status} onChange={(e) => handleStatusChange(e.target.value)} disabled={busy} className="input-box text-sm">{STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</select>
            <select value={order.assignedToUid || ''} onChange={(e) => handleAssignmentChange(e.target.value)} disabled={busy} className="input-box text-sm"><option value="">Unassigned</option>{staffUsers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
          </div>
        )}
      </div>
      <div className="flex gap-8 mb-8 border-b border-orbit-100">
        {['tasks', 'comments', 'activity'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 text-xs tracking-widest uppercase transition-colors ${activeTab === tab ? 'text-orbit-900 border-b-2 border-orbit-900' : 'text-orbit-400 hover:text-orbit-600'}`}>
            {tab} {tab === 'tasks' && `(${tasks.length})`}{tab === 'comments' && `(${comments.length})`}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          {activeTab === 'tasks' && (
            <div>
              <div className="flex gap-3 mb-8">
                <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddTask()} placeholder="Add a task..." className="input-box flex-1" disabled={busy} />
                <button onClick={handleAddTask} disabled={busy || !newTask.trim()} className="btn-primary btn-sm">Add</button>
              </div>
              {tasks.length === 0 ? <div className="py-16 text-center border border-dashed border-orbit-200"><p className="text-sm text-orbit-400">No tasks yet</p></div> : (
                <div className="space-y-3">{tasks.map(task => (
                  <div key={task.id} className="card-elite p-5">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-medium text-orbit-900">{task.title}</p>
                      <select value={task.status} onChange={(e) => handleTaskStatus(task.id, e.target.value)} disabled={busy} className={`badge cursor-pointer border-0 ${STATUS_STYLES[task.status]}`}>{TASK_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    </div>
                  </div>
                ))}</div>
              )}
            </div>
          )}
          {activeTab === 'comments' && (
            <div>
              <div className="mb-8">
                {replyTo && <div className="flex items-center justify-between text-xs text-orbit-400 mb-3"><span>Replying to comment...</span><button onClick={() => setReplyTo(null)} className="hover:text-orbit-900">Cancel</button></div>}
                <div className="flex gap-3">
                  <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddComment()} placeholder="Add a comment..." className="input-box flex-1" disabled={busy} />
                  <button onClick={handleAddComment} disabled={busy || !newComment.trim()} className="btn-primary btn-sm">Post</button>
                </div>
              </div>
              {threadedComments.length === 0 ? <div className="py-16 text-center border border-dashed border-orbit-200"><p className="text-sm text-orbit-400">No comments yet</p></div> : (
                <div className="space-y-4">{threadedComments.map(comment => (
                  <div key={comment.id}>
                    <div className={`p-5 ${comment.createdByUid === user?.uid ? 'bg-orbit-900 text-white' : 'bg-orbit-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <p className={`text-xs ${comment.createdByUid === user?.uid ? 'text-orbit-400' : 'text-orbit-500'}`}>{comment.createdByName || 'Unknown'}</p>
                        <button onClick={() => setReplyTo(comment.id)} className="text-xs opacity-60 hover:opacity-100">Reply</button>
                      </div>
                      <p className="text-sm">{comment.message}</p>
                    </div>
                    {comment.replies?.map(reply => (
                      <div key={reply.id} className={`ml-6 mt-2 p-4 ${reply.createdByUid === user?.uid ? 'bg-orbit-800 text-white' : 'bg-orbit-100'}`}>
                        <p className="text-xs opacity-70 mb-1">{reply.createdByName}</p><p className="text-xs">{reply.message}</p>
                      </div>
                    ))}
                  </div>
                ))}</div>
              )}
            </div>
          )}
          {activeTab === 'activity' && (
            <div>
              {updates.length === 0 ? <div className="py-16 text-center border border-dashed border-orbit-200"><p className="text-sm text-orbit-400">No activity yet</p></div> : (
                <div className="space-y-4">{updates.map(update => (
                  <div key={update.id} className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-orbit-300 mt-1.5 flex-shrink-0" />
                    <div><p className="text-sm text-orbit-700">{update.message}</p><p className="text-xs text-orbit-400 mt-1">{update.createdByName || 'System'}{update.createdAt?.toDate && ` · ${update.createdAt.toDate().toLocaleString()}`}</p></div>
                  </div>
                ))}</div>
              )}
            </div>
          )}
        </div>
        <div className="space-y-8">
          <div className="p-6 bg-orbit-50">
            <p className="section-label mb-4">Order Details</p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-orbit-500">Status</span><span>{order.status?.replace(/_/g, ' ')}</span></div>
              <div className="flex justify-between"><span className="text-orbit-500">Customer</span><span>{order.customerId}</span></div>
              <div className="flex justify-between"><span className="text-orbit-500">Created</span><span>{order.createdAt?.toDate?.()?.toLocaleDateString() || '—'}</span></div>
            </div>
          </div>
          <div className="p-6 bg-orbit-50">
            <p className="section-label mb-4">Task Progress</p>
            <div className="space-y-2">{TASK_STATUSES.map(status => (<div key={status} className="flex items-center justify-between text-xs"><span className="text-orbit-500 capitalize">{status}</span><span>{tasks.filter(t => t.status === status).length}</span></div>))}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
