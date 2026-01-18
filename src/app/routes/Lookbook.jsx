import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuthUser } from '../../lib/auth'
import { DUMMY_LOOKBOOK } from '../../lib/db/lookbook'

const TYPE_LABELS = { campaign: 'Campaign', news: 'News', photoshoot: 'Behind the Scenes', update: 'Update', catalogue: 'Lookbook' }

export default function Lookbook() {
  const { profile } = useAuthUser()
  const isStaff = profile?.role === 'admin' || profile?.role === 'staff'
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState('news')
  const [newContent, setNewContent] = useState('')
  const [newImage, setNewImage] = useState('')

  const filtered = useMemo(() => filter === 'all' ? DUMMY_LOOKBOOK : DUMMY_LOOKBOOK.filter(p => p.type === filter), [filter])
  const featured = DUMMY_LOOKBOOK.filter(p => p.featured).slice(0, 2)

  const handleSubmit = (e) => { e.preventDefault(); alert('Post saved! (Demo mode - not persisted)'); setShowForm(false); setNewTitle(''); setNewContent(''); setNewImage('') }

  return (
    <div className="animate-in">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
        <div><p className="section-label mb-4">Updates & News</p><h1 className="page-title">Lookbook</h1></div>
        {isStaff && <button onClick={() => setShowForm(!showForm)} className="btn-primary">{showForm ? 'Cancel' : 'New Post'}</button>}
      </div>
      {showForm && isStaff && (
        <div className="mb-12 p-8 border border-orbit-200 bg-orbit-50">
          <p className="section-label mb-6">Create Post</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div><label className="section-label mb-2 block">Title *</label><input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="input-box" required /></div>
              <div><label className="section-label mb-2 block">Type</label><select value={newType} onChange={(e) => setNewType(e.target.value)} className="input-box"><option value="news">News</option><option value="update">Update</option><option value="campaign">Campaign</option><option value="photoshoot">Behind the Scenes</option><option value="catalogue">Lookbook</option></select></div>
              <div className="lg:col-span-2"><label className="section-label mb-2 block">Image URL</label><input type="url" value={newImage} onChange={(e) => setNewImage(e.target.value)} className="input-box" placeholder="https://..." /></div>
              <div className="lg:col-span-2"><label className="section-label mb-2 block">Content</label><textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} rows={5} className="input-box resize-none" /></div>
            </div>
            <button type="submit" className="btn-primary btn-sm">Publish Post</button>
          </form>
        </div>
      )}
      {featured.length > 0 && filter === 'all' && (
        <div className="mb-16">
          <p className="section-label mb-6">Featured</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featured.map(post => (
              <Link key={post.id} to={`/lookbook/${post.id}`} className="group relative overflow-hidden">
                <div className="aspect-video bg-orbit-100 overflow-hidden">
                  <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <p className="text-2xs tracking-widest uppercase mb-2 opacity-70">{TYPE_LABELS[post.type]}</p>
                    <h3 className="text-xl font-light">{post.title}</h3>
                    <p className="text-sm opacity-70 mt-1">{post.subtitle}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-6 mb-8 border-b border-orbit-100 overflow-x-auto">
        {['all', 'news', 'update', 'campaign', 'photoshoot', 'catalogue'].map(type => (
          <button key={type} onClick={() => setFilter(type)} className={`pb-4 text-xs tracking-widest uppercase whitespace-nowrap transition-colors ${filter === type ? 'text-orbit-900 border-b-2 border-orbit-900' : 'text-orbit-400 hover:text-orbit-600'}`}>
            {type === 'all' ? 'All' : TYPE_LABELS[type] || type}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(post => (
          <Link key={post.id} to={`/lookbook/${post.id}`} className="group">
            <div className="aspect-video bg-orbit-100 overflow-hidden mb-4"><img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>
            <p className="text-2xs text-orbit-400 uppercase tracking-wider mb-2">{TYPE_LABELS[post.type]}</p>
            <h3 className="text-sm font-medium text-orbit-900 group-hover:text-orbit-600 transition-colors">{post.title}</h3>
            <p className="text-xs text-orbit-500 mt-1">{post.date}</p>
          </Link>
        ))}
      </div>
      {filtered.length === 0 && <div className="py-24 text-center border border-dashed border-orbit-200"><p className="text-sm text-orbit-400">No posts found</p></div>}
    </div>
  )
}
