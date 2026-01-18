import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

// 10 Dummy Denim Products with full specs and images
export const DUMMY_PRODUCTS = [
  {
    id: 'denim-001',
    name: 'Selvage Raw Indigo',
    sku: 'ORB-DN-001',
    price: 189,
    category: 'Premium Denim',
    imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=800&fit=crop',
    description: 'Japanese 14oz selvage denim with raw indigo dye. Signature red line selvage detail visible on cuff roll.',
    specs: {
      weight: '14oz',
      fit: 'Slim Straight',
      rise: 'Mid Rise',
      inseam: '32"',
      material: '100% Cotton Selvage',
      origin: 'Japan',
      wash: 'Raw / Unwashed'
    },
    active: true
  },
  {
    id: 'denim-002',
    name: 'Vintage Wash Slim',
    sku: 'ORB-DN-002',
    price: 145,
    category: 'Classic Denim',
    imageUrl: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=600&h=800&fit=crop',
    description: 'Stone-washed slim fit with authentic vintage fade pattern. Comfort stretch for all-day wear.',
    specs: {
      weight: '11oz',
      fit: 'Slim',
      rise: 'Mid Rise',
      inseam: '32"',
      material: '98% Cotton, 2% Elastane',
      origin: 'Italy',
      wash: 'Stone Wash'
    },
    active: true
  },
  {
    id: 'denim-003',
    name: 'Black Rinse Skinny',
    sku: 'ORB-DN-003',
    price: 135,
    category: 'Modern Denim',
    imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=800&fit=crop',
    description: 'Jet black rinse with skinny silhouette. Power stretch technology for ultimate comfort and movement.',
    specs: {
      weight: '10oz',
      fit: 'Skinny',
      rise: 'Low Rise',
      inseam: '30"',
      material: '92% Cotton, 6% Poly, 2% Elastane',
      origin: 'Turkey',
      wash: 'Rinse Black'
    },
    active: true
  },
  {
    id: 'denim-004',
    name: 'Heritage Straight Leg',
    sku: 'ORB-DN-004',
    price: 165,
    category: 'Heritage Collection',
    imageUrl: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&h=800&fit=crop',
    description: 'Classic American straight leg cut inspired by 1950s workwear. Reinforced seams and copper rivets.',
    specs: {
      weight: '13oz',
      fit: 'Straight',
      rise: 'Regular',
      inseam: '34"',
      material: '100% Cotton',
      origin: 'USA',
      wash: 'One Wash'
    },
    active: true
  },
  {
    id: 'denim-005',
    name: 'Distressed Boyfriend',
    sku: 'ORB-DN-005',
    price: 155,
    category: 'Contemporary',
    imageUrl: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=600&h=800&fit=crop',
    description: 'Relaxed boyfriend fit with artisanal hand-finished distressing. Each pair is unique.',
    specs: {
      weight: '11oz',
      fit: 'Relaxed Boyfriend',
      rise: 'Mid Rise',
      inseam: '28"',
      material: '100% Cotton',
      origin: 'Portugal',
      wash: 'Destroyed Vintage'
    },
    active: true
  },
  {
    id: 'denim-006',
    name: 'Midnight Selvedge',
    sku: 'ORB-DN-006',
    price: 210,
    category: 'Premium Denim',
    imageUrl: 'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=600&h=800&fit=crop',
    description: 'Deep indigo overdyed selvage from limited edition shuttle loom fabric. Collectors piece.',
    specs: {
      weight: '15oz',
      fit: 'Tapered',
      rise: 'High Rise',
      inseam: '32"',
      material: '100% Japanese Selvage Cotton',
      origin: 'Japan',
      wash: 'Raw Overdye'
    },
    active: true
  },
  {
    id: 'denim-007',
    name: 'Summer Light Wash',
    sku: 'ORB-DN-007',
    price: 125,
    category: 'Seasonal',
    imageUrl: 'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=600&h=800&fit=crop',
    description: 'Lightweight bleached denim perfect for warm weather. Breathable open weave construction.',
    specs: {
      weight: '8oz',
      fit: 'Relaxed Straight',
      rise: 'Mid Rise',
      inseam: '32"',
      material: '100% Cotton',
      origin: 'Spain',
      wash: 'Bleach Light'
    },
    active: true
  },
  {
    id: 'denim-008',
    name: 'Grey Cast Slim',
    sku: 'ORB-DN-008',
    price: 145,
    category: 'Modern Denim',
    imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=800&fit=crop',
    description: 'Sophisticated grey-cast indigo with modern slim profile. Clean minimal finish.',
    specs: {
      weight: '12oz',
      fit: 'Slim',
      rise: 'Mid Rise',
      inseam: '32"',
      material: '99% Cotton, 1% Elastane',
      origin: 'Italy',
      wash: 'Grey Cast'
    },
    active: true
  },
  {
    id: 'denim-009',
    name: 'Wide Leg Vintage',
    sku: 'ORB-DN-009',
    price: 175,
    category: 'Heritage Collection',
    imageUrl: 'https://images.unsplash.com/photo-1551854838-212c50b4c184?w=600&h=800&fit=crop',
    description: '1970s inspired wide leg silhouette with authentic vintage wash. High waisted design.',
    specs: {
      weight: '12oz',
      fit: 'Wide Leg',
      rise: 'High Rise',
      inseam: '34"',
      material: '100% Cotton',
      origin: 'USA',
      wash: '70s Vintage'
    },
    active: true
  },
  {
    id: 'denim-010',
    name: 'Tech Stretch Pro',
    sku: 'ORB-DN-010',
    price: 165,
    category: 'Performance',
    imageUrl: 'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600&h=800&fit=crop',
    description: 'Four-way stretch performance denim with moisture-wicking and quick-dry technology.',
    specs: {
      weight: '10oz',
      fit: 'Athletic Slim',
      rise: 'Mid Rise',
      inseam: '32"',
      material: '68% Cotton, 28% Poly, 4% Elastane',
      origin: 'Vietnam',
      wash: 'Tech Dark'
    },
    active: true
  },
]

// Future products coming soon
export const FUTURE_PRODUCTS = [
  {
    id: 'future-001',
    name: 'Recycled Ocean Denim',
    sku: 'ORB-FT-001',
    price: 195,
    category: 'Sustainability',
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop',
    description: 'Revolutionary denim made from recycled ocean plastics. Launching Spring 2025.',
    specs: {
      weight: '11oz',
      fit: 'Slim',
      rise: 'Mid Rise',
      inseam: '32"',
      material: '60% Recycled Ocean Plastic, 40% Organic Cotton',
      origin: 'Netherlands',
      wash: 'Eco Process'
    },
    launchDate: 'Spring 2025',
    isFuture: true
  },
  {
    id: 'future-002',
    name: 'Hemp Blend Classic',
    sku: 'ORB-FT-002',
    price: 185,
    category: 'Sustainability',
    imageUrl: 'https://images.unsplash.com/photo-1588099768523-f4e6a5679d88?w=600&h=800&fit=crop',
    description: 'Hemp-cotton blend for ultimate durability and eco-friendliness. Summer 2025.',
    specs: {
      weight: '13oz',
      fit: 'Straight',
      rise: 'Regular',
      inseam: '32"',
      material: '55% Hemp, 45% Organic Cotton',
      origin: 'France',
      wash: 'Natural'
    },
    launchDate: 'Summer 2025',
    isFuture: true
  },
  {
    id: 'future-003',
    name: 'Temperature Adaptive',
    sku: 'ORB-FT-003',
    price: 225,
    category: 'Innovation',
    imageUrl: 'https://images.unsplash.com/photo-1602293589930-45aad59ba3ab?w=600&h=800&fit=crop',
    description: 'Smart fabric that adapts to body temperature. Patent pending technology. Fall 2025.',
    specs: {
      weight: '12oz',
      fit: 'Slim Tapered',
      rise: 'Mid Rise',
      inseam: '32"',
      material: 'Proprietary Adaptive Blend',
      origin: 'Japan',
      wash: 'Climate Control'
    },
    launchDate: 'Fall 2025',
    isFuture: true
  },
]

// Get all products (dummy + firestore)
export async function listProducts(onlyActive = false) {
  try {
    const snap = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')))
    let products = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    // Merge with dummy if firestore is empty
    if (products.length === 0) {
      products = [...DUMMY_PRODUCTS]
    }
    if (onlyActive) products = products.filter(p => p.active !== false)
    return products
  } catch {
    return [...DUMMY_PRODUCTS]
  }
}

export async function getProduct(id) {
  // Check dummy first
  const dummy = [...DUMMY_PRODUCTS, ...FUTURE_PRODUCTS].find(p => p.id === id)
  if (dummy) return dummy
  // Then firestore
  const snap = await getDoc(doc(db, 'products', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function createProduct(data) {
  const ref = await addDoc(collection(db, 'products'), {
    ...data, active: true, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateProduct(id, patch) {
  await updateDoc(doc(db, 'products', id), { ...patch, updatedAt: serverTimestamp() })
}

export async function deleteProduct(id) {
  await deleteDoc(doc(db, 'products', id))
}