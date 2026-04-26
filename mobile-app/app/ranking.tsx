import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native';
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
  bioScore: number;
  ntkBalance: number;
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
        users.push({ id: doc.id, ...(doc.data() as any) });
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

  if (loading) return <View style={AppStyles.body}><Text style={AppStyles.textWhite}>CARGANDO LIGA BIO-ELITE...</Text></View>;

  return (
    <View style={AppStyles.body}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Header */}
        <View style={{ padding: 25, paddingTop: 60, marginBottom: 10 }}>
          <Text style={[AppStyles.textGray, { fontSize: 10, fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase' }]}>Fase 56: Competición Global</Text>
          <View style={[AppStyles.rowBetween, { marginTop: 5 }]}>
            <Text style={[AppStyles.textWhite, { fontSize: 26, fontWeight: 'bold' }]}>Bio-Ranking ✨</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close-circle-outline" size={32} color="rgba(255,255,255,0.2)" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Podium */}
        <View style={styles.podiumContainer}>
           {top3[1] && <PodiumItem user={top3[1]} rank={2} color="#C0C0C0" height={140} />}
           {top3[0] && <PodiumItem user={top3[0]} rank={1} color="#FFD700" height={180} isWinner />}
           {top3[2] && <PodiumItem user={top3[2]} rank={3} color="#CD7F32" height={120} />}
        </View>

        {/* List */}
        <View style={{ paddingHorizontal: 20, marginTop: 30 }}>
           {rest.map((user, index) => (
             <TouchableOpacity key={user.id} style={styles.rankRow}>
                <Text style={styles.rankNum}>{index + 4}</Text>
                <View style={styles.miniAvatar}>
                   <Text style={{ color: 'white', fontWeight: 'bold' }}>{user.userName[0]}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 15 }}>
                   <Text style={[AppStyles.textWhite, { fontWeight: 'bold' }]}>{user.userName}</Text>
                   <Text style={[AppStyles.textGray, { fontSize: 10 }]}>{user.ntkBalance} NTK Ganados</Text>
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
        <LinearGradient 
          colors={[AppColors.primaryNeonBlue, '#0055ff']}
          style={styles.myRankBar}
        >
          <View style={AppStyles.rowBetween}>
             <View style={AppStyles.rowCentered}>
                <View style={styles.myRankNumBox}>
                   <Text style={styles.myRankText}>{currentUserRank}</Text>
                </View>
                <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 15 }}>TU POSICIÓN GLOBAL</Text>
             </View>
             <Text style={{ color: 'white', fontWeight: 'bold' }}>TOP {Math.round((currentUserRank / 742) * 100)}%</Text>
          </View>
        </LinearGradient>
      )}
    </View>
  );
}

const PodiumItem = ({ user, rank, color, height, isWinner }: any) => (
  <View style={[styles.podiumItem, { height }]}>
     <View style={[styles.podiumAvatar, { borderColor: color, width: isWinner ? 80 : 60, height: isWinner ? 80 : 60 }]}>
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: isWinner ? 24 : 18 }}>{user.userName[0]}</Text>
        <View style={[styles.crown, { backgroundColor: color }]}>
           <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 10 }}>{rank}</Text>
        </View>
     </View>
     <Text style={styles.podiumName} numberOfLines={1}>{user.userName}</Text>
     <Text style={[styles.podiumScore, { color }]}>{user.bioScore} PTS</Text>
     <View style={[styles.box, { backgroundColor: color + '20', height: height - 100 }]} />
  </View>
);

const styles = StyleSheet.create({
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingTop: 20,
    gap: 10
  },
  podiumItem: {
    alignItems: 'center',
    width: (width - 60) / 3,
  },
  podiumAvatar: {
    borderRadius: 40,
    borderWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  crown: {
    position: 'absolute',
    top: -10,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  podiumName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12
  },
  podiumScore: {
    fontSize: 14,
    fontWeight: '900',
    marginTop: 2
  },
  box: {
    width: '100%',
    marginTop: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginBottom: 12,
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  rankNum: {
    color: AppColors.textGray,
    fontWeight: 'bold',
    width: 25
  },
  miniAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  scoreBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10
  },
  scoreText: {
    color: AppColors.primaryNeonBlue,
    fontWeight: 'bold'
  },
  myRankBar: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
    height: 80,
    borderRadius: 25,
    paddingHorizontal: 25,
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#00d1ff',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 15
  },
  myRankNumBox: {
    backgroundColor: 'white',
    width: 35,
    height: 35,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  myRankText: {
    color: AppColors.primaryNeonBlue,
    fontWeight: 'bold'
  }
});
