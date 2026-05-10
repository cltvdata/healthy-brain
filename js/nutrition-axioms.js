/**
 * Bio-Axiom Service (Fase 42)
 * Handles logic for nutrition-based behavioral rewards (Huberman/Inchauspé protocols).
 */

const BioAxioms = (() => {
    // Axiom definitions based on economy-config.js
    const AXIOMS = {
        FIBER_FIRST: {
            id: 'fiber_first',
            name: 'Fibra Primero',
            reward: 15, // NTK
            description: 'Reducción de pico glucémico mediante base de fibra.'
        },
        VINEGAR_HACK: {
            id: 'vinegar_hack',
            name: 'Hack Vinagre',
            reward: 10, // NTK
            description: 'Ácido acético para optimizar metabolismo.'
        },
        CAFFEINE_DELAY: {
            id: 'caffeine_delay',
            name: 'Espera Cafeína',
            reward: 25, // NTK
            description: 'Evitar bloqueo de adenosina en los primeros 90 min.'
        }
    };

    /**
     * Validates and awards an axiom reward.
     * @param {string} axiomId 
     * @param {Object} context - Data needed for validation
     */
    async function validateAxiom(axiomId, context = {}) {
        const user = firebase.auth().currentUser;
        if (!user) return { success: false, error: 'No user auth' };

        const axiom = AXIOMS[axiomId];
        if (!axiom) return { success: false, error: 'Axiom not found' };

        const today = new Date().toISOString().split('T')[0];
        const axiomRef = firebase.firestore()
            .collection('users').doc(user.uid)
            .collection('axioms').doc(`${today}_${axiom.id}`);

        try {
            return await firebase.firestore().runTransaction(async (transaction) => {
                const doc = await transaction.get(axiomRef);
                if (doc.exists) {
                    return { success: false, error: 'Axioma ya completado hoy' };
                }

                // Check daily economy limits (simplified check, would ideally use a shared limit counter)
                // For now, we trust the transaction logic and previous daily aggregate checks in other services
                
                const userRef = firebase.firestore().collection('users').doc(user.uid);
                const userDoc = await transaction.get(userRef);
                const userData = userDoc.data();

                // Award NTK and XP
                const newBalance = (parseInt(userData.ntkBalance || 0)) + axiom.reward;
                const newXp = (userData.xp || 0) + 20; // Fixed XP for axioms

                transaction.set(axiomRef, {
                    axiomId: axiom.id,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    reward: axiom.reward,
                    context: context
                });

                transaction.update(userRef, {
                    ntkBalance: newBalance,
                    xp: newXp
                });

                // Log Transaction
                const logRef = firebase.firestore().collection('transactions').doc();
                transaction.set(logRef, {
                    userId: user.uid,
                    amount: axiom.reward,
                    type: 'bio_axiom',
                    description: `Axioma Completado: ${axiom.name}`,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });

                return { 
                    success: true, 
                    reward: axiom.reward, 
                    name: axiom.name 
                };
            });
        } catch (error) {
            console.error("Axiom Transaction Error:", error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Specific validation for Caffeine Delay.
     * Checks if waking time was more than 90 mins ago.
     */
    async function checkCaffeineDelay() {
        const user = firebase.auth().currentUser;
        if (!user) return { success: false };

        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        const lastWake = userDoc.data().lastWakeTime; // Expected to be set by sleep tracking

        if (!lastWake) return { success: false, error: 'Hora de despertar no detectada' };

        const wakeDate = lastWake.toDate();
        const diffMinutes = (new Date() - wakeDate) / (1000 * 60);

        if (diffMinutes >= 90) {
            return await validateAxiom('CAFFEINE_DELAY', { diffMinutes });
        } else {
            return { success: false, error: `Faltan ${Math.ceil(90 - diffMinutes)} min para la ventana segura.` };
        }
    }

    return {
        validateAxiom,
        checkCaffeineDelay,
        AXIOMS
    };
})();
