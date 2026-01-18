import { 
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, 
  query, orderBy, serverTimestamp 
} from 'firebase/firestore'
import { db } from '../firebase'

export async function listProducts(onlyActive = false) {
  const snap = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')))
  let products = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  if (onlyActive) products = products.filter(p => p.active !== false)
  return products
}

export async function getProduct(id) {
  const snap = await getDoc(doc(db, 'products', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function createProduct(data) {
  const ref = await addDoc(collection(db, 'products'), {
    ...data,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateProduct(id, patch) {
  await updateDoc(doc(db, 'products', id), { ...patch, updatedAt: serverTimestamp() })
}

export async function deleteProduct(id) {
  await deleteDoc(doc(db, 'products', id))
}

// 10 Premium Denim Products with detailed specs
export const DUMMY_PRODUCTS = [
  {
    id: 'orb-001',
    name: 'Atlas Selvage Raw',
    sku: 'ORB-ATL-001',
    price: 285,
    category: 'Premium Selvage',
    imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=800&fit=crop&q=80',
    description: 'Hand-crafted 16oz Japanese selvage denim from Okayama mills. Unsanforized raw indigo with iconic red-line selvage ID. Develops exceptional fades over time.',
    specs: {
      weight: '16oz',
      fit: 'Slim Tapered',
      rise: 'Mid Rise',
      inseam: '34"',
      material: '100% Long-Staple Cotton',
      selvage: 'Red Line ID',
      buttons: 'Copper Donut',
      origin: 'Japan'
    },
    active: true,
    isFuture: false
  },
  {
    id: 'orb-002',
    name: 'Meridian Vintage Wash',
    sku: 'ORB-MRD-002',
    price: 195,
    category: 'Classic Denim',
    imageUrl: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=600&h=800&fit=crop&q=80',
    description: 'Artisan stone-washed slim fit with authentic heritage fade pattern. Premium Italian stretch denim delivers all-day comfort without sacrificing style.',
    specs: {
      weight: '12oz',
      fit: 'Slim',
      rise: 'Mid Rise',
      inseam: '32"',
      material: '98% Cotton, 2% Elastane',
      wash: 'Stone Wash',
      hardware: 'Antique Brass',
      origin: 'Italy'
    },
    active: true,
    isFuture: false
  },
  {
    id: 'orb-003',
    name: 'Eclipse Black Rinse',
    sku: 'ORB-ECL-003',
    price: 175,
    category: 'Modern Black',
    imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=800&fit=crop&q=80',
    description: 'Deep jet-black sulfur dyed denim with clean modern aesthetic. Power stretch technology for unrestricted movement. Stays black wash after wash.',
    specs: {
      weight: '11oz',
      fit: 'Skinny',
      rise: 'Low Rise',
      inseam: '32"',
      material: '92% Cotton, 6% Poly, 2% Elastane',
      wash: 'Black Rinse',
      hardware: 'Matte Black',
      origin: 'Turkey'
    },
    active: true,
    isFuture: false
  },
  {
    id: 'orb-004',
    name: 'Pioneer Straight Heritage',
    sku: 'ORB-PNR-004',
    price: 225,
    category: 'Heritage Collection',
    imageUrl: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&h=800&fit=crop&q=80',
    description: 'Classic American straight leg inspired by 1950s workwear. Triple-stitched seams, riveted stress points, and leather patch. Built to last decades.',
    specs: {
      weight: '14oz',
      fit: 'Straight',
      rise: 'Regular',
      inseam: '34"',
      material: '100% Sanforized Cotton',
      hardware: 'Copper Rivets',
      patch: 'Vegetable Tanned Leather',
      origin: 'USA'
    },
    active: true,
    isFuture: false
  },
  {
    id: 'orb-005',
    name: 'Nova Distressed',
    sku: 'ORB-NVA-005',
    price: 185,
    category: 'Contemporary',
    imageUrl: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=600&h=800&fit=crop&q=80',
    description: 'Artfully distressed boyfriend fit with hand-finished repairs and whisker detailing. Each pair uniquely aged using traditional techniques.',
    specs: {
      weight: '11oz',
      fit: 'Relaxed Boyfriend',
      rise: 'High Rise',
      inseam: '28"',
      material: '100% Cotton',
      wash: 'Vintage Distressed',
      details: 'Hand Repairs',
      origin: 'Portugal'
    },
    active: true,
    isFuture: false
  },
  {
    id: 'orb-006',
    name: 'Cosmos Indigo Overdye',
    sku: 'ORB-CSM-006',
    price: 315,
    category: 'Premium Selvage',
    imageUrl: 'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=600&h=800&fit=crop&q=80',
    description: 'Limited edition double-dyed selvage from renowned Kurabo mills. Rope-dyed indigo over sulfur base creates extraordinary depth and dimension.',
    specs: {
      weight: '15oz',
      fit: 'Tapered',
      rise: 'High Rise',
      inseam: '32"',
      material: '100% Zimbabwe Cotton',
      selvage: 'Gold Line ID',
      dye: 'Rope Dyed Indigo',
      origin: 'Japan'
    },
    active: true,
    isFuture: false
  },
  {
    id: 'orb-007',
    name: 'Solstice Light Bleach',
    sku: 'ORB-SOL-007',
    price: 165,
    category: 'Seasonal',
    imageUrl: 'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=600&h=800&fit=crop&q=80',
    description: 'Sun-faded summer essential with lightweight 9oz denim. Breathable open-weave construction perfect for warm weather styling.',
    specs: {
      weight: '9oz',
      fit: 'Relaxed Straight',
      rise: 'Mid Rise',
      inseam: '32"',
      material: '100% Cotton',
      wash: 'Light Bleach',
      weave: 'Open Weave',
      origin: 'Spain'
    },
    active: true,
    isFuture: false
  },
  {
    id: 'orb-008',
    name: 'Granite Grey Cast',
    sku: 'ORB-GRN-008',
    price: 195,
    category: 'Modern Neutrals',
    imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=800&fit=crop&q=80',
    description: 'Sophisticated grey-cast indigo with modern slim profile. Clean minimal finishing for versatile styling from office to evening.',
    specs: {
      weight: '12oz',
      fit: 'Slim',
      rise: 'Mid Rise',
      inseam: '32"',
      material: '99% Cotton, 1% Elastane',
      wash: 'Grey Cast',
      hardware: 'Silver Nickel',
      origin: 'Italy'
    },
    active: true,
    isFuture: false
  },
  {
    id: 'orb-009',
    name: 'Horizon Wide Leg',
    sku: 'ORB-HRZ-009',
    price: 215,
    category: 'Heritage Collection',
    imageUrl: 'https://images.unsplash.com/photo-1551854838-212c50b4c184?w=600&h=800&fit=crop&q=80',
    description: '1970s-inspired wide leg silhouette with authentic vintage wash. High-waisted cut flatters all body types. Statement denim for the bold.',
    specs: {
      weight: '13oz',
      fit: 'Wide Leg',
      rise: 'High Rise',
      inseam: '34"',
      material: '100% Cotton',
      wash: 'Vintage Medium',
      details: 'Felled Seams',
      origin: 'USA'
    },
    active: true,
    isFuture: false
  },
  {
    id: 'orb-010',
    name: 'Velocity Tech Stretch',
    sku: 'ORB-VLC-010',
    price: 205,
    category: 'Performance',
    imageUrl: 'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600&h=800&fit=crop&q=80',
    description: 'Next-generation performance denim with 4-way stretch. Moisture-wicking, quick-dry technology meets authentic denim aesthetics.',
    specs: {
      weight: '10oz',
      fit: 'Athletic Slim',
      rise: 'Mid Rise',
      inseam: '32"',
      material: '65% Cotton, 30% COOLMAX®, 5% Elastane',
      technology: '4-Way Stretch',
      features: 'Moisture Wicking',
      origin: 'Vietnam'
    },
    active: true,
    isFuture: false
  },
]

// Future products in development queue
export const FUTURE_PRODUCTS = [
  {
    id: 'future-001',
    name: 'Ocean Reclaimed',
    sku: 'ORB-FT-001',
    price: 245,
    category: 'Sustainability',
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop&q=80',
    description: 'Revolutionary denim woven from 100% ocean-reclaimed plastic fibers. Launching with our Carbon Neutral initiative.',
    specs: {
      weight: '11oz',
      fit: 'Slim',
      rise: 'Mid Rise',
      inseam: '32"',
      material: '60% Ocean Plastic, 40% Organic Cotton',
      certification: 'B-Corp Certified',
      origin: 'Netherlands'
    },
    launchDate: 'Spring 2025',
    isFuture: true
  },
  {
    id: 'future-002',
    name: 'Hemp Heritage',
    sku: 'ORB-FT-002',
    price: 235,
    category: 'Sustainability',
    imageUrl: 'https://images.unsplash.com/photo-1588099768523-f4e6a5679d88?w=600&h=800&fit=crop&q=80',
    description: 'Industrial hemp-cotton blend for unprecedented durability. Uses 50% less water than conventional denim production.',
    specs: {
      weight: '14oz',
      fit: 'Straight',
      rise: 'Regular',
      inseam: '32"',
      material: '55% Hemp, 45% Organic Cotton',
      certification: 'GOTS Certified',
      origin: 'Portugal'
    },
    launchDate: 'Summer 2025',
    isFuture: true
  },
  {
    id: 'future-003',
    name: 'Thermo Adaptive',
    sku: 'ORB-FT-003',
    price: 295,
    category: 'Innovation',
    imageUrl: 'https://images.unsplash.com/photo-1602293589930-45aad59ba3ab?w=600&h=800&fit=crop&q=80',
    description: 'Temperature-responsive smart fabric that adapts to body heat. Patent-pending Phase Change Material technology.',
    specs: {
      weight: '12oz',
      fit: 'Slim Tapered',
      rise: 'Mid Rise',
      inseam: '32"',
      material: 'Proprietary PCM Blend',
      technology: 'Temperature Adaptive',
      origin: 'Japan'
    },
    launchDate: 'Fall 2025',
    isFuture: true
  },
]
