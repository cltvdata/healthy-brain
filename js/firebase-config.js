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

    window.hb_db = db;
    window.hb_auth = auth;
    window.db = db;
    window.auth = auth;

    window.hb_secure_auth = {
        signUpWithVerification: async (email, password) => {
            try {
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;
                const actionCodeSettings = {
                    url: window.location.origin + '/verify-email.html',
                    handleCodeInApp: true,
                };
                await user.sendEmailVerification(actionCodeSettings);
                return { success: true, user: user };
            } catch (error) {
                console.error("Auth Security Error:", error);
                return { success: false, error: error.message };
            }
        },
        checkVerification: async () => {
            const user = auth.currentUser;
            if (user) {
                await user.reload();
                return user.emailVerified;
            }
            return false;
        }
    };
    
    // Auth state listener for UI reactivity
    auth.onAuthStateChanged((user) => {
        window.hb_user = user;
        if (user) {
            window.hb_uid = user.uid;
            window.hb_email = user.email;
        } else {
            window.hb_uid = null;
            window.hb_email = null;
        }
    });

    console.log("Firebase Bio-Cloud initialized and ready.");
} else {
    console.error("Firebase SDK not loaded. Check script tags.");
}
