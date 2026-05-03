const firebase = require('firebase/app');
require('firebase/auth');
require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBdC_sOE6f8uPRrk7ywE2EIcVXAyl37r8c",
  authDomain: "healthy-brain-id.firebaseapp.com",
  projectId: "healthy-brain-id",
  storageBucket: "healthy-brain-id.firebasestorage.app",
  messagingSenderId: "706252737234",
  appId: "1:706252737234:web:5e1a59d0aa9197b8a3fb0b"
};

firebase.initializeApp(firebaseConfig);

async function testSync() {
    try {
        console.log("Authenticating anonymously...");
        await firebase.auth().signInAnonymously();
        console.log("Auth success. UID:", firebase.auth().currentUser.uid);

        console.log("Writing to Firestore users collection...");
        await firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).set({
            test: "test",
            lastActive: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log("Write success!");
        process.exit(0);
    } catch (e) {
        console.error("TEST FAILED:", e.message);
        process.exit(1);
    }
}

testSync();
