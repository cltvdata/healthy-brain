import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Modal, Image, Dimensions } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BioEconomy, NTK_PACKS } from '@/constants/BioEconomy';
import { db, auth } from '@/constants/FirebaseConfig';
import { onSnapshot, doc } from 'firebase/firestore';

export default function PagosScreen() {
  const [selectedPackId, setSelectedPackId] = useState<string>(NTK_PACKS[1].id);
  const [showProofModal, setShowProofModal] = useState(false);
  const [verifyMethod, setVerifyMethod] = useState<'BTC' | 'ZELLE' | null>(null);
  const [balance, setBalance] = useState(0);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;
    const unsubscribe = onSnapshot(doc(db, 'users', auth.currentUser.uid), (snapshot) => {
      if (snapshot.exists()) {
        setBalance(snapshot.data().ntkBalance || 0);
      }
    });
    return () => unsubscribe();
  }, []);

  const selectedPack = NTK_PACKS.find(p => p.id === selectedPackId) || NTK_PACKS[1];

  const handleSquarePayment = async () => {
    if (selectedPack.squareUrl) {
      await Linking.openURL(selectedPack.squareUrl);
    }
  };

  return (
    <ScrollView style={AppStyles.body} contentContainerStyle={{ padding: 20 }}>
      {/* Bio-Finance Header */}
      <View style={[AppStyles.rowBetween, { marginBottom: 30, marginTop: 10 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[AppStyles.textWhite, { fontSize: 22, fontWeight: 'bold' }]}>{balance} <Text style={{ color: AppColors.primaryNeonBlue, fontSize: 14 }}>NTK</Text></Text>
          <Text style={[AppStyles.textGray, { fontSize: 10, letterSpacing: 1 }]}>ADQUIRIR MÁS BIO-ACTIVOS</Text>
        </View>
      </View>

      {/* NTK Utility Info */}
      <View style={[AppStyles.glassCard, { padding: 15, marginBottom: 25, borderColor: AppColors.primaryNeonBlue, borderWidth: 1 }]}>
        <View style={AppStyles.rowCentered}>
          <Ionicons name="flash" size={20} color={AppColors.primaryNeonBlue} style={{ marginRight: 10 }} />
          <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>Los NTK desbloquean Protocolos Elite y Bio-Data IA.</Text>
        </View>
      </View>

      {/* Packs Selection */}
      <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold', marginBottom: 15 }]}>
        1. Elige tu Escala de Valor
      </Text>
      
      {NTK_PACKS.map((pack: any) => (
        <TouchableOpacity 
          key={pack.id} 
          style={[
            AppStyles.glassCard, 
            { padding: 15, marginBottom: 12, borderWidth: selectedPackId === pack.id ? 2 : 1 },
            selectedPackId === pack.id && { borderColor: AppColors.primaryBioGreen }
          ]}
          onPress={() => setSelectedPackId(pack.id)}
        >
          <View style={AppStyles.rowBetween}>
            <View style={{ flex: 1 }}>
              <View style={AppStyles.rowCentered}>
                <Text style={[AppStyles.textWhite, { fontSize: 18, fontWeight: 'bold' }]}>{pack.name}</Text>
                {pack.bonus > 0 && (
                  <View style={{ backgroundColor: 'rgba(0, 255, 128, 0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginLeft: 10 }}>
                    <Text style={{ color: AppColors.primaryBioGreen, fontSize: 10, fontWeight: 'bold' }}>+{pack.bonus}% BIO-POWER</Text>
                  </View>
                )}
              </View>
              <Text style={[AppStyles.textGray, { fontSize: 12, marginTop: 4 }]}>
                {pack.tokens.toLocaleString()} NTK • {pack.description}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: AppColors.primaryBioGreen, fontSize: 20, fontWeight: 'bold' }}>
                ${pack.priceUsd}
              </Text>
              <Text style={[AppStyles.textGray, { fontSize: 10 }]}>USD</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {/* Payment Gateway */}
      <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold', marginBottom: 15, marginTop: 15 }]}>
        2. Canal de Liquidación
      </Text>

      <View style={styles.grid}>
        {/* Square (Mastercard/Visa) */}
        <TouchableOpacity style={styles.methodCard} onPress={handleSquarePayment}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
            <Ionicons name="card" size={24} color="#f7931a" />
          </View>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>Square</Text>
          <Text style={{ color: AppColors.textGray, fontSize: 10 }}>Visa / Master</Text>
        </TouchableOpacity>

        {/* Bitcoin */}
        <TouchableOpacity 
          style={styles.methodCard} 
          onPress={() => {
            setVerifyMethod('BTC');
            setShowProofModal(true);
          }}
        >
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(247, 147, 26, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
            <Ionicons name="logo-bitcoin" size={24} color="#f7931a" />
          </View>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>Bitcoin</Text>
          <Text style={{ color: AppColors.textGray, fontSize: 10 }}>Direct Transfer</Text>
        </TouchableOpacity>

        {/* Zelle */}
        <TouchableOpacity 
          style={styles.methodCard}
          onPress={() => {
            setVerifyMethod('ZELLE');
            setShowProofModal(true);
          }}
        >
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(109, 38, 161, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
            <Ionicons name="paper-plane" size={24} color="#6d26a1" />
          </View>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>Zelle</Text>
          <Text style={{ color: AppColors.textGray, fontSize: 10 }}>Instant Bank</Text>
        </TouchableOpacity>

        {/* Apple/Google Placeholder */}
        <TouchableOpacity style={[styles.methodCard, { opacity: 0.5 }]}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
            <Ionicons name="logo-apple" size={24} color="white" />
          </View>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>In-App</Text>
          <Text style={{ color: AppColors.textGray, fontSize: 10 }}>Coming Soon</Text>
        </TouchableOpacity>
      </View>

      {/* Manual Verification Info */}
      <View style={{ backgroundColor: 'rgba(255, 204, 0, 0.05)', padding: 15, borderRadius: 15, borderLeftWidth: 4, borderLeftColor: '#ffcc00', marginTop: 10 }}>
        <Text style={{ color: '#ffcc00', fontWeight: 'bold', fontSize: 12, marginBottom: 5 }}>IMPORTANTE</Text>
        <Text style={{ color: AppColors.textGray, fontSize: 11, lineHeight: 16 }}>
          Los pagos por Bitcoin y Zelle requieren validación manual. Deberás subir tu comprobante de transferencia para la acreditación de tokens (1-12h).
        </Text>
      </View>

      <View style={{ height: 60 }} />

      {/* Modal de Validación Manual */}
      <Modal visible={showProofModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#111', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, height: '80%' }}>
            <TouchableOpacity onPress={() => setShowProofModal(false)} style={{ alignSelf: 'center', marginBottom: 20 }}>
               <View style={{ width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2 }} />
            </TouchableOpacity>

            {ticketSubmitted ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(0, 255, 128, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                  <Ionicons name="checkmark-circle" size={50} color={AppColors.primaryBioGreen} />
                </View>
                <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 }}>Ticket en Revisión</Text>
                <Text style={{ color: AppColors.textGray, fontSize: 13, textAlign: 'center', lineHeight: 20 }}>
                  Hemos recibido tu comprobante de {verifyMethod}. Los {selectedPack.tokens} NTK se acreditarán en tu cuenta tras la validación manual (1-12h).
                </Text>
                <TouchableOpacity 
                   onPress={() => {
                     setShowProofModal(false);
                     setTicketSubmitted(false);
                   }}
                   style={[AppStyles.glowBtnOrange, { marginTop: 35, width: '100%' }]}
                >
                  <Text style={AppStyles.glowBtnOrangeText}>ENTENDIDO</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold', marginBottom: 10 }}>Validar Pago {verifyMethod}</Text>
                <Text style={{ color: AppColors.textGray, fontSize: 14, marginBottom: 25 }}>
                  Envía <Text style={{ color: 'white', fontWeight: 'bold' }}>${selectedPack.priceUsd} USD</Text> a los datos indicados y sube el comprobante.
                </Text>

                <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 30 }]}>
                   <Text style={{ color: AppColors.primaryNeonBlue, fontWeight: 'bold', marginBottom: 10 }}>DATOS DE RECAUDACIÓN:</Text>
                   <View style={{ backgroundColor: 'black', padding: 15, borderRadius: 10 }}>
                      <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                        {verifyMethod === 'BTC' ? 'bc1q...3jk8 (Bitcoin)' : 'pago@healthybrain.app (Zelle)'}
                      </Text>
                      <Text style={{ color: AppColors.textGray, fontSize: 10, marginTop: 5 }}>COPIAR DIRECCIÓN</Text>
                   </View>
                </View>

                <TouchableOpacity style={{ height: 180, borderRadius: 20, borderStyle: 'dashed', borderWidth: 2, borderColor: AppColors.primaryNeonBlue, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 209, 255, 0.05)' }}>
                   <Ionicons name="cloud-upload" size={40} color={AppColors.primaryNeonBlue} />
                   <Text style={{ color: 'white', fontWeight: 'bold', marginTop: 10 }}>Subir Comprobante</Text>
                   <Text style={{ color: AppColors.textGray, fontSize: 11 }}>JPG, PNG o PDF</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={async () => {
                    try {
                      const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
                      if (auth.currentUser) {
                        await addDoc(collection(db, 'tx_validation'), {
                          userId: auth.currentUser.uid,
                          method: verifyMethod,
                          packId: selectedPackId,
                          requestedTokens: selectedPack.tokens,
                          amountUsd: selectedPack.priceUsd,
                          status: 'PENDING',
                          createdAt: serverTimestamp()
                        });
                        setTicketSubmitted(true);
                      }
                    } catch (e) {
                      alert("Error al enviar la solicitud.");
                      console.error(e);
                    }
                  }}
                  style={[AppStyles.glowBtnOrange, { marginTop: 30 }]}
                >
                  <Text style={AppStyles.glowBtnOrangeText}>Enviar para Acreditación</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  methodCard: {
    width: (Dimensions.get('window').width - 56) / 2,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center'
  }
});
