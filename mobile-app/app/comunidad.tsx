import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '@/context/LanguageContext';
import { router } from 'expo-router';
import { SynergyService, Synergy } from '@/services/SynergyService';

const { width } = Dimensions.get('window');

const FeedItem = ({ id, userId, name, action, time, type, xp, glowCount, t }: any) => {
  const getIcon = () => {
    switch(type) {
      case 'workout': return 'fitness';
      case 'steps': return 'footsteps';
      case 'focus': return 'pulse';
      default: return 'star';
    }
  };

  const getColor = () => {
    switch(type) {
      case 'workout': return AppColors.primaryOrange;
      case 'steps': return AppColors.accentBlue;
      case 'focus': return AppColors.primaryBioGreen;
      default: return 'white';
    }
  };

  return (
    <View style={[styles.feedCard, AppStyles.glassCardInteractive]}>
       <View style={AppStyles.rowBetween}>
          <View style={AppStyles.rowCentered}>
             <View style={[styles.avatar, { borderColor: getColor() }]}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>{name[0]}</Text>
             </View>
             <View style={{ marginLeft: 12 }}>
                <Text style={[AppStyles.textWhite, { fontWeight: 'bold' }]}>{name}</Text>
                <Text style={[AppStyles.textGray, { fontSize: 10 }]}>{time}</Text>
             </View>
          </View>
          <View style={[styles.xpBadge, { backgroundColor: getColor() + '20' }]}>
             <Text style={{ color: getColor(), fontSize: 10, fontWeight: 'bold' }}>+{xp} XP</Text>
          </View>
       </View>
       
       <Text style={[AppStyles.textWhite, { marginTop: 15, fontSize: 13, lineHeight: 18 }]}>
         {action}
       </Text>

        <View style={[AppStyles.rowBetween, { marginTop: 15 }]}>
           <TouchableOpacity 
             style={styles.actionBtn}
             onPress={() => SynergyService.toggleGlow(id, userId)}
           >
              <Ionicons name="flash-outline" size={18} color={AppColors.primaryOrange} />
              <Text style={[styles.actionText, { color: AppColors.primaryOrange }]}>{glowCount || 0} {t('community.giveGlow')}</Text>
           </TouchableOpacity>
           <Ionicons name={getIcon()} size={20} color={getColor() + '40'} />
        </View>
    </View>
  );
};

export default function ComunidadScreen() {
  const { t } = useLanguage();
  const [feed, setFeed] = useState<Synergy[]>([]);

  useEffect(() => {
    const unsubscribe = SynergyService.getFeed((data) => {
      setFeed(data);
    });
    return () => unsubscribe();
  }, []);

  return (
    <View style={AppStyles.body}>
      <ScrollView contentContainerStyle={{ padding: 25, paddingBottom: 100 }}>
        
        {/* Header */}
        <View style={{ paddingTop: 40, marginBottom: 30 }}>
          <Text style={[AppStyles.textGray, { fontSize: 10, fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase' }]}>Fase 44: Bio-Social</Text>
          <View style={[AppStyles.rowBetween, { marginTop: 5 }]}>
            <Text style={[AppStyles.textWhite, { fontSize: 26, fontWeight: 'bold' }]}>{t('community.title')} ✨</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close-circle-outline" size={32} color="rgba(255,255,255,0.2)" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Community Stats Summary */}
        <LinearGradient 
          colors={[AppColors.primaryBioGreen + '20', 'transparent']}
          style={[AppStyles.glassCard, { padding: 20, marginBottom: 30, borderColor: AppColors.primaryBioGreen + '30' }]}
        >
           <View style={AppStyles.rowBetween}>
               <View>
                  <Text style={[AppStyles.textWhite, { fontSize: 18, fontWeight: 'bold' }]}>742</Text>
                  <Text style={AppStyles.textGray}>Bio-Explorers Activos</Text>
               </View>
               <TouchableOpacity 
                 style={{ backgroundColor: AppColors.primaryBioGreen, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12 }}
                 // @ts-ignore
                 onPress={() => router.push('/ranking')}
               >
                  <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 12 }}>VER RANKING</Text>
               </TouchableOpacity>
            </View>
            <View style={{ alignItems: 'flex-end', marginTop: 15 }}>
                 <Text style={[AppStyles.textWhite, { fontSize: 18, fontWeight: 'bold' }]}>12.4k</Text>
                 <Text style={AppStyles.textGray}>Sinergias Hoy</Text>
            </View>
        </LinearGradient>

        <Text style={[AppStyles.textGray, { fontSize: 12, fontWeight: 'bold', marginBottom: 20, textTransform: 'uppercase' }]}>{t('community.feed')}</Text>

        {feed.length === 0 ? (
          <View style={{ paddingVertical: 50, alignItems: 'center' }}>
            <Ionicons name="cloud-offline-outline" size={40} color="rgba(255,255,255,0.1)" />
            <Text style={[AppStyles.textGray, { marginTop: 10 }]}>Esperando nuevas sinergias...</Text>
          </View>
        ) : (
          feed.map((item) => (
            <FeedItem 
              key={item.id}
              id={item.id}
              userId={item.userId}
              name={item.userName} 
              action={item.content}
              time="Hace un momento"
              type={item.type}
              xp={item.rewardedNtk}
              glowCount={item.glows}
              t={t}
            />
          ))
        )}

      </ScrollView>

      {/* Social Shortcut Overlay */}
      <View style={styles.fab}>
          <TouchableOpacity style={[styles.fabBtn, AppStyles.glassCardInteractive]}>
             <Ionicons name="share-social" size={24} color="black" />
          </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  feedCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)'
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  },
  xpBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  actionText: {
    color: AppColors.textGray,
    fontSize: 12,
    fontWeight: '600'
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 25
  },
  fabBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: AppColors.primaryBioGreen,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: AppColors.primaryBioGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10
  }
});
