import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const REWARDS = [
  { id: 1, title: 'Cinturón Halterofilia Pro', vendor: 'Bio-Tech Affiliate', price: 1200, icon: 'fitness', color: AppColors.primaryOrange },
  { id: 2, title: 'Pack Proteína Aislada', vendor: 'Metabolic Solutions', price: 400, icon: 'flask', color: AppColors.primaryNeonBlue },
  { id: 3, title: 'Auriculares Bio-Feedback', vendor: 'WaveState Analytics', price: 2500, icon: 'headset', color: AppColors.textGray },
];

export default function RecompensasScreen() {
  const [balance, setBalance] = useState(450);
  const [toast, setToast] = useState<string | null>(null);

  const redeem = (price: number, title: string) => {
    if (balance >= price) {
      setBalance(balance - price);
      setToast(`Canjeado: ${title}`);
      setTimeout(() => setToast(null), 3000);
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
           <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold', marginBottom: 8 }]}>Programa Embajador</Text>
           <Text style={[AppStyles.textGray, { fontSize: 12, marginBottom: 15 }]}>Gana el doble de tokens compartiendo tus progresos biológicos.</Text>
           <TouchableOpacity style={AppStyles.glowBtnOrange}>
              <Text style={AppStyles.glowBtnOrangeText}>Activar Bio-Soc</Text>
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
