import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Switch } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, db } from '@/constants/FirebaseConfig';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { BioPassportCard } from '@/components/BioPassportCard';
import { ReferralService, ReferralStats } from '@/services/ReferralService';
import { BioScoreService } from '@/services/BioScoreService';
import * as Haptics from 'expo-haptics';

export default function PassportScreen() {
  const [userData, setUserData] = useState<any>(null);
  const [stats, setStats] = useState<ReferralStats>({ totalReferrals: 0, activeSovereigns: 0, availableCredits: 0 });
  const [avgScore, setAvgScore] = useState(0);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUserData(data);
        setStats({
          totalReferrals: data.totalReferrals || 0,
          activeSovereigns: data.activeSovereigns || 0,
          availableCredits: data.referralCredits || 0
        });
      }
    });

    // Load recent average score
    BioScoreService.getScoreHistory(user.uid, 7).then(history => {
      const avg = history.reduce((acc, r) => acc + r.score, 0) / (history.length || 1);
      setAvgScore(Math.round(avg));
    });

    return () => unsubscribe();
  }, []);

  const handleShare = async () => {
    if (!userData) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await Share.share({
        message: `He alcanzado el rango de ${avgScore > 90 ? 'Elite Nomad' : 'Sovereign'} en healthy + brain. Únete a mi escuadrón y toma el mando de tu biografía. Código: ${userData.referralCode} #BioHacking #Sovereignty`,
        url: 'https://healthyplusbrain.ia' // Mock URL
      });
    } catch (e) {
      console.error(e);
    }
  };

  const togglePublic = async (value: boolean) => {
    if (!auth.currentUser) return;
    Haptics.selectionAsync();
    await updateDoc(doc(db, 'users', auth.currentUser.uid), {
      isPassportPublic: value
    });
  };

  if (!userData) return <View style={AppStyles.body} />;

  return (
    <View style={AppStyles.body}>
      <ScrollView contentContainerStyle={{ padding: 25, paddingBottom: 60 }}>
        
        {/* Header */}
        <View style={{ paddingTop: 40, marginBottom: 20 }}>
          <View style={AppStyles.rowBetween}>
            <View>
               <Text style={[AppStyles.textGray, { fontSize: 10, fontWeight: 'bold', letterSpacing: 2 }]}>EXPEDICIÓN: 2026</Text>
               <Text style={[AppStyles.textWhite, { fontSize: 28, fontWeight: 'bold' }]}>Tu Bio-ID 🪪</Text>
            </View>
            <TouchableOpacity onPress={() => router.back()}>
               <Ionicons name="close-circle" size={36} color="rgba(255,255,255,0.1)" />
            </TouchableOpacity>
          </View>
        </View>

        {/* THE CARD */}
        <BioPassportCard 
          userName={userData.userName || 'Bioexplorer'}
          bioScore={avgScore || userData.currentBioScore || 0}
          streak={userData.currentStreak || 0}
          referralCode={userData.referralCode || 'BRAIN-0000'}
          isFounder={userData.isFounder || false}
        />

        <Text style={[AppStyles.textGray, { textAlign: 'center', fontSize: 10, marginTop: 10, fontStyle: 'italic' }]}>
           Toca la tarjeta para activar el holograma de seguridad.
        </Text>

        {/* Privacy Control */}
        <View style={[AppStyles.glassCard, { padding: 20, marginTop: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
           <View>
              <Text style={[AppStyles.textWhite, { fontWeight: 'bold' }]}>Visibilidad Pública</Text>
              <Text style={[AppStyles.textGray, { fontSize: 11 }]}>Permitir que otros vean tu rango en la comunidad.</Text>
           </View>
           <Switch 
             value={userData.isPassportPublic || false}
             onValueChange={togglePublic}
             trackColor={{ false: '#333', true: AppColors.primaryBioGreen }}
           />
        </View>

        {/* Referral Center */}
        <View style={{ marginTop: 40 }}>
           <Text style={[AppStyles.textWhite, { fontSize: 20, fontWeight: 'bold', marginBottom: 20 }]}>Centro de Soberanía Viral</Text>
           
           <View style={{ flexDirection: 'row', gap: 15 }}>
              <View style={[AppStyles.glassCard, { flex: 1, padding: 15, alignItems: 'center' }]}>
                 <Text style={[AppStyles.textGray, { fontSize: 9, fontWeight: 'bold' }]}>AMIGOS REFERIDOS</Text>
                 <Text style={{ color: 'white', fontSize: 24, fontWeight: '900', marginVertical: 5 }}>{stats.totalReferrals}</Text>
                 <Text style={{ color: AppColors.primaryBioGreen, fontSize: 10, fontWeight: 'bold' }}>+ {stats.totalReferrals * 250} NTK</Text>
              </View>
              <View style={[AppStyles.glassCard, { flex: 1, padding: 15, alignItems: 'center' }]}>
                 <Text style={[AppStyles.textGray, { fontSize: 9, fontWeight: 'bold' }]}>CRÉDITOS ACUM.</Text>
                 <Text style={{ color: 'white', fontSize: 24, fontWeight: '900', marginVertical: 5 }}>${stats.availableCredits}</Text>
                 <Text style={{ color: AppColors.primaryNeonBlue, fontSize: 10, fontWeight: 'bold' }}>LISTOS PARA USAR</Text>
              </View>
           </View>

           <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <LinearGradient 
                colors={[AppColors.primaryBioGreen, '#00A161']}
                style={StyleSheet.absoluteFill}
              />
              <Ionicons name="share-social" size={20} color="black" style={{ marginRight: 10 }} />
              <Text style={styles.shareText}>INVITAR AMIGOS AL LEGADO</Text>
           </TouchableOpacity>

           <Text style={styles.disclaimer}>
             Gana $5 USD de crédito por cada amigo que adquiera un paquete Neuro-Optimizer o superior.
           </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shareBtn: {
    height: 60,
    borderRadius: 18,
    marginTop: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  shareText: {
    color: 'black',
    fontWeight: '900',
    letterSpacing: 1,
  },
  disclaimer: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 14,
  }
});
