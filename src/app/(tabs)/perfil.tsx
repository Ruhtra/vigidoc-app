import React from 'react';
import { StyleSheet, View } from 'react-native';
 import { useSafeAreaInsets } from 'react-native-safe-area-context';
 
 import { UnderConstruction } from '@components/ui/under-construction';
 import { NavColors } from '@constants/nav-theme';
 
 export default function PerfilScreen() {
   const insets = useSafeAreaInsets();
 
   return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
       <UnderConstruction
         title="Meu Perfil"
         subtitle="Gerencie suas informações pessoais, configure preferências do app e personalize sua experiência no VigiDoc."
         icon="person-outline"
         accentColor={NavColors.textSecondary}
       />
    </View>
   );
 }

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: NavColors.bg0 },
});
