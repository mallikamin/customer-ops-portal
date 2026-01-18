import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

export async function listComments(orderId) {
  const q = query(collection(db, 'orders', orderId, 'comments'), orderBy('createdAt', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function addComment(orderId, { message, createdByUid, createdByName, parentId = null }) {
  await addDoc(collection(db, 'orders', orderId, 'comments'), {
    message, createdByUid, createdByName, parentId,
    createdAt: serverTimestamp(),
  })
}