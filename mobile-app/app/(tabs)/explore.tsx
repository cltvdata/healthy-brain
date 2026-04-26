import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Image, StyleSheet } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '@/constants/FirebaseConfig';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function ExploreScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Ranking de Soberanía (Ordenado por bioScore)
    const q = query(collection(db, 'users'), orderBy('bioScore', 'desc'), limit(20));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leaderboard = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(leaderboard);
      setLoading(false);
    });

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
        setCurrentUser(user);
    });

    return () => {
        unsubscribe();
        unsubscribeAuth();
    };
  }, []);

  const handleGift = (targetId: string, targetName: string) => {
    // @ts-ignore - market exists
    router.push({
        pathname: '/market',
        params: { giftTargetId: targetId, giftTargetName: targetName }
    });
  };

  const getRankStyle = (index: number) => {
    if (index === 0) return { color: '#FFD700', icon: 'trophy' }; // Gold
    if (index === 1) return { color: '#C0C0C0', icon: 'medal' };  // Silver
    if (index === 2) return { color: '#CD7F32', icon: 'medal' };  // Bronze
    return { color: 'rgba(255,255,255,0.3)', icon: 'ellipse' };
  };

  return (
    <View style={AppStyles.body}>
      {/* 🧬 Bio-Champion Header */}
      <LinearGradient
        colors={['rgba(0, 209, 255, 0.1)', 'transparent']}
        style={styles.championHeader}
      >
        <Ionicons name="flash" size={24} color={AppColors.primaryBioGreen} />
        <View style={{ marginLeft: 15, flex: 1 }}>
           <Text style={[AppStyles.textWhite, { fontSize: 13, fontWeight: 'bold' }]}>Red Neuronal Activa 🌐</Text>
           <Text style={[AppStyles.textGray, { fontSize: 10 }]}>{users.length} Nodos sincronizados en la Bio-Cloud.</Text>
        </View>
        <TouchableOpacity 
            // @ts-ignore
            onPress={() => router.push('/market')}
            style={styles.marketBtn}
        >
           <Ionicons name="cart" size={16} color="black" />
           <Text style={styles.marketBtnText}>MARKET</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
        <View style={{ marginBottom: 25 }}>
          <Text style={[AppStyles.textGray, { fontSize: 10, fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase' }]}>Ranking Global</Text>
          <Text style={[AppStyles.textWhite, { fontSize: 24, fontWeight: 'bold' }]}>Soberanía Bio 🏆</Text>
        </View>

        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
             <Text style={AppStyles.textGray}>Sincronizando Nodos...</Text>
          </View>
        ) : (
          users.map((user, index) => {
            const rank = getRankStyle(index);
            const isMe = user.id === currentUser?.uid;
            const level = Math.floor((user.ntkBalance || 0) / 1000) + 1;

            return (
              <View key={user.id} style={[styles.rankCard, isMe && styles.meCard]}>
                <View style={styles.rankNumberContainer}>
                   <Ionicons name={rank.icon as any} size={14} color={rank.color} />
                   <Text style={[styles.rankNumber, { color: rank.color }]}>{index + 1}</Text>
                </View>

                <View style={styles.avatarContainer}>
                   <Image 
                     source={{ uri: `https://i.pravatar.cc/100?u=${user.id}` }} 
                     style={styles.avatar} 
                   />
                   <View style={styles.levelBadge}>
                      <Text style={styles.levelText}>{level}</Text>
                   </View>
                </View>

                <View style={{ flex: 1, marginLeft: 15 }}>
                   <Text style={[AppStyles.textWhite, { fontSize: 14, fontWeight: 'bold' }]}>
                     {user.displayName || `Guerrero_${user.id.substring(0,4)}`}
                     {isMe && <Text style={{ color: AppColors.primaryOrange, fontSize: 10 }}> (TÚ)</Text>}
                   </Text>
                   <Text style={[AppStyles.textGray, { fontSize: 10 }]}>Soberanía: {(user.bioScore || 0).toFixed(1)}</Text>
                </View>

                <View style={styles.ntkContainer}>
                   <Text style={styles.ntkValue}>{user.ntkBalance || 0} NTK</Text>
                   {!isMe && (
                     <TouchableOpacity 
                        onPress={() => handleGift(user.id, user.displayName || 'Guerrero')}
                        style={styles.giftBtn}
                     >
                       <Ionicons name="gift" size={14} color={AppColors.primaryOrange} />
                     </TouchableOpacity>
                   )}
                </View>
              </View>
            );
          })
        )}

        <TouchableOpacity 
            // @ts-ignore
            onPress={() => router.push('/market')}
            style={[AppStyles.glassCard, { marginTop: 20, padding: 20, alignItems: 'center', borderColor: AppColors.primaryOrange + '40' }]}
        >
            <Ionicons name="cart-outline" size={32} color={AppColors.primaryOrange} />
            <Text style={[AppStyles.textWhite, { fontWeight: 'bold', marginTop: 10 }]}>Visitar Bio-Market</Text>
            <Text style={[AppStyles.textGray, { fontSize: 11, textAlign: 'center', marginTop: 5 }]}>Canjea tus NTK por suplementos, bio-hacks y gadgets de optimización.</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  championHeader: {
    margin: 20,
    marginTop: 60,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 209, 255, 0.2)'
  },
  marketBtn: {
    backgroundColor: AppColors.primaryBioGreen,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  marketBtnText: {
    color: 'black',
    fontSize: 10,
    fontWeight: 'bold'
  },
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161616',
    padding: 15,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  meCard: {
    borderColor: AppColors.primaryOrange + '40',
    backgroundColor: AppColors.primaryOrange + '08'
  },
  rankNumberContainer: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rankNumber: {
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  levelBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: 'black',
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: AppColors.primaryBioGreen,
    alignItems: 'center',
    justifyContent: 'center'
  },
  levelText: {
    color: AppColors.primaryBioGreen,
    fontSize: 8,
    fontWeight: 'bold'
  },
  ntkContainer: {
    alignItems: 'flex-end',
    gap: 5
  },
  ntkValue: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    fontStyle: 'italic'
  },
  giftBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AppColors.primaryOrange + '20',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
