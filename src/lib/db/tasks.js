import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

export async function listTasks(orderId) {
  const q = query(collection(db, 'orders', orderId, 'tasks'), orderBy('createdAt', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function createTask(orderId, data) {
  const ref = await addDoc(collection(db, 'orders', orderId, 'tasks'), {
    title: data.title,
    status: 'todo',
    assigneeUid: data.assigneeUid || null,
    dueDate: data.dueDate || null,
    createdByUid: data.createdByUid,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateTask(orderId, taskId, patch) {
  await updateDoc(doc(db, 'orders', orderId, 'tasks', taskId), { ...patch, updatedAt: serverTimestamp() })
}

export async function deleteTask(orderId, taskId) {
  await deleteDoc(doc(db, 'orders', orderId, 'tasks', taskId))
}
