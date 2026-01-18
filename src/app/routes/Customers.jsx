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

  const loadData = async () => {
    setLoading(true)
    const data = await listCustomers()
    setCustomers(data)
    setLoading(false)
  }

  const resetForm = () => {
    setName('')
    setEmail('')
    setPhone('')
    setEditing(null)
    setShowForm(false)
  }

  const openEdit = (customer) => {
    setName(customer.name || '')
    setEmail(customer.contactEmail || '')
    setPhone(customer.contactPhone || '')
    setEditing(customer)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    if (editing) {
      await updateCustomer(editing.id, { name: name.trim(), contactEmail: email, contactPhone: phone })
    } else {
      await createCustomer({ name: name.trim(), contactEmail: email, contactPhone: phone })
    }
    resetForm()
    await loadData()
    setBusy(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this customer?')) return
    setBusy(true)
    await deleteCustomer(id)
    await loadData()
    setBusy(false)
  }

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.contactEmail?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="animate-in">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
        <div>
          <p className="section-label mb-2">Management</p>
          <h1 className="page-title">Customers</h1>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="btn-primary">Add Customer</button>
      </div>

      {showForm && (
        <div className="mb-8 p-6 bg-neutral-50 border border-neutral-200">
          <p className="section-label mb-4">{editing ? 'Edit Customer' : 'New Customer'}</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="section-label mb-1 block">Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="section-label mb-1 block">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="section-label mb-1 block">Phone</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={busy} className="btn-primary btn-sm">{editing ? 'Save' : 'Add'}</button>
              <button type="button" onClick={resetForm} className="btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers..."
          className="input-field max-w-md"
        />
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-neutral-200">
          <p className="text-sm text-neutral-400">No customers found</p>
        </div>
      ) : (
        <div className="border border-neutral-100 divide-y divide-neutral-100">
          {filtered.map(customer => (
            <div key={customer.id} className="flex items-center justify-between p-4 hover:bg-neutral-50">
              <div>
                <p className="text-sm font-medium">{customer.name}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{customer.contactEmail || '—'}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => openEdit(customer)} className="text-xs text-neutral-500 hover:text-neutral-900">Edit</button>
                <button onClick={() => handleDelete(customer.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}