import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Reanimated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NavRadius, NavSpacing, TAB_BAR_HEIGHT } from '@constants/nav-theme';
import { useAuthStore } from '@stores/auth.store';
import { useAuth } from '@hooks/use-auth';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@hooks/use-theme-colors';
import { useThemeStore } from '@stores/theme.store';
import { UserDropdown } from '@components/navigation/user-dropdown';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

/* ─────────────────────────────────────────── */
/*  Health pulse animation                     */
/* ─────────────────────────────────────────── */

function VitalPulse() {
  const NavColors = useThemeColors();
  const vitals = useVitalsStyles(NavColors);
  const lineOffset = useSharedValue(0);

  useEffect(() => {
    lineOffset.value = withRepeat(
      withTiming(-200, { duration: 2000 }),
      -1
    );
  }, [lineOffset]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: lineOffset.value }],
  }));

  return (
    <View style={vitals.pulseWrapper}>
      <Reanimated.View style={[vitals.pulseTrack, animStyle]}>
        <View style={vitals.ecgLine}>
          <View style={vitals.ecgFlat} />
          <View style={vitals.ecgSpike} />
          <View style={vitals.ecgFlat} />
        </View>
      </Reanimated.View>
      <View style={vitals.pulseGlow} />
    </View>
  );
}

/* ─────────────────────────────────────────── */
/*  Quick stat card                            */
/* ─────────────────────────────────────────── */

type StatCardProps = {
  label: string;
  value: string;
  unit: string;
  icon: IoniconName;
  color: string;
  delay: number;
};

function StatCard({ label, value, unit, icon, color, delay }: StatCardProps) {
  const NavColors = useThemeColors();
  const card = useCardStyles(NavColors);
  const dot = useSharedValue(1);

  useEffect(() => {
    dot.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 900 }),
        withTiming(1, { duration: 900 })
      ),
      -1
    );
  }, [dot]);

  const dotStyle = useAnimatedStyle(() => ({ opacity: dot.value }));

  return (
    <Reanimated.View
      entering={FadeInDown.duration(400).delay(delay)}
      style={[card.root, { borderColor: `${color}22` }]}
    >
      <View style={[card.glow, { backgroundColor: color }]} />

      <View style={[card.iconBox, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>

      <View style={card.valueRow}>
        <Text style={[card.value, { color }]}>{value}</Text>
        <Text style={card.unit}>{unit}</Text>
      </View>

      <View style={card.labelRow}>
        <Reanimated.View style={[card.liveDot, { backgroundColor: color }, dotStyle]} />
        <Text style={card.label}>{label}</Text>
      </View>
    </Reanimated.View>
  );
}

/* ─────────────────────────────────────────── */
/*  Quick action button                        */
/* ─────────────────────────────────────────── */

type QuickActionProps = {
  label: string;
  icon: IoniconName;
  color: string;
  delay: number;
};

function QuickAction({ label, icon, color, delay }: QuickActionProps) {
  const NavColors = useThemeColors();
  const action = useActionStyles(NavColors);
  return (
    <Reanimated.View
      entering={FadeInDown.duration(400).delay(delay)}
      style={[action.root, { borderColor: `${color}20` }]}
    >
      <View style={[action.iconBox, { backgroundColor: `${color}14` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={action.label}>{label}</Text>
      <View style={[action.comingSoon, { backgroundColor: `${color}14`, borderColor: `${color}30` }]}>
        <Text style={[action.comingSoonText, { color }]}>Em breve</Text>
      </View>
    </Reanimated.View>
  );
}

/* ─────────────────────────────────────────── */
/*  Main screen                                */
/* ─────────────────────────────────────────── */

export default function HomeScreen() {
  const NavColors = useThemeColors();
  const themeMode = useThemeStore((state) => state.theme);
  const { setTheme } = useThemeStore();
  const styles = useStyles(NavColors);

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useAuthStore();
  const { logout } = useAuth();
  
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const firstName = session?.user?.name?.split(' ')[0] ?? 'Usuário';

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  const greeting2 = hour < 12 ? '🌤' : hour < 18 ? '☀️' : '🌙';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: TAB_BAR_HEIGHT + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <Reanimated.View entering={FadeInDown.duration(450).delay(0)} style={[styles.header, { zIndex: 10 }]}>
          <View>
            <Text style={styles.greetingSmall}>{greeting} {greeting2}</Text>
            <Text style={styles.greetingName}>{firstName}</Text>
          </View>
          
          <View style={{ position: 'relative' }}>
            <Pressable 
              style={styles.avatarSmall}
              onPress={() => setDropdownOpen(!dropdownOpen)}
            >
              <Text style={styles.avatarSmallText}>
                {firstName.charAt(0).toUpperCase()}
              </Text>
              <View style={styles.avatarOnline} />
            </Pressable>

            <UserDropdown
              visible={dropdownOpen}
              onClose={() => setDropdownOpen(false)}
              colors={NavColors}
              position={{ top: insets.top + 42, right: 20 }}
            />
          </View>
        </Reanimated.View>

        {/* ── Health status card ── */}
        <Reanimated.View
          entering={FadeInDown.duration(450).delay(80)}
          style={styles.statusCard}
        >
          {/* Decorative top bar */}
          <View style={styles.statusCardBar} />

          <View style={styles.statusCardContent}>
            <View>
              <Text style={styles.statusLabel}>ESTADO GERAL</Text>
              <Text style={styles.statusValue}>Monitorando</Text>
              <Text style={styles.statusSub}>Seus dados estão sendo coletados</Text>
            </View>
            <VitalPulse />
          </View>

          {/* Status badges */}
          <View style={styles.statusBadges}>
            {[
              { label: 'Batimentos', color: NavColors.danger },
              { label: 'Pressão',    color: NavColors.violet },
              { label: 'SpO₂',      color: NavColors.green },
            ].map((b) => (
              <View
                key={b.label}
                style={[styles.statusBadge, { borderColor: `${b.color}40`, backgroundColor: `${b.color}10` }]}
              >
                <View style={[styles.statusBadgeDot, { backgroundColor: b.color }]} />
                <Text style={[styles.statusBadgeText, { color: b.color }]}>{b.label}</Text>
              </View>
            ))}
          </View>
        </Reanimated.View>

        {/* ── Vital stats grid ── */}
        <Reanimated.View 
          entering={FadeInDown.duration(400).delay(160)}
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Text style={styles.sectionTitle}>Sinais Vitais</Text>
          <Pressable 
            onPress={() => router.push('/new-measurement')}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: `${NavColors.cyan}15`,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: NavRadius.sm,
              borderWidth: 1,
              borderColor: `${NavColors.cyan}30`,
              opacity: pressed ? 0.7 : 1,
              transform: [{ scale: pressed ? 0.96 : 1 }]
            })}
          >
            <Ionicons name="add" size={16} color={NavColors.cyan} style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: NavColors.cyan }}>Registrar</Text>
          </Pressable>
        </Reanimated.View>

        <View style={styles.statsGrid}>
          <StatCard label="Freq. Cardíaca" value="--"  unit="bpm" icon="heart"         color={NavColors.danger} delay={200} />
          <StatCard label="Pressão"        value="--"  unit="mmHg" icon="pulse-outline" color={NavColors.violet} delay={240} />
          <StatCard label="SpO₂"           value="--"  unit="%"    icon="water"          color={NavColors.cyan}   delay={280} />
          <StatCard label="Temperatura"    value="--"  unit="°C"   icon="thermometer"    color={NavColors.warning} delay={320} />
        </View>

        {/* ── Quick actions ── */}
        <Reanimated.View entering={FadeInDown.duration(400).delay(360)}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        </Reanimated.View>

        <View style={styles.actionsGrid}>
          <QuickAction label="Prescrições"    icon="document-text-outline"  color={NavColors.cyan}    delay={380} />
          <QuickAction label="Consultas"      icon="calendar-outline"        color={NavColors.violet}  delay={400} />
          <QuickAction label="Exames"         icon="flask-outline"           color={NavColors.warning} delay={420} />
          <QuickAction label="Emergência"     icon="alert-circle-outline"   color={NavColors.danger}  delay={440} />
        </View>

        {/* ── Coming soon banner ── */}
        <Reanimated.View
          entering={FadeInUp.duration(400).delay(480)}
          style={styles.comingSoonBanner}
        >
          <Ionicons name="construct-outline" size={20} color={NavColors.cyan} />
          <View style={styles.comingSoonBannerText}>
            <Text style={styles.comingSoonBannerTitle}>Dashboard em desenvolvimento</Text>
            <Text style={styles.comingSoonBannerSub}>
              O painel completo de saúde estará disponível em breve com dados em tempo real.
            </Text>
          </View>
        </Reanimated.View>
      </ScrollView>
    </View>
  );
}

/* ─────────────────────────────────────────── */
/*  Dynamic Styles Hook                        */
/* ─────────────────────────────────────────── */

import type { ThemeColors } from '@constants/nav-theme';

const useStyles = (NavColors: ThemeColors) => React.useMemo(() => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: NavColors.bg0,
  },

  scroll: {
    paddingHorizontal: NavSpacing.lg,
    gap: NavSpacing.lg,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: NavSpacing.lg,
  },

  greetingSmall: {
    fontSize: 13,
    color: NavColors.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  greetingName: {
    fontSize: 24,
    fontWeight: '800',
    color: NavColors.textPrimary,
    letterSpacing: 0.2,
  },

  avatarSmall: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: NavColors.bg4,
    borderWidth: 1.5,
    borderColor: NavColors.borderBright,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  avatarSmallText: {
    fontSize: 16,
    fontWeight: '800',
    color: NavColors.cyan,
  },

  avatarOnline: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: NavColors.green,
    borderWidth: 2,
    borderColor: NavColors.bg0,
  },

  themeToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: NavColors.textMuted,
  },

  themeToggleTextActive: {
    fontSize: 13,
    fontWeight: '700',
    color: NavColors.bg0,
  },

  dropdownDivider: {
    height: 1,
    backgroundColor: NavColors.border,
  },

  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: NavSpacing.md,
    paddingHorizontal: NavSpacing.lg,
    gap: NavSpacing.md,
  },



  // ── Status card ──
  statusCard: {
    backgroundColor: NavColors.bg2,
    borderRadius: NavRadius.lg,
    borderWidth: 1,
    borderColor: NavColors.border,
    overflow: 'hidden',
    shadowColor: NavColors.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },

  statusCardBar: {
    height: 3,
    backgroundColor: NavColors.cyan,
    opacity: 0.7,
  },

  statusCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: NavSpacing.lg,
  },

  statusLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: NavColors.cyan,
    letterSpacing: 2,
    marginBottom: 4,
  },

  statusValue: {
    fontSize: 20,
    fontWeight: '800',
    color: NavColors.textPrimary,
    letterSpacing: 0.3,
  },

  statusSub: {
    fontSize: 12,
    color: NavColors.textMuted,
    marginTop: 2,
  },

  statusBadges: {
    flexDirection: 'row',
    gap: NavSpacing.sm,
    padding: NavSpacing.lg,
    paddingTop: 0,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: NavRadius.full,
    borderWidth: 1,
  },

  statusBadgeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },

  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // ── Section title ──
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: NavColors.textSecondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: -NavSpacing.sm,
  },

  // ── Stats grid ──
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: NavSpacing.md,
  },

  // ── Actions grid ──
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: NavSpacing.md,
  },

  // ── Coming soon banner ──
  comingSoonBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: NavSpacing.md,
    backgroundColor: NavColors.cyanSoft,
    borderRadius: NavRadius.md,
    borderWidth: 1,
    borderColor: NavColors.cyanDim,
    padding: NavSpacing.lg,
    marginBottom: NavSpacing.sm,
  },

  comingSoonBannerText: {
    flex: 1,
    gap: 4,
  },

  comingSoonBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: NavColors.cyan,
  },

  comingSoonBannerSub: {
    fontSize: 12,
    color: NavColors.textSecondary,
    lineHeight: 18,
  },
}), [NavColors]);

/* ─────────────────────────────────────────── */
/*  Pulse animation styles                     */
/* ─────────────────────────────────────────── */

const useVitalsStyles = (NavColors: ThemeColors) => React.useMemo(() => StyleSheet.create({
  pulseWrapper: {
    width: 100,
    height: 40,
    overflow: 'hidden',
    position: 'relative',
  },
  pulseTrack: {
    position: 'absolute',
    width: 300,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  ecgLine: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  ecgFlat: {
    width: 30,
    height: 1.5,
    backgroundColor: NavColors.danger,
    opacity: 0.6,
  },
  ecgSpike: {
    width: 2,
    height: 30,
    backgroundColor: NavColors.danger,
    marginHorizontal: 4,
  },
  pulseGlow: {
    position: 'absolute',
    right: 0,
    width: 30,
    top: 0,
    bottom: 0,
    backgroundColor: NavColors.bg2,
  },
}), [NavColors]);

/* ─────────────────────────────────────────── */
/*  Stat card styles                           */
/* ─────────────────────────────────────────── */

const useCardStyles = (NavColors: ThemeColors) => React.useMemo(() => StyleSheet.create({
  root: {
    width: '47%',
    backgroundColor: NavColors.bg2,
    borderRadius: NavRadius.md,
    borderWidth: 1,
    padding: NavSpacing.md,
    gap: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: -16,
    right: -16,
    width: 48,
    height: 48,
    borderRadius: 24,
    opacity: 0.05,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: NavRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  unit: {
    fontSize: 11,
    color: NavColors.textMuted,
    fontWeight: '600',
    marginBottom: 3,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  label: {
    fontSize: 11,
    color: NavColors.textSecondary,
    fontWeight: '500',
  },
}), [NavColors]);

/* ─────────────────────────────────────────── */
/*  Action styles                              */
/* ─────────────────────────────────────────── */

const useActionStyles = (NavColors: ThemeColors) => React.useMemo(() => StyleSheet.create({
  root: {
    width: '47%',
    backgroundColor: NavColors.bg2,
    borderRadius: NavRadius.md,
    borderWidth: 1,
    padding: NavSpacing.md,
    gap: 8,
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: NavRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: NavColors.textPrimary,
    letterSpacing: 0.2,
  },
  comingSoon: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: NavRadius.full,
    borderWidth: 1,
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
}), [NavColors]);
