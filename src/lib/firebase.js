import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyASf7lyaGhgEl0q_q1j1lQTho4_HjVAICA",
  authDomain: "customer-ops-portal.firebaseapp.com",
  projectId: "customer-ops-portal",
  storageBucket: "customer-ops-portal.firebasestorage.app",
  messagingSenderId: "96326522125",
  appId: "1:96326522125:web:077b1758f6095020430c44"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
