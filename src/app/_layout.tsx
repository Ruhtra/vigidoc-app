import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { AuthService } from '@lib/services/auth.service';
import { useAuthStore } from '@stores/auth.store';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();

  const { isAuthenticated, isLoading, setSession, hydrateSession } =
    useAuthStore();

  // 1. Hidrata o store com a sessão persistida no AsyncStorage
  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  // 2. Depois de hidratar, valida a sessão com o servidor Better-Auth
  useEffect(() => {
    if (isLoading) return;

    async function validateSession() {
      if (isAuthenticated) {
        const serverSession = await AuthService.getCurrentSession();
        if (!serverSession) {
          // Token expirado/inválido — limpa e redireciona
          setSession(null);
        }
      }
    }

    validateSession();
  }, [isLoading, isAuthenticated, setSession]);

  // 3. Proteção de rotas: redireciona baseado no estado de autenticação
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments, router]);

  // 4. Esconde a splash screen após resolver o estado de autenticação
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}
