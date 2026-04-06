import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useThemeColors } from '@hooks/use-theme-colors';
import { NavSpacing, NavRadius } from '@constants/nav-theme';

// ─── Types ────────────────────────────────────────────────────────────────────
type Severity = 'normal' | 'alert' | 'critical';
type FilterStatus = 'all' | 'normal' | 'alert' | 'critical';
type TimeRange = 7 | 30 | 90;

interface MetricEntry {
  id: string;
  icon: string;
  label: string;
  value: string;
  unit: string;
  color: string;
  severity: Severity;
}

interface MeasurementRecord {
  id: string;
  time: string;
  overallSeverity: Severity;
  filledCount: number;
  totalCount: number;
  metrics: MetricEntry[];
}

interface DayGroup {
  dateLabel: string;
  dateISO: string;
  records: MeasurementRecord[];
  worstSeverity: Severity;
}

// ─── Mock Data Building ────────────────────────────────────────────────────────
function buildMockHistory(): DayGroup[] {
  const today = new Date();
  const makeDate = (daysAgo: number): string => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };
  const formatDateLabel = (iso: string): string => {
    const d = new Date(iso + 'T00:00:00');
    const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
    if (diff === 0) return 'Hoje';
    if (diff === 1) return 'Ontem';
    return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
  };
  const makeRecord = (
    id: string,
    time: string,
    pa: [number, number],
    fc: number,
    temp: number,
    spo2: number,
    peso: number,
    dor: number,
    filledCount: number,
  ): MeasurementRecord => {
    const paSev: Severity = pa[0] >= 140 || pa[1] >= 90 ? 'critical' : pa[0] >= 130 || pa[1] >= 85 ? 'alert' : 'normal';
    const fcSev: Severity = fc < 50 || fc > 110 ? 'critical' : fc < 60 || fc > 100 ? 'alert' : 'normal';
    const tempSev: Severity = temp > 37.8 || temp < 35.5 ? 'critical' : temp > 37.2 || temp < 36.1 ? 'alert' : 'normal';
    const spo2Sev: Severity = spo2 <= 90 ? 'critical' : spo2 <= 94 ? 'alert' : 'normal';
    const dorSev: Severity = dor >= 8 ? 'critical' : dor >= 4 ? 'alert' : 'normal';
    const severities = [paSev, fcSev, tempSev, spo2Sev, dorSev];
    const overall: Severity = severities.includes('critical') ? 'critical' : severities.includes('alert') ? 'alert' : 'normal';
    const metrics: MetricEntry[] = [
      { id: 'pa', icon: 'speedometer', label: 'PA', value: `${pa[0]}/${pa[1]}`, unit: 'mmHg', color: '#00D4FF', severity: paSev },
      { id: 'fc', icon: 'heart', label: 'FC', value: `${fc}`, unit: 'bpm', color: '#FF4466', severity: fcSev },
      { id: 'temp', icon: 'thermometer', label: 'T°', value: `${temp.toFixed(1)}`, unit: '°C', color: '#F97316', severity: tempSev },
      { id: 'spo2', icon: 'water', label: 'O₂', value: `${spo2}`, unit: '%', color: '#00FF88', severity: spo2Sev },
      { id: 'peso', icon: 'barbell', label: 'Kg', value: `${peso.toFixed(1)}`, unit: 'kg', color: '#A78BFA', severity: 'normal' },
      { id: 'dor', icon: 'alert-circle', label: 'Dor', value: `${dor}`, unit: '/10', color: '#EAB308', severity: dorSev },
    ];
    return { id, time, overallSeverity: overall, filledCount, totalCount: 6, metrics: metrics.slice(0, filledCount) };
  };

  return [
    {
      dateISO: makeDate(0),
      dateLabel: formatDateLabel(makeDate(0)),
      worstSeverity: 'alert',
      records: [
        makeRecord('t-01', '08:14', [120, 80], 72, 36.5, 98, 70.2, 2, 6),
        makeRecord('t-02', '14:30', [128, 84], 85, 37.3, 97, 70.1, 4, 6),
        makeRecord('t-03', '20:05', [125, 82], 78, 36.8, 98, 70.0, 2, 6),
      ],
    },
    {
      dateISO: makeDate(1),
      dateLabel: formatDateLabel(makeDate(1)),
      worstSeverity: 'normal',
      records: [
        makeRecord('y-01', '07:55', [118, 78], 68, 36.4, 99, 70.4, 2, 6),
        makeRecord('y-02', '12:20', [122, 80], 74, 36.6, 98, 70.3, 2, 6),
        makeRecord('y-03', '18:45', [119, 79], 71, 36.5, 98, 70.2, 2, 6),
        makeRecord('y-04', '22:10', [116, 76], 66, 36.3, 99, 70.1, 2, 6),
      ],
    },
    {
      dateISO: makeDate(2),
      dateLabel: formatDateLabel(makeDate(2)),
      worstSeverity: 'critical',
      records: [
        makeRecord('d2-01', '08:00', [118, 77], 70, 37.9, 92, 70.5, 2, 6),
        makeRecord('d2-02', '13:00', [145, 92], 105, 38.1, 91, 70.4, 2, 6),
        makeRecord('d2-03', '19:30', [135, 88], 95, 37.5, 94, 70.3, 2, 6),
      ],
    },
    {
      dateISO: makeDate(4),
      dateLabel: formatDateLabel(makeDate(4)),
      worstSeverity: 'normal',
      records: [
        makeRecord('d4-01', '09:00', [117, 77], 69, 36.5, 98, 70.6, 2, 6),
      ],
    }
  ];
}

const ALL_HISTORY = buildMockHistory();

// ─── Helpers ─────────────────────────────────────────────────────────
function getSeverityColor(sev: Severity) {
  if (sev === 'critical') return '#FF4466';
  if (sev === 'alert') return '#F59E0B';
  return '#10B981';
}

// ─── Sub-components ────────────────────────────────────────────────────────────

interface MeasurementRowProps {
  record: MeasurementRecord;
  isLast: boolean;
}

function MeasurementRow({ record, isLast }: MeasurementRowProps) {
  const NavColors = useThemeColors();
  const color = getSeverityColor(record.overallSeverity);
  const getMetricValue = (id: string) => record.metrics.find(m => m.id === id);

  return (
    <View style={[rowStyles.row, !isLast && { borderBottomWidth: 1, borderBottomColor: NavColors.borderSoft }]}>
      <View style={rowStyles.timeCol}>
        <View style={[rowStyles.severityDot, { backgroundColor: color }]} />
        <Text style={[rowStyles.timeText, { color: NavColors.textPrimary }]}>{record.time}</Text>
      </View>
      
      <View style={rowStyles.metricsContainer}>
        {['pa', 'fc', 'temp', 'spo2', 'dor', 'peso'].map(mid => {
          const m = getMetricValue(mid);
          const mColor = m ? (m.severity ? getSeverityColor(m.severity) : NavColors.textPrimary) : NavColors.textMuted;
          return (
            <View key={mid} style={rowStyles.metricCell}>
              <Ionicons name={m?.icon as any || 'remove'} size={12} color={mColor} />
              <Text style={[rowStyles.valueText, { color: m ? NavColors.textPrimary : NavColors.textMuted }]}>
                {m?.value || '-'}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  timeCol: {
    width: 55,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  severityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  metricsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
  },
  metricCell: {
    width: '16%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  valueText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

function CollapsibleDayGroup({ group, isExpanded, onToggle }: { group: DayGroup; isExpanded: boolean; onToggle: () => void }) {
  const NavColors = useThemeColors();
  const worstColor = getSeverityColor(group.worstSeverity);
  
  const heightAnim = useSharedValue(isExpanded ? 1 : 0);

  useEffect(() => {
    heightAnim.value = withTiming(isExpanded ? 1 : 0, { duration: 350, easing: Easing.bezier(0.33, 1, 0.68, 1) });
  }, [isExpanded]);

  const contentStyle = useAnimatedStyle(() => ({
    maxHeight: interpolate(heightAnim.value, [0, 1], [0, 800], Extrapolation.CLAMP),
    opacity: heightAnim.value,
    overflow: 'hidden',
  }));

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(heightAnim.value, [0, 1], [0, 180])}deg` }]
  }));

  const total = group.records.length;
  const critical = group.records.filter(r => r.overallSeverity === 'critical').length;
  const alert = group.records.filter(r => r.overallSeverity === 'alert').length;

  return (
    <Animated.View entering={FadeInDown.duration(400)} style={[groupStyles.box, { backgroundColor: NavColors.bg1, borderColor: NavColors.borderSoft }]}>
      <TouchableOpacity onPress={onToggle} activeOpacity={0.8} style={groupStyles.header}>
         <View style={[groupStyles.accentBar, { backgroundColor: worstColor }]} />
         <View style={groupStyles.headerBody}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={[groupStyles.dateLabel, { color: NavColors.textPrimary }]}>{group.dateLabel}</Text>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                {critical > 0 && <View style={[groupStyles.miniBadge, { backgroundColor: 'rgba(255,68,102,0.1)' }]}><Text style={[groupStyles.miniBadgeText, { color: '#FF4466' }]}>{critical}C</Text></View>}
                {alert > 0 && <View style={[groupStyles.miniBadge, { backgroundColor: 'rgba(245,158,11,0.1)' }]}><Text style={[groupStyles.miniBadgeText, { color: '#F59E0B' }]}>{alert}A</Text></View>}
              </View>
            </View>
            <Text style={[groupStyles.statText, { color: NavColors.textMuted }]}>{total} aferições registradas</Text>
         </View>
         <Animated.View style={indicatorStyle}>
            <Ionicons name="chevron-down" size={18} color={NavColors.textMuted} />
         </Animated.View>
      </TouchableOpacity>

      <Animated.View style={contentStyle}>
         <View style={groupStyles.tableHeader}>
            <Text style={[groupStyles.headerCell, { width: 55, textAlign: 'left', paddingLeft: 12 }]}>HORA</Text>
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={groupStyles.headerCell}>PA</Text>
              <Text style={groupStyles.headerCell}>FC</Text>
              <Text style={groupStyles.headerCell}>T°</Text>
              <Text style={groupStyles.headerCell}>O₂</Text>
              <Text style={groupStyles.headerCell}>DOR</Text>
              <Text style={groupStyles.headerCell}>KG</Text>
            </View>
         </View>
         <View style={groupStyles.rowsContainer}>
            {group.records.map((record, idx) => (
              <MeasurementRow key={record.id} record={record} isLast={idx === group.records.length - 1} />
            ))}
         </View>
      </Animated.View>
    </Animated.View>
  );
}

const groupStyles = StyleSheet.create({
  box: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  accentBar: {
    width: 4,
    height: 24,
    borderRadius: 2,
    marginRight: 12,
  },
  headerBody: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'capitalize',
  },
  miniBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  miniBadgeText: {
    fontSize: 9,
    fontWeight: '900',
  },
  statText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  headerCell: {
    flex: 1,
    fontSize: 8,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    letterSpacing: 1,
  },
  rowsContainer: {
    paddingBottom: 8,
  },
});

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function HistoricoScreen() {
  const NavColors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [timeRange, setTimeRange] = useState<TimeRange>(7);
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const [headerTheme, setHeaderTheme] = useState<{ colors: [string, string]; icon: any }>({
    colors: ['#0C1526', '#02040E'],
    icon: 'sunny'
  });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) {
      setHeaderTheme({ colors: ['#00D4FF', '#007BF5'], icon: 'partly-sunny' });
    } else if (hour >= 12 && hour < 18) {
      setHeaderTheme({ colors: ['#FF7B00', '#FF007B'], icon: 'sunny' });
    } else if (hour >= 18 && hour < 24) {
      setHeaderTheme({ colors: ['#7B2FFF', '#3A0088'], icon: 'moon' });
    } else {
      setHeaderTheme({ colors: ['#0C1526', '#02040E'], icon: 'moon-outline' });
    }
  }, []);

  const filteredHistory = useMemo(() => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeRange);
    return ALL_HISTORY
      .filter(group => new Date(group.dateISO + 'T00:00:00') >= cutoffDate)
      .map(group => ({
        ...group,
        records: group.records.filter(record => filterStatus === 'all' || record.overallSeverity === filterStatus),
      }))
      .filter(group => group.records.length > 0);
  }, [filterStatus, timeRange]);

  useEffect(() => {
    if (filteredHistory.length > 0) setExpandedDays({ [filteredHistory[0].dateISO]: true });
  }, [filterStatus, timeRange]);

  const toggleDay = (dateISO: string) => setExpandedDays(prev => ({ ...prev, [dateISO]: !prev[dateISO] }));

  const summary = useMemo(() => {
    const recs = filteredHistory.flatMap(g => g.records);
    return { total: recs.length, alert: recs.filter(r => r.overallSeverity === 'alert').length, critical: recs.filter(r => r.overallSeverity === 'critical').length };
  }, [filteredHistory]);

  return (
    <View style={{ flex: 1, backgroundColor: NavColors.bg0 }}>
      {/* ── Fixed Header Section ── */}
      <View style={{ backgroundColor: NavColors.bg0, zIndex: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 }}>
        <LinearGradient 
          colors={headerTheme.colors} 
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: insets.top + 10, paddingHorizontal: 20, paddingBottom: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name={headerTheme.icon} size={24} color="#FFF" />
              <Text style={{ fontSize: 26, fontWeight: '900', color: '#FFF' }}>Histórico</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
              {[7, 30, 90].map(val => (
                <TouchableOpacity key={val} onPress={() => setTimeRange(val as any)} style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, backgroundColor: timeRange === val ? '#FFF' : 'transparent' }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: timeRange === val ? '#000' : 'rgba(255,255,255,0.7)' }}>{val}d</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.2)' }} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
               {([
                 { k: 'all', i: 'apps', c: '#FFF' },
                 { k: 'normal', i: 'checkmark-circle', c: '#FFF' },
                 { k: 'alert', i: 'warning', c: '#FFF' },
                 { k: 'critical', i: 'alert-circle', c: '#FFF' }
               ] as const).map(item => (
                 <TouchableOpacity key={item.k} onPress={() => setFilterStatus(item.k)} style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: filterStatus === item.k ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)', borderColor: filterStatus === item.k ? '#FFF' : 'transparent', borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' }}>
                    <Ionicons name={item.i as any} size={18} color="#FFF" />
                 </TouchableOpacity>
               ))}
            </ScrollView>
          </View>
        </LinearGradient>

        <View style={{ flexDirection: 'row', paddingVertical: 12, backgroundColor: NavColors.bg0, borderBottomWidth: 1, borderBottomColor: NavColors.borderSoft }}>
           <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 9, fontWeight: '900', color: NavColors.textMuted }}>TOTAL</Text>
              <Text style={{ fontSize: 18, fontWeight: '900', color: NavColors.textPrimary }}>{summary.total}</Text>
           </View>
           <View style={{ flex: 1, alignItems: 'center', borderLeftWidth: 1, borderRightWidth: 1, borderColor: NavColors.borderSoft }}>
              <Text style={{ fontSize: 9, fontWeight: '900', color: NavColors.textMuted }}>ALERTA</Text>
              <Text style={{ fontSize: 18, fontWeight: '900', color: '#F59E0B' }}>{summary.alert}</Text>
           </View>
           <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 9, fontWeight: '900', color: NavColors.textMuted }}>CRÍTICO</Text>
              <Text style={{ fontSize: 18, fontWeight: '900', color: '#FF4466' }}>{summary.critical}</Text>
           </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingTop: 16 }}>
        {filteredHistory.map(group => (
          <CollapsibleDayGroup key={group.dateISO} group={group} isExpanded={!!expandedDays[group.dateISO]} onToggle={() => toggleDay(group.dateISO)} />
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}
