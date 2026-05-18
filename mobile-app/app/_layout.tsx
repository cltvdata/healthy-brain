import React, { useEffect, useState } from 'react';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { LanguageProvider } from '@/context/LanguageContext';
import { auth, db } from '@/constants/FirebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { View, ActivityIndicator } from 'react-native';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigationState = useRootNavigationState();

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });
    return subscriber;
  }, []);

  useEffect(() => {
    if (initializing || !navigationState?.key) return;

    const checkRedirect = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (!data.profileCompleted) {
              router.replace('/perfil-setup');
              return;
            }
          }
        } catch (e) {
          console.error("Error checking profile completion:", e);
        }
      } else {
        router.replace('/login');
      }
    };

    checkRedirect();
  }, [user, initializing, navigationState?.key]);

  if (initializing) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#13ec5b" />
      </View>
    );
  }

  return (
    <LanguageProvider>
      <ThemeProvider value={DarkTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="progreso" />
          <Stack.Screen name="pagos" />
          <Stack.Screen name="sesion-enfoque" options={{ presentation: 'modal' }} />
          <Stack.Screen name="perfil-setup" />
          <Stack.Screen name="comunidad" />
          <Stack.Screen name="analisis-longevidad" />
          <Stack.Screen name="analisis-sueño" />
          <Stack.Screen name="bio-report" />
          <Stack.Screen name="bio-sync" />
          <Stack.Screen name="certificado" />
          <Stack.Screen name="entrenar" />
          <Stack.Screen name="escuadrones" />
          <Stack.Screen name="market" />
          <Stack.Screen name="mentores" />
          <Stack.Screen name="notebook-insights" />
          <Stack.Screen name="nutricion-ia" />
          <Stack.Screen name="passport" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="ranking" options={{ presentation: 'modal' }} />
          <Stack.Screen name="recompensas" />
          <Stack.Screen name="sueno-profundo" />
          <Stack.Screen name="torneos" />
          <Stack.Screen name="wallet" />
          <Stack.Screen name="legal-disclaimer" />
          <Stack.Screen name="micro-intervenciones" />
          <Stack.Screen name="recovery-dashboard" />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          <Stack.Screen name="logros" />
          <Stack.Screen name="gemelo" />
          <Stack.Screen name="salud-conexiones" />
          <Stack.Screen name="mEDITACION" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </LanguageProvider>
  );
}

