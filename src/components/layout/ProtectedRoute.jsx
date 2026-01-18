import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthUser } from '../../lib/auth'

export default function ProtectedRoute({ children, allowRoles }) {
  const { user, profile, loading } = useAuthUser()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 border-2 border-orbit-200 rounded-full" />
            <div className="absolute inset-0 border-2 border-orbit-900 rounded-full border-t-transparent animate-spin" />
          </div>
          <p className="mt-6 text-xs tracking-widest text-orbit-400 uppercase">Loading</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (allowRoles && allowRoles.length > 0) {
    const role = profile?.role || 'customer'
    if (!allowRoles.includes(role)) {
      return <Navigate to="/" replace />
    }
  }

  return children
}
