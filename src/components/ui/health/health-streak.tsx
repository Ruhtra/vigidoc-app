import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Reanimated, { FadeInDown } from "react-native-reanimated";

import { NavRadius, NavSpacing, ThemeColors } from "@constants/nav-theme";
import { useThemeColors } from "@hooks/use-theme-colors";

import { useQuery } from "@tanstack/react-query";
import { vitalsService, StreakHistoryItem } from "@lib/services/vitals.service";
import { Skeleton } from "../skeleton";

export function HealthStreak() {
  const NavColors = useThemeColors();
  const streakStyles = useStreakStyles(NavColors);

  const { data: streakData, isLoading } = useQuery({
    queryKey: ["healthStreak"],
    queryFn: async () => {
      const response = await vitalsService.getStreak();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  if (isLoading) {
    return (
      <View style={{ marginTop: NavSpacing.md }}>
        <Skeleton height={160} borderRadius={NavRadius.lg} />
      </View>
    );
  }

  const currentStreak = streakData?.currentStreak || 0;
  const days = (streakData?.history || []) as StreakHistoryItem[];

  return (
    <Reanimated.View
      entering={FadeInDown.duration(400).delay(200)}
      style={streakStyles.root}
    >
      <View style={streakStyles.header}>
        <View style={streakStyles.fireIcon}>
          <Ionicons name="flame" size={24} color={NavColors.warning} />
        </View>
        <View>
          <Text style={streakStyles.title}>
            {currentStreak} {currentStreak === 1 ? "dia" : "dias"} de ofensiva
          </Text>
          <Text style={streakStyles.subtitle}>Mínimo de 4 medições/dia</Text>
        </View>
      </View>

      <View style={streakStyles.timeline}>
        {days.map((day, idx) => (
          <View
            key={`${day.date}-${idx}`}
            style={[
              streakStyles.dayWrapper,
              { zIndex: days.length - idx, elevation: days.length - idx },
            ]}
          >
            {idx > 0 && (
              <View
                style={[
                  streakStyles.line,
                  day.status === "done" && streakStyles.lineDone,
                ]}
              />
            )}
            <View style={streakStyles.dayNode}>
              <View
                style={[
                  streakStyles.circle,
                  day.status === "done" && streakStyles.circleDone,
                  day.status === "pending" && streakStyles.circlePending,
                ]}
              >
                {day.status === "done" ? (
                  <Ionicons name="checkmark" size={14} color="white" />
                ) : day.status === "pending" ? (
                  <Text
                    style={[
                      streakStyles.pendingText,
                      { color: NavColors.warning },
                    ]}
                  >
                    ?
                  </Text>
                ) : (
                  <Text style={streakStyles.emptyText}>-</Text>
                )}
              </View>
            </View>
            <Text
              style={[
                streakStyles.dayLabel,
                day.status === "pending" && streakStyles.dayLabelActive,
              ]}
            >
              {day.label}
            </Text>
            {day.count > 0 && (
              <Text style={streakStyles.dayCount}>{day.count} med.</Text>
            )}
          </View>
        ))}
      </View>
    </Reanimated.View>
  );
}

const useStreakStyles = (NavColors: ThemeColors) =>
  React.useMemo(
    () =>
      StyleSheet.create({
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
          flexDirection: "row",
          alignItems: "center",
          gap: NavSpacing.md,
          marginBottom: NavSpacing.lg,
        },
        fireIcon: {
          width: 48,
          height: 48,
          borderRadius: NavRadius.full,
          backgroundColor: `${NavColors.warning}15`,
          alignItems: "center",
          justifyContent: "center",
        },
        title: {
          fontSize: 18,
          fontWeight: "800",
          color: NavColors.warning,
        },
        subtitle: {
          fontSize: 13,
          color: NavColors.warning,
          fontWeight: "500",
          opacity: 0.8,
        },
        timeline: {
          flexDirection: "row",
          justifyContent: "space-between",
          backgroundColor: NavColors.bg2,
          borderRadius: NavRadius.md,
          padding: NavSpacing.md,
        },
        dayWrapper: {
          alignItems: "center",
          gap: 6,
          flex: 1,
          position: "relative",
        },
        dayNode: {
          width: 28,
          height: 28,
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        },
        line: {
          position: "absolute",
          left: "-50%",
          right: "50%",
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
          alignItems: "center",
          justifyContent: "center",
        },
        circleDone: {
          backgroundColor: NavColors.warning,
        },
        circlePending: {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: NavColors.warning,
          borderStyle: "dashed",
        },
        pendingText: {
          fontSize: 12,
          fontWeight: "800",
        },
        emptyText: {
          fontSize: 12,
          fontWeight: "700",
          color: NavColors.textMuted,
        },
        dayLabel: {
          fontSize: 10,
          fontWeight: "600",
          color: NavColors.textMuted,
        },
        dayLabelActive: {
          color: NavColors.warning,
        },
        dayCount: {
          fontSize: 9,
          fontWeight: "700",
          color: NavColors.warning,
          marginTop: -2,
        },
      }),
    [NavColors],
  );
