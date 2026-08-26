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

async function simulateMultiDaySync() {
    try {
        console.log("Authenticating anonymously...");
        await firebase.auth().signInAnonymously();
        const uid = firebase.auth().currentUser.uid;
        console.log("Auth success. Test UID:", uid);

        const db = firebase.firestore();

        console.log("Creating user document...");
        await db.collection('users').doc(uid).set({
            email: `test_${uid}@example.com`,
            ntkBalance: 1000,
            bioScore: 85,
            healthProvider: 'apple_health',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
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

            await db.collection('users').doc(uid).collection('health_syncs').add(syncData);
            console.log(`Day -${i} synced: ${steps} steps, ${hrv} HRV, ${sleepHours.toFixed(1)}h sleep`);
        }

        console.log("Updating latest user metrics...");
        await db.collection('users').doc(uid).update({
            latestSteps: latestData.metrics.steps,
            latestHRV: latestData.metrics.hrv,
            latestSleepHours: latestData.metrics.sleepHours,
            lastHealthSync: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log("✅ MULTI-DAY TEST COMPLETED SUCCESSFULLY!");
        process.exit(0);
    } catch (e) {
        console.error("TEST FAILED:", e.message);
        process.exit(1);
    }
}

simulateMultiDaySync();
