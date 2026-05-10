/**
 * HEALTHY + BRAIN - Circadian Sunlight Service
 * Synchronizes biological clock with local solar cycles.
 */

const CircadianService = {
    coords: { lat: 40.7128, lng: -74.0060 }, // Default: NYC
    sunTimes: null,
    
    async init() {
        await this.updateLocation();
        this.calculateSunTimes();
    },

    async updateLocation() {
        return new Promise((resolve) => {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition((position) => {
                    this.coords.lat = position.coords.latitude;
                    this.coords.lng = position.coords.longitude;
                    resolve(true);
                }, () => {
                    console.warn("Geolocation denied. Using default coordinates.");
                    resolve(false);
                });
            } else {
                resolve(false);
            }
        });
    },

    /**
     * Simplified Sunrise/Sunset calculation
     * For high precision, an external library or API would be used.
     */
    calculateSunTimes() {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);

        // Approximate sunrise/sunset based on latitude and day of year
        // This is a heuristic for demonstration; in production we use SunCalc
        const latRad = this.coords.lat * Math.PI / 180;
        const declination = 0.409 * Math.sin(2 * Math.PI * (dayOfYear - 81) / 365);
        const hourAngle = Math.acos(-Math.tan(latRad) * Math.tan(declination));
        
        const sunriseHour = 12 - (hourAngle * 24 / (2 * Math.PI)) - (this.coords.lng / 15) + (now.getTimezoneOffset() / 60);
        const sunsetHour = 12 + (hourAngle * 24 / (2 * Math.PI)) - (this.coords.lng / 15) + (now.getTimezoneOffset() / 60);

        this.sunTimes = {
            sunrise: this.setHour(now, sunriseHour),
            sunset: this.setHour(now, sunsetHour),
            solarNoon: this.setHour(now, 12 - (this.coords.lng / 15) + (now.getTimezoneOffset() / 60))
        };
    },

    setHour(date, hourDecimal) {
        const d = new Date(date);
        d.setHours(Math.floor(hourDecimal));
        d.setMinutes(Math.floor((hourDecimal % 1) * 60));
        return d;
    },

    getCurrentWindow() {
        if (!this.sunTimes) return null;
        const now = Date.now();
        const { sunrise, sunset, solarNoon } = this.sunTimes;

        // AM Window: Within 1h of sunrise
        if (now >= sunrise.getTime() && now <= sunrise.getTime() + 60 * 60 * 1000) {
            return 'AM_LOW_ANGLE';
        }
        // Peak Window: Within 1h of solar noon
        if (now >= solarNoon.getTime() - 30 * 60 * 1000 && now <= solarNoon.getTime() + 30 * 60 * 1000) {
            return 'MID_DAY_VIT_D';
        }
        // Sunset Window: Within 1h of sunset
        if (now >= sunset.getTime() - 30 * 60 * 1000 && now <= sunset.getTime() + 30 * 60 * 1000) {
            return 'PM_SUNSET';
        }

        return null;
    },

    async claimReward() {
        const windowType = this.getCurrentWindow();
        if (!windowType) throw "No hay ventana de luz activa en este momento.";

        const currentUser = firebase.auth().currentUser;
        if (!currentUser) throw "Inicia sesión para reclamar";

        const userRef = firebase.firestore().collection('users').doc(currentUser.uid);
        const reward = window.EconomyConfig.REWARDS.SUNLIGHT[windowType];

        // Check if already claimed today
        const today = new Date().toISOString().split('T')[0];
        const doc = await userRef.get();
        const data = doc.data();
        
        const lastSunlight = data.lastSunlightClaim || { date: '', types: [] };
        if (lastSunlight.date === today && lastSunlight.types.includes(windowType)) {
            throw "Ya reclamaste esta ventana de luz hoy.";
        }

        if (lastSunlight.date !== today) {
            lastSunlight.date = today;
            lastSunlight.types = [];
        }
        lastSunlight.types.push(windowType);

        await userRef.update({
            ntkBalance: (data.ntkBalance || 0) + reward,
            xp: (data.xp || 0) + (reward * 2),
            lastSunlightClaim: lastSunlight
        });

        return reward;
    }
};

if (typeof window !== 'undefined') {
    window.CircadianService = CircadianService;
}
