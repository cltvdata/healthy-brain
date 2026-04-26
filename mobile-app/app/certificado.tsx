import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Share } from 'react-native';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ReportGenerator, BioReport } from '@/services/ReportGenerator';

const { width } = Dimensions.get('window');

export default function CertificadoScreen() {
  const [report, setReport] = useState<BioReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    const data = await ReportGenerator.sysnthesizeUserStatus();
    setReport(data);
    setLoading(false);
  };

  const handleShare = async () => {
    if (!report) return;
    try {
      await Share.share({
        message: `He certificado mi Soberanía Biológica en healthy + brain. Bio-Score: ${report.bioScore}, Edad Metabólica: ${report.metabolicAge}. #BioHacking #Longevity`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <View style={AppStyles.body}><Text style={AppStyles.textWhite}>GENERANDO CERTIFICADO OFICIAL...</Text></View>;
  if (!report) return <View style={AppStyles.body}><Text style={AppStyles.textWhite}>ERROR AL GENERAR REPORTE</Text></View>;

  return (
    <View style={AppStyles.body}>
      <ScrollView contentContainerStyle={{ padding: 25, paddingBottom: 50 }}>
        
        {/* Header */}
        <View style={{ paddingTop: 40, marginBottom: 30 }}>
          <View style={[AppStyles.rowBetween, { marginTop: 5 }]}>
            <Text style={[AppStyles.textWhite, { fontSize: 26, fontWeight: 'bold' }]}>Tu Bio-Certificado 📜</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close-circle-outline" size={32} color="rgba(255,255,255,0.2)" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Certificate Card (Passport Style) */}
        <View style={styles.certCard}>
          <LinearGradient 
            colors={['rgba(255,255,255,0.05)', 'rgba(0,0,0,0.5)']} 
            style={styles.certInner}
          >
             {/* Seal Overlay */}
             <View style={styles.sealContainer}>
                <Ionicons name="shield-checkmark" size={100} color="rgba(19, 236, 91, 0.05)" />
             </View>

             <View style={styles.certHeader}>
                <Ionicons name="finger-print" size={40} color={AppColors.primaryBioGreen} />
                <View>
                   <Text style={styles.certTitle}>Soberanía Biológica</Text>
                   <Text style={styles.certSubtitle}>PASAPORTE DE LONGEVIDAD v1.0</Text>
                </View>
             </View>

             <View style={styles.divider} />

             {/* User Details */}
             <View style={styles.fieldRow}>
                <View style={{ flex: 1 }}>
                   <Text style={styles.label}>BIO-EXPLORADOR</Text>
                   <Text style={styles.value}>{report.userName.toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                   <Text style={styles.label}>ESTADO</Text>
                   <Text style={[styles.value, { color: AppColors.primaryBioGreen }]}>CERTIFICADO</Text>
                </View>
             </View>

             <View style={styles.fieldRow}>
                <View style={{ flex: 1 }}>
                   <Text style={styles.label}>BIO-SCORE</Text>
                   <Text style={styles.value}>{report.bioScore}</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                   <Text style={styles.label}>EDAD METAB.</Text>
                   <Text style={styles.value}>{report.metabolicAge}</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                   <Text style={styles.label}>RESILIENCIA</Text>
                   <Text style={styles.value}>{report.resilienceLevel}</Text>
                </View>
             </View>

             <View style={styles.divider} />

             <View style={styles.footer}>
                <View>
                   <Text style={styles.label}>FECHA DE EMISIÓN</Text>
                   <Text style={styles.footerVal}>{report.certDate}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                   <Text style={styles.label}>FIRMA DIGITAL</Text>
                   <Text style={[styles.footerVal, { fontFamily: 'monospace' }]}>NTK-SEC-8492-X</Text>
                </View>
             </View>
          </LinearGradient>
        </View>

        {/* Pillar Breakdown */}
        <View style={{ marginTop: 30, gap: 15 }}>
           <Text style={[AppStyles.textWhite, { fontWeight: 'bold', fontSize: 18 }]}>Análisis de Pilares</Text>
           
           <View style={styles.pillarBox}>
              <Ionicons name="pulse" size={24} color={AppColors.primaryNeonBlue} />
              <View style={{ flex: 1, marginLeft: 15 }}>
                 <Text style={styles.pillarTitle}>Sinergia Cardiovascular</Text>
                 <Text style={styles.pillarSub}>Tu HRV estable indica equilibrio en el sistema autónomo.</Text>
              </View>
              <Text style={styles.grade}>A+</Text>
           </View>

           <View style={styles.pillarBox}>
              <Ionicons name="walk" size={24} color={AppColors.primaryBioGreen} />
              <View style={{ flex: 1, marginLeft: 15 }}>
                 <Text style={styles.pillarTitle}>Consistencia de Actividad</Text>
                 <Text style={styles.pillarSub}>Has mantenido {report.activityConsistency}% de tus metas diarias.</Text>
              </View>
              <Text style={styles.grade}>A</Text>
           </View>
        </View>

        {/* Share Button */}
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
           <Ionicons name="share-social" size={22} color="black" style={{ marginRight: 10 }} />
           <Text style={styles.shareText}>COMPARTIR BIO-HITO</Text>
        </TouchableOpacity>

        <Text style={[AppStyles.textGray, { textAlign: 'center', marginTop: 20, fontSize: 10, fontStyle: 'italic' }]}>
           Este certificado ha sido procesado mediante la Red NTK y es válido por 30 días.
        </Text>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  certCard: {
    backgroundColor: '#111',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)', // Dorado sutil
    overflow: 'hidden',
    height: 480,
    shadowColor: '#00d1ff',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  certInner: {
    flex: 1,
    padding: 25,
    justifyContent: 'space-between',
  },
  sealContainer: {
    position: 'absolute',
    top: '30%',
    left: '25%',
    transform: [{ rotate: '-20deg' }],
  },
  certHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  certTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1
  },
  certSubtitle: {
    color: AppColors.primaryBioGreen,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 10
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 20,
    marginVertical: 10
  },
  label: {
    color: AppColors.textGray,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 5
  },
  value: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(19, 236, 91, 0.2)',
    paddingTop: 15
  },
  footerVal: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600'
  },
  pillarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  pillarTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold'
  },
  pillarSub: {
    color: AppColors.textGray,
    fontSize: 11,
    marginTop: 2
  },
  grade: {
    color: AppColors.primaryBioGreen,
    fontSize: 20,
    fontWeight: '900'
  },
  shareBtn: {
    backgroundColor: 'white',
    height: 65,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40
  },
  shareText: {
    color: 'black',
    fontWeight: '900',
    letterSpacing: 1
  }
});
