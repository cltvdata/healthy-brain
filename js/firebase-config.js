// Firebase Configuration and Initialization
const firebaseConfig = {
  apiKey: "AIzaSyBdC_sOE6f8uPRrk7ywE2EIcVXAyl37r8c",
  authDomain: "healthy-brain-id.firebaseapp.com",
  projectId: "healthy-brain-id",
  storageBucket: "healthy-brain-id.firebasestorage.app",
  messagingSenderId: "706252737234",
  appId: "1:706252737234:web:5e1a59d0aa9197b8a3fb0b"
};

// Initialize Firebase
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const auth = firebase.auth();

    // Export utilities to window for global access
    window.hb_db = db;
    window.hb_auth = auth;
    window.db = db;
    window.auth = auth;
    
    console.log("Firebase Bio-Cloud initialized and ready.");
} else {
    console.error("Firebase SDK not loaded. Check script tags.");
}
