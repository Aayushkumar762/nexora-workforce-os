import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyDZeOjqifcp520kmABTIjXPk62-MuM4JSQ',
  authDomain: 'nexora-employee-management-hub.firebaseapp.com',
  projectId: 'nexora-employee-management-hub',
  storageBucket: 'nexora-employee-management-hub.firebasestorage.app',
  messagingSenderId: '789813210683',
  appId: '1:789813210683:web:69162271bf479941f7b61e',
  measurementId: 'G-R5Y5C0X916',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)