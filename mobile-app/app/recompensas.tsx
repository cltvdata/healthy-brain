import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { db, auth } from '@/constants/FirebaseConfig';
import { doc, onSnapshot, runTransaction, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Share, Clipboard } from 'react-native';
import { BioEconomy } from '@/constants/BioEconomy';

const { width } = Dimensions.get('window');

const REWARDS = [
  { id: 1, title: 'Cinturón Halterofilia Pro', vendor: 'Bio-Tech Affiliate', price: 1200, icon: 'fitness', color: AppColors.primaryOrange, type: 'physical' },
  { id: 2, title: 'Fuego Metabólico (12h)', vendor: 'Digital Boost', price: 300, icon: 'flame', color: AppColors.primaryBioGreen, type: 'boost', multiplier: 1.5 },
  { id: 3, title: 'Auriculares Bio-Feedback', vendor: 'WaveState Analytics', price: 2500, icon: 'headset', color: AppColors.textGray, type: 'physical' },
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

  const redeem = async (reward: any) => {
    const { price, title, type, multiplier } = reward;
    if (balance < price || !auth.currentUser) return;

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) throw "User doc missing";
        
        const currentBalance = userDoc.data().ntkBalance || 0;
        if (currentBalance < price) throw "Saldo insuficiente";

        const updateData: any = { ntkBalance: currentBalance - price };

        // Handle Digital Boost Logic
        if (type === 'boost') {
          const expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + 12);
          updateData.activeBoost = {
             title,
             multiplier,
             expiresAt: expiresAt.getTime()
          };
        }

        transaction.update(userRef, updateData);
      });

      // Log to Bio-Cloud History
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'logs'), {
        type: type === 'boost' ? 'boost_activate' : 'redeem',
        category: 'market',
        title: type === 'boost' ? `Activado: ${title}` : `Canjeado: ${title}`,
        value: -price,
        unit: 'NTK',
        timestamp: serverTimestamp()
      });

      setToast(type === 'boost' ? `🔥 Boost Activo: ${title}` : `Canjeado en Bio-Red: ${title}`);
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
              onPress={() => redeem(reward)}
              disabled={balance < reward.price}
            >
               <Text style={{ color: balance >= reward.price ? AppColors.primaryOrange : 'rgba(255,255,255,0.2)', fontWeight: 'bold', fontSize: 10 }}>
                 {balance >= reward.price ? 'CANJEAR' : 'BLOQUEADO'}
               </Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Buy Tokens Section */}
        <Text style={[AppStyles.textWhite, { fontSize: 12, fontWeight: 'bold', letterSpacing: 2, marginTop: 25, marginBottom: 20, textTransform: 'uppercase' }]}>Recargas de Neuro-Tokens</Text>
        
        <TouchableOpacity 
          style={[AppStyles.glassCard, { padding: 15, marginBottom: 10, flexDirection: 'row', alignItems: 'center' }]}
          onPress={() => require('react-native').Linking.openURL('https://square.link/u/p1C6yuV3')}
        >
          <View style={{ width: 50, height: 50, borderRadius: 12, backgroundColor: 'rgba(255, 138, 0, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 15 }}>
             <Ionicons name="battery-charging" size={24} color={AppColors.primaryOrange} />
          </View>
          <View style={{ flex: 1 }}>
             <Text style={[AppStyles.textWhite, { fontSize: 13, fontWeight: 'bold' }]}>Bio-Beginner (1,000 NTK)</Text>
             <Text style={{ color: AppColors.primaryOrange, fontWeight: 'bold', fontSize: 11 }}>$9.99 USD</Text>
          </View>
          <Ionicons name="cart-outline" size={20} color="white" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[AppStyles.glassCard, { padding: 15, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderColor: AppColors.primaryBioGreen, borderWidth: 1 }]}
          onPress={() => require('react-native').Linking.openURL('https://square.link/u/GIHh27Y0')}
        >
          <View style={{ width: 50, height: 50, borderRadius: 12, backgroundColor: 'rgba(0, 209, 255, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 15 }}>
             <Ionicons name="battery-full" size={24} color={AppColors.primaryBioGreen} />
          </View>
          <View style={{ flex: 1 }}>
             <Text style={[AppStyles.textWhite, { fontSize: 13, fontWeight: 'bold' }]}>Neuro-Optimizer (3,500 NTK)</Text>
             <Text style={{ color: AppColors.primaryBioGreen, fontWeight: 'bold', fontSize: 11 }}>$24.99 USD</Text>
          </View>
          <Ionicons name="star" size={16} color={AppColors.primaryBioGreen} style={{ marginRight: 10 }} />
          <Ionicons name="cart-outline" size={20} color="white" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[AppStyles.glassCard, { padding: 15, marginBottom: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 138, 0, 0.1)' }]}
          onPress={() => require('react-native').Linking.openURL('https://square.link/u/vx2qZn8R')}
        >
          <View style={{ width: 50, height: 50, borderRadius: 12, backgroundColor: AppColors.primaryOrange, alignItems: 'center', justifyContent: 'center', marginRight: 15 }}>
             <Ionicons name="trophy" size={24} color="black" />
          </View>
          <View style={{ flex: 1 }}>
             <Text style={[AppStyles.textWhite, { fontSize: 13, fontWeight: 'bold' }]}>Soberanía Elite (12,000 NTK)</Text>
             <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 11 }}>$74.99 USD</Text>
          </View>
          <Text style={{ color: AppColors.primaryOrange, fontSize: 8, fontWeight: 'black', marginRight: 10 }}>MEJOR VALOR</Text>
          <Ionicons name="cart-outline" size={20} color="white" />
        </TouchableOpacity>

        {/* Sponsors Section */}
        <Text style={[AppStyles.textWhite, { fontSize: 12, fontWeight: 'bold', letterSpacing: 2, marginTop: 25, marginBottom: 20, textTransform: 'uppercase' }]}>Patrocinadores Bio-Elite</Text>
        
        <TouchableOpacity 
          style={[AppStyles.glassCard, { padding: 20, marginBottom: 15, flexDirection: 'row', alignItems: 'center', borderColor: AppColors.primaryOrange }]}
          onPress={() => require('react-native').Linking.openURL('https://www.adidas.com/us/invite?invitationCode=adidasSC63JFLWF3FN')}
        >
          <View style={{ width: 60, height: 60, borderRadius: 15, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', marginRight: 15 }}>
             <Image 
                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg' }} 
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
             />
          </View>
          <View style={{ flex: 1 }}>
             <Text style={[AppStyles.textWhite, { fontSize: 14, fontWeight: 'bold', marginBottom: 2 }]}>adiClub Membership</Text>
             <Text style={[AppStyles.textGray, { fontSize: 10, lineHeight: 14 }]}>Únete a Adidas y obtén $10 USD de descuento exclusivos para Bio-Hackers.</Text>
          </View>
          <Ionicons name="open-outline" size={18} color={AppColors.primaryOrange} />
        </TouchableOpacity>

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
