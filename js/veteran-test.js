/**
 * HEALTHY + BRAIN - Veteran User Test Script
 * This script allows testing the veteran bonus logic by simulating an older account.
 */

const VeteranTest = {
  // Simulate an account created 7 months ago
  async simulateVeteranStatus() {
    const user = window.hb_auth?.currentUser;
    if (!user) {
      console.error('[VeteranTest] User not logged in');
      return;
    }

    const db = window.hb_db;
    const sevenMonthsAgo = new Date();
    sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 7);

    try {
      await db.collection('users').doc(user.uid).update({
        createdAt: sevenMonthsAgo,
        isVeteran: true // Optional flag
      });
      console.log('[VeteranTest] Account simulated as 7 months old.');
      alert('✅ Cuenta simulada como Veterana (7 meses de antigüedad). Procede a sincronizar datos para ver el bono.');
    } catch (error) {
      console.error('[VeteranTest] Error simulating status:', error);
    }
  },

  // Check current NTK Balance
  async checkBalance() {
    const user = window.hb_auth?.currentUser;
    if (!user) return;

    const doc = await window.hb_db.collection('users').doc(user.uid).get();
    const data = doc.data();
    console.log('[VeteranTest] Current NTK Balance:', data.ntkBalance);
    return data.ntkBalance;
  }
};

window.VeteranTest = VeteranTest;
console.log('[VeteranTest] Loaded - use window.VeteranTest.simulateVeteranStatus() to test.');
