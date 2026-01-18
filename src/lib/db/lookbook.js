import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

// Dummy lookbook posts - campaigns, news, catalogues, behind-the-scenes
export const DUMMY_LOOKBOOK = [
  {
    id: 'lb-001',
    type: 'campaign',
    title: 'Summer 2025 Campaign',
    subtitle: 'The Endless Blue Collection',
    content: `Introducing our most ambitious seasonal collection yet. Shot on location in the Amalfi Coast, this campaign celebrates the timeless appeal of denim against Mediterranean landscapes.

Each piece tells a story of craftsmanship meeting adventure. From the rugged cliffs of Positano to the sun-drenched beaches of Capri, our Summer 2025 collection captures the essence of Italian summer style.

The Endless Blue Collection features lighter weights, breathable constructions, and washes inspired by the Tyrrhenian Sea. Pre-orders open February 1st.`,
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&h=800&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=800&h=600&fit=crop',
    ],
    date: 'January 15, 2025',
    featured: true,
  },
  {
    id: 'lb-002',
    type: 'news',
    title: 'Orbit Wins Sustainable Fashion Award',
    subtitle: 'Recognition for our eco-initiatives',
    content: `We are honored to announce that Orbit has been awarded the 2024 Sustainable Fashion Innovation Award for our pioneering work in recycled denim technology.

This recognition validates our commitment to creating beautiful products while protecting our planet. Our recycled ocean plastic denim line, launching Spring 2025, represents the culmination of three years of R&D.

Thank you to our partners, suppliers, and customers who share our vision for a more sustainable fashion industry.`,
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop',
    gallery: [],
    date: 'January 10, 2025',
    featured: false,
  },
  {
    id: 'lb-003',
    type: 'photoshoot',
    title: 'Behind The Scenes: Tokyo Shoot',
    subtitle: 'Street style meets precision',
    content: `Take a look behind the curtain at our recent photoshoot in the streets of Shibuya and Harajuku.

Our creative team spent two weeks capturing the energy of Tokyo youth culture, resulting in some of our most dynamic imagery yet. The contrast between traditional Japanese aesthetics and contemporary street fashion created unexpected magic.

Special thanks to our local production team and the amazing street cast who brought authenticity to every frame.`,
    imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1200&h=800&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&h=600&fit=crop',
    ],
    date: 'January 5, 2025',
    featured: false,
  },
  {
    id: 'lb-004',
    type: 'update',
    title: 'New Factory Partnership in Portugal',
    subtitle: 'Expanding our European production',
    content: `We are excited to announce our new partnership with Textil Amorim, a family-owned factory in Porto with over 80 years of denim expertise.

This collaboration will enhance our production capacity while maintaining the artisanal quality you expect from Orbit. The Amorim family shares our commitment to ethical manufacturing and environmental responsibility.

Production begins March 2025. Existing orders will continue through our current facilities with no disruption.`,
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=800&fit=crop',
    gallery: [],
    date: 'December 28, 2024',
    featured: false,
  },
  {
    id: 'lb-005',
    type: 'catalogue',
    title: 'Heritage Collection Lookbook',
    subtitle: 'Timeless pieces, modern interpretation',
    content: `Our Heritage Collection pays homage to the golden era of American workwear. Each piece features authentic details that defined the original work pants of the 1950s.

Copper rivets, leather patches, hidden selvedge details, and reinforced stitching - these are jeans built to last generations. We've updated the fits for contemporary bodies while preserving the soul of the originals.

Available now in all partner stores.`,
    imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=1200&h=800&fit=crop',
    gallery: [
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
    title: 'Spring 2025 Orders Now Open',
    subtitle: 'Secure your inventory early',
    content: `Spring 2025 ordering is now open for all partners. Early orders placed before February 15th will receive priority production slots and a 5% early-bird discount.

This season features expanded size ranges, new sustainable options, and several exciting collaborations we'll announce in the coming weeks.

Contact your account manager or place orders directly through the portal.`,
    imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=800&fit=crop',
    gallery: [],
    date: 'December 15, 2024',
    featured: false,
  },
  {
    id: 'lb-007',
    type: 'photoshoot',
    title: 'Performance Line: Mountain Test',
    subtitle: 'Pushing limits in the Alps',
    content: `Our new Performance line was put to the ultimate test - a week of hiking, climbing, and camping in the Swiss Alps.

The Tech Stretch Pro and Mountain series performed flawlessly in conditions ranging from freezing rain to intense sun. The four-way stretch allowed full range of motion on technical climbs, while the moisture-wicking kept our team comfortable through 10-hour days.

Real performance tested in real conditions. Available now.`,
    imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&h=800&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop',
    ],
    date: 'December 10, 2024',
    featured: false,
  },
]

// Get lookbook posts
export async function listLookbookPosts() {
  try {
    const q = query(collection(db, 'lookbook'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    const posts = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    // Return dummy if empty
    return posts.length > 0 ? posts : [...DUMMY_LOOKBOOK]
  } catch {
    return [...DUMMY_LOOKBOOK]
  }
}

export async function getLookbookPost(id) {
  const dummy = DUMMY_LOOKBOOK.find(p => p.id === id)
  if (dummy) return dummy
  const snap = await getDocs(doc(db, 'lookbook', id))
  return snap.exists?.() ? { id: snap.id, ...snap.data() } : null
}

export async function createLookbookPost(data) {
  const ref = await addDoc(collection(db, 'lookbook'), {
    ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateLookbookPost(id, patch) {
  await updateDoc(doc(db, 'lookbook', id), { ...patch, updatedAt: serverTimestamp() })
}

export async function deleteLookbookPost(id) {
  await deleteDoc(doc(db, 'lookbook', id))
}

// Comments on lookbook posts
export async function listLookbookComments(postId) {
  try {
    const q = query(collection(db, 'lookbook', postId, 'comments'), orderBy('createdAt', 'asc'))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch {
    return []
  }
}

export async function addLookbookComment(postId, { message, createdByUid, createdByName }) {
  await addDoc(collection(db, 'lookbook', postId, 'comments'), {
    message, createdByUid, createdByName, createdAt: serverTimestamp(),
  })
}