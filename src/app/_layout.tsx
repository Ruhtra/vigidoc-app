import { 
  DarkTheme as NavigationDarkTheme, 
  DefaultTheme as NavigationLightTheme, 
  ThemeProvider 
} from '@react-navigation/native';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { preventAutoHideAsync, hideAsync } from 'expo-splash-screen';
import React, { useEffect, useState, useMemo } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { getThemeColors } from '@constants/nav-theme';

import { useAuthStore } from '@stores/auth.store';
import { VersionService } from '@lib/services/version.service';
import { UpdateRequiredScreen } from '@components/update-required';
import { useThemeStore } from '@stores/theme.store';

preventAutoHideAsync();

export default function RootLayout() {
  const { theme: storeTheme } = useThemeStore();
  const NavColors = useMemo(() => getThemeColors(storeTheme), [storeTheme]);
  const isDark = storeTheme === 'dark';

  // Custom Theme based on VigiDoc DNA
  const VigiDocTheme = useMemo(() => ({
    ...(isDark ? NavigationDarkTheme : NavigationLightTheme),
    colors: {
      ...(isDark ? NavigationDarkTheme.colors : NavigationLightTheme.colors),
      background: NavColors.bg1,
      primary: NavColors.cyan,
      card: NavColors.bg1,
      text: NavColors.textPrimary,
      border: NavColors.border,
      notification: NavColors.violet,
    },
  }), [isDark, NavColors]);

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
    SystemUI.setBackgroundColorAsync(NavColors.bg1);
  }, [NavColors]);

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
      // 3. Verificação de status do usuário (Persistence check)
      const userStatus = useAuthStore.getState().session?.user?.status;
      
      if (userStatus === 'PENDING') {
        // Se estiver pendente e não estiver na tela de pendência, redireciona pra lá
        if (segments[1] !== 'pending-access') {
          router.replace('/(auth)/pending-access');
        }
        return;
      }

      // Se estiver autenticado e ativo, e tentar entrar em rotas de auth (exceto pending-access), vai pro Home
      if (inAuthGroup && segments[1] !== 'pending-access') {
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
      <View style={{ flex: 1, backgroundColor: NavColors.bg1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={NavColors.cyan} size="large" />
      </View>
    );
  }

  // SE FOR OBRIGATÓRIO ATUALIZAR, RENDERIZA APENAS A TELA DE BLOQUEIO
  if (isUpdateRequired) {
    return (
      <ThemeProvider value={VigiDocTheme}>
        <StatusBar style={isDark ? "light" : "dark"} translucent backgroundColor="transparent" />
        <UpdateRequiredScreen storeUrl={storeUrl} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={VigiDocTheme}>
      <StatusBar style={isDark ? "light" : "dark"} translucent backgroundColor="transparent" />
      <View style={{ flex: 1, backgroundColor: NavColors.bg1 }}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: NavColors.bg1 } }}>
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

