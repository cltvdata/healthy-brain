import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Svg, { Polygon, Line, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

const RANKING = [
  { id: 1, name: 'Alex_Optimization', score: 9.2, xp: 4500, avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: 2, name: 'Maria_BioHacker', score: 8.8, xp: 3120, avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: 3, name: 'Tú (Guerrero)', score: 7.4, xp: 150, avatar: null },
];

export default function ComunidadScreen() {
  // Radar data
  const center = 100;
  const radius = 80;
  const points = [
    { label: 'Dopamina', val: 85 },
    { label: 'HRV', val: 74 },
    { label: 'Metabolismo', val: 90 },
    { label: 'Músculo', val: 65 },
    { label: 'Focus', val: 80 },
  ];

  const getPoint = (val: number, index: number, total: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const r = (val / 100) * radius;
    return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
  };

  const polyPoints = points.map((p, i) => getPoint(p.val, i, points.length)).join(' ');
  const avgPoints = points.map((p, i) => getPoint(60, i, points.length)).join(' ');

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
        <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', textTransform: 'uppercase' }}>Bio Network</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Radar Chart */}
        <View style={[AppStyles.glassCard, { padding: 20, alignItems: 'center', marginBottom: 30, borderColor: 'rgba(0, 209, 255, 0.2)', backgroundColor: 'rgba(0, 209, 255, 0.05)' }]}>
           <Text style={[AppStyles.textWhite, { fontSize: 12, fontWeight: 'bold', letterSpacing: 2, marginBottom: 20, textTransform: 'uppercase' }]}>Huella Biológica vs Global</Text>
           
           <Svg height="200" width="200" viewBox="0 0 200 200">
             {/* Web */}
             {[0.2, 0.4, 0.6, 0.8, 1].map((step) => (
               <Polygon
                 key={step}
                 points={points.map((_, i) => getPoint(100 * step, i, points.length)).join(' ')}
                 fill="none"
                 stroke="rgba(255,255,255,0.1)"
                 strokeWidth="1"
               />
             ))}
             {/* Global Avg */}
             <Polygon
               points={avgPoints}
               fill="rgba(255,255,255,0.05)"
               stroke="rgba(255,255,255,0.2)"
               strokeWidth="1"
               strokeDasharray="4,4"
             />
             {/* User Data */}
             <Polygon
               points={polyPoints}
               fill="rgba(0, 209, 255, 0.2)"
               stroke={AppColors.primaryNeonBlue}
               strokeWidth="2"
             />
             {points.map((p, i) => {
                const pt = getPoint(p.val, i, points.length).split(',');
                return <Circle key={i} cx={pt[0]} cy={pt[1]} r="3" fill={AppColors.primaryNeonBlue} />;
             })}
           </Svg>

           <Text style={[AppStyles.textGray, { fontSize: 10, marginTop: 20 }]}>Estás en el <Text style={{ color: AppColors.primaryNeonBlue, fontWeight: 'bold' }}>TOP 12%</Text> de optimización</Text>
        </View>

        {/* Leaderboard */}
        <Text style={[AppStyles.textWhite, { fontSize: 12, fontWeight: 'bold', letterSpacing: 3, marginBottom: 15, textTransform: 'uppercase' }]}>Ranking de Soberanía</Text>
        
        {RANKING.map((user, idx) => (
          <View key={user.id} style={[AppStyles.glassCard, { padding: 15, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderColor: user.name.includes('Tú') ? AppColors.primaryOrange : AppColors.borderGlass }]}>
            <Text style={{ width: 25, color: idx === 0 ? '#f59e0b' : AppColors.textGray, fontWeight: 'bold', fontSize: 16 }}>{user.id}</Text>
            <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)', marginRight: 15, overflow: 'hidden' }}>
               {user.avatar ? (
                 <Image source={{ uri: user.avatar }} style={{ width: '100%', height: '100%' }} />
               ) : (
                 <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                   <Ionicons name="person" size={20} color={AppColors.primaryOrange} />
                 </View>
               )}
            </View>
            <View style={{ flex: 1 }}>
               <Text style={[AppStyles.textWhite, { fontSize: 13, fontWeight: 'bold' }]}>{user.name}</Text>
               <Text style={[AppStyles.textGray, { fontSize: 10 }]}>{user.score} SOBERANÍA</Text>
            </View>
            <Text style={{ color: 'white', fontSize: 11, fontWeight: 'bold', fontStyle: 'italic' }}>{user.xp} XP</Text>
          </View>
        ))}

        {/* Activity Feed */}
        <View style={{ marginTop: 20 }}>
           <Text style={[AppStyles.textWhite, { fontSize: 12, fontWeight: 'bold', letterSpacing: 2, marginBottom: 15, textTransform: 'uppercase' }]}>Hitos de la Red</Text>
           <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, paddingHorizontal: 20 }}>
              <View style={[AppStyles.glassCard, { width: 180, padding: 15, marginRight: 15, alignItems: 'center' }]}>
                 <Ionicons name="star" size={20} color={AppColors.primaryNeonBlue} style={{ marginBottom: 8 }} />
                 <Text style={[AppStyles.textWhite, { fontSize: 10, fontWeight: 'bold' }]}>Dopamine Peak!</Text>
                 <Text style={[AppStyles.textGray, { fontSize: 9, textAlign: 'center' }]}>Erick desbloqueó Meta de Sueño</Text>
              </View>
              <View style={[AppStyles.glassCard, { width: 180, padding: 15, marginRight: 15, alignItems: 'center' }]}>
                 <Ionicons name="flame" size={20} color={AppColors.primaryOrange} style={{ marginBottom: 8 }} />
                 <Text style={[AppStyles.textWhite, { fontSize: 10, fontWeight: 'bold' }]}>Bio-Mastery</Text>
                 <Text style={[AppStyles.textGray, { fontSize: 9, textAlign: 'center' }]}>Sarah completó Rutina 5D</Text>
              </View>
           </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}
