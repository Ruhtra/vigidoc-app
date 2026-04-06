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
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NavRadius, NavSpacing, TAB_BAR_HEIGHT } from '@constants/nav-theme';
import { useAuthStore } from '@stores/auth.store';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@hooks/use-theme-colors';
import { UserDropdown } from '@components/navigation/user-dropdown';
import { VitalPulse } from '@components/ui/vital-pulse';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

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
      
      <View style={card.headerRow}>
        <View style={[card.iconBox, { backgroundColor: `${color}14` }]}>
          <Ionicons name={icon} size={14} color={color} />
        </View>
        <Text style={card.label} numberOfLines={1}>{label}</Text>
      </View>

      <View style={card.valueRow}>
        <Text style={[card.value, { color }]}>{value}</Text>
        <Text style={card.unit} numberOfLines={1}>{unit}</Text>
      </View>
    </Reanimated.View>
  );
}

/* ─────────────────────────────────────────── */
/*  Health Streak (Ofensiva)                    */
/* ─────────────────────────────────────────── */

function HealthStreak() {
  const NavColors = useThemeColors();
  const streak = useStreakStyles(NavColors);
  
  const days = [
    { label: 'Seg', count: 4, status: 'done' },
    { label: 'Ter', count: 5, status: 'done' },
    { label: 'Qua', count: 4, status: 'done' },
    { label: 'Qui', count: 6, status: 'done' },
    { label: 'Sex', count: 4, status: 'done' },
    { label: 'Sáb', count: 0, status: 'pending' },
    { label: 'Dom', count: 0, status: 'empty' },
  ] as const;

  return (
    <Reanimated.View 
      entering={FadeInDown.duration(400).delay(400)}
      style={streak.root}
    >
      <View style={streak.header}>
        <View style={streak.fireIcon}>
          <Ionicons name="flame" size={20} color={NavColors.warning} />
        </View>
        <View>
          <Text style={streak.title}>5 dias de ofensiva</Text>
          <Text style={streak.subtitle}>Mínimo de 4 medições/dia</Text>
        </View>
      </View>

      <View style={streak.timeline}>
        {days.map((day, idx) => (
          <View key={day.label} style={streak.dayWrapper}>
            <View style={streak.dayNode}>
              {idx > 0 && <View style={[streak.line, day.status === 'done' && streak.lineDone]} />}
              <View style={[
                streak.circle,
                day.status === 'done' && streak.circleDone,
                day.status === 'pending' && streak.circlePending
              ]}>
                {day.status === 'done' ? (
                  <Ionicons name="checkmark" size={12} color="white" />
                ) : day.status === 'pending' ? (
                  <Text style={streak.pendingText}>?</Text>
                ) : (
                  <Text style={streak.emptyText}>-</Text>
                )}
              </View>
            </View>
            <Text style={[streak.dayLabel, day.status === 'pending' && streak.dayLabelActive]}>{day.label}</Text>
            {day.count > 0 && <Text style={streak.dayCount}>{day.count} med.</Text>}
          </View>
        ))}
      </View>
    </Reanimated.View>
  );
}

/* ─────────────────────────────────────────── */
/*  Main screen                                */
/* ─────────────────────────────────────────── */

export default function DevScreen() {
  const NavColors = useThemeColors();
  const styles = useStyles(NavColors);

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useAuthStore();
  
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const firstName = session?.user?.name?.split(' ')[0] ?? 'Usuário';

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const greetingEmoji = hour < 12 ? '🌤' : hour < 18 ? '☀️' : '🌙';

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
            <Text style={styles.greetingSmall}>IoT Future Dashboard 🧪</Text>
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
          <View style={styles.statusCardBar} />
          <View style={styles.statusCardContent}>
            <View>
              <Text style={styles.statusLabel}>ESTADO GERAL</Text>
              <Text style={styles.statusValue}>Monitorando</Text>
              <Text style={styles.statusSub}>Seus dados estão sendo coletados</Text>
            </View>
            <VitalPulse color={NavColors.danger} backgroundColor={NavColors.bg2} />
          </View>

          {/* Smart Status Indicators (Insights) */}
          <View style={styles.statusBadges}>
            {[
              { label: 'Padrão Normal', color: NavColors.cyan,   icon: 'analytics-outline' },
              { label: 'Sensores OK',  color: NavColors.green,  icon: 'radio-outline' },
              { label: 'Estável',      color: NavColors.violet, icon: 'shield-checkmark-outline' },
            ].map((b) => (
              <View
                key={b.label}
                style={[styles.statusBadge, { borderColor: `${b.color}25`, backgroundColor: `${b.color}08` }]}
              >
                <Ionicons name={b.icon as any} size={10} color={b.color} />
                <Text style={[styles.statusBadgeText, { color: b.color }]}>{b.label}</Text>
              </View>
            ))}
          </View>
        </Reanimated.View>

        {/* ── Vital stats grid ── */}
        <Reanimated.View 
          entering={FadeInDown.duration(400).delay(160)}
          style={styles.sectionHeader}
        >
          <Text style={styles.sectionTitle}>Sinais Vitais</Text>
          <Pressable 
            onPress={() => router.push('/new-measurement')}
            style={({ pressed }) => [
              styles.registerButton,
              { opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] }
            ]}
          >
            <Ionicons name="add" size={16} color={NavColors.cyan} style={{ marginRight: 4 }} />
            <Text style={styles.registerButtonText}>Registrar</Text>
          </Pressable>
        </Reanimated.View>

        <View style={styles.statsGrid}>
          <StatCard label="Pressão (PA)"   value="--"  unit="mmHg" icon="pulse-outline"       color={NavColors.violet}  delay={200} />
          <StatCard label="Frq. Cardíaca" value="--"  unit="bpm"  icon="heart"               color={NavColors.danger}  delay={220} />
          <StatCard label="Temperatura"    value="--"  unit="°C"   icon="thermometer"         color={NavColors.warning} delay={240} />
          <StatCard label="Saturação (O₂)" value="--"  unit="%"    icon="water"               color={NavColors.green}   delay={260} />
          <StatCard label="Peso"           value="--"  unit="kg"   icon="speedometer-outline" color={NavColors.cyan}    delay={280} />
          <StatCard label="Nível de Dor"   value="--"  unit="/10"  icon="alert-circle-outline" color={NavColors.violet} delay={300} />
        </View>

        {/* ── Health Streak ── */}
        <HealthStreak />
      </ScrollView>
    </View>
  );
}

/* ─────────────────────────────────────────── */
/*  Styles                                     */
/* ─────────────────────────────────────────── */

import type { ThemeColors } from '@constants/nav-theme';

const useStyles = (NavColors: ThemeColors) => React.useMemo(() => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: NavColors.bg0,
  },
  scroll: {
    paddingHorizontal: NavSpacing.lg,
    paddingTop: NavSpacing.sm,
    gap: NavSpacing.md,
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
    padding: NavSpacing.md,
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
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  statusBadges: {
    flexDirection: 'row',
    gap: 8,
    padding: NavSpacing.md,
    paddingTop: 0,
    marginTop: -8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: NavRadius.sm,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: NavSpacing.xs,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: NavColors.textSecondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${NavColors.cyan}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: NavRadius.sm,
    borderWidth: 1,
    borderColor: `${NavColors.cyan}30`,
  },
  registerButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: NavColors.cyan,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: NavSpacing.md,
  },
}), [NavColors]);

const useVitalsStyles = (NavColors: ThemeColors) => React.useMemo(() => StyleSheet.create({
  pulseWrapper: {
    width: 100,
    height: 40,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseGlow: {
    position: 'absolute',
    right: 0,
    width: 30,
    top: 0,
    bottom: 0,
  },
}), [NavColors]);

const useCardStyles = (NavColors: ThemeColors) => React.useMemo(() => StyleSheet.create({
  root: {
    width: '48%',
    backgroundColor: NavColors.bg2,
    borderRadius: NavRadius.md,
    borderWidth: 1,
    padding: NavSpacing.sm,
    gap: 4,
    overflow: 'hidden',
    position: 'relative',
    height: 70,
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    top: -12,
    right: -12,
    width: 40,
    height: 40,
    borderRadius: 20,
    opacity: 0.1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBox: {
    width: 24,
    height: 24,
    borderRadius: NavRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    paddingLeft: 2,
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  unit: {
    fontSize: 10,
    color: NavColors.textMuted,
    fontWeight: '600',
  },
  label: {
    fontSize: 10,
    color: NavColors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
}), [NavColors]);

const useStreakStyles = (NavColors: ThemeColors) => React.useMemo(() => StyleSheet.create({
  root: {
    backgroundColor: `${NavColors.warning}10`,
    borderRadius: NavRadius.lg,
    borderWidth: 1,
    borderColor: `${NavColors.warning}30`,
    padding: NavSpacing.lg,
    marginTop: NavSpacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: NavSpacing.md,
    marginBottom: NavSpacing.lg,
  },
  fireIcon: {
    width: 36,
    height: 36,
    borderRadius: NavRadius.sm,
    backgroundColor: `${NavColors.warning}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: NavColors.warning,
  },
  subtitle: {
    fontSize: 12,
    color: NavColors.warning,
    opacity: 0.7,
  },
  timeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: NavColors.bg2,
    borderRadius: NavRadius.md,
    padding: NavSpacing.sm,
    paddingVertical: NavSpacing.md,
  },
  dayWrapper: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  dayNode: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  line: {
    position: 'absolute',
    left: -18,
    right: 12,
    height: 2,
    backgroundColor: NavColors.bg3,
    top: 11,
    zIndex: 0,
  },
  lineDone: {
    backgroundColor: NavColors.warning,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: NavColors.bg3,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  circleDone: {
    backgroundColor: NavColors.warning,
  },
  circlePending: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: NavColors.warning,
    borderStyle: 'dashed',
  },
  pendingText: {
    fontSize: 10,
    fontWeight: '700',
    color: NavColors.warning,
  },
  emptyText: {
    fontSize: 10,
    fontWeight: '700',
    color: NavColors.textMuted,
  },
  dayLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: NavColors.textMuted,
  },
  dayLabelActive: {
    color: NavColors.warning,
  },
  dayCount: {
    fontSize: 8,
    fontWeight: '700',
    color: NavColors.warning,
    marginTop: -2,
  }
}), [NavColors]);
