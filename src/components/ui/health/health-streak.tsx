import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Reanimated, { FadeInDown } from 'react-native-reanimated';

import { NavRadius, NavSpacing, ThemeColors } from '@constants/nav-theme';
import { useThemeColors } from '@hooks/use-theme-colors';

export function HealthStreak() {
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
      entering={FadeInDown.duration(400).delay(200)}
      style={streak.root}
    >
      <View style={streak.header}>
        <View style={streak.fireIcon}>
          <Ionicons name="flame" size={24} color={NavColors.warning} />
        </View>
        <View>
          <Text style={streak.title}>5 dias de ofensiva</Text>
          <Text style={streak.subtitle}>Mínimo de 4 medições/dia</Text>
        </View>
      </View>

      <View style={streak.timeline}>
        {days.map((day, idx) => (
          <View key={day.label} style={[streak.dayWrapper, { zIndex: days.length - idx, elevation: days.length - idx }]}>
            {idx > 0 && <View style={[streak.line, day.status === 'done' && streak.lineDone]} />}
            <View style={streak.dayNode}>
              <View style={[
                streak.circle,
                day.status === 'done' && streak.circleDone,
                day.status === 'pending' && streak.circlePending
              ]}>
                {day.status === 'done' ? (
                  <Ionicons name="checkmark" size={14} color="white" />
                ) : day.status === 'pending' ? (
                  <Text style={[streak.pendingText, { color: NavColors.warning }]}>?</Text>
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

const useStreakStyles = (NavColors: ThemeColors) => React.useMemo(() => StyleSheet.create({
  root: {
    backgroundColor: NavColors.bg1,
    borderRadius: NavRadius.lg,
    borderWidth: 1,
    borderColor: NavColors.border,
    padding: NavSpacing.lg,
    marginTop: NavSpacing.md,
    // Efeito para igualar o design antigo
    shadowColor: NavColors.warning,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: NavSpacing.md,
    marginBottom: NavSpacing.lg,
  },
  fireIcon: {
    width: 48,
    height: 48,
    borderRadius: NavRadius.full,
    backgroundColor: `${NavColors.warning}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: NavColors.warning,
  },
  subtitle: {
    fontSize: 13,
    color: NavColors.warning,
    fontWeight: '500',
    opacity: 0.8,
  },
  timeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: NavColors.bg2,
    borderRadius: NavRadius.md,
    padding: NavSpacing.md,
  },
  dayWrapper: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
    position: 'relative',
  },
  dayNode: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  line: {
    position: 'absolute',
    left: '-50%',
    right: '50%',
    height: 2,
    backgroundColor: NavColors.bg3,
    top: 13,
  },
  lineDone: {
    backgroundColor: NavColors.warning,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: NavColors.bg3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleDone: {
    backgroundColor: NavColors.warning,
  },
  circlePending: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: NavColors.warning,
    borderStyle: 'dashed',
  },
  pendingText: {
    fontSize: 12,
    fontWeight: '800',
  },
  emptyText: {
    fontSize: 12,
    fontWeight: '700',
    color: NavColors.textMuted,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: NavColors.textMuted,
  },
  dayLabelActive: {
    color: NavColors.warning,
  },
  dayCount: {
    fontSize: 9,
    fontWeight: '700',
    color: NavColors.warning,
    marginTop: -2,
  }
}), [NavColors]);
