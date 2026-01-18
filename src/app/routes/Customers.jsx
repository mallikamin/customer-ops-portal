import React, { useEffect, useState } from 'react'
import { listCustomers, createCustomer, updateCustomer, deleteCustomer } from '../../lib/db/customers'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)
  const [search, setSearch] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => { loadData() }, [])
  const loadData = async () => { setLoading(true); setCustomers(await listCustomers()); setLoading(false) }
  const resetForm = () => { setName(''); setEmail(''); setPhone(''); setEditing(null); setShowForm(false) }
  const openEdit = (customer) => { setName(customer.name || ''); setEmail(customer.contactEmail || ''); setPhone(customer.contactPhone || ''); setEditing(customer); setShowForm(true) }

  const handleSubmit = async (e) => {
    e.preventDefault(); if (!name.trim()) return; setBusy(true)
    if (editing) await updateCustomer(editing.id, { name: name.trim(), contactEmail: email, contactPhone: phone })
    else await createCustomer({ name: name.trim(), contactEmail: email, contactPhone: phone })
    resetForm(); await loadData(); setBusy(false)
  }

  const handleDelete = async (id) => { if (!confirm('Delete this customer?')) return; setBusy(true); await deleteCustomer(id); await loadData(); setBusy(false) }
  const filtered = customers.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.contactEmail?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="animate-in">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
        <div><p className="section-label mb-4">Management</p><h1 className="page-title">Customers</h1></div>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="btn-primary">Add Customer</button>
      </div>
      {showForm && (
        <div className="mb-12 p-8 border border-orbit-200 bg-orbit-50">
          <p className="section-label mb-6">{editing ? 'Edit Customer' : 'New Customer'}</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div><label className="section-label mb-2 block">Name *</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-box" /></div>
              <div><label className="section-label mb-2 block">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-box" /></div>
              <div><label className="section-label mb-2 block">Phone</label><input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-box" /></div>
            </div>
            <div className="flex gap-4"><button type="submit" disabled={busy} className="btn-primary btn-sm">{editing ? 'Save' : 'Add'}</button><button type="button" onClick={resetForm} className="btn-ghost">Cancel</button></div>
          </form>
        </div>
      )}
      <div className="mb-8"><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers..." className="input-box max-w-md" /></div>
      {loading ? <div className="py-24 text-center"><div className="w-6 h-6 border border-orbit-900 border-t-transparent rounded-full animate-spin mx-auto" /></div> : filtered.length === 0 ? <div className="py-24 text-center border border-dashed border-orbit-200"><p className="text-sm text-orbit-400">No customers found</p></div> : (
        <div className="border border-orbit-100 divide-y divide-orbit-100">
          {filtered.map(customer => (
            <div key={customer.id} className="flex items-center justify-between px-6 py-5 hover:bg-orbit-50 transition-colors">
              <div><p className="text-sm font-medium text-orbit-900">{customer.name}</p><p className="text-xs text-orbit-400 mt-1">{customer.contactEmail || '—'}</p></div>
              <div className="flex gap-4"><button onClick={() => openEdit(customer)} className="text-xs text-orbit-400 hover:text-orbit-900">Edit</button><button onClick={() => handleDelete(customer.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button></div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
