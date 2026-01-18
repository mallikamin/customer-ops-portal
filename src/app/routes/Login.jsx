import React, { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { signIn, useAuthUser } from '../../lib/auth'

export default function Login() {
  const { user, loading } = useAuthUser()
  const location = useLocation()
  const from = location.state?.from || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!loading && user) return <Navigate to={from} replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) return
    setBusy(true)
    setError('')
    try {
      await signIn(email.trim(), password)
    } catch (err) {
      setError(err.code === 'auth/invalid-credential' ? 'Invalid email or password' : 'Unable to sign in')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border border-orbit-900 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex">
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1542272604-787c3835535d?w=1200&h=1600&fit=crop" alt="Denim" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-16">
          <h1 className="text-5xl font-extralight text-white tracking-tight leading-tight">Premium Denim.<br />Elevated Process.</h1>
          <p className="mt-6 text-sm text-white/70 max-w-md leading-relaxed">Orbit connects manufacturers with retailers through a seamless B2B experience.</p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-sm animate-in">
          <div className="mb-16 flex items-center gap-3">
            <div className="w-12 h-12 bg-orbit-900 rounded-full flex items-center justify-center">
              <span className="text-white text-lg font-semibold">O</span>
            </div>
            <span className="text-2xl font-light tracking-tight">Orbit</span>
          </div>
          <div className="mb-12">
            <h2 className="text-3xl font-extralight tracking-tight">Welcome</h2>
            <p className="mt-3 text-sm text-orbit-500">Sign in to your account to continue</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="section-label mb-3 block">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-elite" placeholder="you@company.com" disabled={busy} />
            </div>
            <div>
              <label className="section-label mb-3 block">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-elite" placeholder="••••••••" disabled={busy} />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={busy} className="btn-primary w-full">{busy ? 'Signing in...' : 'Continue'}</button>
          </form>
          <div className="mt-16 pt-8 border-t border-orbit-100">
            <p className="section-label mb-4">Demo Accounts</p>
            <div className="space-y-2 text-xs">
              <p><span className="text-orbit-900">Admin:</span> <span className="text-orbit-500">mallikamin@gmail.com</span></p>
              <p><span className="text-orbit-900">Staff:</span> <span className="text-orbit-500">staff@customerops.com</span></p>
              <p><span className="text-orbit-900">Customer:</span> <span className="text-orbit-500">customer@customerops.com</span></p>
              <p className="text-orbit-400 mt-3">Password: admin123 / staff123 / customer123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
