import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '@/constants/FirebaseConfig';
import { doc, onSnapshot, runTransaction, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';

const REWARDS = [
  { 
    id: '1', 
    title: 'Pack Proteína Aislada', 
    description: 'Metabolic Solutions Co. - Suplemento Premium',
    cost: 400, 
    icon: 'medical', 
    color: '#00d1ff',
    image: 'https://images.unsplash.com/photo-1593094855729-19cca04f3748?auto=format&fit=crop&q=80&w=200'
  },
  { 
    id: '2', 
    title: 'Cinturón Halterofilia Pro', 
    description: 'Bio-Tech Affiliate - Soporte Lumbar Elite',
    cost: 1200, 
    icon: 'fitness', 
    color: '#ff8a00',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=200'
  },
  { 
    id: '3', 
    title: 'Auriculares Bio-Feedback', 
    description: 'WaveState Analytics - Monitorización HRV',
    cost: 2500, 
    icon: 'headset', 
    color: '#a855f7',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=200'
  }
];

export default function MarketScreen() {
  const { giftTargetId, giftTargetName } = useLocalSearchParams();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;

    const userRef = doc(db, 'users', auth.currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        setBalance(doc.data().ntkBalance || 0);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleRedeem = async (reward: typeof REWARDS[0]) => {
    if (balance < reward.cost) {
      Alert.alert("Soberanía Insuficiente", `Necesitas ${reward.cost} NTK. ¡Sigue optimizando tu bio-perfil!`);
      return;
    }

    setProcessing(true);
    const userRef = doc(db, 'users', auth.currentUser!.uid);
    const logRef = collection(db, 'users', auth.currentUser!.uid, 'logs');

    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) throw "Usuario no encontrado";

        const currentNtk = userDoc.data().ntkBalance || 0;
        if (currentNtk < reward.cost) throw "NTK Insuficiente";

        transaction.update(userRef, { ntkBalance: currentNtk - reward.cost });
      });

      await addDoc(logRef, {
        type: 'redeem',
        category: 'market',
        title: `Canje: ${reward.title}`,
        value: -reward.cost,
        unit: 'NTK',
        timestamp: serverTimestamp()
      });

      Alert.alert("Éxito", `Has canjeado ${reward.title}. Revisa tu Bio-Cloud para los detalles del envío.`);
    } catch (e) {
      Alert.alert("Error", "La sincronización falló: " + e);
    } finally {
      setProcessing(false);
    }
  };

  const sendGift = async (amount: number) => {
    if (balance < amount) return;

    setProcessing(true);
    const senderRef = doc(db, 'users', auth.currentUser!.uid);
    const receiverRef = doc(db, 'users', giftTargetId as string);

    try {
      await runTransaction(db, async (transaction) => {
        const senderDoc = await transaction.get(senderRef);
        const receiverDoc = await transaction.get(receiverRef);

        const currentSenderNtk = senderDoc.data()?.ntkBalance || 0;
        if (currentSenderNtk < amount) throw "Saldo insuficiente";

        transaction.update(senderRef, { ntkBalance: currentSenderNtk - amount });
        transaction.update(receiverRef, { ntkBalance: (receiverDoc.data()?.ntkBalance || 0) + amount });
      });

      Alert.alert("Sinergia Exitosa", `Has enviado ${amount} NTK a ${giftTargetName}.`);
      router.back();
    } catch (e) {
      Alert.alert("Error de Sinergia", "" + e);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
      return (
          <View style={[AppStyles.body, { justifyContent: 'center' }]}>
              <ActivityIndicator color={AppColors.primaryOrange} size="large" />
          </View>
      );
  }

  return (
    <View style={AppStyles.body}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
           <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>BIO-MARKET</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 50 }}>
        {/* Balance Card */}
        <TouchableOpacity 
          onPress={() => router.push('/wallet' as any)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[AppColors.primaryOrange, '#FF4D00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}
          >
            <View style={AppStyles.rowBetween}>
              <View>
                <Text style={styles.balanceLabel}>TU RIQUEZA BIOLÓGICA</Text>
                <Text style={styles.balanceValue}>{balance.toLocaleString()}</Text>
                <Text style={styles.levelInfo}>NIVEL 12 • MINERO DE DOPAMINA</Text>
              </View>
              <Ionicons name="wallet-outline" size={44} color="rgba(0,0,0,0.3)" />
            </View>
            
            <View style={styles.xpMiniBar}>
              <View style={[styles.xpMiniFill, { width: '65%' }]} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Gift Section (If params present) */}
        {giftTargetId && (
            <View style={[AppStyles.glassCard, styles.giftSection]}>
                <Text style={styles.sectionTitle}>Sinergia con {giftTargetName}</Text>
                <Text style={styles.sectionSub}>Regala soberanía para fortalecer la red.</Text>
                <View style={styles.giftGrid}>
                    {[50, 100, 250].map(amt => (
                        <TouchableOpacity 
                            key={amt}
                            onPress={() => sendGift(amt)}
                            disabled={processing || balance < amt}
                            style={[styles.giftBtn, balance < amt && { opacity: 0.3 }]}
                        >
                            <Text style={styles.giftText}>{amt} NTK</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        )}

        {/* Categories (Filtros) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 25 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
             {['TODO', 'ENERGÍA', 'LONGEVIDAD', 'EQUIPO'].map((cat, i) => (
                <TouchableOpacity key={i} style={[styles.filterChip, i === 0 && styles.activeFilterChip]}>
                  <Text style={[styles.filterText, i === 0 && styles.activeFilterText]}>{cat}</Text>
                </TouchableOpacity>
             ))}
          </View>
        </ScrollView>

        {/* Bio-Tokenomics Dashboard */}
        <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 30, backgroundColor: 'rgba(255,138,0,0.05)', borderColor: 'rgba(255,138,0,0.2)' }]}>
           <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 }}>ECOSISTEMA NTK</Text>
              <View style={{ backgroundColor: AppColors.primaryBioGreen + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 }}>
                 <Text style={{ color: AppColors.primaryBioGreen, fontSize: 8, fontWeight: 'bold' }}>DEFLACIONARIO</Text>
              </View>
           </View>
           
           <View style={{ flexDirection: 'row', gap: 20 }}>
              <View style={{ flex: 1 }}>
                 <Text style={{ color: AppColors.textGray, fontSize: 9, fontWeight: 'bold', marginBottom: 5 }}>TOTAL QUEMADO 🔥</Text>
                 <Text style={{ color: AppColors.primaryOrange, fontSize: 20, fontWeight: '900' }}>142,850</Text>
                 <Text style={{ color: AppColors.textGray, fontSize: 8 }}>NTK eliminados</Text>
              </View>
              <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.05)' }} />
              <View style={{ flex: 1 }}>
                 <Text style={{ color: AppColors.textGray, fontSize: 9, fontWeight: 'bold', marginBottom: 5 }}>SUMINISTRO BIO</Text>
                 <Text style={{ color: 'white', fontSize: 20, fontWeight: '900' }}>1.9M</Text>
                 <Text style={{ color: AppColors.textGray, fontSize: 8 }}>NTK circulantes</Text>
              </View>
           </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 25, marginBottom: 15 }]}>Catálogo de Optimización</Text>

        {REWARDS.map(reward => (
            <View key={reward.id} style={[AppStyles.glassCard, styles.rewardCard]}>
                <View style={styles.rewardImageContainer}>
                    <Image source={{ uri: reward.image }} style={styles.rewardImage} />
                    <LinearGradient 
                        colors={['transparent', 'rgba(0,0,0,0.8)']} 
                        style={StyleSheet.absoluteFill} 
                    />
                    <View style={[styles.itemIcon, { backgroundColor: reward.color + '40' }]}>
                        <Ionicons name={reward.icon as any} size={20} color={reward.color} />
                    </View>
                </View>

                <View style={styles.rewardContent}>
                    <Text style={styles.rewardTitle}>{reward.title}</Text>
                    <Text style={styles.rewardDesc}>{reward.description}</Text>
                    
                    <View style={styles.rewardFooter}>
                        <View style={styles.costContainer}>
                            <Text style={[styles.costValue, { color: reward.color }]}>{reward.cost} NTK</Text>
                        </View>
                        <TouchableOpacity 
                            onPress={() => handleRedeem(reward)}
                            disabled={processing || balance < reward.cost}
                            style={[styles.redeemBtn, { backgroundColor: reward.color }, balance < reward.cost && styles.disabledBtn]}
                        >
                            {processing ? (
                                <ActivityIndicator color="black" size="small" />
                            ) : (
                                <Text style={styles.redeemText}>CANJEAR</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        ))}
      </ScrollView>

      {/* Loading Overlay */}
      {processing && (
          <View style={styles.overlay}>
              <ActivityIndicator color={AppColors.primaryOrange} size="large" />
              <Text style={{ color: 'white', marginTop: 15, fontWeight: 'bold' }}>SINCRONIZANDO BIO-TRANSACCIÓN...</Text>
          </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
    fontStyle: 'italic',
  },
  balanceCard: {
    padding: 25,
    borderRadius: 30,
    marginBottom: 20,
    elevation: 10,
    shadowColor: '#ff8a00',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  balanceLabel: {
    color: 'rgba(0,0,0,0.6)',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  balanceValue: {
    color: 'black',
    fontSize: 42,
    fontWeight: '900',
    fontStyle: 'italic',
    marginVertical: 5,
  },
  xpMiniBar: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 3,
    marginTop: 10,
    overflow: 'hidden',
  },
  xpMiniFill: {
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  levelInfo: {
    color: 'rgba(0,0,0,0.5)',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 10,
    textTransform: 'uppercase',
  },
  giftSection: {
    padding: 20,
    borderWidth: 1,
    borderColor: AppColors.primaryOrange + '40',
  },
  sectionTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionSub: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    marginTop: 4,
    marginBottom: 15,
  },
  giftGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  giftBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: AppColors.primaryOrange + '20',
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppColors.primaryOrange + '40',
  },
  giftText: {
    color: AppColors.primaryOrange,
    fontSize: 12,
    fontWeight: 'bold',
  },
  rewardCard: {
    padding: 0,
    marginBottom: 20,
    overflow: 'hidden',
  },
  rewardImageContainer: {
    height: 120,
    width: '100%',
  },
  rewardImage: {
    width: '100%',
    height: '100%',
  },
  itemIcon: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  rewardContent: {
    padding: 20,
  },
  rewardTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rewardDesc: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    marginTop: 4,
  },
  rewardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  costContainer: {
    flex: 1,
  },
  costValue: {
    fontSize: 18,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  redeemBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  disabledBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    opacity: 0.5,
  },
  redeemText: {
    color: 'black',
    fontSize: 12,
    fontWeight: 'bold',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginRight: 10,
  },
  activeFilterChip: {
    backgroundColor: AppColors.primaryOrange + '20',
    borderColor: AppColors.primaryOrange
  },
  filterText: {
    color: AppColors.textGray,
    fontSize: 10,
    fontWeight: 'bold'
  },
  activeFilterText: {
    color: AppColors.primaryOrange
  }
});
