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

/* ─────────────────────────────────────────────────────────── */
/*  Design Tokens                                              */
/* ─────────────────────────────────────────────────────────── */

const palette = {
  bg: '#0A0F1E',
  bgCard: '#111827',
  bgCard2: '#131D2F',
  border: '#1F2D48',
  borderAccent: 'rgba(251,191,36,0.3)',
  teal400: '#2DD4BF',
  teal500: '#0D9488',
  tealDim: 'rgba(13,148,136,0.1)',
  amber400: '#FBBF24',
  amber500: '#F59E0B',
  amberDim: 'rgba(251,191,36,0.08)',
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  white: '#FFFFFF',
  dangerText: '#F87171',
} as const;

const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

/* ─────────────────────────────────────────────────────────── */
/*  Pending Access Screen                                      */
/* ─────────────────────────────────────────────────────────── */

export default function PendingAccessScreen() {
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();

  // ── Pulsing glow animation ──
  const glowOpacity = useSharedValue(0.3);
  const iconScale = useSharedValue(1);
  const dotOpacity1 = useSharedValue(0.3);
  const dotOpacity2 = useSharedValue(0.3);
  const dotOpacity3 = useSharedValue(0.3);

  useEffect(() => {
    // Softer breathing glow
    glowOpacity.value = withRepeat(
      withSequence(withTiming(0.7, { duration: 1800 }), withTiming(0.25, { duration: 1800 })),
      -1
    );

    // Subtle icon pulse
    iconScale.value = withRepeat(
      withSequence(withTiming(1.04, { duration: 1600 }), withTiming(1, { duration: 1600 })),
      -1
    );

    // Loading dots cascade
    const delay = (ms: number) =>
      new Promise<void>((res) => setTimeout(res, ms));
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
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Background grid pattern */}
      <View style={styles.gridBg} pointerEvents="none">
        {Array.from({ length: 8 }).map((_, row) =>
          Array.from({ length: 5 }).map((_, col) => (
            <View
              key={`${row}-${col}`}
              style={[
                styles.gridCell,
                { opacity: 0.02 + (row + col) * 0.003, borderColor: palette.amber400 },
              ]}
            />
          ))
        )}
      </View>

      {/* Corner accents */}
      <View style={[styles.cornerTL, { borderColor: palette.amber400 }]} />
      <View style={[styles.cornerBR, { borderColor: palette.amber400 }]} />

      <Reanimated.View entering={FadeIn.duration(500)} style={styles.content}>
        {/* ── Icon ── */}
        <View style={styles.iconWrapper}>
          {/* Breathing glow */}
          <Reanimated.View
            style={[styles.iconGlow, { backgroundColor: palette.amber400 }, glowStyle]}
          />

          {/* Outer ring */}
          <View style={styles.iconRingOuter}>
            <Reanimated.View style={[styles.iconInner, iconStyle]}>
              <Ionicons name="time-outline" size={52} color={palette.amber400} />
            </Reanimated.View>
          </View>
        </View>

        {/* ── Badge ── */}
        <Reanimated.View entering={FadeInDown.duration(400).delay(100)} style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>AGUARDANDO APROVAÇÃO</Text>
        </Reanimated.View>

        {/* ── Title ── */}
        <Reanimated.View entering={FadeInDown.duration(400).delay(200)} style={styles.textBlock}>
          <Text style={styles.title}>Acesso Pendente</Text>
          <Text style={styles.subtitle}>
            Sua conta foi criada com sucesso! Estamos aguardando a{' '}
            <Text style={{ color: palette.teal400, fontWeight: '700' }}>
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
          <View style={styles.infoCard}>
            <Ionicons name="notifications-outline" size={20} color={palette.teal400} />
            <View style={styles.infoCardText}>
              <Text style={styles.infoCardTitle}>Notificação automática</Text>
              <Text style={styles.infoCardSub}>
                Você será notificado assim que seu acesso for liberado. O app abrirá automaticamente.
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="shield-checkmark-outline" size={20} color={palette.teal400} />
            <View style={styles.infoCardText}>
              <Text style={styles.infoCardTitle}>Seus dados estão seguros</Text>
              <Text style={styles.infoCardSub}>
                A verificação manual garante que apenas profissionais autorizados acessem a plataforma.
              </Text>
            </View>
          </View>
        </Reanimated.View>

        {/* ── Loading dots ── */}
        <Reanimated.View entering={FadeInDown.duration(400).delay(400)} style={styles.dotsRow}>
          <Text style={styles.dotsLabel}>Verificando seu status</Text>
          <View style={styles.dots}>
            <Reanimated.View style={[styles.dot, dot1Style]} />
            <Reanimated.View style={[styles.dot, dot2Style]} />
            <Reanimated.View style={[styles.dot, dot3Style]} />
          </View>
        </Reanimated.View>

        {/* ── Logout link ── */}
        <Reanimated.View entering={FadeInDown.duration(400).delay(500)}>
          <Pressable
            onPress={logout}
            style={styles.logoutButton}
            testID="btn-logout-pending"
          >
            <Ionicons name="log-out-outline" size={15} color={palette.textMuted} />
            <Text style={styles.logoutText}>Sair e usar outra conta</Text>
          </Pressable>
        </Reanimated.View>
      </Reanimated.View>
    </View>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Styles                                                     */
/* ─────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Grid background */
  gridBg: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridCell: {
    width: '20%',
    height: 80,
    borderWidth: 0.5,
  },

  /* Corner accents */
  cornerTL: {
    position: 'absolute',
    top: 64,
    left: 24,
    width: 28,
    height: 28,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRadius: 4,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 80,
    right: 24,
    width: 28,
    height: 28,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderRadius: 4,
  },

  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
    maxWidth: 360,
    width: '100%',
  },

  /* Icon */
  iconWrapper: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  iconGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.08,
  },
  iconRingOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: palette.amberDim,
    borderWidth: 1.5,
    borderColor: palette.borderAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Badge */
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: palette.amberDim,
    borderWidth: 1,
    borderColor: palette.borderAccent,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: palette.amber400,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: palette.amber400,
    letterSpacing: 1.2,
  },

  /* Text block */
  textBlock: { alignItems: 'center', gap: spacing.sm },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: palette.textPrimary,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 15,
    color: palette.textSecondary,
    textAlign: 'center',
    lineHeight: 23,
  },

  /* Info cards */
  infoCards: { width: '100%', gap: spacing.sm },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: palette.bgCard,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 16,
    padding: spacing.md,
  },
  infoCardText: { flex: 1, gap: 4 },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  infoCardSub: {
    fontSize: 13,
    color: palette.textMuted,
    lineHeight: 19,
  },

  /* Loading dots */
  dotsRow: { alignItems: 'center', gap: spacing.xs },
  dotsLabel: { fontSize: 12, color: palette.textMuted, letterSpacing: 0.3 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.amber400,
  },

  /* Logout */
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  logoutText: {
    fontSize: 13,
    color: palette.textMuted,
    fontWeight: '500',
  },
});
