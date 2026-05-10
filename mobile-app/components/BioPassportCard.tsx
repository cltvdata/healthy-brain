import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, TouchableWithoutFeedback } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppColors, AppStyles } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { BioEconomy } from '@/constants/BioEconomy';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 50;
const CARD_HEIGHT = 220;

interface BioPassportProps {
  userName: string;
  bioScore: number;
  streak: number;
  referralCode: string;
  memberSince?: string;
  isPremium?: boolean;
  isFounder?: boolean;
}

export const BioPassportCard: React.FC<BioPassportProps> = ({ 
  userName, 
  bioScore, 
  streak, 
  referralCode, 
  memberSince,
  isPremium,
  isFounder
}) => {
  const shimmerValue = useRef(new Animated.Value(0)).current;

  const getRank = () => {
    if (bioScore >= BioEconomy.PASS_RANK_ELITE) return { label: 'ELITE NOMAD', color: '#FFD700', icon: 'diamond-outline' };
    if (bioScore >= BioEconomy.PASS_RANK_SOVEREIGN) return { label: 'BIO-SOVEREIGN', color: AppColors.primaryBioGreen, icon: 'shield-checkmark' };
    return { label: 'BIO-EXPLORER', color: AppColors.primaryNeonBlue, icon: 'compass-outline' };
  };

  const rank = getRank();

  const startShimmer = () => {
    shimmerValue.setValue(0);
    Animated.timing(shimmerValue, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    // Initial entrance shimmer
    setTimeout(startShimmer, 500);
  }, []);

  const shimmerTranslate = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-CARD_WIDTH, CARD_WIDTH * 1.5],
  });

  return (
    <TouchableWithoutFeedback onPress={startShimmer}>
      <View style={[styles.cardContainer, { borderColor: rank.color + '40' }]}>
        {/* Deep Glass Background */}
        <LinearGradient
          colors={['#0A0A0A', '#1A1A1A']}
          style={StyleSheet.absoluteFill}
        />

        {/* Dynamic Rank Glow */}
        <View style={[styles.glow, { backgroundColor: rank.color + '15' }]} />

        {/* THE HOLOGRAPHIC SHIMMER */}
        <Animated.View 
          style={[
            styles.shimmerLayer, 
            { transform: [{ translateX: shimmerTranslate }, { rotate: '25deg' }] }
          ]}
        >
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)', 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* Content Layout */}
        <View style={styles.cardContent}>
          <View style={AppStyles.rowBetween}>
            <View>
              <Text style={styles.orgName}>HEALTHY + BRAIN</Text>
              <Text style={styles.passType}>SOVEREIGNTY PASSPORT</Text>
            </View>
            <Ionicons name="finger-print" size={32} color={rank.color} />
          </View>

          <View style={styles.mainInfo}>
            <View>
               <Text style={styles.label}>IDENTIDAD</Text>
               <Text style={styles.userName}>{userName.toUpperCase()}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
               <Text style={styles.label}>BIO-SCORE</Text>
               <Text style={[styles.scoreValue, { color: rank.color }]}>{bioScore}</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={styles.badge}>
                 <Ionicons name={rank.icon as any} size={14} color={rank.color} style={{ marginRight: 6 }} />
                 <Text style={[styles.badgeText, { color: rank.color }]}>{rank.label}</Text>
              </View>
              {isFounder && (
                <View style={[styles.badge, { borderColor: '#FFD700', backgroundColor: 'rgba(255,215,0,0.05)' }]}>
                   <Ionicons name="sunny" size={12} color="#FFD700" style={{ marginRight: 6 }} />
                   <Text style={[styles.badgeText, { color: '#FFD700' }]}>GENESIS FOUNDER</Text>
                </View>
              )}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
               <Text style={styles.label}>REFERRAL CODE</Text>
               <Text style={styles.refCode}>{referralCode}</Text>
            </View>
          </View>
        </View>

        {/* Premium Texture Overlay */}
        <View style={styles.texture} />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    marginVertical: 10,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  glow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  shimmerLayer: {
    position: 'absolute',
    top: -100,
    left: 0,
    width: 60,
    height: CARD_HEIGHT * 2,
    zIndex: 1,
  },
  cardContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  orgName: {
    color: 'white',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  passType: {
    color: '#666',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginTop: 2,
  },
  mainInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: '#444',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
  },
  userName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '900',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  refCode: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  texture: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.05,
    backgroundColor: 'transparent',
    // Could use a small pattern image here if needed
  }
});
