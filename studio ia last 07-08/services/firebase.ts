import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  initializeFirestore, 
  doc, 
  setDoc, 
  getDoc,
  updateDoc,
  setLogLevel
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { safeStorage } from './storage';

// Ensure complete, non-empty Firebase configuration parameters to prevent auth/missing-project-id errors
const resolvedProjectId = (firebaseConfig.projectId && firebaseConfig.projectId.trim() !== '') 
  ? firebaseConfig.projectId 
  : (firebaseConfig.authDomain ? firebaseConfig.authDomain.split('.')[0] : 'healthy-brain-id');

const validatedConfig = {
  ...firebaseConfig,
  projectId: resolvedProjectId,
  authDomain: firebaseConfig.authDomain || `${resolvedProjectId}.firebaseapp.com`
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(validatedConfig) : getApp();
export const auth = getAuth(app);

// Suppress non-fatal Firestore network connection logs
setLogLevel('error');

// Use initializeFirestore with long polling to bypass WebSocket restrictions in sandboxed preview environment
const firestoreSettings = {
  experimentalForceLongPolling: true,
  ignoreUndefinedProperties: true
};

export const db = firebaseConfig.firestoreDatabaseId 
  ? initializeFirestore(app, firestoreSettings, firebaseConfig.firestoreDatabaseId)
  : initializeFirestore(app, firestoreSettings);

// Provider for Google Sign-In
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Register a user with email and password (with auto-login fallback if user exists)
 */
export const registerWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (err: any) {
    console.warn("Register with email notice, checking login fallback:", err?.code || err);
    if (err?.code === 'auth/email-already-in-use') {
      try {
        const loginCredential = await signInWithEmailAndPassword(auth, email, password);
        return loginCredential.user;
      } catch (loginErr: any) {
        throw err; // throw original email-already-in-use if password wrong
      }
    }
    throw err;
  }
};

/**
 * Sign in a user with email and password (with auto-registration fallback if account doesn't exist)
 */
export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (err: any) {
    console.warn("Login with email notice, checking auto-registration fallback:", err?.code || err);
    if (
      err?.code === 'auth/invalid-credential' || 
      err?.code === 'auth/user-not-found' || 
      err?.code === 'auth/wrong-password'
    ) {
      try {
        const newUserCredential = await createUserWithEmailAndPassword(auth, email, password);
        return newUserCredential.user;
      } catch (createErr: any) {
        console.warn("Auto-registration fallback notice:", createErr?.code || createErr);
        if (createErr?.code === 'auth/email-already-in-use') {
          // Account exists but password was wrong
          throw err;
        }
        throw createErr;
      }
    }
    throw err;
  }
};

/**
 * Sign in with Google Popup (standard Firebase OAuth)
 */
export const loginWithGoogle = async () => {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    return userCredential.user;
  } catch (err: any) {
    console.error("Google login error:", err);
    throw err;
  }
};

/**
 * Log out current user
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (err: any) {
    console.warn("Logout error:", err);
  }
};

/**
 * Listen to authentication state changes with adblocker / network failure resilience
 */
export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  try {
    return onAuthStateChanged(
      auth, 
      (user) => {
        try {
          callback(user);
        } catch (e) {
          console.warn("Error inside onAuthChange callback:", e);
        }
      },
      (error) => {
        console.warn("Firebase Auth error (e.g. adblocker or cookie policy restriction):", error);
        callback(null);
      }
    );
  } catch (err) {
    console.warn("Failed to subscribe to Auth state change:", err);
    callback(null);
    return () => {};
  }
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Save / Update full user state in Firestore with LocalStorage offline fallback
 */
export const saveUserData = async (userId: string, data: any) => {
  const path = `users/${userId}`;
  
  // Local storage immediate fallback using safeStorage
  safeStorage.setItem(`healthy_brain_user_${userId}`, JSON.stringify(data));

  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, {
      ...data,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err: any) {
    console.warn("Firestore operating in offline/cached mode or unreachable:", err?.message || err);
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }
};

/**
 * Get full user state from Firestore with LocalStorage fallback
 */
export const getUserData = async (userId: string) => {
  const path = `users/${userId}`;
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      safeStorage.setItem(`healthy_brain_user_${userId}`, JSON.stringify(data));
      return data;
    }
  } catch (err: any) {
    console.warn("Firestore offline or fetch error, falling back to local cache:", err?.message || err);
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.GET, path);
    }
  }

  // Local storage fallback
  const localData = safeStorage.getItem(`healthy_brain_user_${userId}`);
  if (localData) {
    try {
      return JSON.parse(localData);
    } catch (e) {
      console.warn("LocalStorage JSON parse error:", e);
    }
  }

  return null;
};

