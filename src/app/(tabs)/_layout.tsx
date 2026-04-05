import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { CustomTabBar } from '@components/navigation/custom-tab-bar';
import { SideDrawer } from '@components/navigation/side-drawer';
import { useThemeColors } from '@hooks/use-theme-colors';

export default function TabsLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const NavColors = useThemeColors();

  return (
    <View style={{ flex: 1, backgroundColor: NavColors.bg0 }}>
      <Tabs
        screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: NavColors.bg0 } }}
        tabBar={(props) => (
          <CustomTabBar
            {...props}
            onMenuPress={() => setDrawerOpen(true)}
          />
        )}
      >
        <Tabs.Screen
          name="index"
          options={{ title: 'Home' }}
        />
        <Tabs.Screen
          name="historico"
          options={{ title: 'Histórico' }}
        />
        <Tabs.Screen
          name="notificacoes"
          options={{ title: 'Notificações' }}
        />
        <Tabs.Screen
          name="meu-medico"
          options={{ title: 'Meu Médico' }}
        />
        <Tabs.Screen
          name="perfil"
          options={{ title: 'Perfil', href: null }}
        />
      </Tabs>

      {/* Side drawer rendered above all tabs */}
      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </View>
  );
}
