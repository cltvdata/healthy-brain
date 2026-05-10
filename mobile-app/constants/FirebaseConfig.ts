import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase Cloud Infrastructure (Fase 20)
// Configuración de producción para Healthy + Brain
const firebaseConfig = {
  apiKey: "AIzaSyBdC_sOE6f8uPRrk7ywE2EIcVXAyl37r8c",
  authDomain: "healthy-brain-id.firebaseapp.com",
  projectId: "healthy-brain-id",
  storageBucket: "healthy-brain-id.firebasestorage.app",
  messagingSenderId: "706252737234",
  appId: "1:706252737234:web:5e1a59d0aa9197b8a3fb0b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
