import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

export async function getCustomer(id) {
  const snap = await getDoc(doc(db, 'customers', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function listCustomers() {
  const q = query(collection(db, 'customers'), orderBy('name', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function createCustomer(data) {
  const ref = await addDoc(collection(db, 'customers'), {
    ...data, active: true, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateCustomer(id, patch) {
  await updateDoc(doc(db, 'customers', id), { ...patch, updatedAt: serverTimestamp() })
}

export async function deleteCustomer(id) {
  await deleteDoc(doc(db, 'customers', id))
}