/**
 * HEALTHY + BRAIN - App Initialization Helper
 * Ensures all services are loaded before use
 */

const AppInit = {
    // Wait for firebase to be ready
    async waitForFirebase(timeout = 5000) {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            if (window.firebase && window.hb_db && window.hb_auth) {
                return true;
            }
            await new Promise(r => setTimeout(r, 100));
        }
        console.warn('[AppInit] Firebase timeout');
        return false;
    },

    // Check if user is authenticated
    async getCurrentUser() {
        await this.waitForFirebase();
        return window.hb_auth?.currentUser || null;
    },

    // Safe database reference
    getDb() {
        return window.hb_db || null;
    },

    // Safe auth reference
    getAuth() {
        return window.hb_auth || null;
    },

    // Check auth state and redirect if needed
    async requireAuth(redirectTo = 'perfil-setup.html') {
        const user = await this.getCurrentUser();
        if (!user) {
            // Check localStorage for persistent login
            const savedUser = localStorage.getItem('hb_user');
            if (savedUser) {
                return true; // Has local session
            }
            // window.location.href = redirectTo;
            return false;
        }
        return true;
    },

    // Initialize all services for a page
    async initPage(options = {}) {
        const { requireAuth = false, redirectTo = 'perfil-setup.html' } = options;
        
        console.log('[AppInit] Initializing page...');
        
        // Wait for Firebase
        await this.waitForFirebase();
        
        // Check auth if required
        if (requireAuth) {
            const hasAuth = await this.requireAuth(redirectTo);
            if (!hasAuth) {
                console.log('[AppInit] Auth required but not available');
            }
        }
        
        // Initialize services
        if (window.BioProfile) {
            await window.BioProfile.init();
        }
        
        if (window.BiometricTracker) {
            await window.BiometricTracker.init();
        }
        
        if (window.CircadianService) {
            await window.CircadianService.init();
        }
        
        if (window.SocialSynergy) {
            window.SocialSynergy.init();
        }
        
        // Analytics
        if (window.hb_analytics) {
            window.hb_analytics.init();
        }
        
        console.log('[AppInit] Page ready');
        return true;
    },

    // Get user data from Firestore
    async getUserData(fields = []) {
        const user = await this.getCurrentUser();
        if (!user) return null;
        
        const db = this.getDb();
        if (!db) return null;
        
        try {
            const doc = await db.collection('users').doc(user.uid).get();
            const data = doc.data();
            
            if (fields.length > 0) {
                const result = {};
                fields.forEach(f => result[f] = data?.[f]);
                return result;
            }
            
            return data;
        } catch (e) {
            console.error('[AppInit] Error getting user data:', e);
            return null;
        }
    },

    // Update user data in Firestore
    async updateUserData(data) {
        const user = await this.getCurrentUser();
        if (!user) return false;
        
        const db = this.getDb();
        if (!db) return false;
        
        try {
            await db.collection('users').doc(user.uid).update(data);
            return true;
        } catch (e) {
            console.error('[AppInit] Error updating user data:', e);
            return false;
        }
    }
};

// Export
window.AppInit = AppInit;

// Auto-init on DOM ready if on a protected page
document.addEventListener('DOMContentLoaded', () => {
    // Only auto-init on pages that need auth
    const needsAuth = document.body.classList.contains('needs-auth');
    if (needsAuth && window.AppInit) {
        window.AppInit.initPage({ requireAuth: true }).catch(console.error);
    }
});