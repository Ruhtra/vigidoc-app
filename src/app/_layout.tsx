import { DarkTheme as NavigationDarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { preventAutoHideAsync, hideAsync } from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { useColorScheme, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { NavColorsDark } from '@constants/nav-theme';

import { AuthService } from '@lib/services/auth.service';
import { useAuthStore } from '@stores/auth.store';
import { VersionService } from '@lib/services/version.service';
import { UpdateRequiredScreen } from '@components/update-required';

preventAutoHideAsync();

// Custom Dark Theme based on VigiDoc DNA
const VigiDocTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    background: NavColorsDark.bg1,
    primary: NavColorsDark.cyan,
    card: NavColorsDark.bg1,
    text: NavColorsDark.textPrimary,
    border: NavColorsDark.border,
    notification: NavColorsDark.violet,
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  const { isAuthenticated, isLoading: isAuthLoading, hydrateSession } = useAuthStore();
  
  // Estados para controle de versão
  const [isVersionChecking, setIsVersionChecking] = useState(true);
  const [isUpdateRequired, setIsUpdateRequired] = useState(false);
  const [storeUrl, setStoreUrl] = useState('');

  // 1. Verifica Versão e Hidrata Sessão
  useEffect(() => {
    async function initialize() {
      try {
        // Validação de Versão (Paralelo ao Auth para performance)
        const versionConfig = await VersionService.getConfig();
        const needsUpdate = await VersionService.checkUpdateRequired(versionConfig.min_version);
        
        setIsUpdateRequired(needsUpdate);
        setStoreUrl(versionConfig.store_url);
        
        // Hidratação da Sessão
        await hydrateSession();
      } catch (error) {
        console.error('[RootLayout] Init Error:', error);
      } finally {
        setIsVersionChecking(false);
      }
    }
    initialize();
  }, [hydrateSession]);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(NavColorsDark.bg1);
  }, []);

  // 2. Proteção de rotas: redireciona baseado no estado de autenticação
  useEffect(() => {
    // Se precisar atualizar, não faz redirect de auth
    if (isUpdateRequired) return;

    // Aguarda carregar tudo e roteador estar pronto
    if (!navigationState?.key || isAuthLoading || isVersionChecking) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else {
      if (inAuthGroup) {
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, isAuthLoading, isVersionChecking, isUpdateRequired, segments, router, navigationState?.key]);

  // 3. Esconde a splash screen após o estado INICIAL estar resolvido
  useEffect(() => {
    if (!isAuthLoading && !isVersionChecking) {
      hideAsync();
    }
  }, [isAuthLoading, isVersionChecking]);

  // Se estiver verificando a versão ou autenticando na abertura fria
  if (isVersionChecking || (isAuthLoading && !isAuthenticated)) {
    return (
      <View style={{ flex: 1, backgroundColor: NavColorsDark.bg1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={NavColorsDark.cyan} size="large" />
      </View>
    );
  }

  // SE FOR OBRIGATÓRIO ATUALIZAR, RENDERIZA APENAS A TELA DE BLOQUEIO
  if (isUpdateRequired) {
    return (
      <ThemeProvider value={VigiDocTheme}>
        <StatusBar style="light" translucent backgroundColor="transparent" />
        <UpdateRequiredScreen storeUrl={storeUrl} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={VigiDocTheme}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <View style={{ flex: 1, backgroundColor: NavColorsDark.bg1 }}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: NavColorsDark.bg1 } }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen 
            name="new-measurement" 
            options={{ 
              presentation: 'modal',
              headerShown: false
            }} 
          />
        </Stack>
      </View>
    </ThemeProvider>
  );
}

