import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Reanimated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { NavRadius, NavSpacing, TAB_BAR_HEIGHT } from '@constants/nav-theme';
import type { ThemeColors } from '@constants/nav-theme';
import { useThemeColors } from '@hooks/use-theme-colors';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

type UnderConstructionProps = {
  title: string;
  subtitle?: string;
  icon: IoniconName;
  accentColor?: string;
};

export function UnderConstruction({
  title,
  subtitle,
  icon,
  accentColor,
}: UnderConstructionProps) {
  const NavColors = useThemeColors();
  const styles = useStyles(NavColors);
  const color = accentColor ?? NavColors.cyan;

  // Pulse animation for the main icon
  const iconScale = useSharedValue(1);
  const iconGlow = useSharedValue(0.5);
  const ring1Scale = useSharedValue(1);
  const ring2Scale = useSharedValue(1);
  const ring1Opacity = useSharedValue(0.4);
  const ring2Opacity = useSharedValue(0.2);

  useEffect(() => {
    iconScale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 1800 }),
        withTiming(1, { duration: 1800 })
      ),
      -1
    );
    iconGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1600 }),
        withTiming(0.4, { duration: 1600 })
      ),
      -1
    );
    ring1Scale.value = withRepeat(
      withSequence(
        withTiming(1.6, { duration: 2200 }),
        withTiming(1, { duration: 0 })
      ),
      -1
    );
    ring1Opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 2200 }),
        withTiming(0.35, { duration: 0 })
      ),
      -1
    );
    ring2Scale.value = withRepeat(
      withSequence(
        withTiming(1.6, { duration: 2200 }),
        withTiming(1, { duration: 0 })
      ),
      -1,
      false // reverse phase
    );
  }, [iconScale, iconGlow, ring1Scale, ring2Scale, ring1Opacity, ring2Opacity]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const iconGlowStyle = useAnimatedStyle(() => ({
    opacity: iconGlow.value,
  }));

  const ring1Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring1Scale.value }],
    opacity: ring1Opacity.value,
  }));

  const ring2Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring2Scale.value }],
    opacity: ring1Opacity.value * 0.6,
  }));

  return (
    <View style={[styles.root, { paddingBottom: TAB_BAR_HEIGHT + 24 }]}>
      {/* Background grid pattern */}
      <View style={styles.gridBg} pointerEvents="none">
        {Array.from({ length: 10 }).map((_, row) =>
          Array.from({ length: 6 }).map((_, col) => (
            <View
              key={`${row}-${col}`}
              style={[
                styles.gridCell,
                {
                  opacity: 0.03 + (row + col) * 0.003,
                  borderColor: color,
                },
              ]}
            />
          ))
        )}
      </View>

      {/* Corner accents */}
      <View style={[styles.cornerTL, { borderColor: color }]} />
      <View style={[styles.cornerBR, { borderColor: color }]} />

      <Reanimated.View entering={FadeIn.duration(400)} style={styles.content}>
        {/* Pulsing rings behind icon */}
        <View style={styles.iconWrapper}>
          <Reanimated.View
            style={[styles.ring, styles.ring2, { borderColor: color }, ring2Style]}
          />
          <Reanimated.View
            style={[styles.ring, styles.ring1, { borderColor: color }, ring1Style]}
          />

          {/* Glow circle */}
          <Reanimated.View
            style={[
              styles.iconGlow,
              { backgroundColor: color },
              iconGlowStyle,
            ]}
          />

          {/* Icon container */}
          <Reanimated.View
            style={[
              styles.iconContainer,
              {
                backgroundColor: `${color}14`,
                borderColor: `${color}40`,
              },
              iconStyle,
            ]}
          >
            <Ionicons name={icon} size={38} color={color} />
          </Reanimated.View>
        </View>

        {/* Badge */}
        <View style={[styles.badge, { borderColor: `${color}35`, backgroundColor: `${color}10` }]}>
          <View style={[styles.badgeDot, { backgroundColor: color }]} />
          <Text style={[styles.badgeText, { color: color }]}>
            EM CONSTRUÇÃO
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{title}</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          {subtitle ?? 'Esta funcionalidade está sendo desenvolvida e estará disponível em breve.'}
        </Text>

        {/* Progress bar */}
        <View style={styles.progressWrapper}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: color, width: '35%' },
              ]}
            />
            <View style={[styles.progressGlow, { backgroundColor: color }]} />
          </View>
          <Text style={styles.progressLabel}>35% concluído</Text>
        </View>

        {/* Decorative code lines */}
        <View style={styles.codeLines}>
          {['SISTEMA', 'VIGIDOC', 'v2.0'].map((token, i) => (
            <View key={token} style={styles.codeLine}>
              <View style={[styles.codeLineDot, { opacity: 1 - i * 0.25, backgroundColor: color }]} />
              <Text style={[styles.codeLineText, { opacity: 0.4 + i * 0.1 }]}>{token}</Text>
            </View>
          ))}
        </View>
      </Reanimated.View>
    </View>
  );
}

/* ─────────────────────────────────────────── */
/*  Styles                                     */
/* ─────────────────────────────────────────── */

const useStyles = (NavColors: ThemeColors) => React.useMemo(() => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: NavColors.bg0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Grid background ──
  gridBg: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  gridCell: {
    width: '16.66%',
    height: 70,
    borderWidth: 0.5,
  },

  // ── Corner accents ──
  cornerTL: {
    position: 'absolute',
    top: 48,
    left: 24,
    width: 28,
    height: 28,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRadius: 4,
  },

  cornerBR: {
    position: 'absolute',
    bottom: 120,
    right: 24,
    width: 28,
    height: 28,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderRadius: 4,
  },

  content: {
    alignItems: 'center',
    paddingHorizontal: NavSpacing.xl,
    gap: NavSpacing.lg,
    maxWidth: 320,
  },

  // ── Icon ──
  iconWrapper: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: NavSpacing.sm,
  },

  ring: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1,
  },

  ring1: {
    width: 100,
    height: 100,
  },

  ring2: {
    width: 120,
    height: 120,
  },

  iconGlow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    opacity: 0.06,
    filter: [{ blur: 20 }] as never,
  },

  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Badge ──
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: NavRadius.full,
    borderWidth: 1,
  },

  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  // ── Text ──
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: NavColors.textPrimary,
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: 32,
  },

  subtitle: {
    fontSize: 14,
    color: NavColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.2,
  },

  // ── Progress ──
  progressWrapper: {
    width: '100%',
    gap: 8,
    marginTop: NavSpacing.sm,
  },

  progressTrack: {
    height: 4,
    backgroundColor: NavColors.bg3,
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
  },

  progressFill: {
    height: '100%',
    borderRadius: 2,
  },

  progressGlow: {
    position: 'absolute',
    right: '65%',
    top: -3,
    width: 8,
    height: 10,
    borderRadius: 4,
    opacity: 0.6,
  },

  progressLabel: {
    fontSize: 11,
    color: NavColors.textMuted,
    textAlign: 'right',
    letterSpacing: 0.5,
    fontWeight: '600',
  },

  // ── Code lines decoration ──
  codeLines: {
    flexDirection: 'row',
    gap: NavSpacing.lg,
    marginTop: NavSpacing.sm,
  },

  codeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  codeLineDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },

  codeLineText: {
    fontSize: 10,
    color: NavColors.textMuted,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
}), [NavColors]);
