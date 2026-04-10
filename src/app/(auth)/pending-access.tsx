import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@stores/auth.store';
import { useThemeColors } from '@hooks/use-theme-colors';
import { useQuery } from '@tanstack/react-query';
import { AuthService } from '@lib/services/auth.service';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function PendingAccessScreen() {
  const NavColors = useThemeColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { clearSession, setSession } = useAuthStore();

  const { data: sessionData } = useQuery({
    queryKey: ['sessionStatus'],
    queryFn: async () => {
      const { data } = await AuthService.getCurrentSession();
      return data;
    },
    refetchInterval: 15000, 
  });

  React.useEffect(() => {
    if (sessionData?.user?.status === 'ACTIVE') {
      setSession(sessionData);
      router.replace('/(tabs)');
    }
  }, [sessionData]);

  const handleLogout = async () => {
    await AuthService.signOut();
    clearSession();
    router.replace('/(auth)/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: NavColors.bg0 }]}>
      <LinearGradient colors={[NavColors.bg1, NavColors.bg0]} style={StyleSheet.absoluteFill} />
      
      <View style={[styles.content, { paddingTop: insets.top + 40 }]}>
        <Animated.View entering={FadeInDown.delay(200)} style={styles.iconContainer}>
          <View style={[styles.iconBg, { backgroundColor: `${NavColors.cyan}15` }]}>
            <Ionicons name="time" size={64} color={NavColors.cyan} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400)} style={styles.textContainer}>
          <Text style={[styles.title, { color: NavColors.textPrimary }]}>Acesso Pendente</Text>
          <Text style={[styles.description, { color: NavColors.textMuted }]}>
            Sua solicitação de cadastro foi recebida e está aguardando aprovação administrativa.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(600)} style={styles.card}>
          <View style={[styles.infoCard, { backgroundColor: NavColors.bg1, borderColor: NavColors.borderSoft }]}>
            <Ionicons name="information-circle-outline" size={24} color={NavColors.cyan} />
            <Text style={[styles.infoText, { color: NavColors.textSecondary }]}>
              Você receberá acesso total assim que seu perfil for validado.
            </Text>
          </View>
        </Animated.View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={[styles.logoutText, { color: NavColors.textMuted }]}>Sair da conta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 32, alignItems: 'center' },
  iconContainer: { marginBottom: 32 },
  iconBg: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center' },
  textContainer: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 28, fontWeight: '900', marginBottom: 16, textAlign: 'center' },
  description: { fontSize: 16, textAlign: 'center', lineHeight: 24 },
  card: { width: '100%' },
  infoCard: { flexDirection: 'row', padding: 20, borderRadius: 20, borderWidth: 1, alignItems: 'center', gap: 16 },
  infoText: { flex: 1, fontSize: 14, fontWeight: '500', lineHeight: 20 },
  footer: { marginTop: 'auto', marginBottom: 40 },
  logoutButton: { padding: 12 },
  logoutText: { fontSize: 14, fontWeight: '700', textDecorationLine: 'underline' }
});
