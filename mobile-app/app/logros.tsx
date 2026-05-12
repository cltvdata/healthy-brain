import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { db, auth } from '@/constants/FirebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import { ACHIEVEMENTS, TIERS, AchievementService, Achievement } from '@/services/AchievementService';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'all', label: 'Todos', icon: 'apps' },
  { id: 'streak', label: 'Racha', icon: 'flame' },
  { id: 'score', label: 'Score', icon: 'pulse' },
  { id: 'social', label: 'Social', icon: 'people' },
  { id: 'exploration', label: 'Explorar', icon: 'compass' },
  { id: 'tournament', label: 'Torneos', icon: 'trophy' },
];

export default function LogrosScreen() {
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [totalNTK, setTotalNTK] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const unsubscribe = onSnapshot(doc(db, 'users', auth.currentUser.uid), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setUnlockedIds(data.unlockedAchievements || []);
        setTotalNTK(data.ntkBalance || 0);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredAchievements = selectedCategory === 'all' 
    ? ACHIEVEMENTS 
    : ACHIEVEMENTS.filter(a => a.category === selectedCategory as any);

  const unlockedCount = unlockedIds.length;
  const totalAchievements = ACHIEVEMENTS.length;
  const progressPercent = (unlockedCount / totalAchievements) * 100;

  const tierProgress = AchievementService.getTierProgress(unlockedIds);

  return (
    <View style={AppStyles.body}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Header */}
        <View style={{ padding: 20, paddingTop: 60 }}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={{ marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
            <Text style={[AppStyles.textWhite, { fontSize: 18, fontWeight: 'bold' }]}>Logros Bio-Soberanos</Text>
          </TouchableOpacity>

          {/* Progress Card */}
          <LinearGradient
            colors={['rgba(19, 236, 91, 0.15)', 'rgba(0, 0, 0, 0)']}
            style={styles.progressCard}
          >
            <View style={styles.progressHeader}>
              <View>
                <Text style={[AppStyles.textGray, { fontSize: 10, letterSpacing: 2 }]}>PROGRESO DE LOGROS</Text>
                <Text style={[AppStyles.textWhite, { fontSize: 28, fontWeight: 'bold', marginTop: 5 }]}>
                  {unlockedCount} <Text style={{ color: AppColors.primaryBioGreen }}>/ {totalAchievements}</Text>
                </Text>
              </View>
              <View style={styles.tierBadge}>
                <Text style={[styles.tierText, { color: TIERS.legend.color }]}>{tierProgress.current}</Text>
              </View>
            </View>
            
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>
            
            <View style={[AppStyles.rowBetween, { marginTop: 15 }]}>
              <Text style={[AppStyles.textGray, { fontSize: 11 }]}>Recompensas acumuladas</Text>
              <Text style={{ color: AppColors.primaryOrange, fontWeight: 'bold' }}>
                +{totalNTK} NTK
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, marginBottom: 20 }}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              style={[
                styles.categoryChip,
                selectedCategory === cat.id && styles.categoryChipActive
              ]}
            >
              <Ionicons 
                name={cat.icon as any} 
                size={16} 
                color={selectedCategory === cat.id ? AppColors.primaryBioGreen : AppColors.textGray} 
              />
              <Text style={[
                styles.categoryChipText,
                selectedCategory === cat.id && styles.categoryChipTextActive
              ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Achievements Grid */}
        <View style={{ paddingHorizontal: 20 }}>
          {filteredAchievements.map((achievement) => {
            const isUnlocked = unlockedIds.includes(achievement.id);
            const tier = TIERS[achievement.tier];
            
            return (
              <View 
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  isUnlocked && { borderColor: tier.color, backgroundColor: tier.bg }
                ]}
              >
                <View style={[
                  styles.achievementIcon,
                  { backgroundColor: isUnlocked ? tier.color : 'rgba(255,255,255,0.05)' }
                ]}>
                  <Ionicons 
                    name={achievement.icon as any} 
                    size={24} 
                    color={isUnlocked ? 'black' : AppColors.textGray} 
                  />
                </View>
                
                <View style={{ flex: 1, marginLeft: 15 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={[AppStyles.textWhite, { fontSize: 14, fontWeight: 'bold' }]}>
                      {achievement.title}
                    </Text>
                    <View style={[styles.tierDot, { backgroundColor: tier.color }]} />
                  </View>
                  <Text style={[AppStyles.textGray, { fontSize: 11, marginTop: 2 }]}>
                    {achievement.description}
                  </Text>
                </View>
                
                <View style={{ alignItems: 'flex-end' }}>
                  {isUnlocked ? (
                    <View style={styles.unlockedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color={AppColors.primaryBioGreen} />
                      <Text style={{ color: AppColors.primaryBioGreen, fontSize: 10, fontWeight: 'bold', marginLeft: 4 }}>OK</Text>
                    </View>
                  ) : (
                    <View style={styles.lockedBadge}>
                      <Ionicons name="lock-closed" size={12} color={AppColors.textGray} />
                    </View>
                  )}
                  <Text style={[styles.rewardText, { color: isUnlocked ? AppColors.primaryOrange : AppColors.textGray }]}>
                    +{achievement.reward} NTK
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Stats Summary */}
        <View style={{ padding: 20, marginTop: 10 }}>
          <Text style={[AppStyles.textWhite, { fontSize: 16, fontWeight: 'bold', marginBottom: 15 }]}>
            Desglose por Categoría
          </Text>
          
          {CATEGORIES.slice(1).map((cat) => {
            const categoryAchievements = ACHIEVEMENTS.filter(a => a.category === cat.id);
            const unlockedInCategory = categoryAchievements.filter(a => unlockedIds.includes(a.id));
            const percent = categoryAchievements.length > 0 
              ? (unlockedInCategory.length / categoryAchievements.length) * 100 
              : 0;
            
            return (
              <View key={cat.id} style={styles.categoryRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Ionicons name={cat.icon as any} size={18} color={AppColors.textGray} />
                  <Text style={[AppStyles.textWhite, { marginLeft: 10, fontSize: 13 }]}>{cat.label}</Text>
                </View>
                <View style={{ flex: 1, marginHorizontal: 15 }}>
                  <View style={styles.miniProgressBg}>
                    <View style={[styles.miniProgressFill, { width: `${percent}%` }]} />
                  </View>
                </View>
                <Text style={[AppStyles.textGray, { fontSize: 11, minWidth: 40, textAlign: 'right' }]}>
                  {unlockedInCategory.length}/{categoryAchievements.length}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  progressCard: {
    padding: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(19, 236, 91, 0.3)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  tierBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tierText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: AppColors.primaryBioGreen,
    borderRadius: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 10,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: 'rgba(19, 236, 91, 0.1)',
    borderColor: 'rgba(19, 236, 91, 0.3)',
  },
  categoryChipText: {
    color: AppColors.textGray,
    fontSize: 12,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: AppColors.primaryBioGreen,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 18,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  lockedBadge: {
    alignItems: 'center',
    marginBottom: 4,
  },
  rewardText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  miniProgressBg: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: AppColors.primaryNeonBlue,
    borderRadius: 2,
  },
});