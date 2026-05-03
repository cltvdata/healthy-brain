// Script para inyectar datos de prueba (7 días) a un usuario autenticado.

async function seedDummyData() {
    if (!window.hb_auth || !window.hb_auth.currentUser) {
        alert("Debes iniciar sesión para generar datos de prueba.");
        return;
    }

    const uid = window.hb_auth.currentUser.uid;
    const db = window.hb_db;
    
    // Configuración base de los días (de -7 días a hoy)
    const metricsRef = db.collection('users').doc(uid).collection('metrics');
    
    const baseDate = new Date();
    
    // Simulación progresiva: el usuario empieza estresado y va mejorando su HRV y bajando el cortisol.
    const dummyData = [
        { daysAgo: 6, hrv: 45, cortisol: 18.5, sleepScore: 50, dopamine: 40, ntkEarned: 10 },
        { daysAgo: 5, hrv: 48, cortisol: 17.2, sleepScore: 55, dopamine: 45, ntkEarned: 20 },
        { daysAgo: 4, hrv: 52, cortisol: 16.0, sleepScore: 62, dopamine: 50, ntkEarned: 40 },
        { daysAgo: 3, hrv: 60, cortisol: 14.5, sleepScore: 70, dopamine: 65, ntkEarned: 80 },
        { daysAgo: 2, hrv: 68, cortisol: 13.0, sleepScore: 78, dopamine: 75, ntkEarned: 120 },
        { daysAgo: 1, hrv: 75, cortisol: 11.5, sleepScore: 85, dopamine: 85, ntkEarned: 150 },
        { daysAgo: 0, hrv: 82, cortisol: 10.0, sleepScore: 92, dopamine: 95, ntkEarned: 200 }
    ];

    try {
        console.log("Iniciando inyección de datos de prueba para UID:", uid);
        let totalNTK = 0;
        let lastHrv = 0;
        let lastBioScore = 0;

        for (const data of dummyData) {
            const date = new Date(baseDate);
            date.setDate(date.getDate() - data.daysAgo);
            const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
            
            const bioScore = Math.floor((data.hrv * 0.4) + (data.sleepScore * 0.4) + (data.dopamine * 0.2));

            await metricsRef.doc(dateString).set({
                date: date,
                hrv: data.hrv,
                cortisol: data.cortisol,
                sleepScore: data.sleepScore,
                dopamine: data.dopamine,
                bioScore: bioScore,
                ntkEarned: data.ntkEarned
            });
            
            totalNTK += data.ntkEarned;
            lastHrv = data.hrv;
            lastBioScore = bioScore;
        }

        // Actualizar el perfil principal del usuario con los últimos datos
        await db.collection('users').doc(uid).set({
            ntkBalance: firebase.firestore.FieldValue.increment(totalNTK),
            hrv: lastHrv,
            bioScore: lastBioScore,
            cortisol: 10.0,
            lastLogin: new Date()
        }, { merge: true });

        alert("¡Datos de simulación (7 días) inyectados con éxito! Revisa tus gráficos.");
        console.log("Datos inyectados correctamente.");
        
        // Recargar la página para ver los cambios
        setTimeout(() => window.location.reload(), 1500);

    } catch (error) {
        console.error("Error inyectando datos:", error);
        alert("Hubo un error inyectando los datos de prueba. Verifica la consola.");
    }
}

// Hacerlo accesible globalmente
window.seedDummyData = seedDummyData;
