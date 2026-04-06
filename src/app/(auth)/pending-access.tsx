import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Reanimated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@hooks/use-auth';
import { useThemeColors } from '@hooks/use-theme-colors';
import { NavSpacing } from '@/constants/nav-theme';
import { ThemeToggle } from '@components/ui/theme-toggle';

export default function PendingAccessScreen() {
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const NavColors = useThemeColors();

  // ── Pulsing glow animation ──
  const glowOpacity = useSharedValue(0.3);
  const iconScale = useSharedValue(1);
  const dotOpacity1 = useSharedValue(0.3);
  const dotOpacity2 = useSharedValue(0.3);
  const dotOpacity3 = useSharedValue(0.3);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(withTiming(0.7, { duration: 1800 }), withTiming(0.25, { duration: 1800 })),
      -1
    );

    iconScale.value = withRepeat(
      withSequence(withTiming(1.04, { duration: 1600 }), withTiming(1, { duration: 1600 })),
      -1
    );

    const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));
    const animate = async () => {
      while (true) {
        dotOpacity1.value = withTiming(1, { duration: 300 });
        await delay(300);
        dotOpacity2.value = withTiming(1, { duration: 300 });
        await delay(300);
        dotOpacity3.value = withTiming(1, { duration: 300 });
        await delay(500);
        dotOpacity1.value = withTiming(0.3, { duration: 200 });
        dotOpacity2.value = withTiming(0.3, { duration: 200 });
        dotOpacity3.value = withTiming(0.3, { duration: 200 });
        await delay(400);
      }
    };
    animate();
  }, [dotOpacity1, dotOpacity2, dotOpacity3, glowOpacity, iconScale]);

  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }));
  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: iconScale.value }] }));
  const dot1Style = useAnimatedStyle(() => ({ opacity: dotOpacity1.value }));
  const dot2Style = useAnimatedStyle(() => ({ opacity: dotOpacity2.value }));
  const dot3Style = useAnimatedStyle(() => ({ opacity: dotOpacity3.value }));

  return (
    <View style={[styles.root, { backgroundColor: NavColors.bg0, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Background grid pattern */}
      <View style={styles.gridBg} pointerEvents="none">
        {Array.from({ length: 8 }).map((_, row) =>
          Array.from({ length: 5 }).map((_, col) => (
            <View
              key={`${row}-${col}`}
              style={[
                styles.gridCell,
                { opacity: 0.02, borderColor: NavColors.warning },
              ]}
            />
          ))
        )}
      </View>

      <View style={[styles.cornerTL, { borderColor: NavColors.warning + '60' }]} />
      <View style={[styles.cornerBR, { borderColor: NavColors.warning + '60' }]} />

      <View style={styles.topRightActions}>
        <ThemeToggle />
      </View>

      <Reanimated.View entering={FadeIn.duration(500)} style={styles.content}>
        {/* ── Icon ── */}
        <View style={styles.iconWrapper}>
          <Reanimated.View
            style={[styles.iconGlow, { backgroundColor: NavColors.warning }, glowStyle]}
          />
          <View style={[styles.iconRingOuter, { backgroundColor: NavColors.warning + '15', borderColor: NavColors.warning + '30' }]}>
            <Reanimated.View style={[styles.iconInner, iconStyle]}>
              <Ionicons name="time-outline" size={52} color={NavColors.warning} />
            </Reanimated.View>
          </View>
        </View>

        {/* ── Badge ── */}
        <Reanimated.View entering={FadeInDown.duration(400).delay(100)} style={[styles.badge, { backgroundColor: NavColors.warning + '15', borderColor: NavColors.warning + '30' }]}>
          <View style={[styles.badgeDot, { backgroundColor: NavColors.warning }]} />
          <Text style={[styles.badgeText, { color: NavColors.warning }]}>AGUARDANDO APROVAÇÃO</Text>
        </Reanimated.View>

        {/* ── Title ── */}
        <Reanimated.View entering={FadeInDown.duration(400).delay(200)} style={styles.textBlock}>
          <Text style={[styles.title, { color: NavColors.textPrimary }]}>Acesso Pendente</Text>
          <Text style={[styles.subtitle, { color: NavColors.textSecondary }]}>
            Sua conta foi criada com sucesso! Estamos aguardando a{' '}
            <Text style={{ color: NavColors.cyan, fontWeight: '700' }}>
              liberação do seu acesso
            </Text>{' '}
            por um administrador.
          </Text>
        </Reanimated.View>

        {/* ── Info cards ── */}
        <Reanimated.View
          entering={FadeInDown.duration(400).delay(300)}
          style={styles.infoCards}
        >
          <View style={[styles.infoCard, { backgroundColor: NavColors.bg1, borderColor: NavColors.border }]}>
            <Ionicons name="notifications-outline" size={20} color={NavColors.cyan} />
            <View style={styles.infoCardText}>
              <Text style={[styles.infoCardTitle, { color: NavColors.textPrimary }]}>Notificação automática</Text>
              <Text style={[styles.infoCardSub, { color: NavColors.textMuted }]}>
                Você será notificado assim que seu acesso for liberado. O app abrirá automaticamente.
              </Text>
            </View>
          </View>

          <View style={[styles.infoCard, { backgroundColor: NavColors.bg1, borderColor: NavColors.border }]}>
            <Ionicons name="shield-checkmark-outline" size={20} color={NavColors.cyan} />
            <View style={styles.infoCardText}>
              <Text style={[styles.infoCardTitle, { color: NavColors.textPrimary }]}>Seus dados estão seguros</Text>
              <Text style={[styles.infoCardSub, { color: NavColors.textMuted }]}>
                A verificação manual garante que apenas profissionais autorizados acessem a plataforma.
              </Text>
            </View>
          </View>
        </Reanimated.View>

        {/* ── Loading dots ── */}
        <Reanimated.View entering={FadeInDown.duration(400).delay(400)} style={styles.dotsRow}>
          <Text style={[styles.dotsLabel, { color: NavColors.textMuted }]}>Verificando seu status</Text>
          <View style={styles.dots}>
            <Reanimated.View style={[styles.dot, { backgroundColor: NavColors.warning }, dot1Style]} />
            <Reanimated.View style={[styles.dot, { backgroundColor: NavColors.warning }, dot2Style]} />
            <Reanimated.View style={[styles.dot, { backgroundColor: NavColors.warning }, dot3Style]} />
          </View>
        </Reanimated.View>

        {/* ── Logout link ── */}
        <Reanimated.View entering={FadeInDown.duration(400).delay(500)}>
          <Pressable
            onPress={logout}
            style={styles.logoutButton}
            testID="btn-logout-pending"
          >
            <Ionicons name="log-out-outline" size={15} color={NavColors.textMuted} />
            <Text style={[styles.logoutText, { color: NavColors.textMuted }]}>Sair e usar outra conta</Text>
          </Pressable>
        </Reanimated.View>
      </Reanimated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  gridBg: { ...StyleSheet.absoluteFillObject, flexDirection: 'row', flexWrap: 'wrap' },
  gridCell: { width: '20%', height: 80, borderWidth: 0.5 },
  cornerTL: { position: 'absolute', top: 64, left: 24, width: 28, height: 28, borderTopWidth: 2, borderLeftWidth: 2, borderRadius: 4 },
  cornerBR: { position: 'absolute', bottom: 80, right: 24, width: 28, height: 28, borderBottomWidth: 2, borderRightWidth: 2, borderRadius: 4 },
  content: { alignItems: 'center', paddingHorizontal: NavSpacing.lg, gap: NavSpacing.lg, maxWidth: 360, width: '100%' },
  iconWrapper: { width: 140, height: 140, alignItems: 'center', justifyContent: 'center', marginBottom: NavSpacing.sm },
  iconGlow: { position: 'absolute', width: 100, height: 100, borderRadius: 50, opacity: 0.08 },
  iconRingOuter: { width: 110, height: 110, borderRadius: 55, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  iconInner: { alignItems: 'center', justifyContent: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
  badgeDot: { width: 7, height: 7, borderRadius: 4 },
  badgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  textBlock: { alignItems: 'center', gap: NavSpacing.sm },
  title: { fontSize: 26, fontWeight: '800', textAlign: 'center', letterSpacing: 0.3 },
  subtitle: { fontSize: 15, textAlign: 'center', lineHeight: 23 },
  infoCards: { width: '100%', gap: NavSpacing.sm },
  infoCard: { flexDirection: 'row', alignItems: 'flex-start', gap: NavSpacing.sm, borderWidth: 1, borderRadius: 16, padding: NavSpacing.md },
  infoCardText: { flex: 1, gap: 4 },
  infoCardTitle: { fontSize: 14, fontWeight: '700' },
  infoCardSub: { fontSize: 13, lineHeight: 19 },
  dotsRow: { alignItems: 'center', gap: NavSpacing.xs },
  dotsLabel: { fontSize: 12, letterSpacing: 0.3 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: NavSpacing.sm, paddingHorizontal: NavSpacing.md },
  logoutText: { fontSize: 13, fontWeight: '500' },
  topRightActions: {
    position: 'absolute',
    top: 60, // Sits comfortably below system bar
    right: 24,
    zIndex: 99,
  },
});
