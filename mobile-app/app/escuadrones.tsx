import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator, Alert, TextInput } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { db, auth } from '@/constants/FirebaseConfig';
import { 
  collection, doc, getDoc, getDocs, query, where, 
  setDoc, updateDoc, arrayUnion, serverTimestamp, 
  onSnapshot, limit, orderBy
} from 'firebase/firestore';
import { SynergyService } from '@/services/SynergyService';

const { width } = Dimensions.get('window');

export default function EscuadronesScreen() {
  const [squad, setSquad] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [availableSquads, setAvailableSquads] = useState<any[]>([]);
  const [newSquadName, setNewSquadName] = useState('');
  const [creating, setCreating] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Listen for current user squad
    const unsubscribeUser = onSnapshot(doc(db, 'users', user.uid), async (userSnap) => {
      if (userSnap.exists() && userSnap.data().squadId) {
        const sId = userSnap.data().squadId;
        const sSnap = await getDoc(doc(db, 'squads', sId));
        setSquad({ id: sId, ...sSnap.data() });
      } else {
        setSquad(null);
      }
      setLoading(false);
    });

    // Load available squads
    const q = query(collection(db, 'squads'), limit(10));
    const unsubscribeSquads = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAvailableSquads(list);
    });

    return () => {
      unsubscribeUser();
      unsubscribeSquads();
    };
  }, []);

  const handleCreateSquad = async () => {
    if (!newSquadName.trim()) return Alert.alert("Error", "Ingresa un nombre para tu escuadrón");
    const user = auth.currentUser;
    if (!user) return;

    setCreating(true);
    try {
      const squadId = `sqd_${Date.now()}`;
      const squadRef = doc(db, 'squads', squadId);
      
      const newSquadData = {
        name: newSquadName,
        leaderId: user.uid,
        members: [user.uid],
        avgHrv: 0,
        totalPoints: 0,
        createdAt: serverTimestamp()
      };

      await setDoc(squadRef, newSquadData);
      await updateDoc(doc(db, 'users', user.uid), { squadId });
      
      setNewSquadName('');
      Alert.alert("¡Escuadrón Creado!", `Bienvenido al comando ${newSquadName}. Invita a 4 guerreros más.`);
    } catch (e) {
      Alert.alert("Error", "No se pudo crear el escuadrón.");
    } finally {
      setCreating(false);
    }
  };

  const handleJoinSquad = async (sId: string, sName: string) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const sRef = doc(db, 'squads', sId);
      const sSnap = await getDoc(sRef);
      if (sSnap.exists() && sSnap.data().members.length >= 5) {
        return Alert.alert("Squad Lleno", "Este escuadrón ya tiene 5 miembros.");
      }

      await updateDoc(sRef, { members: arrayUnion(user.uid) });
      await updateDoc(doc(db, 'users', user.uid), { squadId: sId });
      Alert.alert("¡Unido!", `Ahora eres parte de ${sName}.`);
    } catch (e) {
      Alert.alert("Error", "No se pudo unir al escuadrón.");
    }
  };

  if (loading) return <View style={[AppStyles.body, { justifyContent: 'center' }]}><ActivityIndicator color={AppColors.primaryOrange} /></View>;

  return (
    <View style={AppStyles.body}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 20 }}>CUARTEL DE ESCUADRONES</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {squad ? (
          <View>
            <View style={[AppStyles.glassCard, { padding: 25, borderColor: AppColors.primaryOrange, borderWidth: 1 }]}>
               <Text style={[AppStyles.textGray, { fontSize: 10, letterSpacing: 2, marginBottom: 5 }]}>TU ESCUADRÓN ACTIVO</Text>
               <Text style={[AppStyles.textWhite, { fontSize: 28, fontWeight: 'bold', marginBottom: 20 }]}>{squad.name}</Text>
               
               <View style={AppStyles.rowBetween}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: AppColors.primaryNeonBlue, fontSize: 18, fontWeight: 'bold' }}>{squad.avgHrv || '--'}</Text>
                    <Text style={{ color: AppColors.textGray, fontSize: 9 }}>RESILIENCIA GRUPAL</Text>
                  </View>
                  <View style={{ width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: AppColors.primaryOrange, fontSize: 18, fontWeight: 'bold' }}>{squad.members.length}/5</Text>
                    <Text style={{ color: AppColors.textGray, fontSize: 9 }}>GUERREROS</Text>
                  </View>
                  <View style={{ width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: AppColors.primaryBioGreen, fontSize: 18, fontWeight: 'bold' }}>{squad.totalPoints || 0}</Text>
                    <Text style={{ color: AppColors.textGray, fontSize: 9 }}>MINADO TOTAL</Text>
                  </View>
               </View>

               <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: AppColors.primaryBioGreen }} />
                  <Text style={{ color: AppColors.primaryBioGreen, fontSize: 10, fontWeight: 'bold', letterSpacing: 1 }}>SISTEMA DE MINADO ACTIVO</Text>
               </View>
            </View>

            {/* Bio-Evidence Section */}
            <View style={[AppStyles.glassCard, { marginTop: 20, padding: 20 }]}>
              <Text style={[AppStyles.textWhite, { fontSize: 14, fontWeight: 'bold', marginBottom: 12 }]}>📸 BIO-EVIDENCIA DEL DÍA</Text>
              <Text style={[AppStyles.textGray, { fontSize: 11, marginBottom: 15 }]}>Sube una evidencia (comida, entreno, sol) para validar tu hito y ganar NTK extra.</Text>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <TouchableOpacity 
                  onPress={() => setIsPublic(!isPublic)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}
                >
                  <Ionicons 
                    name={isPublic ? "radio-button-on" : "radio-button-off"} 
                    size={20} 
                    color={isPublic ? AppColors.primaryBioGreen : AppColors.textGray} 
                  />
                  <View>
                    <Text style={{ color: 'white', fontSize: 13 }}>Compartir en Comunidad Global</Text>
                    <Text style={{ color: AppColors.textGray, fontSize: 10 }}>{isPublic ? 'Visible para todos' : 'Privado (Solo tu Escuadrón)'}</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[AppStyles.glowBtnBioGreen, uploadingEvidence && { opacity: 0.7 }]}
                disabled={uploadingEvidence}
                onPress={async () => {
                  setUploadingEvidence(true);
                  try {
                    // Simulate processing
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    if (auth.currentUser) {
                      // postAchievement internally calls rewardUser
                      await SynergyService.postAchievement(
                        'evidence',
                        `Ha validado un hito biográfico mediante bio-evidencia ${isPublic ? 'pública' : 'de escuadrón'}.`,
                        25
                      );
                    }

                    Alert.alert("¡Evidencia Subida!", `Tu logro ha sido compartido con el alcance: ${isPublic ? 'Público' : 'Escuadrón'}. Has ganado 25 NTK.`);
                  } catch (e) {
                    Alert.alert("Error", "No se pudo procesar la evidencia.");
                  } finally {
                    setUploadingEvidence(false);
                  }
                }}
              >
                <Text style={AppStyles.glowBtnBioGreenText}>
                  {uploadingEvidence ? 'VALIDANDO...' : 'SUBIR BIO-EVIDENCIA'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={{ marginTop: 20, padding: 15, backgroundColor: 'rgba(255,0,0,0.1)', borderRadius: 15, alignItems: 'center' }}
              onPress={() => Alert.alert("Abandonar", "¿Seguro que quieres dejar este escuadrón?")}
            >
              <Text style={{ color: '#ff4444', fontWeight: 'bold', fontSize: 12 }}>ABANDONAR COMMANDO</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {/* Create Squad */}
            <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 30 }]}>
              <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold', marginBottom: 15 }]}>FUNDAR NUEVO ESCUADRÓN</Text>
              <TextInput 
                style={[AppStyles.highContrastInput, { marginBottom: 15 }]}
                placeholder="Nombre del Commando (ej: LOBOS BIO)"
                placeholderTextColor="#666"
                value={newSquadName}
                onChangeText={setNewSquadName}
              />
              <TouchableOpacity 
                onPress={handleCreateSquad}
                disabled={creating}
                style={[AppStyles.glowBtnOrange, { padding: 15 }]}
              >
                <Text style={AppStyles.glowBtnOrangeText}>{creating ? 'FUNDANDO...' : 'FUNDAR ESCUADRÓN'}</Text>
              </TouchableOpacity>
            </View>

            {/* List Available */}
            <Text style={[AppStyles.textWhite, { fontSize: 14, fontWeight: 'bold', marginBottom: 15, letterSpacing: 1 }]}>ESCUADRONES DISPONIBLES</Text>
            {availableSquads.map(s => (
              <TouchableOpacity 
                key={s.id} 
                onPress={() => handleJoinSquad(s.id, s.name)}
                style={[AppStyles.glassCard, { padding: 15, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
              >
                <View>
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>{s.name}</Text>
                  <Text style={{ color: AppColors.textGray, fontSize: 10 }}>{s.members.length}/5 Miembros</Text>
                </View>
                <Ionicons name="enter-outline" size={20} color={AppColors.primaryNeonBlue} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
