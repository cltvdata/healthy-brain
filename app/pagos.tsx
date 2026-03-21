import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function PagosScreen() {
  const [selectedPlan, setSelectedPlan] = useState<'diario' | 'mensual' | 'anual'>('mensual');

  type Plan = { title: string; price: string; period: string; highlight?: boolean };

  const plans: Record<'diario' | 'mensual' | 'anual', Plan> = {
    diario: { title: 'Pase Diario', price: '$1.00', period: '/ día' },
    mensual: { title: 'Premium Mensual', price: '$30.00', period: '/ mes' },
    anual: { title: 'Premium Anual (15% OFF)', price: '$306.00', period: '/ año', highlight: true }
  };

  return (
    <ScrollView style={AppStyles.body} contentContainerStyle={{ padding: 20 }}>
      {/* Header */}
      <View style={[AppStyles.rowCentered, { marginBottom: 30, marginTop: 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 15 }}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={[AppStyles.textWhite, { fontSize: 24, fontWeight: 'bold' }]}>Premium Checkout</Text>
      </View>

      {/* Pricing Plans */}
      <Text style={[AppStyles.textWhite, { fontSize: 18, fontWeight: 'bold', marginBottom: 15 }]}>
        1. Selecciona tu plan
      </Text>
      
      {Object.entries(plans).map(([key, plan]) => (
        <TouchableOpacity 
          key={key} 
          style={[
            AppStyles.glassCard, 
            { padding: 15, marginBottom: 15, borderWidth: selectedPlan === key ? 2 : 1 },
            selectedPlan === key && { borderColor: AppColors.primaryOrange }
          ]}
          onPress={() => setSelectedPlan(key as any)}
        >
          <View style={AppStyles.rowBetween}>
            <View>
              <Text style={[AppStyles.textWhite, { fontSize: 18, fontWeight: '600' }]}>{plan.title}</Text>
              {plan.highlight && (
                <Text style={{ color: AppColors.primaryNeonBlue, fontSize: 12, marginTop: 4 }}>
                  Ahorras $54 al año
                </Text>
              )}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[AppStyles.textWhite, { fontSize: 22, fontWeight: 'bold', color: AppColors.primaryOrange }]}>
                {plan.price}
              </Text>
              <Text style={AppStyles.textGray}>{plan.period}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {/* Payment Methods */}
      <Text style={[AppStyles.textWhite, { fontSize: 18, fontWeight: 'bold', marginBottom: 15, marginTop: 10 }]}>
        2. Método de Pago
      </Text>

      <View style={styles.paymentMethodsGrid}>
        {[
          { icon: 'card', name: 'Stripe (Card)' },
          { icon: 'logo-google', name: 'Google Pay' },
          { icon: 'cash', name: 'CashApp' },
          { icon: 'send', name: 'Zelle' },
        ].map((method) => (
          <TouchableOpacity key={method.name} style={styles.paymentMethodCard}>
            <Ionicons name={method.icon as any} size={28} color={AppColors.primaryNeonBlue} />
            <Text style={[AppStyles.textWhite, { marginTop: 8, fontSize: 12 }]}>{method.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bitcoin QR Placeholder */}
      <View style={[AppStyles.glassCard, { padding: 20, alignItems: 'center', marginTop: 15 }]}>
        <Ionicons name="qr-code" size={100} color="white" />
        <Text style={[AppStyles.textWhite, { marginTop: 15, fontSize: 16, fontWeight: 'bold' }]}>Pago con Bitcoin</Text>
        <Text style={[AppStyles.textGray, { textAlign: 'center', marginTop: 5, fontSize: 12 }]}>
          Escanea este código QR desde tu Wallet para enviar BTC.
        </Text>
      </View>

      {/* Checkout Button */}
      <TouchableOpacity style={[AppStyles.glowBtnOrange, { marginTop: 30, marginBottom: 40 }]}>
        <Text style={AppStyles.glowBtnOrangeText}>Pagar {plans[selectedPlan].price}</Text>
      </TouchableOpacity>
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  paymentMethodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  paymentMethodCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  }
});
