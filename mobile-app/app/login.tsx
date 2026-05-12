import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { auth, db } from '@/constants/FirebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { router } from 'expo-router';
import { AppStyles, AppColors } from '@/constants/AppStyles';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      alert('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      let userCredential;
      if (isRegistering) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        const now = new Date();
        const trialEnd = new Date();
        trialEnd.setDate(now.getDate() + 15);
        
        // Initialize user doc with full Bio-Economy setup
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: userCredential.user.email,
          createdAt: serverTimestamp(),
          ntkBalance: 500,
          bioScore: 85,
          hrv: 60,
          userName: email.split('@')[0],
          isProfileComplete: false,
          trialStartDate: serverTimestamp(),
          trialEndDate: trialEnd,
          bioShields: 0,
          currentStreak: 0,
          longestStreak: 0,
          showInRanking: true,
          shareBioScore: true,
          shareNTK: true,
          legalAccepted: true,
          photoPrivacy: 'private',
          statsPrivacy: 'private',
          communityPrivacy: true,
          aguaMeta: 2.5,
          objetivo: 'longevidad',
          unlockedAchievements: []
        });
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error(error);
      alert(error.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // In a real Expo app, this would use expo-auth-session/google
    // For now, we'll simulate the UI flow or provide a placeholder
    alert('Iniciando sesión con Google...');
    // Mocking success for the demo if needed, but better to explain it needs native config
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[AppColors.backgroundDark, '#001a2c']}
        style={StyleSheet.absoluteFill}
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Ionicons name="infinite" size={50} color={AppColors.primaryBioGreen} />
            </View>
            <Text style={styles.title}>HEALTHY + BRAIN</Text>
            <Text style={styles.subtitle}>Bio-Soberanía y Longevidad IA</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Correo Electrónico"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity 
              style={[styles.mainBtn, { backgroundColor: isRegistering ? AppColors.accentBlue : AppColors.primaryBioGreen }]}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="black" />
              ) : (
                <Text style={styles.mainBtnText}>
                  {isRegistering ? 'CREAR CUENTA BIOLÓGICA' : 'INICIAR NEURO-SESIÓN'}
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>O CONTINUAR CON</Text>
              <View style={styles.line} />
            </View>

            <TouchableOpacity 
              style={styles.googleBtn}
              onPress={handleGoogleSignIn}
            >
              <Ionicons name="logo-google" size={20} color="white" />
              <Text style={styles.googleBtnText}>Google ID</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.toggleBtn}
            onPress={() => setIsRegistering(!isRegistering)}
          >
            <Text style={styles.toggleText}>
              {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿Nuevo aquí? Crea tu Bio-ID'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    padding: 30,
    paddingTop: 80,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(19, 236, 91, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(19, 236, 91, 0.3)',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: 'white',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: AppColors.primaryBioGreen,
    marginTop: 5,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  form: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 30,
    padding: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 15,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  mainBtn: {
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: AppColors.primaryBioGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  mainBtnText: {
    color: 'black',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    fontWeight: 'bold',
    marginHorizontal: 15,
  },
  googleBtn: {
    flexDirection: 'row',
    height: 55,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  googleBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  toggleBtn: {
    marginTop: 30,
  },
  toggleText: {
    color: AppColors.primaryBioGreen,
    fontSize: 14,
    fontWeight: '600',
  },
});
