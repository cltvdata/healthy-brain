/**
 * HEALTHY + BRAIN - Social Synergy Service
 * Manages unique interactions and daily limits.
 */

const SocialSynergy = {
    db: null,
    auth: null,

    init() {
        this.db = firebase.firestore();
        this.auth = firebase.auth();
    },

    /**
     * Checks if the current user can interact (gift/glow) with targetUid.
     * Rule: Only one interaction per target user per 24 hours.
     */
    async canInteract(targetUid) {
        const currentUser = this.auth.currentUser;
        if (!currentUser) return false;
        if (currentUser.uid === targetUid) return false;

        const interactionRef = this.db.collection('users')
            .doc(currentUser.uid)
            .collection('interactions')
            .doc(targetUid);

        const doc = await interactionRef.get();
        if (!doc.exists) return true;

        const lastInteraction = doc.data().timestamp.toMillis();
        const now = Date.now();
        const cooldown = window.EconomyConfig.LIMITS.INTERACTION_COOLDOWN;

        return (now - lastInteraction) > cooldown;
    },

    /**
     * Records an interaction with a target user.
     */
    async recordInteraction(targetUid, type = 'glow') {
        const currentUser = this.auth.currentUser;
        if (!currentUser) return;

        const interactionRef = this.db.collection('users')
            .doc(currentUser.uid)
            .collection('interactions')
            .doc(targetUid);

        await interactionRef.set({
            type: type,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    },

    /**
     * Processes a gift transaction with limits.
     */
    async sendGift(targetUid, targetName, amount) {
        const currentUser = this.auth.currentUser;
        if (!currentUser) throw "Debes iniciar sesión";

        const canInt = await this.canInteract(targetUid);
        if (!canInt) throw "Sinergia en enfriamiento. Vuelve en 24h.";

        const senderRef = this.db.collection('users').doc(currentUser.uid);
        const receiverRef = this.db.collection('users').doc(targetUid);

        return await this.db.runTransaction(async (transaction) => {
            const senderDoc = await transaction.get(senderRef);
            const receiverDoc = await transaction.get(receiverRef);

            if (!senderDoc.exists) throw "Usuario no encontrado";
            
            const senderData = senderDoc.data();
            const senderBalance = senderData.ntkBalance || 0;
            if (senderBalance < amount) throw "NTK Insuficiente";

            // Limit Check
            const MAX_DAILY = window.EconomyConfig.LIMITS.DAILY_GIFT_SENT;
            const today = new Date().toISOString().split('T')[0];
            const dailyRecord = senderData.dailyGiftRecord || { date: today, totalAmount: 0 };
            
            if (dailyRecord.date !== today) {
                dailyRecord.date = today;
                dailyRecord.totalAmount = 0;
            }
            
            if (dailyRecord.totalAmount + amount > MAX_DAILY) {
                throw `Límite diario alcanzado (${MAX_DAILY} NTK)`;
            }

            dailyRecord.totalAmount += amount;

            // Updates
            transaction.update(senderRef, { 
                ntkBalance: senderBalance - amount,
                dailyGiftRecord: dailyRecord,
                xp: (senderData.xp || 0) + (amount * window.EconomyConfig.REWARDS.SOCIAL.GIFT_BONUS_XP)
            });
            
            transaction.update(receiverRef, { 
                ntkBalance: (receiverDoc.data().ntkBalance || 0) + amount 
            });

            // Log activity
            const activityRef = this.db.collection('sinergias').doc();
            transaction.set(activityRef, {
                from: senderData.displayName || "Guerrero",
                to: targetName,
                amount: amount,
                type: 'gift',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Mark interaction
            const interactionRef = senderRef.collection('interactions').doc(targetUid);
            transaction.set(interactionRef, {
                type: 'gift',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            return true;
        });
    }
};

if (typeof window !== 'undefined') {
    window.SocialSynergy = SocialSynergy;
}
