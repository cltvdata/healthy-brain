import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { db, auth } from '@/constants/FirebaseConfig';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

const { width } = Dimensions.get('window');

interface LeaderboardUser {
  id: string;
  userName: string;
  bioScore: any;
  ntkBalance: any;
  currentTrend?: number;
  showInRanking?: boolean;
}

export default function RankingScreen() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      orderBy('bioScore', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users: LeaderboardUser[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as any;
        if (data.showInRanking === false) return;

        users.push({
          id: doc.id,
          userName: data.userName || 'Bio-Sovereign',
          bioScore: data.bioScore || 0,
          ntkBalance: data.ntkBalance || 0,
          currentTrend: data.currentTrend || 0,
        });
      });
      setLeaderboard(users);
      
      const myRank = users.findIndex(u => u.id === auth.currentUser?.uid);
      if (myRank !== -1) setCurrentUserRank(myRank + 1);
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  if (loading) {
    return (
      <View style={[AppStyles.body, { justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="sync" size={40} color={AppColors.primaryNeonBlue} />
        <Text style={[AppStyles.textWhite, { marginTop: 20, fontWeight: '900', letterSpacing: 2 }]}>SINCRONIZANDO RED SOBERANA...</Text>
      </View>
    );
  }

  return (
    <View style={AppStyles.body}>
      <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
        
        {/* Header */}
        <View style={{ padding: 25, paddingTop: 60, marginBottom: 10 }}>
          <View style={[AppStyles.rowAtStart, { gap: 8, marginBottom: 5 }]}>
              <View style={{ width: 12, height: 2, backgroundColor: AppColors.primaryNeonBlue }} />
              <Text style={[AppStyles.textGray, { fontSize: 10, fontWeight: '900', letterSpacing: 2.5, textTransform: 'uppercase' }]}>Malla de Identidad ZK-Proof</Text>
          </View>
          <View style={[AppStyles.rowBetween, { marginTop: 5 }]}>
            <Text style={[AppStyles.textWhite, { fontSize: 32, fontWeight: '900' }]}>RED SOBERANA</Text>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Global Stats Bar */}
        <View style={{ paddingHorizontal: 25, marginBottom: 30 }}>
           <LinearGradient
            colors={['rgba(0, 209, 255, 0.15)', 'rgba(0,0,0,0.3)']}
            style={styles.statsBarGradient}
           >
              <View>
                <Text style={styles.statsLabel}>BIO-PODER TOTAL DE LA RED</Text>
                <Text style={styles.statsValue}>{ (leaderboard.reduce((a, b) => a + (typeof b.bioScore === 'number' ? b.bioScore : 0), 0)).toLocaleString() } BP</Text>
              </View>
              <Ionicons name="earth" size={32} color={AppColors.primaryNeonBlue} style={{ opacity: 0.5 }} />
           </LinearGradient>
        </View>

        {/* Podium */}
        <View style={styles.podiumContainer}>
           {top3[1] && <PodiumItem user={top3[1]} rank={2} color="#C0C0C0" height={160} />}
           {top3[0] && <PodiumItem user={top3[0]} rank={1} color={AppColors.primaryNeonBlue} height={210} isWinner />}
           {top3[2] && <PodiumItem user={top3[2]} rank={3} color="#CD7F32" height={140} />}
        </View>

        {/* List Header */}
        <View style={[AppStyles.rowBetween, { paddingHorizontal: 25, marginTop: 40, marginBottom: 15 }]}>
           <Text style={{ color: 'rgba(255,255,255,0.3)', fontWeight: '900', fontSize: 10, letterSpacing: 1 }}>ASPIRANTES A ORÁCULO</Text>
           <Text style={{ color: 'rgba(255,255,255,0.3)', fontWeight: '900', fontSize: 10 }}>SCORE</Text>
        </View>

        {/* List */}
        <View style={{ paddingHorizontal: 20 }}>
           {rest.map((user, index) => (
             <TouchableOpacity key={user.id} style={styles.rankRow}>
                <Text style={styles.rankNum}>{index + 4}</Text>
                <View style={[styles.miniAvatar, { borderColor: user.bioScore > 85 ? AppColors.primaryBioGreen + '40' : 'transparent' }]}>
                   <Text style={{ color: 'white', fontWeight: '900' }}>{user.userName[0].toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 15 }}>
                   <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[AppStyles.textWhite, { fontWeight: 'bold', fontSize: 15 }]}>{user.userName}</Text>
                      {user.bioScore > 85 && <Ionicons name="shield-checkmark" size={14} color={AppColors.primaryBioGreen} />}
                   </View>
                   <Text style={[AppStyles.textGray, { fontSize: 10, marginTop: 3, fontWeight: '600' }]}>
                      {user.ntkBalance.toLocaleString()} NTK • SOBERANO VERIFICADO
                   </Text>
                </View>
                 <View style={styles.scoreBadge}>
                    <Text style={styles.scoreText}>{user.bioScore}</Text>
                 </View>
              </TouchableOpacity>
           ))}
        </View>

      </ScrollView>

      {/* Floating My Rank */}
      {currentUserRank && (
        <TouchableOpacity style={styles.floatingContainer} activeOpacity={0.9}>
            <LinearGradient 
                colors={[AppColors.primaryNeonBlue, '#0055ff']}
                style={styles.myRankBar}
            >
                <View style={AppStyles.rowBetween}>
                    <View style={AppStyles.rowCentered}>
                        <View style={styles.myRankNumBox}>
                            <Text style={styles.myRankText}>{currentUserRank}</Text>
                        </View>
                        <View style={{ marginLeft: 15 }}>
                            <Text style={{ color: 'white', fontWeight: '900', fontSize: 14, letterSpacing: 0.5 }}>TU RANGO BIO-VITAL</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '600' }}>Incentivos de Soberanía: ACTIVO</Text>
                        </View>
                    </View>
                    <View style={styles.rankGlowIcon}>
                        <Ionicons name="finger-print" size={24} color="white" />
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

const PodiumItem = ({ user, rank, color, height, isWinner }: any) => (
  <View style={[styles.podiumItem, { height }]}>
     <View style={[
        styles.podiumAvatar, 
        { borderColor: color, width: isWinner ? 100 : 75, height: isWinner ? 100 : 75 },
        isWinner && { shadowColor: color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 30, elevation: 30 }
     ]}>
        <Text style={{ color: 'white', fontWeight: '900', fontSize: isWinner ? 36 : 22 }}>{user.userName[0].toUpperCase()}</Text>
        <LinearGradient 
            colors={[color, 'transparent']} 
            style={[styles.crown, { backgroundColor: color }]}
        >
           <Text style={{ color: rank === 1 ? 'black' : 'white', fontWeight: '900', fontSize: 12 }}>{rank}</Text>
        </LinearGradient>
     </View>
     <Text style={styles.podiumName} numberOfLines={1}>{user.userName}</Text>
     <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
        <Text style={[styles.podiumScore, { color }]}>{user.bioScore}</Text>
        {user.bioScore > 90 && <Ionicons name="flash" size={14} color={color} />}
     </View>
     <View style={[styles.box, { backgroundColor: color + '08', height: height - 120, borderColor: color + '20', borderWidth: 1 }]} />
  </View>
);

const styles = StyleSheet.create({
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  statsBarGradient: {
    padding: 20,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(0, 209, 255, 0.2)'
  },
  statsLabel: {
    color: AppColors.primaryNeonBlue,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2
  },
  statsValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4
  },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingTop: 30,
    gap: 15
  },
  podiumItem: {
    alignItems: 'center',
    width: (width - 80) / 3,
  },
  podiumAvatar: {
    borderRadius: 50,
    borderWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15
  },
  crown: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  podiumName: {
    color: 'white',
    fontWeight: '900',
    fontSize: 14,
    width: '100%',
    textAlign: 'center'
  },
  podiumScore: {
    fontSize: 18,
    fontWeight: '900',
  },
  box: {
    width: '100%',
    marginTop: 15,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    marginBottom: 12,
    padding: 18,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  rankNum: {
    color: 'rgba(255,255,255,0.2)',
    fontWeight: '900',
    width: 30,
    fontSize: 14
  },
  miniAvatar: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  },
  scoreBadge: {
    backgroundColor: 'rgba(0, 209, 255, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 209, 255, 0.15)'
  },
  scoreText: {
    color: AppColors.primaryNeonBlue,
    fontWeight: '900',
    fontSize: 18
  },
  floatingContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  myRankBar: {
    height: 95,
    borderRadius: 35,
    paddingHorizontal: 25,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  myRankNumBox: {
    backgroundColor: 'white',
    width: 44,
    height: 44,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  myRankText: {
    color: AppColors.primaryNeonBlue,
    fontWeight: '900',
    fontSize: 20
  },
  rankGlowIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
