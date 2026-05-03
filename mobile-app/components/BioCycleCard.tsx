import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AppStyles, AppColors } from '../constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { BioCycleState } from '../services/BioCycleService';

interface BioCycleCardProps {
    state: BioCycleState;
}

export default function BioCycleCard({ state }: BioCycleCardProps) {
    return (
        <View style={[AppStyles.glassCard, { padding: 20, marginBottom: 25, borderColor: state.color, borderWidth: 1 }]}>
            <View style={AppStyles.rowBetween}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: state.color + '20', alignItems: 'center', justifyContent: 'center', marginRight: 15 }}>
                        <Ionicons name="moon" size={20} color={state.color} />
                    </View>
                    <View>
                        <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold' }]}>Bio-Ciclo: {state.phase}</Text>
                        <Text style={{ color: state.color, fontSize: 11, fontWeight: '600' }}>{state.description.toUpperCase()}</Text>
                    </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[AppStyles.textWhite, { fontSize: 18, fontWeight: 'bold' }]}>Día {state.dayOfCycle}</Text>
                    <Text style={[AppStyles.textGray, { fontSize: 9 }]}>Ciclo Personal</Text>
                </View>
            </View>

            <View style={{ marginTop: 20 }}>
                <View style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                    <View style={{ height: '100%', backgroundColor: state.color, width: `${(state.dayOfCycle / 28) * 100}%` }} />
                </View>
            </View>

            <View style={{ marginTop: 20, gap: 12 }}>
                <View style={styles.insightRow}>
                    <Ionicons name="sparkles" size={14} color={state.color} style={{ marginRight: 10 }} />
                    <Text style={[AppStyles.textGray, { fontSize: 12, flex: 1 }]}>
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>Soberanía IA:</Text> {state.hormonalInsight}
                    </Text>
                </View>

                <View style={styles.gridContainer}>
                    <View style={[styles.gridItem, { backgroundColor: 'rgba(0,0,0,0.2)' }]}>
                        <Ionicons name="nutrition" size={14} color={AppColors.primaryOrange} style={{ marginBottom: 5 }} />
                        <Text style={[AppStyles.textWhite, { fontSize: 10, fontWeight: 'bold' }]}>Nutrición IA</Text>
                        <Text style={[AppStyles.textGray, { fontSize: 9, textAlign: 'center', marginTop: 4 }]}>{state.nutritionAdvice}</Text>
                    </View>
                    <View style={[styles.gridItem, { backgroundColor: 'rgba(0,0,0,0.2)' }]}>
                        <Ionicons name="fitness" size={14} color={AppColors.primaryBioGreen} style={{ marginBottom: 5 }} />
                        <Text style={[AppStyles.textWhite, { fontSize: 10, fontWeight: 'bold' }]}>Entreno IA</Text>
                        <Text style={[AppStyles.textGray, { fontSize: 9, textAlign: 'center', marginTop: 4 }]}>{state.trainingAdvice}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    insightRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 12,
        borderRadius: 12
    },
    gridContainer: {
        flexDirection: 'row',
        gap: 10
    },
    gridItem: {
        flex: 1,
        padding: 12,
        borderRadius: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
    }
});
