import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from './firebase'

function normalizeRole(role) {
  if (!role) return 'customer'
  return role.toLowerCase()
}

export function useAuthUser() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      setProfile(null)
      if (!u) {
        setLoading(false)
        return
      }
      try {
        const ref = doc(db, 'users', u.uid)
        const snap = await getDoc(ref)
        if (snap.exists()) {
          const data = snap.data()
          setProfile({ ...data, role: normalizeRole(data.role) })
        } else {
          const placeholder = { role: 'customer', name: u.email, customerId: null }
          await setDoc(ref, placeholder, { merge: true })
          setProfile(placeholder)
        }
      } catch (e) {
        console.error('Failed loading user profile:', e)
        setProfile({ role: 'customer', name: u.email, customerId: null })
      } finally {
        setLoading(false)
      }
    })
    return () => unsub()
  }, [])

  return { user, profile, loading }
}

export async function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
}

export async function signOut() {
  return firebaseSignOut(auth)
}

export function isStaffRole(role) {
  const normalized = normalizeRole(role)
  return normalized === 'admin' || normalized === 'staff'
}