import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthUser } from '../../lib/auth'
import { DUMMY_LOOKBOOK } from '../../lib/db/lookbook'

const TYPE_LABELS = { campaign: 'Campaign', news: 'News', photoshoot: 'Behind the Scenes', update: 'Update', catalogue: 'Lookbook' }
const DUMMY_COMMENTS = [
  { id: 1, name: 'Sarah Chen', message: 'Absolutely stunning collection! The Mediterranean backdrop really brings out the blues.', date: 'Jan 16, 2025' },
  { id: 2, name: 'Marcus Rivera', message: 'When will the raw selvage be available for pre-order?', date: 'Jan 15, 2025' },
  { id: 3, name: 'Emily Watson', message: 'Love the sustainability focus. This is the future of denim.', date: 'Jan 14, 2025' },
]

export default function LookbookDetail() {
  const { postId } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuthUser()
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState(DUMMY_COMMENTS)

  const post = DUMMY_LOOKBOOK.find(p => p.id === postId)
  if (!post) return <div className="py-24 text-center animate-in"><p className="text-sm text-orbit-500 mb-6">Post not found</p><button onClick={() => navigate('/lookbook')} className="btn-secondary">Back to Lookbook</button></div>

  const handleSubmitComment = (e) => {
    e.preventDefault(); if (!comment.trim()) return
    setComments([{ id: Date.now(), name: profile?.name || user?.email || 'Anonymous', message: comment.trim(), date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }, ...comments])
    setComment('')
  }

  return (
    <div className="animate-in">
      <button onClick={() => navigate('/lookbook')} className="text-xs text-orbit-400 hover:text-orbit-900 mb-8 transition-colors">← Back to lookbook</button>
      <div className="aspect-video lg:aspect-[21/9] bg-orbit-100 overflow-hidden mb-12"><img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" /></div>
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <p className="section-label mb-4">{TYPE_LABELS[post.type]} · {post.date}</p>
          <h1 className="text-3xl lg:text-4xl font-extralight tracking-tight mb-3">{post.title}</h1>
          {post.subtitle && <p className="text-lg text-orbit-500 font-light">{post.subtitle}</p>}
        </div>
        <div className="prose prose-lg max-w-none mb-12"><p className="text-sm text-orbit-700 leading-relaxed whitespace-pre-line">{post.content}</p></div>
        {post.images && post.images.length > 0 && (
          <div className="mb-12">
            <p className="section-label mb-6">Gallery</p>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {post.images.map((img, i) => <div key={i} className="aspect-square bg-orbit-100 overflow-hidden"><img src={img} alt={`${post.title} ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" /></div>)}
            </div>
          </div>
        )}
        <div className="border-t border-orbit-100 pt-12">
          <p className="section-label mb-6">Comments ({comments.length})</p>
          <form onSubmit={handleSubmitComment} className="mb-8">
            <div className="flex gap-3"><input type="text" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment..." className="input-box flex-1" /><button type="submit" disabled={!comment.trim()} className="btn-primary btn-sm">Post</button></div>
          </form>
          <div className="space-y-6">
            {comments.map(c => (
              <div key={c.id} className="pb-6 border-b border-orbit-100 last:border-0">
                <div className="flex items-center justify-between mb-2"><p className="text-sm font-medium text-orbit-900">{c.name}</p><p className="text-xs text-orbit-400">{c.date}</p></div>
                <p className="text-sm text-orbit-600">{c.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
