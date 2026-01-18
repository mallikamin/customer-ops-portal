import { 
  collection, doc, getDoc, getDocs, addDoc, updateDoc, 
  query, where, orderBy, serverTimestamp, onSnapshot, Timestamp
} from 'firebase/firestore'
import { db } from '../firebase'

export async function getOrder(orderId) {
  const snap = await getDoc(doc(db, 'orders', orderId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function listOrders(customerId = null) {
  let q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
  if (customerId) {
    q = query(collection(db, 'orders'), where('customerId', '==', customerId), orderBy('createdAt', 'desc'))
  }
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// Real-time subscription for orders
export function subscribeToOrders(callback, customerId = null) {
  let q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
  if (customerId) {
    q = query(collection(db, 'orders'), where('customerId', '==', customerId), orderBy('createdAt', 'desc'))
  }
  return onSnapshot(q, (snap) => {
    const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    callback(orders)
  }, (error) => {
    console.error('Orders subscription error:', error)
    callback([])
  })
}

// Create order with products
export async function createOrder(data) {
  const ref = await addDoc(collection(db, 'orders'), {
    ...data,
    status: 'submitted',
    viewed: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  // Add creation update
  await addOrderUpdate(ref.id, { 
    type: 'created', 
    message: 'Order submitted', 
    createdByUid: data.createdByUid,
    createdByName: data.createdByName || null
  })
  // Create notification
  await createNotification({
    type: 'new_order',
    orderId: ref.id,
    title: data.title,
    customerId: data.customerId,
    message: `New order "${data.title}" from ${data.customerId}`,
  })
  return ref.id
}

export async function updateOrder(orderId, patch) {
  await updateDoc(doc(db, 'orders', orderId), { ...patch, updatedAt: serverTimestamp() })
}

export async function markOrderViewed(orderId) {
  await updateDoc(doc(db, 'orders', orderId), { viewed: true })
}

// Get unviewed orders count
export async function getUnviewedOrdersCount() {
  const q = query(collection(db, 'orders'), where('viewed', '==', false))
  const snap = await getDocs(q)
  return snap.size
}

// Order updates/timeline
export async function listOrderUpdates(orderId) {
  const q = query(collection(db, 'orders', orderId, 'updates'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function addOrderUpdate(orderId, { type, message, createdByUid, createdByName }) {
  await addDoc(collection(db, 'orders', orderId, 'updates'), {
    type, message, createdByUid, createdByName: createdByName || null,
    createdAt: serverTimestamp(),
  })
}

// ============ NOTIFICATIONS ============

// Create notification
export async function createNotification(data) {
  await addDoc(collection(db, 'notifications'), {
    ...data,
    read: false,
    createdAt: serverTimestamp(),
  })
}

// Get all notifications
export async function listNotifications() {
  const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// Subscribe to notifications in real-time
export function subscribeToNotifications(callback) {
  const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    const notifications = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    callback(notifications)
  }, () => callback([]))
}

// Mark notification as read
export async function markNotificationRead(notifId) {
  await updateDoc(doc(db, 'notifications', notifId), { read: true })
}

// Mark all notifications as read
export async function markAllNotificationsRead() {
  const q = query(collection(db, 'notifications'), where('read', '==', false))
  const snap = await getDocs(q)
  const updates = snap.docs.map(d => updateDoc(doc(db, 'notifications', d.id), { read: true }))
  await Promise.all(updates)
}

// Export notifications to CSV
export function exportNotificationsToCSV(notifications) {
  const headers = ['Date', 'Time', 'Type', 'Message', 'Order ID', 'Customer', 'Read']
  const rows = notifications.map(n => {
    const date = n.createdAt?.toDate ? n.createdAt.toDate() : new Date()
    return [
      date.toLocaleDateString(),
      date.toLocaleTimeString(),
      n.type || '',
      `"${(n.message || '').replace(/"/g, '""')}"`,
      n.orderId || '',
      n.customerId || '',
      n.read ? 'Yes' : 'No'
    ]
  })
  
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `orbit-notifications-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}