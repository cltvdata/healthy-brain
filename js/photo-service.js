/**
 * HEALTHY + BRAIN - Photo Upload Service
 * Handles photo capture, upload to Firebase Storage, and history management
 */

// Safe Firebase Accessor
const getFirebase = () => {
    if (typeof window !== 'undefined' && window.firebase) return window.firebase;
    if (typeof firebase !== 'undefined') return firebase;
    return null;
};

const PhotoService = {
    // Upload photo to Firebase Storage
    async uploadPhoto(imageData, type = 'progress') {
        const user = window.hb_auth?.currentUser;
        if (!user) {
            console.warn('[PhotoService] User not authenticated');
            return null;
        }

        const fb = getFirebase();
        if (!fb) {
            console.warn('[PhotoService] Firebase not available');
            return null;
        }

        try {
            // Convert base64 to blob
            const response = await fetch(imageData);
            const blob = await response.blob();
            
            // Create unique filename
            const timestamp = Date.now();
            const filename = `${type}_${timestamp}.jpg`;
            const path = `photos/${user.uid}/${filename}`;
            
            // Upload to Firebase Storage
            const storageRef = fb.storage().ref(path);
            const snapshot = await storageRef.put(blob, {
                contentType: 'image/jpeg'
            });
            
            // Get download URL
            const downloadURL = await snapshot.ref.getDownloadURL();
            
            // Save metadata to Firestore
            const photoData = {
                url: downloadURL,
                path: path,
                type: type,
                timestamp: fb.firestore.FieldValue.serverTimestamp(),
                createdAt: new Date().toISOString()
            };
            
            await window.hb_db.collection('users').doc(user.uid)
                .collection('photos').doc(timestamp.toString()).set(photoData);
            
            console.log('[PhotoService] Photo uploaded:', downloadURL);
            return photoData;
            
        } catch (error) {
            console.error('[PhotoService] Upload error:', error);
            return null;
        }
    },

    // Get photo history from Firestore
    async getPhotoHistory(type = null, limit = 20) {
        const user = window.hb_auth?.currentUser;
        if (!user) return [];

        try {
            let query = window.hb_db.collection('users').doc(user.uid)
                .collection('photos').orderBy('timestamp', 'desc').limit(limit);
            
            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('[PhotoService] Error fetching history:', error);
            return [];
        }
    },

    // Delete photo
    async deletePhoto(photoId) {
        const user = window.hb_auth?.currentUser;
        if (!user) return false;

        try {
            await window.hb_db.collection('users').doc(user.uid)
                .collection('photos').doc(photoId).delete();
            return true;
        } catch (error) {
            console.error('[PhotoService] Delete error:', error);
            return false;
        }
    },

    // Save locally with sync indicator
    saveLocalPhoto(imageData, type = 'progress') {
        const photos = JSON.parse(localStorage.getItem('hb_photos') || '[]');
        const newPhoto = {
            src: imageData,
            date: new Date().toISOString(),
            type: type,
            synced: false
        };
        photos.unshift(newPhoto);
        localStorage.setItem('hb_photos', JSON.stringify(photos.slice(0, 8)));
        return newPhoto;
    },

    // Sync local photos to Firebase
    async syncLocalPhotos() {
        const photos = JSON.parse(localStorage.getItem('hb_photos') || '[]');
        const unsynced = photos.filter(p => !p.synced);
        
        for (const photo of unsynced) {
            const result = await this.uploadPhoto(photo.src, photo.type);
            if (result) {
                photo.synced = true;
            }
        }
        
        localStorage.setItem('hb_photos', JSON.stringify(photos));
        return unsynced.length;
    }
};

// Export
if (typeof window !== 'undefined') {
    window.PhotoService = PhotoService;
}