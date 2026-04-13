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
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useAuthStore } from '@stores/auth.store';
import { VersionService } from '@lib/services/version.service';
import { UpdateRequiredScreen } from '@components/update-required';
import { useThemeStore } from '@stores/theme.store';
import { MeasurementSyncEngine } from '@components/measurement-sync-engine';
import { ReminderSyncEngine } from '@components/reminder-sync-engine';

const queryClient = new QueryClient();

preventAutoHideAsync();

function RootLayoutContent() {
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
  
  const { data: appConfig, isLoading: isVersionChecking } = useQuery({
    queryKey: ['appConfig'],
    queryFn: async () => {
      const config = await VersionService.getConfig();
      const needsUpdate = await VersionService.checkUpdateRequired(config.min_version);
      return { config, needsUpdate };
    },
    staleTime: Infinity, 
  });

  const { isLoading: isHydrating } = useQuery({
    queryKey: ['sessionHydrate'],
    queryFn: async () => {
      await hydrateSession();
      return true;
    },
    staleTime: Infinity,
  });

  const isUpdateRequired = appConfig?.needsUpdate || false;
  const storeUrl = appConfig?.config?.store_url || '';

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(NavColors.bg1);
  }, [NavColors]);

  useEffect(() => {
    if (isUpdateRequired) return;
    if (!navigationState?.key || isAuthLoading || isVersionChecking || isHydrating) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else {
      const userStatus = useAuthStore.getState().session?.user?.status;
      
      if (userStatus === 'PENDING') {
        if (segments[1] !== 'pending-access') {
          router.replace('/(auth)/pending-access');
        }
        return;
      }

      if (inAuthGroup && segments[1] !== 'pending-access') {
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, isAuthLoading, isVersionChecking, isHydrating, isUpdateRequired, segments, router, navigationState?.key]);

  useEffect(() => {
    if (!isAuthLoading && !isVersionChecking && !isHydrating) {
      hideAsync();
    }
  }, [isAuthLoading, isVersionChecking, isHydrating]);

  if (isVersionChecking || isHydrating || (isAuthLoading && !isAuthenticated)) {
    return (
      <View style={{ flex: 1, backgroundColor: NavColors.bg1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={NavColors.cyan} size="large" />
      </View>
    );
  }

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
      <MeasurementSyncEngine />
      <ReminderSyncEngine />
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

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootLayoutContent />
    </QueryClientProvider>
  );
}
