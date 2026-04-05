import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { UnderConstruction } from '@components/ui/under-construction';
import { NavColors } from '@constants/nav-theme';

export default function MeuMedicoScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <UnderConstruction
        title="Meu Médico"
        subtitle="Conecte-se ao seu médico, agende consultas, envie mensagens e acompanhe orientações diretamente pelo app."
        icon="medkit-outline"
        accentColor={NavColors.green}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: NavColors.bg0 },
});
