import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { NavSpacing, NavRadius } from '@constants/nav-theme';
import { useThemeColors } from '@hooks/use-theme-colors';
import { useReminderStore, ReminderData } from '../../stores/reminder.store';

// Verifica se está rodando no Expo Go para evitar crashes com notificações push (removidas no SDK 53+)
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// ─── Types ────────────────────────────────────────────────
type PermissionStatus = 'granted' | 'denied' | 'undetermined';

// ─── Helpers ──────────────────────────────────────────────
function formatTime(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

function getNextReminderIn(reminders: ReminderData[]): string | null {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const sorted = [...reminders].sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
  const next = sorted.find((r) => r.hour * 60 + r.minute > currentMinutes);

  if (!next) {
    // próximo é o primeiro do dia seguinte
    const first = sorted[0];
    if (!first) return null;
    const minutesUntilMidnight = 24 * 60 - currentMinutes;
    const minutesAfterMidnight = first.hour * 60 + first.minute;
    const total = minutesUntilMidnight + minutesAfterMidnight;
    const hrs = Math.floor(total / 60);
    const mins = total % 60;
    return `${hrs}h ${mins}min`;
  }

  const diff = next.hour * 60 + next.minute - currentMinutes;
  const hrs = Math.floor(diff / 60);
  const mins = diff % 60;
  return hrs > 0 ? `${hrs}h ${mins}min` : `${mins}min`;
}

// ─── Period accent colors ─────────────────────────────────
const PERIOD_CONFIG = {
  morning: { color: '#F59E0B', glow: 'rgba(245,158,11,0.25)', gradient: ['#F59E0B', '#FF7B00'] as [string, string] },
  afternoon: { color: '#2DD4BF', glow: 'rgba(45,212,191,0.25)', gradient: ['#2DD4BF', '#0891B2'] as [string, string] },
  night: { color: '#A78BFA', glow: 'rgba(167,139,250,0.25)', gradient: ['#7B2FFF', '#A78BFA'] as [string, string] },
};

// ─── Sub-components ───────────────────────────────────────

function GlowDot({ color }: { color: string }) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(1, { duration: 800 }), withTiming(0.4, { duration: 800 })),
      -1,
      true,
    );
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: color,
          shadowColor: color,
          shadowOpacity: 0.9,
          shadowRadius: 6,
        },
        style,
      ]}
    />
  );
}

function ReminderCard({ reminder, index }: { reminder: ReminderData; index: number }) {
  const NavColors = useThemeColors();
  const cfg = PERIOD_CONFIG[reminder.period];

  const glowAnim = useSharedValue(0.15);
  useEffect(() => {
    glowAnim.value = withRepeat(
      withSequence(withTiming(0.35, { duration: 2000 }), withTiming(0.15, { duration: 2000 })),
      -1,
      true,
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowAnim.value,
  }));

  return (
    <Animated.View entering={FadeInDown.duration(500).delay(300 + index * 120)}>
      <Animated.View
        style={[
          styles.reminderCard,
          {
            backgroundColor: NavColors.bg2,
            borderColor: cfg.glow,
            shadowColor: cfg.color,
          },
          glowStyle,
        ]}
      >
        {/* Corner accent */}
        <View style={[styles.cornerTL, { borderColor: cfg.color }]} />
        <View style={[styles.cornerBR, { borderColor: cfg.color }]} />

        {/* Left Icon */}
        <LinearGradient
          colors={cfg.gradient}
          style={styles.reminderIconWrap}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={reminder.icon} size={20} color="#FFF" />
        </LinearGradient>

        {/* Info */}
        <View style={styles.reminderInfo}>
          <Text style={[styles.reminderLabel, { color: NavColors.textSecondary }]}>
            {reminder.label}
          </Text>
          <Text style={[styles.reminderTime, { color: cfg.color }]}>
            {formatTime(reminder.hour, reminder.minute)}
          </Text>
        </View>

        {/* Live indicator */}
        <View style={styles.reminderRight}>
          <GlowDot color={cfg.color} />
          <Text style={[styles.reminderDailyLabel, { color: NavColors.textMuted }]}>Diário</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Permission Banner ────────────────────────────────────

type PermissionBannerProps = {
  status: PermissionStatus;
  onRequestPermission: () => void;
  onOpenSettings: () => void;
};

function PermissionBanner({ status, onRequestPermission, onOpenSettings }: PermissionBannerProps) {
  const NavColors = useThemeColors();

  const pulseScale = useSharedValue(1);
  useEffect(() => {
    if (status === 'granted') {
      pulseScale.value = withRepeat(
        withSequence(withTiming(1.08, { duration: 900 }), withTiming(1, { duration: 900 })),
        -1,
        true,
      );
    } else {
      pulseScale.value = 1;
    }
  }, [status]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }]
  }));

  if (status === 'granted') {
    return (
      <Animated.View
        entering={FadeInDown.duration(600)}
        style={[styles.permBanner, styles.permBannerGranted, { borderColor: 'rgba(16,185,129,0.3)' }]}
      >
        <View style={styles.permBannerRow}>
          <Animated.View style={pulseStyle}>
            <View style={styles.permIconWrap}>
              <Ionicons name="shield-checkmark" size={22} color="#10B981" />
            </View>
          </Animated.View>
          <View style={styles.permTextWrap}>
            <Text style={[styles.permTitle, { color: '#10B981' }]}>Notificações Ativas</Text>
            <Text style={[styles.permDesc, { color: NavColors.textSecondary }]} numberOfLines={1}>
              Lembretes funcionando corretamente.
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  }

  if (status === 'denied') {
    return (
      <Animated.View
        entering={FadeInDown.duration(600)}
        style={[styles.permBanner, styles.permBannerDenied, { borderColor: 'rgba(244,63,94,0.5)' }]}
      >
        <LinearGradient
          colors={['rgba(244,63,94,0.12)', 'rgba(244,63,94,0.04)']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.permBannerRow}>
          <View style={[styles.permIconWrap, { borderColor: 'rgba(244,63,94,0.4)', backgroundColor: 'rgba(244,63,94,0.15)' }]}>
            <Ionicons name="notifications-off" size={22} color="#F43F5E" />
          </View>
          <View style={styles.permTextWrap}>
            <Text style={[styles.permTitle, { color: '#F43F5E' }]}>⚠️ Notificações Bloqueadas</Text>
            <Text style={[styles.permDesc, { color: 'rgba(244,63,94,0.8)' }]}>
              Você bloqueou as notificações nas configurações do sistema. Os lembretes não serão entregues enquanto estiverem bloqueadas.
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.permButton}
          onPress={onOpenSettings}
          activeOpacity={0.8}
          accessibilityLabel="Abrir configurações do sistema para habilitar notificações"
        >
          <LinearGradient
            colors={['#F43F5E', '#BE123C']}
            style={styles.permButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="settings-outline" size={16} color="#FFF" />
            <Text style={styles.permButtonText}>Habilitar nas Configurações</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // undetermined
  return (
    <Animated.View
      entering={FadeInDown.duration(600)}
      style={[styles.permBanner, styles.permBannerWarn, { borderColor: 'rgba(245,158,11,0.4)' }]}
    >
      <LinearGradient
        colors={['rgba(245,158,11,0.10)', 'rgba(245,158,11,0.02)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.permBannerRow}>
        <View style={[styles.permIconWrap, { borderColor: 'rgba(245,158,11,0.4)', backgroundColor: 'rgba(245,158,11,0.12)' }]}>
          <Ionicons name="notifications-outline" size={22} color="#F59E0B" />
        </View>
        <View style={styles.permTextWrap}>
          <Text style={[styles.permTitle, { color: '#F59E0B' }]}>Notificações Desativadas</Text>
          <Text style={[styles.permDesc, { color: 'rgba(245,158,11,0.8)' }]}>
            As notificações não estão ativas. Sem elas, você não receberá os lembretes de medição configurados pelo seu responsável de saúde.
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.permButton}
        onPress={onRequestPermission}
        activeOpacity={0.8}
        accessibilityLabel="Ativar notificações para receber lembretes"
      >
        <LinearGradient
          colors={['#F59E0B', '#D97706']}
          style={styles.permButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="notifications" size={16} color="#FFF" />
          <Text style={styles.permButtonText}>Ativar Notificações</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────
export default function NotificacoesScreen() {
  const NavColors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [permStatus, setPermStatus] = React.useState<PermissionStatus>('undetermined');
  const { reminders, isSyncing, syncWithServer: forceSync } = useReminderStore();

  useEffect(() => {
    checkPermission();
  }, []);

  async function checkPermission() {
    if (isExpoGo) {
       // No Expo Go, simulamos permissão concedida para que a tela não fique travada,
       // já que local notifications funcionam mas o import do push quebra.
       setPermStatus('granted');
       return;
    }

    try {
      const Notifications = require('expo-notifications');
      const { status } = await Notifications.getPermissionsAsync();
      if (status === 'granted') setPermStatus('granted');
      else if (status === 'denied') setPermStatus('denied');
      else setPermStatus('undetermined');
    } catch {
      setPermStatus('undetermined');
    }
  }

  async function handleRequestPermission() {
    if (isExpoGo) return; // Não disponível no Go

    try {
      const Notifications = require('expo-notifications');
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') setPermStatus('granted');
      else setPermStatus('denied');
    } catch {
      setPermStatus('denied');
    }
  }

  function handleOpenSettings() {
    Linking.openSettings();
  }

  const nextIn = getNextReminderIn(reminders);

  return (
    <View style={[styles.root, { backgroundColor: NavColors.bg0, paddingTop: insets.top }]}>
      {/* Background grid decoration */}
      <View style={styles.bgGrid} pointerEvents="none" />

      <View style={[styles.contentWrapper, { paddingBottom: insets.bottom }]}>
        {/* ── Header ──────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.headerBlock}>
          <LinearGradient
            colors={['rgba(45,212,191,0.15)', 'transparent']}
            style={styles.headerGradientBg}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.headerIconRow}>
            <LinearGradient
              colors={['#2DD4BF', '#0891B2']}
              style={styles.headerIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="alarm" size={24} color="#FFF" />
            </LinearGradient>
            <View>
              <Text style={[styles.headerTitle, { color: NavColors.textPrimary }]}>Lembretes</Text>
              <Text style={[styles.headerSub, { color: NavColors.textMuted }]}>
                MONITORAMENTO · DIÁRIO
              </Text>
            </View>
          </View>

          <Text style={[styles.headerDesc, { color: NavColors.textSecondary }]}>
            Configurados automaticamente para as suas aferições diárias.
          </Text>
        </Animated.View>

        {/* ── Permission Banner ─────────────────── */}
        <PermissionBanner
          status={permStatus}
          onRequestPermission={handleRequestPermission}
          onOpenSettings={handleOpenSettings}
        />

        {/* ── Schedule Overview ─────────────────── */}
        <Animated.View entering={FadeInDown.duration(500).delay(200)}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLabelRow}>
              <View style={[styles.sectionLine, { backgroundColor: NavColors.cyan }]} />
              <Text style={[styles.sectionLabel, { color: NavColors.textMuted }]}>
                AGENDA DE HOJE
              </Text>
            </View>
            <View style={[styles.countBadge, { backgroundColor: NavColors.cyanDim, borderColor: NavColors.borderBright }]}>
              <Text style={[styles.countText, { color: NavColors.cyan }]}>
                {reminders.length} lembretes
              </Text>
            </View>
          </View>

          {/* Next reminder pill */}
          {nextIn && permStatus === 'granted' && (
            <Animated.View entering={FadeInDown.duration(400).delay(250)} style={{ marginBottom: NavSpacing.sm }}>
              <View style={[styles.nextReminderPill, { backgroundColor: NavColors.bg2, borderColor: NavColors.cyanGlow }]}>
                <Ionicons name="time-outline" size={14} color={NavColors.cyan} />
                <Text style={[styles.nextReminderText, { color: NavColors.textSecondary }]}>
                  Próximo lembrete em{' '}
                  <Text style={{ color: NavColors.cyan, fontWeight: '700' }}>{nextIn}</Text>
                </Text>
              </View>
            </Animated.View>
          )}
        </Animated.View>

        {/* ── Reminder Cards (Scrollable) ───────── */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollList}
          contentContainerStyle={{ gap: NavSpacing.sm, paddingBottom: NavSpacing.xxl }}
          refreshControl={
            <RefreshControl
              refreshing={isSyncing}
              onRefresh={forceSync}
              tintColor={NavColors.cyan}
              colors={[NavColors.cyan]}
            />
          }
        >
          {reminders.map((r, i) => (
            <ReminderCard key={r.id} reminder={r} index={i} />
          ))}
          
          {reminders.length === 0 && !isSyncing && (
             <Text style={{ textAlign: 'center', color: NavColors.textMuted, marginTop: NavSpacing.xl }}>
               Nenhum lembrete configurado na sua conta.
             </Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  bgGrid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.03,
    // Simulated grid via borderWidth approach
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: NavSpacing.xl,
    paddingTop: NavSpacing.md,
    gap: NavSpacing.lg,
  },
  scrollList: {
    flex: 1,
  },

  // Header
  headerBlock: {
    borderRadius: NavRadius.lg,
    overflow: 'hidden',
    padding: NavSpacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(45,212,191,0.12)',
  },
  headerGradientBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: NavRadius.lg,
  },
  headerIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: NavSpacing.md,
    marginBottom: NavSpacing.md,
  },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: NavRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2DD4BF',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    marginTop: 2,
  },
  headerDesc: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
  },

  // Permission Banner
  sectionGap: {},
  permBanner: {
    borderRadius: NavRadius.lg,
    borderWidth: 1,
    padding: NavSpacing.lg,
    overflow: 'hidden',
    gap: NavSpacing.md,
  },
  permBannerGranted: {
    backgroundColor: 'rgba(16,185,129,0.07)',
  },
  permBannerDenied: {
    backgroundColor: 'rgba(244,63,94,0.05)',
  },
  permBannerWarn: {
    backgroundColor: 'rgba(245,158,11,0.05)',
  },
  permBannerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: NavSpacing.md,
  },
  permIconWrap: {
    width: 44,
    height: 44,
    borderRadius: NavRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.4)',
    backgroundColor: 'rgba(16,185,129,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permTextWrap: {
    flex: 1,
    gap: 4,
  },
  permTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  permDesc: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '400',
  },
  permButton: {
    borderRadius: NavRadius.md,
    overflow: 'hidden',
  },
  permButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: NavSpacing.lg,
    gap: 8,
  },
  permButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: NavSpacing.sm,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: NavSpacing.xs,
  },
  sectionLine: {
    width: 3,
    height: 14,
    borderRadius: 2,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: NavRadius.full,
    borderWidth: 1,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Next reminder pill
  nextReminderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: NavSpacing.md,
    paddingVertical: 8,
    borderRadius: NavRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  nextReminderText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Reminder Card
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: NavSpacing.md,
    borderRadius: NavRadius.lg,
    borderWidth: 1,
    gap: NavSpacing.md,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 4,
    overflow: 'visible',
  },
  cornerTL: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 12,
    height: 12,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRadius: 2,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 12,
    height: 12,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderRadius: 2,
  },
  reminderIconWrap: {
    width: 40,
    height: 40,
    borderRadius: NavRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  reminderInfo: {
    flex: 1,
    gap: 4,
  },
  reminderLabel: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  reminderTime: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1,
    lineHeight: 24,
  },
  reminderRight: {
    alignItems: 'center',
    gap: 6,
  },
  reminderDailyLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.5,
  },

  // Info Footer
  infoFooter: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: NavSpacing.sm,
    padding: NavSpacing.sm,
    borderRadius: NavRadius.md,
    borderWidth: 1,
    marginTop: NavSpacing.xs,
  },
  infoFooterText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '400',
  },
});
