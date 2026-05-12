import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { AppStyles, AppColors } from '../constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { db, auth } from '../constants/FirebaseConfig';
import { doc, updateDoc, increment, onSnapshot } from 'firebase/firestore';

const { width } = Dimensions.get('window');

interface BioHydrationWidgetProps {
    goal: number; // in Liters
}

export default function BioHydrationWidget({ goal = 2.5 }: BioHydrationWidgetProps) {
    const [currentLiters, setCurrentLiters] = useState(0);
    const [pulseAnim] = useState(new Animated.Value(1));

    useEffect(() => {
        if (!auth.currentUser) return;
        
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const unsubscribe = onSnapshot(userRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                if (data.todaysHydration !== undefined) {
                    setCurrentLiters(data.todaysHydration);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    const addWater = async (amount: number) => {
        if (!auth.currentUser) return;
        
        const newLiters = Math.min(goal, currentLiters + amount);
        setCurrentLiters(newLiters);
        
        // Pulse effect
        Animated.sequence([
            Animated.timing(pulseAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
            Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
            todaysHydration: increment(amount),
            ntkBalance: increment(2) // Small reward for hydration
        });
    };

    const progress = Math.min(1, currentLiters / goal);

    return (
        <View style={[AppStyles.glassCard, styles.container]}>
            <LinearGradient
                colors={['rgba(0, 209, 255, 0.1)', 'transparent']}
                style={StyleSheet.absoluteFill}
            />
            
            <View style={AppStyles.rowBetween}>
                <View>
                    <Text style={styles.label}>HIDRATACIÓN CELULAR</Text>
                    <Text style={styles.value}>{currentLiters.toFixed(1)} / {goal.toFixed(1)} L</Text>
                </View>
                <Animated.View style={[styles.iconBox, { transform: [{ scale: pulseAnim }] }]}>
                    <Ionicons name="water" size={24} color={AppColors.primaryNeonBlue} />
                </Animated.View>
            </View>

            <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>

            <View style={styles.controls}>
                <TouchableOpacity onPress={() => addWater(0.25)} style={styles.addBtn}>
                    <Text style={styles.addText}>+250ml</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => addWater(0.5)} style={styles.addBtn}>
                    <Text style={styles.addText}>+500ml</Text>
                </TouchableOpacity>
            </View>
            
            <Text style={styles.hint}>
                {progress >= 1 ? '¡Meta alcanzada! Sinergia óptima.' : 'Mantén tus neuronas hidratadas para máximo foco.'}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        marginBottom: 20,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: 'rgba(0, 209, 255, 0.2)',
        overflow: 'hidden'
    },
    label: {
        color: AppColors.primaryNeonBlue,
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 1.5,
        marginBottom: 4
    },
    value: {
        color: 'white',
        fontSize: 22,
        fontWeight: '900'
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0, 209, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    progressTrack: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 4,
        marginTop: 20,
        overflow: 'hidden'
    },
    progressFill: {
        height: '100%',
        backgroundColor: AppColors.primaryNeonBlue,
        borderRadius: 4
    },
    controls: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 20
    },
    addBtn: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingVertical: 12,
        borderRadius: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
    },
    addText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12
    },
    hint: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        marginTop: 15,
        textAlign: 'center',
        fontStyle: 'italic'
    }
});
