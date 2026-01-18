import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthUser } from '../../lib/auth'
import { createOrder } from '../../lib/db/orders'
import { listCustomers } from '../../lib/db/customers'
import { listStaffUsers } from '../../lib/db/users'

export default function OrderCreate() {
  const navigate = useNavigate()
  const { user, profile } = useAuthUser()
  const isStaff = profile?.role === 'admin' || profile?.role === 'staff'
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [customerId, setCustomerId] = useState(profile?.customerId || '')
  const [assignedToUid, setAssignedToUid] = useState('')
  const [customers, setCustomers] = useState([])
  const [staffUsers, setStaffUsers] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { if (isStaff) Promise.all([listCustomers(), listStaffUsers()]).then(([c, s]) => { setCustomers(c); setStaffUsers(s) }) }, [isStaff])

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    if (!title.trim()) { setError('Please enter an order title'); return }
    const finalCustomerId = isStaff ? customerId : profile?.customerId
    if (!finalCustomerId) { setError('Please select a customer'); return }
    setBusy(true)
    try {
      const orderId = await createOrder({ customerId: finalCustomerId, title: title.trim(), summary: summary.trim(), assignedToUid: assignedToUid || null, createdByUid: user.uid })
      navigate(`/orders/${orderId}`)
    } catch { setError('Failed to create order') } finally { setBusy(false) }
  }

  return (
    <div className="max-w-2xl mx-auto animate-in">
      <button onClick={() => navigate(-1)} className="text-xs text-orbit-400 hover:text-orbit-900 mb-8 transition-colors">← Back</button>
      <div className="mb-12"><p className="section-label mb-4">New</p><h1 className="text-3xl font-extralight tracking-tight">Create Order</h1></div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div><label className="section-label mb-3 block">Order Title *</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Spring 2025 Denim Order" className="input-elite" disabled={busy} /></div>
        <div><label className="section-label mb-3 block">Description</label><textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Order details and notes..." rows={4} className="input-elite resize-none" disabled={busy} /></div>
        {isStaff && (
          <>
            <div><label className="section-label mb-3 block">Customer *</label><select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="input-box" disabled={busy}><option value="">Select customer...</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label className="section-label mb-3 block">Assign To</label><select value={assignedToUid} onChange={(e) => setAssignedToUid(e.target.value)} className="input-box" disabled={busy}><option value="">Unassigned</option>{staffUsers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          </>
        )}
        {!isStaff && profile?.customerId && <div className="p-5 bg-orbit-50"><p className="text-xs text-orbit-500">Creating order for: <span className="text-orbit-900 font-medium">{profile.customerId}</span></p></div>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex items-center gap-4 pt-4">
          <button type="submit" disabled={busy} className="btn-primary">{busy ? 'Creating...' : 'Create Order'}</button>
          <button type="button" onClick={() => navigate(-1)} className="btn-ghost">Cancel</button>
        </div>
      </form>
    </div>
  )
}
