import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import * as Sentry from '@sentry/react-native';
import { LanguageProvider } from '@/context/LanguageContext';
import { useEffect } from 'react';
import { auth } from '@/constants/FirebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

Sentry.init({
  dsn: '', // Reemplaza con tu DSN real de sentry.io cuando tengas una cuenta
  debug: false,
  enabled: false, // Deshabilitar hasta configurar DSN real
});

export const unstable_settings = {
  anchor: '(tabs)',
};

export default Sentry.wrap(function RootLayout() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace('/login' as any);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <LanguageProvider>
      <ThemeProvider value={DarkTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" options={{ headerShown: false, animation: 'fade' }} />
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
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </LanguageProvider>
  );
});

