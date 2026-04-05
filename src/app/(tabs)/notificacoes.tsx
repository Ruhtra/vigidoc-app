import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { UnderConstruction } from '@components/ui/under-construction';
import { NavColors } from '@constants/nav-theme';

export default function NotificacoesScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <UnderConstruction
        title="Notificações"
        subtitle="Receba alertas em tempo real sobre seus sinais vitais, lembretes de medicamentos e avisos do seu médico."
        icon="notifications-outline"
        accentColor={NavColors.warning}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: NavColors.bg0 },
});
