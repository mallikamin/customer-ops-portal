import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuthUser } from '../../lib/auth'
import { DUMMY_LOOKBOOK, createLookbookPost } from '../../lib/db/lookbook'

const TYPE_LABELS = {
  campaign: 'Campaign',
  news: 'News',
  photoshoot: 'Behind the Scenes',
  update: 'Update',
  catalogue: 'Catalogue',
}

export default function Lookbook() {
  const { user, profile } = useAuthUser()
  const isStaff = profile?.role === 'admin' || profile?.role === 'staff'
  
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [posts, setPosts] = useState(DUMMY_LOOKBOOK)

  // Form state
  const [newTitle, setNewTitle] = useState('')
  const [newSubtitle, setNewSubtitle] = useState('')
  const [newType, setNewType] = useState('news')
  const [newContent, setNewContent] = useState('')
  const [newImage, setNewImage] = useState('')
  const [busy, setBusy] = useState(false)

  const filtered = useMemo(() => {
    if (filter === 'all') return posts
    return posts.filter(p => p.type === filter)
  }, [posts, filter])

  const featured = posts.filter(p => p.featured).slice(0, 2)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newTitle.trim() || !newContent.trim()) return
    
    setBusy(true)
    try {
      // Add to local state for demo
      const newPost = {
        id: `new-${Date.now()}`,
        type: newType,
        title: newTitle.trim(),
        subtitle: newSubtitle.trim(),
        content: newContent.trim(),
        imageUrl: newImage.trim() || 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=800&fit=crop',
        gallery: [],
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        featured: false,
      }
      setPosts([newPost, ...posts])
      
      // Also try to save to Firestore (will work once rules are set)
      try {
        await createLookbookPost(newPost)
      } catch {}
      
      // Reset form
      setNewTitle('')
      setNewSubtitle('')
      setNewContent('')
      setNewImage('')
      setShowForm(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="animate-in">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
        <div>
          <p className="section-label mb-2">Updates & News</p>
          <h1 className="page-title">Lookbook</h1>
        </div>
        {isStaff && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? 'Cancel' : 'New Post'}
          </button>
        )}
      </div>

      {/* Create Post Form (Staff) */}
      {showForm && isStaff && (
        <div className="mb-8 p-6 bg-neutral-50 border border-neutral-200">
          <p className="section-label mb-4">Create New Post</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="section-label mb-1 block">Title *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="section-label mb-1 block">Subtitle</label>
                <input
                  type="text"
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="section-label mb-1 block">Type</label>
                <select value={newType} onChange={(e) => setNewType(e.target.value)} className="input-field">
                  <option value="news">News</option>
                  <option value="update">Update</option>
                  <option value="campaign">Campaign</option>
                  <option value="photoshoot">Behind the Scenes</option>
                  <option value="catalogue">Catalogue</option>
                </select>
              </div>
              <div>
                <label className="section-label mb-1 block">Image URL</label>
                <input
                  type="url"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  className="input-field"
                  placeholder="https://..."
                />
              </div>
            </div>
            <div>
              <label className="section-label mb-1 block">Content *</label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={4}
                className="input-field resize-none"
                required
              />
            </div>
            <button type="submit" disabled={busy} className="btn-primary btn-sm">
              {busy ? 'Publishing...' : 'Publish Post'}
            </button>
          </form>
        </div>
      )}

      {/* Featured */}
      {featured.length > 0 && filter === 'all' && (
        <div className="mb-10">
          <p className="section-label mb-4">Featured</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {featured.map(post => (
              <Link key={post.id} to={`/lookbook/${post.id}`} className="group relative overflow-hidden">
                <div className="aspect-video bg-neutral-100 overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <p className="text-2xs tracking-widest uppercase opacity-70 mb-1">{TYPE_LABELS[post.type]}</p>
                    <h3 className="text-xl font-light">{post.title}</h3>
                    {post.subtitle && <p className="text-sm opacity-70 mt-1">{post.subtitle}</p>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-6 border-b border-neutral-100 overflow-x-auto">
        {['all', 'news', 'update', 'campaign', 'photoshoot', 'catalogue'].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`pb-3 text-xs tracking-widest uppercase whitespace-nowrap ${
              filter === type ? 'text-neutral-900 border-b-2 border-neutral-900' : 'text-neutral-400'
            }`}
          >
            {type === 'all' ? 'All' : TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-neutral-200">
          <p className="text-sm text-neutral-400">No posts found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(post => (
            <Link key={post.id} to={`/lookbook/${post.id}`} className="group">
              <div className="aspect-video bg-neutral-100 overflow-hidden mb-3">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <p className="text-2xs text-neutral-400 uppercase tracking-wider mb-1">{TYPE_LABELS[post.type]}</p>
              <h3 className="text-sm font-medium group-hover:text-neutral-600 transition-colors">{post.title}</h3>
              <p className="text-xs text-neutral-400 mt-1">{post.date}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}