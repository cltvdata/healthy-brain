import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { db, auth } from '@/constants/FirebaseConfig';
import { collection, query, orderBy, limit, onSnapshot, doc } from 'firebase/firestore';
import Svg, { Rect, G, Line } from 'react-native-svg';

const { width } = Dimensions.get('window');

/**
 * Income Mini Chart (Grasa bars)
 */
const IncomeChart = () => {
    const data = [120, 450, 300, 800, 200, 650, 400]; // MOCKED for demo
    const max = 1000;
    const barWidth = (width - 100) / 7;

    return (
        <View style={{ height: 120, alignItems: 'flex-end', flexDirection: 'row', gap: 8, paddingHorizontal: 10 }}>
            {data.map((val, i) => (
                <View key={i} style={{ alignItems: 'center' }}>
                    <View 
                        style={{ 
                            width: barWidth, 
                            height: (val / max) * 100, 
                            backgroundColor: i === 3 ? AppColors.primaryOrange : AppColors.primaryBioGreen + '40',
                            borderRadius: 6,
                            borderColor: i === 3 ? AppColors.primaryOrange : 'transparent',
                            borderWidth: 1
                        }} 
                    />
                    <Text style={{ color: AppColors.textGray, fontSize: 8, marginTop: 5 }}>{['L','M','X','J','V','S','D'][i]}</Text>
                </View>
            ))}
        </View>
    );
};

export default function WalletScreen() {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth.currentUser) return;

        // Balance Sync
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const unsubUser = onSnapshot(userRef, (snap) => {
            if (snap.exists()) setBalance(snap.data().ntkBalance || 0);
        });

        // Transactions Sync (Using logs as proxy for now)
        const logsRef = collection(userRef, 'logs');
        const q = query(logsRef, orderBy('timestamp', 'desc'), limit(20));
        const unsubLogs = onSnapshot(q, (snap) => {
            setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        });

        return () => { unsubUser(); unsubLogs(); };
    }, []);

    const getRank = (bal: number) => {
        if (bal > 5000) return { title: 'BIO-ORÁCULO', icon: 'diamond', color: '#00D1FF' };
        if (bal > 1500) return { title: 'ELITE GUARDIAN', icon: 'shield-checkmark', color: AppColors.primaryOrange };
        return { title: 'MINERO DE DOPAMINA', icon: 'flash', color: AppColors.primaryBioGreen };
    };

    const rank = getRank(balance);

    return (
        <View style={AppStyles.body}>
            <ScrollView contentContainerStyle={{ padding: 25, paddingTop: 60 }}>
                {/* Header Navigation */}
                <View style={[AppStyles.rowBetween, { marginBottom: 30 }]}>
                    <TouchableOpacity onPress={() => router.back()} style={{ padding: 10 }}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>BIO-WALLET PRO</Text>
                    <TouchableOpacity style={{ padding: 10 }}>
                        <Ionicons name="settings-outline" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Main Balance Card */}
                <View style={[AppStyles.glassCard, { padding: 30, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)', borderColor: rank.color + '40', borderWidth: 2 }]}>
                    <View style={{ position: 'absolute', top: -15, backgroundColor: rank.color, paddingHorizontal: 15, paddingVertical: 4, borderRadius: 20 }}>
                        <Text style={{ color: 'black', fontSize: 10, fontWeight: 'black' }}>{rank.title}</Text>
                    </View>
                    
                    <Text style={{ color: AppColors.textGray, fontSize: 12, fontWeight: 'bold', letterSpacing: 2 }}>TOTAL RECURSOS NTK</Text>
                    <Text style={{ color: 'white', fontSize: 48, fontWeight: '900', marginVertical: 10 }}>{balance.toLocaleString()}</Text>
                    <View style={AppStyles.rowCentered}>
                        <Ionicons name={rank.icon as any} size={16} color={rank.color} style={{ marginRight: 8 }} />
                        <Text style={{ color: rank.color, fontWeight: 'bold', fontSize: 12 }}>RANGO VITAL ACTIVO</Text>
                    </View>
                </View>

                {/* Income Flow Section */}
                <View style={{ marginTop: 40 }}>
                    <View style={[AppStyles.rowBetween, { marginBottom: 20 }]}>
                        <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>FLUJO DE BIO-ACTIVOS</Text>
                        <Text style={{ color: AppColors.textGray, fontSize: 10 }}>ÚLTIMOS 7 DÍAS</Text>
                    </View>
                    <View style={[AppStyles.glassCard, { padding: 20 }]}>
                        <IncomeChart />
                        <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 20 }} />
                        <View style={AppStyles.rowBetween}>
                            <View>
                                <Text style={{ color: AppColors.textGray, fontSize: 9 }}>PROMEDIO DIARIO</Text>
                                <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>+245 NTK</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={{ color: AppColors.textGray, fontSize: 9 }}>VALOR ESTIMADO</Text>
                                <Text style={{ color: AppColors.primaryBioGreen, fontSize: 18, fontWeight: 'bold' }}>$12.50 USD</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Transaction History */}
                <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold', marginTop: 40, marginBottom: 20 }}>HISTORIAL DE TRANSACCIONES</Text>
                
                {loading ? (
                    <ActivityIndicator color={AppColors.primaryBioGreen} />
                ) : (
                    <View style={{ gap: 15 }}>
                        {transactions.length === 0 ? (
                            <Text style={{ color: AppColors.textGray, textAlign: 'center', marginTop: 20 }}>No se detectan movimientos.</Text>
                        ) : (
                            transactions.map((tx, i) => (
                                <View key={tx.id} style={[AppStyles.glassCard, { padding: 15, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 3, borderLeftColor: tx.value > 0 ? AppColors.primaryBioGreen : AppColors.primaryOrange }]}>
                                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', marginRight: 15 }}>
                                        <Ionicons 
                                            name={tx.type === 'focus' ? 'pulse' : tx.type === 'diet' ? 'restaurant' : 'swap-horizontal'} 
                                            size={20} 
                                            color="white" 
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>{tx.type === 'focus' ? 'Mina de Enfoque' : tx.type === 'diet' ? 'Inyección Nutricional' : tx.title || 'Operación Bio'}</Text>
                                        <Text style={{ color: AppColors.textGray, fontSize: 10 }}>{tx.timestamp?.toDate ? tx.timestamp.toDate().toLocaleDateString() : 'Reciente'}</Text>
                                    </View>
                                    <Text style={{ color: tx.value > 0 ? AppColors.primaryBioGreen : AppColors.primaryOrange, fontWeight: 'bold', fontSize: 16 }}>
                                        {tx.value > 0 ? '+' : ''}{tx.value || 0}
                                    </Text>
                                </View>
                            ))
                        )}
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}
