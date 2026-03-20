import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyB1W-ohpixh0zpkwM7ZLd33kW5cAZmyIm0",
  authDomain: "pathforge-d1984.firebaseapp.com",
  projectId: "pathforge-d1984",
  storageBucket: "pathforge-d1984.firebasestorage.app",
  messagingSenderId: "148037154898",
  appId: "1:148037154898:web:dee09f5bd9c34b3bcd478b"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()