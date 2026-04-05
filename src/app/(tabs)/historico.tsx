import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { UnderConstruction } from '@components/ui/under-construction';
import { NavColors } from '@constants/nav-theme';

export default function HistoricoScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <UnderConstruction
        title="Histórico de Saúde"
        subtitle="Acompanhe todo o histórico de registros, exames e evolução do seu estado de saúde ao longo do tempo."
        icon="time-outline"
        accentColor={NavColors.violet}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: NavColors.bg0 },
});
