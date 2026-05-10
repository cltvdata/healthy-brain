import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Dimensions, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { auth, db, storage } from '@/constants/FirebaseConfig';
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const { width } = Dimensions.get('window');

interface BioDocument {
  id: string;
  type: 'report' | 'lab' | 'photo';
  uri: string;
  date: string;
  name: string;
}

export default function BioVaultScreen() {
  const [documents, setDocuments] = useState<BioDocument[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    if (!auth.currentUser) return;
    try {
      const q = query(
        collection(db, 'vault_documents'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const docs: BioDocument[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        docs.push({
          id: doc.id,
          type: data.type,
          uri: data.uri,
          date: data.createdAt.toDate().toLocaleDateString(),
          name: data.name,
        });
      });
      setDocuments(docs);
    } catch (error) {
      console.error("Error loading documents:", error);
    }
  };

  const handleUpload = async (source: 'camera' | 'library') => {
    const { status } = source === 'camera' 
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permiso denegado', `Necesitamos acceso a tu ${source === 'camera' ? 'cámara' : 'galería'}.`);
      return;
    }

    const result = source === 'camera'
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.7 });

    if (!result.canceled && result.assets[0]) {
      uploadFile(result.assets[0].uri);
    }
  };

  const uploadFile = async (uri: string) => {
    if (!auth.currentUser) return;
    setUploading(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `vault/${auth.currentUser.uid}/${Date.now()}.jpg`;
      const storageRef = ref(storage, filename);
      
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'vault_documents'), {
        userId: auth.currentUser.uid,
        uri: downloadURL,
        type: 'report',
        name: 'Reporte Salud ' + new Date().toLocaleDateString(),
        createdAt: Timestamp.now(),
      });

      Alert.alert('Éxito', 'Documento cifrado y guardado en la bóveda.');
      loadDocuments();
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert('Error', 'No se pudo subir el archivo.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={AppStyles.body}>
      <LinearGradient
        colors={['rgba(0, 209, 255, 0.1)', 'transparent']}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>BIO-VAULT</Text>
          <Text style={styles.headerSubtitle}>Bóveda de Datos Biográficos</Text>
        </View>
        <View style={styles.shieldIcon}>
          <Ionicons name="shield-checkmark" size={28} color={AppColors.primaryBioGreen} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Storage Stats */}
        <View style={styles.statsCard}>
          <View style={AppStyles.rowBetween}>
            <View>
              <Text style={styles.statsLabel}>ESPACIO CIFRADO</Text>
              <Text style={styles.statsValue}>{documents.length} Documentos</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.statsPercent}>0.2% de 10GB</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '2%' }]} />
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>NUEVA EVIDENCIA BIOMÉTRICA</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity onPress={() => handleUpload('camera')} style={styles.actionBtn}>
            <LinearGradient colors={[AppColors.primaryNeonBlue, '#0055FF']} style={styles.btnGradient}>
              <Ionicons name="scan-circle" size={28} color="white" />
              <Text style={styles.btnText}>ESCANEAR</Text>
              <Text style={styles.btnSubtext}>Cámara Bio</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => handleUpload('library')} style={styles.actionBtn}>
            <LinearGradient colors={['#FF8800', '#FF4400']} style={styles.btnGradient}>
              <Ionicons name="images" size={28} color="white" />
              <Text style={styles.btnText}>GALERÍA</Text>
              <Text style={styles.btnSubtext}>Screenshots</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => Alert.alert('LabSync', 'Conectando con laboratorios externos...')} style={styles.actionBtn}>
            <LinearGradient colors={['#9b59b6', '#8e44ad']} style={styles.btnGradient}>
              <Ionicons name="flask" size={28} color="white" />
              <Text style={styles.btnText}>LABS</Text>
              <Text style={styles.btnSubtext}>Resultados</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>ARCHIVOS RECIENTES</Text>

        <View style={styles.grid}>
          {documents.map((doc) => (
            <TouchableOpacity key={doc.id} style={styles.docCard}>
              <Image source={{ uri: doc.uri }} style={styles.docImage} />
              <View style={styles.docInfo}>
                <Text style={styles.docName} numberOfLines={1}>{doc.name}</Text>
                <Text style={styles.docDate}>{doc.date}</Text>
              </View>
              <View style={styles.typeBadge}>
                <Ionicons name="document-text" size={10} color="white" />
              </View>
            </TouchableOpacity>
          ))}
          {documents.length === 0 && !uploading && (
            <View style={styles.emptyState}>
              <Ionicons name="folder-open-outline" size={60} color="rgba(255,255,255,0.1)" />
              <Text style={styles.emptyText}>No hay archivos en tu bóveda</Text>
            </View>
          )}
          {uploading && (
            <View style={styles.uploadingCard}>
              <Text style={styles.uploadingText}>CIFRANDO Y SUBIENDO...</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 2
  },
  headerSubtitle: {
    color: AppColors.primaryNeonBlue,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 1
  },
  shieldIcon: {
    width: 44,
    alignItems: 'flex-end'
  },
  statsCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 25,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 25
  },
  statsLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 5
  },
  statsValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800'
  },
  statsPercent: {
    color: AppColors.primaryBioGreen,
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 8
  },
  progressBar: {
    width: 100,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: AppColors.primaryBioGreen
  },
  actionRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30
  },
  actionBtn: {
    flex: 1,
    height: 100,
    borderRadius: 25,
    overflow: 'hidden'
  },
  btnGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  btnText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1
  },
  btnSubtext: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 8,
    fontWeight: '600',
    marginTop: -2
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 15
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15
  },
  docCard: {
    width: (width - 55) / 2,
    height: 200,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  docImage: {
    width: '100%',
    height: 130,
    opacity: 0.8
  },
  docInfo: {
    padding: 12
  },
  docName: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4
  },
  docDate: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 9,
    fontWeight: '600'
  },
  typeBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    width: '100%'
  },
  emptyText: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 14,
    marginTop: 15,
    fontWeight: '600'
  },
  uploadingCard: {
    width: '100%',
    height: 100,
    backgroundColor: 'rgba(0, 209, 255, 0.05)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppColors.primaryNeonBlue + '30'
  },
  uploadingText: {
    color: AppColors.primaryNeonBlue,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2
  }
});
