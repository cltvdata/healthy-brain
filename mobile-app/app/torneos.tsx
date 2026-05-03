import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Alert, Image } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { db, auth } from '@/constants/FirebaseConfig';
import { collection, doc, onSnapshot, runTransaction, increment, serverTimestamp, setDoc } from 'firebase/firestore';
import { TorneoService } from '@/services/TorneoService';

const { width } = Dimensions.get('window');

export default function TorneosScreen() {
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Listen for current active tournament
    const unsub = onSnapshot(doc(db, 'tournaments', 'grand_prix_current'), (snap) => {
      if (snap.exists()) {
        setTournament({ id: snap.id, ...snap.data() });
      } else {
        // Create initial dummy tournament if not exists for demo
        createInitialTournament();
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const createInitialTournament = async () => {
    await setDoc(doc(db, 'tournaments', 'grand_prix_current'), {
      name: 'BIO-GRAND PRIX: GÉNESIS',
      status: 'enrollment', // enrollment, active, completed
      entryFee: 200,
      participants: [],
      brackets: {
        round1: [], // 8 slots
        round2: [], // 4 slots
        final: []   // 2 slots
      },
      createdAt: serverTimestamp()
    });
  };

  const handleEnroll = async () => {
    if (!auth.currentUser || !tournament) return;
    if (tournament.participants.includes(auth.currentUser.uid)) {
      return Alert.alert("Inscrito", "Ya estás esperando en los boxes.");
    }

    setProcessing(true);
    try {
      await TorneoService.enrollUser(auth.currentUser.uid, tournament.id, tournament.entryFee);
      Alert.alert("🏁 ¡INSCRITO!", "Has entrado al Bio-Grand Prix. Prepárate para el Viernes.");
    } catch (e: any) {
      Alert.alert("Error", e.message || e.toString());
    } finally {
      setProcessing(false);
    }
  };

  const renderBracketNode = (player: any, score?: number) => (
    <View style={{ width: 100, padding: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, borderWidth: 1, borderColor: player ? AppColors.primaryOrange : 'rgba(255,255,255,0.1)', marginBottom: 10 }}>
        <Text numberOfLines={1} style={{ color: player ? 'white' : 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 'bold' }}>{player ? player.userName || 'Guerrero' : 'VACANTE'}</Text>
        {player && <Text style={{ color: AppColors.primaryOrange, fontSize: 8 }}>{score || '--'} HRV</Text>}
    </View>
  );

  if (loading) return <ActivityIndicator color={AppColors.primaryOrange} style={{ flex: 1, backgroundColor: '#0a0a0a' }} />;

  return (
    <View style={AppStyles.body}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 10 }}>
                <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={{ color: AppColors.primaryOrange, fontWeight: 'black', fontStyle: 'italic', fontSize: 18 }}>BIO-GRAND PRIX</Text>
            <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 20 }}>
            {/* Tournament Info */}
            <View style={[AppStyles.glassCard, { padding: 20, borderColor: AppColors.primaryOrange, borderStyle: 'dashed' }]}>
                <Text style={{ color: 'white', fontSize: 20, fontWeight: 'black', fontStyle: 'italic', marginBottom: 5 }}>{tournament?.name}</Text>
                <Text style={{ color: AppColors.textGray, fontSize: 11, marginBottom: 20 }}>CUPO: {tournament?.participants?.length}/8 GUERREROS</Text>
                
                <TouchableOpacity 
                    onPress={handleEnroll}
                    disabled={processing || tournament?.status !== 'enrollment'}
                    style={{ backgroundColor: AppColors.primaryOrange, padding: 18, borderRadius: 15, alignItems: 'center' }}
                >
                    <Text style={{ color: 'black', fontWeight: 'bold' }}>{processing ? 'INSCRIBIENDO...' : 'INSCRIBIRSE (200 NTK)'}</Text>
                </TouchableOpacity>
            </View>

            {/* Brackets Visualization */}
            <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold', marginTop: 40, marginBottom: 20, letterSpacing: 2 }}>ESTRUCTURA DE COMBATE</Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {/* Cuartos */}
                <View>
                    <Text style={{ color: AppColors.textGray, fontSize: 8, marginBottom: 10 }}>CUARTOS (Viernes)</Text>
                    {tournament?.brackets?.round1?.slice(0, 4).map((p: any, i: number) => (
                      <View key={i}>
                        {renderBracketNode(p.id === auth.currentUser?.uid ? { userName: 'TÚ' } : { userName: p.id }, p.score)}
                        {i % 2 === 1 && <View style={{ height: 20 }} />}
                      </View>
                    ))}
                </View>

                {/* Semis */}
                <View style={{ justifyContent: 'center' }}>
                    <Text style={{ color: AppColors.textGray, fontSize: 8, marginBottom: 10 }}>SEMIS (Sábado)</Text>
                    {renderBracketNode(tournament?.status === 'active' ? null : null)}
                    <View style={{ height: 60 }} />
                    {renderBracketNode(null)}
                </View>

                {/* Final */}
                <View style={{ justifyContent: 'center' }}>
                    <Text style={{ color: AppColors.primaryOrange, fontSize: 8, marginBottom: 10, fontWeight: 'bold' }}>GRAN FINAL (Domingo)</Text>
                    <Ionicons name="trophy" size={32} color={AppColors.primaryOrange} style={{ alignSelf: 'center', marginBottom: 15 }} />
                    {renderBracketNode(null)}
                </View>
            </View>

            {/* Sponsorship Integration */}
            <TouchableOpacity 
                onPress={() => router.push('/market')}
                style={[AppStyles.glassCard, { padding: 15, marginTop: 40, backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)' }]}
            >
                <View style={AppStyles.rowBetween}>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13 }}>PATROCINADO POR ADIDAS</Text>
                        <Text style={{ color: AppColors.textGray, fontSize: 10, marginTop: 2 }}>Desbloquea equipamiento con tus Neuro-Tokens.</Text>
                    </View>
                    <Image 
                        source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg' }} 
                        style={{ width: 40, height: 26, opacity: 0.8 }} 
                        resizeMode="contain"
                    />
                </View>
            </TouchableOpacity>

            <View style={{ marginTop: 20, padding: 20, backgroundColor: 'rgba(255,138,0,0.1)', borderRadius: 20, borderLeftWidth: 4, borderLeftColor: AppColors.primaryOrange }}>
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14, marginBottom: 5 }}>ℹ️ REGLAMENTO BIO-GP</Text>
                <Text style={{ color: AppColors.textGray, fontSize: 11, lineHeight: 16 }}>
                    1. Cada ronda dura 24h terrestres.{"\n"}
                    2. El guerrero con mayor promedio de HRV al final del día avanza.{"\n"}
                    3. El Campeón recibe 1,280 NTK (Fondo común acumulado).
                </Text>
            </View>
        </ScrollView>
    </View>
  );
}
