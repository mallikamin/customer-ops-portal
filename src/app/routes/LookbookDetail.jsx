import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthUser } from '../../lib/auth'
import { DUMMY_LOOKBOOK, listLookbookComments, addLookbookComment } from '../../lib/db/lookbook'

const TYPE_LABELS = {
  campaign: 'Campaign',
  news: 'News',
  photoshoot: 'Behind the Scenes',
  update: 'Update',
  catalogue: 'Catalogue',
}

export default function LookbookDetail() {
  const { postId } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuthUser()
  
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState([])
  const [busy, setBusy] = useState(false)

  const post = DUMMY_LOOKBOOK.find(p => p.id === postId)

  // Load comments
  useEffect(() => {
    if (postId) {
      listLookbookComments(postId).then(setComments).catch(() => setComments([]))
    }
  }, [postId])

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    
    setBusy(true)
    try {
      // Add to Firestore
      await addLookbookComment(postId, {
        message: comment.trim(),
        createdByUid: user?.uid,
        createdByName: profile?.name || user?.email || 'Anonymous'
      })
      
      // Refresh comments
      const updated = await listLookbookComments(postId)
      setComments(updated.length > 0 ? updated : [
        ...comments,
        {
          id: Date.now(),
          message: comment.trim(),
          createdByName: profile?.name || user?.email || 'Anonymous',
          createdAt: { toDate: () => new Date() }
        }
      ])
      setComment('')
    } catch {
      // Add locally if Firestore fails
      setComments([
        ...comments,
        {
          id: Date.now(),
          message: comment.trim(),
          createdByName: profile?.name || user?.email || 'Anonymous',
          createdAt: { toDate: () => new Date() }
        }
      ])
      setComment('')
    } finally {
      setBusy(false)
    }
  }

  if (!post) {
    return (
      <div className="py-16 text-center animate-in">
        <p className="text-sm text-neutral-500 mb-4">Post not found</p>
        <button onClick={() => navigate('/lookbook')} className="btn-secondary btn-sm">Back to Lookbook</button>
      </div>
    )
  }

  return (
    <div className="animate-in">
      <button onClick={() => navigate('/lookbook')} className="text-xs text-neutral-400 hover:text-neutral-900 mb-6">← Back to lookbook</button>

      {/* Hero Image */}
      <div className="aspect-video lg:aspect-[21/9] bg-neutral-100 overflow-hidden mb-8">
        <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="section-label mb-2">{TYPE_LABELS[post.type]} · {post.date}</p>
          <h1 className="text-3xl font-light mb-2">{post.title}</h1>
          {post.subtitle && <p className="text-lg text-neutral-500 font-light">{post.subtitle}</p>}
        </div>

        {/* Content */}
        <div className="mb-10">
          <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">{post.content}</p>
        </div>

        {/* Gallery */}
        {post.gallery && post.gallery.length > 0 && (
          <div className="mb-10">
            <p className="section-label mb-4">Gallery</p>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {post.gallery.map((img, i) => (
                <div key={i} className="aspect-square bg-neutral-100 overflow-hidden">
                  <img src={img} alt={`${post.title} ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="border-t border-neutral-100 pt-8">
          <p className="section-label mb-4">Comments ({comments.length})</p>
          
          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="input-field flex-1"
                disabled={busy}
              />
              <button type="submit" disabled={busy || !comment.trim()} className="btn-primary btn-sm">
                {busy ? '...' : 'Post'}
              </button>
            </div>
          </form>

          {/* Comments List */}
          {comments.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-neutral-200">
              <p className="text-sm text-neutral-400">Be the first to comment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map(c => {
                const date = c.createdAt?.toDate ? c.createdAt.toDate() : new Date()
                return (
                  <div key={c.id} className="pb-4 border-b border-neutral-100 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">{c.createdByName || 'Anonymous'}</p>
                      <p className="text-xs text-neutral-400">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <p className="text-sm text-neutral-600">{c.message}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}