import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, Dimensions, ScrollView, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AppColors } from '@/constants/AppStyles';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, db } from '@/constants/FirebaseConfig';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

type Mode = 'login' | 'register' | 'reset';

export default function LoginScreen() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa tu correo y contraseña.');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      const msg = err.code === 'auth/user-not-found' ? 'Usuario no encontrado.'
        : err.code === 'auth/wrong-password' ? 'Contraseña incorrecta.'
        : err.code === 'auth/invalid-email' ? 'Correo inválido.'
        : 'Error al iniciar sesión.';
      Alert.alert('Error de Autenticación', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!nombre || !email || !password) {
      Alert.alert('Error', 'Completa todos los campos.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      // Crear documento de usuario en Firestore
      await setDoc(doc(db, 'users', cred.user.uid), {
        userName: nombre,
        email: email.trim(),
        ntkBalance: 1000,
        isFounder: true,
        createdAt: serverTimestamp(),
        showInRanking: true,
        shareBioScore: true,
        shareNTK: true,
        useAnonymousAlias: false,
      });
      router.replace('/perfil-setup');
    } catch (err: any) {
      const msg = err.code === 'auth/email-already-in-use' ? 'Este correo ya está registrado.'
        : err.code === 'auth/invalid-email' ? 'Correo inválido.'
        : err.code === 'auth/weak-password' ? 'Contraseña muy débil.'
        : 'Error al registrarse.';
      Alert.alert('Error de Registro', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Ingresa tu correo para restablecer la contraseña.');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert('Éxito', 'Revisa tu correo para restablecer tu contraseña.', [
        { text: 'OK', onPress: () => setMode('login') }
      ]);
    } catch (err: any) {
      Alert.alert('Error', 'No se pudo enviar el correo de restablecimiento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Background Gradient */}
      <LinearGradient
        colors={['#000000', '#050d1a', '#00000f']}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative glows */}
      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Logo / Branding */}
        <View style={styles.logoSection}>
          <View style={styles.logoRing}>
            <Ionicons name="pulse" size={40} color={AppColors.primaryNeonBlue} />
          </View>
          <Text style={styles.logoTitle}>HEALTHY + BRAIN</Text>
          <Text style={styles.logoSubtitle}>BIO-INTELLIGENCE PLATFORM</Text>
        </View>

        {/* Mode Tabs */}
        <View style={styles.modeTabs}>
          <TouchableOpacity
            style={[styles.modeTab, mode === 'login' && styles.modeTabActive]}
            onPress={() => setMode('login')}
          >
            <Text style={[styles.modeTabText, mode === 'login' && styles.modeTabTextActive]}>
              INGRESAR
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeTab, mode === 'register' && styles.modeTabActive]}
            onPress={() => setMode('register')}
          >
            <Text style={[styles.modeTabText, mode === 'register' && styles.modeTabTextActive]}>
              REGISTRARSE
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {mode === 'register' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>NOMBRE</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color="rgba(255,255,255,0.3)" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Tu nombre"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={nombre}
                  onChangeText={setNombre}
                  autoCapitalize="words"
                />
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>CORREO ELECTRÓNICO</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color="rgba(255,255,255,0.3)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="ejemplo@correo.com"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {mode !== 'reset' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>CONTRASEÑA</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color="rgba(255,255,255,0.3)" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)} style={{ padding: 10 }}>
                  <Ionicons name={showPass ? 'eye-off' : 'eye'} size={18} color="rgba(255,255,255,0.3)" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {mode === 'register' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>CONFIRMAR CONTRASEÑA</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="shield-checkmark-outline" size={18} color="rgba(255,255,255,0.3)" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Repite tu contraseña"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPass}
                />
              </View>
            </View>
          )}

          {/* Main Action Button */}
          <TouchableOpacity
            style={[styles.mainBtn, loading && { opacity: 0.6 }]}
            onPress={mode === 'login' ? handleLogin : mode === 'register' ? handleRegister : handleReset}
            disabled={loading}
          >
            <LinearGradient
              colors={['#00d1ff', '#0066ff']}
              style={styles.mainBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="black" />
              ) : (
                <Text style={styles.mainBtnText}>
                  {mode === 'login' ? 'INICIAR SESIÓN' : mode === 'register' ? 'CREAR CUENTA' : 'ENVIAR ENLACE'}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Secondary Actions */}
          {mode === 'login' && (
            <TouchableOpacity onPress={() => setMode('reset')} style={styles.secondaryAction}>
              <Text style={styles.secondaryActionText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          )}

          {mode === 'reset' && (
            <TouchableOpacity onPress={() => setMode('login')} style={styles.secondaryAction}>
              <Text style={styles.secondaryActionText}>← Volver al login</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Footer note */}
        <Text style={styles.footerNote}>
          Al continuar aceptas los{' '}
          <Text style={{ color: AppColors.primaryNeonBlue }}>Términos de Uso</Text>{' '}
          y la{' '}
          <Text style={{ color: AppColors.primaryNeonBlue }}>Política de Privacidad</Text>.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  glowTopLeft: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: AppColors.primaryNeonBlue,
    opacity: 0.04,
    top: -50,
    left: -50,
  },
  glowBottomRight: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: AppColors.primaryOrange,
    opacity: 0.04,
    bottom: -80,
    right: -80,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: AppColors.primaryNeonBlue + '60',
    backgroundColor: 'rgba(0, 209, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 3,
  },
  logoSubtitle: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 4,
    fontWeight: '700',
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modeTabActive: {
    backgroundColor: AppColors.primaryNeonBlue,
  },
  modeTabText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  modeTabTextActive: {
    color: 'black',
  },
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: 16,
    marginBottom: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 52,
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
  mainBtn: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  mainBtnGradient: {
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainBtnText: {
    color: 'black',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1.5,
  },
  secondaryAction: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  secondaryActionText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
  },
  footerNote: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.2)',
    fontSize: 11,
    lineHeight: 18,
  },
});
