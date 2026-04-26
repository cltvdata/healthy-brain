import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { db, auth } from '@/constants/FirebaseConfig';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';

export default function BioSyncScreen() {
  const [inputText, setInputText] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const parseAndSync = async () => {
    if (!inputText.trim()) {
      Alert.alert("Bio-Error", "Copia y pega los datos de tu otra app o reloj.");
      return;
    }

    setIsParsing(true);
    
    // Simulación de Procesamiento IA (Regex Parser)
    setTimeout(async () => {
      try {
        const text = inputText.toLowerCase();
        let extractedData: any = { type: 'external_sync', timestamp: serverTimestamp() };
        let ntkReward = 5; // Base reward for syncing

        // 1. Detectar Pasos
        const stepsMatch = text.match(/(\d+[,.]?\d*)\s*(pasos|steps)/);
        if (stepsMatch) {
          extractedData.steps = parseInt(stepsMatch[1].replace(/[,.]/g, ''));
          ntkReward += Math.floor(extractedData.steps / 1000);
        }

        // 2. Detectar Sueño
        const sleepMatch = text.match(/(\d+[,.]?\d*)\s*(horas|hours|h)\s*(de sueño|sleep)/);
        if (sleepMatch) {
          extractedData.sleepHours = parseFloat(sleepMatch[1]);
          ntkReward += 10;
        }

        // 3. Detectar Cardio
        const cardioMatch = text.match(/(\d+)\s*(min|minutos|minutes)\s*(de)?\s*(correr|running|bici|cycling|baile|dance)/);
        if (cardioMatch) {
          extractedData.cardioMinutes = parseInt(cardioMatch[1]);
          extractedData.cardioType = cardioMatch[4].toUpperCase();
          ntkReward += Math.floor(extractedData.cardioMinutes / 2);
        }

        if (!extractedData.steps && !extractedData.sleepHours && !extractedData.cardioMinutes) {
          setIsParsing(false);
          Alert.alert("IA: Datos Insuficientes", "No detecté métricas claras. Intenta copiar el resumen semanal o diario de Apple Health o Google Fit.");
          return;
        }

        // Save to Firebase
        if (!auth.currentUser) return;
        const userId = auth.currentUser.uid;
        
        await addDoc(collection(db, 'users', userId, 'logs'), {
          ...extractedData,
          title: `SYNC EXTERNO: ${Object.keys(extractedData).filter(k => k !== 'type' && k !== 'timestamp').join(', ')}`,
          value: ntkReward,
          unit: 'NTK+'
        });

        // Update Balance
        await updateDoc(doc(db, 'users', userId), {
          ntkBalance: increment(ntkReward)
        });

        setIsParsing(false);
        Alert.alert("Sincronización Exitosa", `La IA ha procesado tus datos externos. +${ntkReward} NTK acreditados.`);
        router.back();

      } catch (error) {
        console.error(error);
        setIsParsing(false);
        Alert.alert("Error de Bio-Nube", "No se pudo sincronizar el historial.");
      }
    }, 2000);
  };

  return (
    <View style={AppStyles.body}>
      <ScrollView contentContainerStyle={{ padding: 25, paddingTop: 60 }}>
        <View style={AppStyles.rowBetween}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>BIO-SYNC IA</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={[AppStyles.glassCard, { marginTop: 30, padding: 20 }]}>
           <Ionicons name="sparkles" size={32} color={AppColors.primaryNeonBlue} style={{ alignSelf: 'center', marginBottom: 15 }} />
           <Text style={[AppStyles.textWhite, { textAlign: 'center', fontSize: 18, fontWeight: 'bold' }]}>Importador Omnicanal</Text>
           <Text style={[AppStyles.textGray, { textAlign: 'center', marginTop: 10, fontSize: 13 }]}>
             Copia y pega el resumen de tu Apple Watch, Garmin o cualquier app de salud. Nuestra IA extraerá las métricas para completar tu historial biográfico.
           </Text>
        </View>

        <View style={{ marginTop: 30 }}>
          <Text style={[AppStyles.textGray, { fontSize: 10, fontWeight: 'bold', marginBottom: 10, letterSpacing: 1 }]}>DATOS EXTERNOS (PASTE HERE)</Text>
          <TextInput
            style={[AppStyles.highContrastInput, { height: 200, textAlignVertical: 'top', fontSize: 14 }]}
            placeholder="Ej: 'Today 12,500 steps, 45 min running, 7.5h sleep...'"
            placeholderTextColor="rgba(255,255,255,0.2)"
            multiline
            value={inputText}
            onChangeText={setInputText}
          />
        </View>

        <TouchableOpacity 
          style={[AppStyles.glowBtnBlue, { marginTop: 30, opacity: isParsing ? 0.6 : 1 }]} 
          onPress={parseAndSync}
          disabled={isParsing}
        >
          <Text style={AppStyles.glowBtnBlueText}>{isParsing ? "PROCESANDO BIO-DATA..." : "SINCRONIZAR CON LA NUBE"}</Text>
        </TouchableOpacity>

        <View style={{ marginTop: 40, padding: 20, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 15 }}>
           <Text style={[AppStyles.textWhite, { fontSize: 12, fontWeight: 'bold', marginBottom: 10 }]}>💡 TIPS DE SINCRONIZACIÓN</Text>
           <Text style={AppStyles.textGray}>• Copia el texto directamente desde la app de salud.</Text>
           <Text style={AppStyles.textGray}>• Incluye unidades (steps, horas, km).</Text>
           <Text style={AppStyles.textGray}>• No te preocupes por el orden, la IA lo ordenará.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2
  }
});
