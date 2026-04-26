import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { db, auth } from '@/constants/FirebaseConfig';
import { doc, onSnapshot, runTransaction } from 'firebase/firestore';
import { Share, Clipboard } from 'react-native';
import { BioEconomy } from '@/constants/BioEconomy';

const { width } = Dimensions.get('window');

const REWARDS = [
  { id: 1, title: 'Cinturón Halterofilia Pro', vendor: 'Bio-Tech Affiliate', price: 1200, icon: 'fitness', color: AppColors.primaryOrange },
  { id: 2, title: 'Pack Proteína Aislada', vendor: 'Metabolic Solutions', price: 400, icon: 'flask', color: AppColors.primaryNeonBlue },
  { id: 3, title: 'Auriculares Bio-Feedback', vendor: 'WaveState Analytics', price: 2500, icon: 'headset', color: AppColors.textGray },
];

export default function RecompensasScreen() {
  const [balance, setBalance] = useState(0);
  const [referralCode, setReferralCode] = useState('BRAIN-XXXX');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const unsubscribe = onSnapshot(doc(db, 'users', auth.currentUser.uid), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setBalance(data.ntkBalance || 0);
        setReferralCode(data.referralCode || 'BRAIN-NONE');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const redeem = async (price: number, title: string) => {
    if (balance < price || !auth.currentUser) return;

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) throw "User doc missing";
        
        const currentBalance = userDoc.data().ntkBalance || 0;
        if (currentBalance >= price) {
          transaction.update(userRef, { ntkBalance: currentBalance - price });
        } else {
          throw "Saldo insuficiente";
        }
      });

      // Log to Bio-Cloud History
      const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'logs'), {
        type: 'redeem',
        category: 'market',
        title: `Canjeado: ${title}`,
        value: -price,
        unit: 'NTK',
        timestamp: serverTimestamp()
      });

      setToast(`Canjeado en Bio-Red: ${title}`);
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      console.error("Redeem Error:", error);
      setToast("Error de conexión Biocloud");
    }
  };

  return (
    <View style={AppStyles.body}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <TouchableOpacity 
          style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' }}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', textTransform: 'uppercase' }}>Bio Marketplace</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Balance Hero */}
        <View style={{ alignItems: 'center', marginVertical: 30 }}>
          <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: AppColors.primaryOrange, alignItems: 'center', justifyContent: 'center', shadowColor: AppColors.primaryOrange, shadowRadius: 20, shadowOpacity: 0.4, elevation: 15, marginBottom: 20 }}>
             <Ionicons name="flash" size={50} color="white" />
          </View>
          <Text style={[AppStyles.textGray, { fontSize: 10, fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 5 }]}>Tus Activos de Dopamina</Text>
          <Text style={{ color: 'white', fontSize: 42, fontWeight: 'bold' }}>{balance} <Text style={{ color: AppColors.primaryOrange, fontSize: 24 }}>NTK</Text></Text>
        </View>

        {/* Rewards List */}
        <Text style={[AppStyles.textWhite, { fontSize: 12, fontWeight: 'bold', letterSpacing: 2, marginBottom: 20, textTransform: 'uppercase' }]}>Catálogo de Canje</Text>
        
        {REWARDS.map((reward) => (
          <View key={reward.id} style={[AppStyles.glassCard, { padding: 15, marginBottom: 15, flexDirection: 'row', alignItems: 'center' }]}>
            <View style={{ width: 60, height: 60, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', marginRight: 15 }}>
               <Ionicons name={reward.icon as any} size={28} color={reward.color} />
            </View>
            <View style={{ flex: 1 }}>
               <Text style={[AppStyles.textWhite, { fontSize: 14, fontWeight: 'bold', marginBottom: 2 }]}>{reward.title}</Text>
               <Text style={[AppStyles.textGray, { fontSize: 10, marginBottom: 8 }]}>{reward.vendor}</Text>
               <Text style={{ color: reward.color, fontWeight: 'bold', fontSize: 12 }}>{reward.price} NTK</Text>
            </View>
            <TouchableOpacity 
              style={{ paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10, backgroundColor: balance >= reward.price ? 'rgba(255, 138, 0, 0.1)' : 'rgba(255,255,255,0.05)' }}
              onPress={() => redeem(reward.price, reward.title)}
              disabled={balance < reward.price}
            >
               <Text style={{ color: balance >= reward.price ? AppColors.primaryOrange : 'rgba(255,255,255,0.2)', fontWeight: 'bold', fontSize: 10 }}>
                 {balance >= reward.price ? 'CANJEAR' : 'BLOQUEADO'}
               </Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Affiliate Banner */}
        <View style={[AppStyles.glassCard, { padding: 20, marginTop: 20, backgroundColor: 'rgba(255, 138, 0, 0.05)', borderColor: 'rgba(255, 138, 0, 0.2)' }]}>
           <View style={[AppStyles.rowBetween, { marginBottom: 15 }]}>
              <View>
                 <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold' }]}>Programa Embajador</Text>
                 <Text style={[AppStyles.textGray, { fontSize: 11 }]}>Gana +{BioEconomy.REFERRAL_BONUS_FIXED} NTK por referido</Text>
              </View>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 138, 0, 0.1)', alignItems: 'center', justifyContent: 'center' }}>
                 <Ionicons name="people" size={20} color={AppColors.primaryOrange} />
              </View>
           </View>

           <View style={{ padding: 15, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
              <Text style={[AppStyles.textGray, { fontSize: 9, textTransform: 'uppercase', marginBottom: 5 }]}>Tu Bio-Código Personal</Text>
              <View style={AppStyles.rowBetween}>
                 <Text style={{ color: AppColors.primaryOrange, fontSize: 18, fontWeight: 'bold', letterSpacing: 1 }}>{referralCode}</Text>
                 <TouchableOpacity onPress={() => {
                    Clipboard.setString(referralCode);
                    setToast("¡Código copiado al bioma!");
                    setTimeout(() => setToast(null), 2000);
                 }}>
                    <Ionicons name="copy-outline" size={20} color="white" />
                 </TouchableOpacity>
              </View>
           </View>
           
           <TouchableOpacity 
             style={AppStyles.glowBtnOrange}
             onPress={async () => {
                await Share.share({
                   message: `🚀 ¡Únete a la Bio-Elite en Healthy + Brain! Usa mi código ${referralCode} para obtener 500 NTK de bienvenida y 15 días de prueba total. Descárgala aquí: https://biohacking.app`
                });
             }}
           >
              <Text style={AppStyles.glowBtnOrangeText}>COMPARTIR SOBERANÍA</Text>
           </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Toast */}
      {toast && (
        <View style={{ position: 'absolute', bottom: 50, left: 20, right: 20, backgroundColor: AppColors.primaryOrange, padding: 15, borderRadius: 30, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
           <Ionicons name="checkmark-circle" size={20} color="black" style={{ marginRight: 10 }} />
           <Text style={{ color: 'black', fontWeight: 'bold' }}>{toast}</Text>
        </View>
      )}
    </View>
  );
}
