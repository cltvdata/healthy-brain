import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc, addDoc, collection, updateDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBdC_sOE6f8uPRrk7ywE2EIcVXAyl37r8c",
  authDomain: "healthy-brain-id.firebaseapp.com",
  projectId: "healthy-brain-id",
  storageBucket: "healthy-brain-id.firebasestorage.app",
  messagingSenderId: "706252737234",
  appId: "1:706252737234:web:5e1a59d0aa9197b8a3fb0b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function simulateMultiDaySync() {
    try {
        console.log("Authenticating anonymously...");
        const userCredential = await signInAnonymously(auth);
        const uid = userCredential.user.uid;
        console.log("Auth success. Test UID:", uid);

        console.log("Creating user document...");
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, {
            email: `test_${uid}@example.com`,
            ntkBalance: 1000,
            bioScore: 85,
            healthProvider: 'apple_health',
            createdAt: serverTimestamp()
        }, { merge: true });

        console.log("Generating 7 days of simulated health data...");
        let latestData = null;
        
        for (let i = 7; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            const steps = Math.floor(4000 + Math.random() * 8000);
            const hrv = Math.floor(40 + Math.random() * 40);
            const sleepHours = 6 + Math.random() * 2.5;

            const syncData = {
                provider: 'apple_health',
                syncedFields: ['steps', 'hrv', 'sleep', 'heartRate'],
                metrics: {
                    steps: steps,
                    hrv: hrv,
                    sleepHours: sleepHours,
                    heartRate: Math.floor(60 + Math.random() * 25),
                    glucose: Math.floor(85 + Math.random() * 20),
                    weight: 72 + Math.random() * 1.5
                },
                timestamp: date
            };

            latestData = syncData;

            await addDoc(collection(userRef, 'health_syncs'), syncData);
            console.log(`Day -${i} synced: ${steps} steps, ${hrv} HRV, ${sleepHours.toFixed(1)}h sleep`);
        }

        console.log("Updating latest user metrics...");
        await updateDoc(userRef, {
            latestSteps: latestData.metrics.steps,
            latestHRV: latestData.metrics.hrv,
            latestSleepHours: latestData.metrics.sleepHours,
            lastHealthSync: serverTimestamp()
        });

        console.log("✅ MULTI-DAY TEST COMPLETED SUCCESSFULLY!");
        process.exit(0);
    } catch (e) {
        console.error("TEST FAILED:", e.message);
        process.exit(1);
    }
}

simulateMultiDaySync();
