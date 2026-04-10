import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useAuthStore } from "@stores/auth.store";
import { useMeasurementStore } from "@stores/measurement.store";
import { NavSpacing, NavRadius } from "@constants/nav-theme";
import { useThemeColors } from "@hooks/use-theme-colors";
import {
  vitalsService,
  VitalRecordAPIResponse,
} from "@lib/services/vitals.service";
import { getVitalSeverity, getOverallSeverity } from "@lib/utils/vitals-logic";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@components/ui/skeleton";
import { HealthStreak } from "@components/ui/health/health-streak";

export default function HomeScreen() {
  const NavColors = useThemeColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useAuthStore();
  const measurementState = useMeasurementStore();
  const queryClient = useQueryClient();

  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [headerTheme, setHeaderTheme] = useState<{
    colors: [string, string];
    icon: any;
  }>({
    colors: ["#FF7B00", "#FF007B"],
    icon: "sunny",
  });

  const {
    data: measurements = [],
    isFetching: loading,
    refetch,
  } = useQuery({
    queryKey: ["vitalsHistory", 1],
    queryFn: async () => {
      const response = await vitalsService.getHistory(1);
      return response.data;
    },
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    const hour = new Date().getHours();

    // Atualiza Saudação e Tema baseado na hora do dia
    if (hour >= 6 && hour < 12) {
      setGreeting("Bom dia");
      setHeaderTheme({ colors: ["#00D4FF", "#007BF5"], icon: "partly-sunny" });
    } else if (hour >= 12 && hour < 18) {
      setGreeting("Boa tarde");
      setHeaderTheme({ colors: ["#FF7B00", "#FF007B"], icon: "sunny" });
    } else if (hour >= 18 && hour < 24) {
      setGreeting("Boa noite");
      setHeaderTheme({ colors: ["#7B2FFF", "#3A0088"], icon: "moon" });
    } else {
      setGreeting("Boa madrugada");
      setHeaderTheme({ colors: ["#0C1526", "#02040E"], icon: "moon-outline" });
    }

    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`,
      );

      // Handle Measurement timer state
      if (
        measurementState.status === "measuring" &&
        measurementState.startTime
      ) {
        const elapsed = now.getTime() - measurementState.startTime;
        const remaining = 10 * 60 * 1000 - elapsed;
        if (remaining <= 0) {
          // Auto-finalized by MeasurementSyncEngine — nothing to do here
        } else {
          const mins = Math.floor(remaining / 60000);
          const secs = Math.floor((remaining % 60000) / 1000);
          setTimeRemaining(
            `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`,
          );
        }
      } else if (
        measurementState.status === "waiting" &&
        measurementState.waitCooldownEnd
      ) {
        const remaining = measurementState.waitCooldownEnd - now.getTime();
        if (remaining <= 0) {
          measurementState.resetWait();
          setTimeRemaining(null);
        } else {
          const mins = Math.floor(remaining / 60000);
          const secs = Math.floor((remaining % 60000) / 1000);
          setTimeRemaining(
            `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`,
          );
        }
      } else {
        setTimeRemaining(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [measurementState]);

  const handleMeasurementPress = () => {
    if (measurementState.status !== "waiting") {
      router.push("/new-measurement");
    }
  };

  const userName = session?.user?.name?.split(" ")[0] || "Maria";

  return (
    <View style={[styles.root, { backgroundColor: NavColors.bg0 }]}>
      <View style={{ flex: 1 }}>
        {/* Header Gradient Container */}
        <Animated.View entering={FadeInDown.duration(600)}>
          <LinearGradient
            colors={headerTheme.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.headerGradient, { paddingTop: insets.top + 20 }]}
          >
            <View style={styles.headerTop}>
              <View style={styles.greetingRow}>
                <Ionicons
                  name={headerTheme.icon as any}
                  size={28}
                  color="#FFF"
                />
                <Text style={styles.greetingText}>
                  {greeting}, {userName}!
                </Text>
              </View>
              <View style={[styles.notificationPill, { opacity: 0.5 }]}>
                <Ionicons name="notifications-outline" size={16} color="#FFF" />
                <Text style={styles.notificationText}>18:00</Text>
              </View>
            </View>

            <Text style={styles.subGreetingText}>
              {currentTime} - {measurements.length}{" "}
              {measurements.length === 1 ? "medição" : "medições"} hoje
            </Text>

            <TouchableOpacity
              style={[
                styles.mainButton,
                measurementState.status === "waiting" &&
                  styles.mainButtonDisabled,
              ]}
              onPress={handleMeasurementPress}
              disabled={measurementState.status === "waiting"}
              activeOpacity={0.9}
            >
              {measurementState.status === "waiting" ? (
                <View style={styles.mainButtonContent}>
                  <Ionicons name="time-outline" size={24} color="#FF007B" />
                  <Text style={styles.mainButtonTextDisabled}>
                    Nova medição em {timeRemaining}
                  </Text>
                </View>
              ) : measurementState.status === "measuring" ? (
                <View style={styles.mainButtonContent}>
                  <Ionicons name="play" size={24} color="#FF007B" />
                  <Text style={styles.mainButtonTextActive}>
                    Continuar ({timeRemaining})
                  </Text>
                </View>
              ) : (
                <View style={styles.mainButtonContent}>
                  <Ionicons name="play" size={24} color="#111" />
                  <Text style={styles.mainButtonText}>
                    Iniciar Nova Medição
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        {/* Content Rest */}
        <View style={styles.contentPadding}>
          {/* Offensive Block - Unificado */}
          <HealthStreak />

          {/* List header */}
          <View style={styles.listHeader}>
            <View>
              <Text
                style={[styles.listTitle, { color: NavColors.textPrimary }]}
              >
                Últimas Aferições
              </Text>
              <Text
                style={[styles.listSubtitle, { color: NavColors.textMuted }]}
              >
                Hoje
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                queryClient.invalidateQueries({ queryKey: ["vitalsHistory"] });
                queryClient.invalidateQueries({ queryKey: ["healthStreak"] });
              }}
              style={[
                styles.refreshButton,
                {
                  backgroundColor: NavColors.bg3,
                  borderColor: NavColors.borderSoft,
                },
              ]}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={18} color={NavColors.cyan} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Dynamic Measurements List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ 
            paddingHorizontal: NavSpacing.xl, 
            paddingBottom: 100 
          }}
        >
          {loading ? (
            <View style={{ gap: 12, marginTop: 10 }}>
              <Skeleton height={140} borderRadius={NavRadius.lg} />
              <Skeleton height={140} borderRadius={NavRadius.lg} />
            </View>
          ) : measurements.length > 0 ? (
            measurements.map((item, index) => {
              const severity = getOverallSeverity(item.vitals);
              const color =
                severity === "critical"
                  ? "#EF4444"
                  : severity === "alert"
                    ? "#F59E0B"
                    : "#10B981";
              const title =
                severity === "critical"
                  ? "Alerta Crítico"
                  : severity === "alert"
                    ? "Atenção Necessária"
                    : "Aferição Estável";
              const time = new Date(item.recordedAt).toLocaleTimeString(
                "pt-BR",
                { hour: "2-digit", minute: "2-digit" },
              );

              return (
                <Animated.View
                  key={item.id}
                  entering={FadeInUp.duration(600).delay(100 * index)}
                >
                  <View
                    style={[
                      styles.historyCardV2,
                      {
                        backgroundColor: NavColors.bg1,
                        borderColor: NavColors.borderSoft,
                      },
                    ]}
                  >
                    <View style={styles.historyCardTopRow}>
                      <PulseIndicator
                        color={color}
                        icon={
                          severity === "normal"
                            ? "pulse"
                            : severity === "alert"
                              ? "warning"
                              : "alert-circle"
                        }
                      />
                      <View style={styles.historyTextContainer}>
                        <Text
                          style={[
                            styles.historyTitleText,
                            { color: NavColors.textPrimary },
                          ]}
                        >
                          {title}
                        </Text>
                        <Text
                          style={[
                            styles.historyTime,
                            { color: NavColors.textMuted },
                          ]}
                        >
                          {time}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.badgeTopRight,
                          { 
                            backgroundColor: `${color}10`, // Mais transparente
                            opacity: 0.5 // Efeito de desabilitado
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeTopRightText, 
                            { color: color, opacity: 0.6 }
                          ]}
                        >
                          Ver detalhes
                        </Text>
                      </View>
                    </View>

                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.metricsScroll}
                    >
                      <MetricBadge
                        icon="speedometer"
                        value={item.vitals.bloodPressure || "-"}
                        severity={getVitalSeverity(
                          "bloodPressure",
                          item.vitals.bloodPressure,
                        )}
                      />
                      <MetricBadge
                        icon="heart"
                        value={
                          item.vitals.heartRate
                            ? String(item.vitals.heartRate)
                            : "-"
                        }
                        severity={getVitalSeverity(
                          "heartRate",
                          item.vitals.heartRate,
                        )}
                      />
                      <MetricBadge
                        icon="thermometer"
                        value={
                          item.vitals.temperature
                            ? String(item.vitals.temperature)
                            : "-"
                        }
                        severity={getVitalSeverity(
                          "temperature",
                          item.vitals.temperature,
                        )}
                      />
                      <MetricBadge
                        icon="water"
                        value={
                          item.vitals.oxygenSaturation
                            ? `${item.vitals.oxygenSaturation}%`
                            : "-"
                        }
                        severity={getVitalSeverity(
                          "oxygenSaturation",
                          item.vitals.oxygenSaturation,
                        )}
                      />
                      <MetricBadge
                        icon="alert-circle"
                        value={
                          item.vitals.painLevel !== null
                            ? String(item.vitals.painLevel)
                            : "-"
                        }
                        severity={getVitalSeverity(
                          "painLevel",
                          item.vitals.painLevel,
                        )}
                      />
                      <MetricBadge
                        icon="barbell"
                        value={
                          item.vitals.weight !== null
                            ? `${item.vitals.weight} kg`
                            : "-"
                        }
                        severity={item.vitals.weight !== null ? "normal" : "unfilled"}
                      />
                    </ScrollView>
                  </View>
                </Animated.View>
              );
            })
          ) : (
            <View style={{ alignItems: "center", paddingVertical: 30 }}>
              <Ionicons
                name="calendar-outline"
                size={48}
                color={NavColors.textMuted}
                style={{ opacity: 0.3 }}
              />
              <Text
                style={{
                  color: NavColors.textMuted,
                  marginTop: 10,
                  fontWeight: "500",
                }}
              >
                Nenhuma aferição hoje
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

// Indicator Animado Futurista
function PulseIndicator({ color, icon }: { color: string; icon: any }) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 1000 }),
        withTiming(1, { duration: 1000 }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    shadowColor: color,
    shadowOpacity: 0.6,
    shadowRadius: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: color + "20", // Opacidade de 20%
    justifyContent: "center",
    alignItems: "center",
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name={icon} size={22} color={color} />
    </Animated.View>
  );
}

// Sub-componente para renderizar cada métrica com ícone e cor de severidade
function MetricBadge({
  icon,
  value,
  severity,
}: {
  icon: any;
  value: string;
  severity: "normal" | "alert" | "critical" | "unfilled";
}) {
  const colorMap = {
    normal: "#10B981", // Verde
    alert: "#F59E0B", // Amarelo
    critical: "#EF4444", // Vermelho
    unfilled: "#4B5563", // Cinza
  };
  const color = colorMap[severity];

  return (
    <View style={styles.metricBadge}>
      <Ionicons name={icon} size={14} color={color} />
      <Text
        style={[
          styles.metricValue,
          { color: severity === "unfilled" ? "#6B7280" : "#E5E7EB" },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerGradient: {
    paddingHorizontal: NavSpacing.xl,
    paddingBottom: NavSpacing.xl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFF",
  },
  notificationPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  notificationText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },
  subGreetingText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    marginBottom: 24,
    fontWeight: "500",
  },
  mainButton: {
    backgroundColor: "#FFF",
    borderRadius: NavRadius.xl,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  mainButtonDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  mainButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  mainButtonText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
  },
  mainButtonTextActive: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FF007B",
  },
  mainButtonTextDisabled: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FF007B",
  },
  contentPadding: {
    paddingHorizontal: NavSpacing.xl,
    paddingTop: NavSpacing.xl,
  },

  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: NavSpacing.xl,
    marginBottom: NavSpacing.md,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  listSubtitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  historyCardV2: {
    borderWidth: 1,
    borderRadius: NavRadius.lg,
    padding: NavSpacing.lg,
    marginBottom: NavSpacing.md,
    // Add glowing shadow inside
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  historyCardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: NavSpacing.md,
  },
  historyTextContainer: {
    marginLeft: NavSpacing.md,
    flex: 1,
  },
  historyTitleText: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  historyTime: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  badgeTopRight: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: NavRadius.full,
  },
  badgeTopRightText: {
    fontWeight: "800",
    fontSize: 13,
  },
  metricsScroll: {
    flexDirection: "row",
    gap: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  metricBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: NavRadius.md,
    gap: 6,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
