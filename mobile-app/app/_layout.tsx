import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { LanguageProvider } from '@/context/LanguageContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <LanguageProvider>
      <ThemeProvider value={DarkTheme}>
        <Stack screenOptions={{ headerShown: false }}>
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
}

