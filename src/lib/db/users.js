import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

export async function getUser(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function listStaffUsers() {
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(u => {
      const role = (u.role || '').toLowerCase()
      return role === 'admin' || role === 'staff'
    })
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
}
