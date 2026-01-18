import { 
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp 
} from 'firebase/firestore'
import { db } from '../firebase'

export async function listLookbookPosts() {
  const q = query(collection(db, 'lookbook'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function createLookbookPost(data) {
  const ref = await addDoc(collection(db, 'lookbook'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateLookbookPost(id, patch) {
  await updateDoc(doc(db, 'lookbook', id), { ...patch, updatedAt: serverTimestamp() })
}

export async function deleteLookbookPost(id) {
  await deleteDoc(doc(db, 'lookbook', id))
}

export async function listLookbookComments(postId) {
  const q = query(collection(db, 'lookbook', postId, 'comments'), orderBy('createdAt', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function addLookbookComment(postId, { message, createdByUid, createdByName }) {
  await addDoc(collection(db, 'lookbook', postId, 'comments'), {
    message, createdByUid, createdByName,
    createdAt: serverTimestamp(),
  })
}

export const DUMMY_LOOKBOOK = [
  {
    id: 'lb-001',
    type: 'campaign',
    title: 'Summer 2025 Campaign',
    subtitle: 'The Endless Blue Collection',
    content: 'Introducing our most ambitious seasonal collection yet. Shot on location in the Amalfi Coast, this campaign celebrates the timeless appeal of denim against Mediterranean landscapes. Each piece tells a story of craftsmanship meeting adventure.',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=600&fit=crop',
    ],
    date: 'January 15, 2025',
    featured: true,
  },
  {
    id: 'lb-002',
    type: 'news',
    title: 'Orbit Wins Sustainable Fashion Award',
    subtitle: 'Recognition for our eco-initiatives',
    content: 'We are honored to announce that Orbit has been awarded the 2024 Sustainable Fashion Innovation Award for our pioneering work in recycled denim technology. This recognition validates our commitment to creating beautiful products while protecting our planet.',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop',
    images: [],
    date: 'January 10, 2025',
    featured: false,
  },
  {
    id: 'lb-003',
    type: 'photoshoot',
    title: 'Behind The Scenes: Tokyo Shoot',
    subtitle: 'Street style meets precision',
    content: 'Take a look behind the curtain at our recent photoshoot in the streets of Shibuya and Harajuku. Our creative team spent two weeks capturing the energy of Tokyo youth culture, resulting in some of our most dynamic imagery yet.',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=800&h=600&fit=crop',
    ],
    date: 'January 5, 2025',
    featured: false,
  },
  {
    id: 'lb-004',
    type: 'update',
    title: 'New Factory Partnership in Portugal',
    subtitle: 'Expanding our European production',
    content: 'We are excited to announce our new partnership with Textil Amorim, a family-owned factory in Porto with over 80 years of denim expertise. This collaboration will enhance our capacity while maintaining the artisanal quality you expect from Orbit.',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=800&fit=crop',
    images: [],
    date: 'December 28, 2024',
    featured: false,
  },
  {
    id: 'lb-005',
    type: 'catalogue',
    title: 'Heritage Collection Lookbook',
    subtitle: 'Timeless pieces, modern interpretation',
    content: 'Our Heritage Collection pays homage to the golden era of American workwear. Each piece features authentic details: copper rivets, leather patches, and selvage edge stitching. These are jeans built to last generations.',
    imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=1200&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800&h=600&fit=crop',
    ],
    date: 'December 20, 2024',
    featured: true,
  },
  {
    id: 'lb-006',
    type: 'news',
    title: 'Spring Orders Now Open',
    subtitle: 'Secure your inventory early',
    content: 'Spring 2025 ordering is now open for all partners. Early orders placed before February 15th will receive priority production slots and a 5% early-bird discount. Contact your account manager for details.',
    imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=800&fit=crop',
    images: [],
    date: 'December 15, 2024',
    featured: false,
  },
]
