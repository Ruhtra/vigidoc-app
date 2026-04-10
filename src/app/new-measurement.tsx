import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  FadeInDown, 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withSequence, 
  withTiming
} from 'react-native-reanimated';

import { useMeasurementStore } from '@stores/measurement.store';
import { useThemeColors } from '@hooks/use-theme-colors';
import { NavSpacing, NavRadius } from '@constants/nav-theme';

const MEASUREMENT_TYPES = [
  { id: 'pa' as const, title: 'Pressão (PA)', icon: 'speedometer-outline', color: '#00D4FF', unit: 'mmHg' },
  { id: 'fc' as const, title: 'Frequência (FC)', icon: 'heart-outline', color: '#FF4466', unit: 'bpm' },
  { id: 'temp' as const, title: 'Temperatura', icon: 'thermometer-outline', color: '#F97316', unit: 'ºC' },
  { id: 'spo2' as const, title: 'Oxigenação', icon: 'water-outline', color: '#00FF88', unit: '%' },
  { id: 'peso' as const, title: 'Peso', icon: 'barbell-outline', color: '#7B2FFF', unit: 'kg' },
  { id: 'dor' as const, title: 'Nível de Dor', icon: 'alert-circle-outline', color: '#EAB308', unit: '/10' },
];

type Severity = 'normal' | 'alert' | 'critical';

function getMetricSeverity(id: string, value: any): Severity {
  if (!value) return 'normal';
  if (id === 'pa') {
    const sis = value.sistolica;
    const dia = value.diastolica;
    if (sis >= 140 || dia >= 90) return 'critical';
    if (sis >= 130 || dia >= 85) return 'alert';
    return 'normal';
  }
  if (id === 'fc') {
    const v = value.value;
    if (v < 50 || v > 110) return 'critical';
    if (v < 60 || v > 100) return 'alert';
    return 'normal';
  }
  if (id === 'temp') {
    const v = value.value;
    if (v > 37.8 || v < 35.5) return 'critical';
    if (v > 37.2 || v < 36.1) return 'alert';
    return 'normal';
  }
  if (id === 'spo2') {
    const v = value.value;
    if (v <= 90) return 'critical';
    if (v <= 94) return 'alert';
    return 'normal';
  }
  if (id === 'dor') {
    const v = value.value;
    if (v >= 8) return 'critical';
    if (v >= 4) return 'alert';
    return 'normal';
  }
  return 'normal';
}

function getSeverityColor(sev: Severity) {
  if (sev === 'critical') return '#FF4466';
  if (sev === 'alert') return '#F59E0B';
  return '#00FF88'; 
}

const PulseRing = ({ color }: { color: string }) => {
  const pulse = useSharedValue(1);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    pulse.value = withRepeat(withSequence(withTiming(1.3, { duration: 1200 }), withTiming(1, { duration: 1200 })), -1);
    opacity.value = withRepeat(withSequence(withTiming(0.05, { duration: 1200 }), withTiming(0.3, { duration: 1200 })), -1);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[
      { position: 'absolute', width: '130%', height: '130%', borderRadius: 100, backgroundColor: color },
      animatedStyle
    ]} />
  );
};

const GlowText = ({ text, color, style }: { text: string; color: string; style: any }) => {
  return (
    <View>
      <Text style={[style, { color, position: 'absolute', textShadowColor: color, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10, opacity: 0.6 }]}>{text}</Text>
      <Text style={[style, { color }]}>{text}</Text>
    </View>
  );
}

export default function NewMeasurementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const measurementState = useMeasurementStore();
  const NavColors = useThemeColors();
  const queryClient = useQueryClient();

  // The submission function used by both manual finalize and sync engine
  const submitFn = async (payload: any) => {
    const { vitalsService } = await import('@lib/services/vitals.service');
    await vitalsService.submitRecord(payload);
    queryClient.invalidateQueries({ queryKey: ['vitalsHistory'] });
    queryClient.invalidateQueries({ queryKey: ['healthStreak'] });
  };

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [val1, setVal1] = useState('');
  const [val2, setVal2] = useState('');
  const [timeRemaining, setTimeRemaining] = useState<string>('10:00');
  const [headerTheme, setHeaderTheme] = useState<{ colors: [string, string]; icon: any }>({
    colors: ['#0C1526', '#02040E'],
    icon: 'sunny'
  });
  
  const inputRef = useRef<TextInput>(null);
  const diastolicRef = useRef<TextInput>(null);

  const count = measurementState.getMeasurementCount();

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

  useEffect(() => {
    const interval = setInterval(() => {
      if (measurementState.status === 'measuring' && measurementState.startTime) {
        const elapsed = Date.now() - measurementState.startTime;
        const remaining = 10 * 60 * 1000 - elapsed;
        if (remaining <= 0) {
          // Auto-finalize: submit to API then navigate away
          measurementState.finalizeAndSync(submitFn).then(() => router.back());
        } else {
          const mins = Math.floor(remaining / 60000);
          const secs = Math.floor((remaining % 60000) / 1000);
          setTimeRemaining(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [measurementState.status, measurementState.startTime]);

  const handleSaveItem = (id: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (id === 'pa') {
       if (!val1 || !val2) return;
       measurementState.addMeasurement('pa', { sistolica: Number(val1), diastolica: Number(val2), time: timeStr });
    } else {
       if (!val1) return;
       measurementState.addMeasurement(id as any, { value: Number(val1), time: timeStr });
    }
    setActiveModal(null);
    setVal1('');
    setVal2('');
  };

  const handleRegistrar = () => {
    const count = measurementState.getMeasurementCount();
    const doFinalize = () => {
      measurementState.finalizeAndSync(submitFn);
      router.back();
    };

    if (count < 6) {
      Alert.alert(
        'Medição Incompleta',
        `Você realizou ${count} de 6 aferições. Deseja realmente finalizar o registro com dados faltando?`,
        [
          { text: 'Continuar Medindo', style: 'cancel' },
          { text: 'Sim, Finalizar', onPress: doFinalize },
        ]
      );
    } else {
      doFinalize();
    }
  };

  const openModal = (id: string) => {
    setVal1('');
    setVal2('');
    setActiveModal(id);
  };

  const activeItemData = activeModal ? MEASUREMENT_TYPES.find(m => m.id === activeModal) : null;

  return (
    <View style={{ flex: 1, backgroundColor: NavColors.bg0 }}>
      <StatusBar style="light" />
      
      {/* Background Grid Pattern or Glow */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.4, backgroundColor: NavColors.bg0 }}>
        {/* We can place additional futuristic decorations here if needed */}
      </View>
      
      <Animated.View entering={FadeInDown.duration(600)}>
        <LinearGradient
          colors={headerTheme.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: insets.top + 10, paddingHorizontal: 20, paddingBottom: 25, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
               <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>
                 {measurementState.status === 'measuring' ? timeRemaining : 'Aguardando'}
               </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontSize: 28, fontWeight: '900', color: '#FFF', letterSpacing: -0.5 }}>Nova Medição</Text>
              <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: '600' }}>Acompanhamento de Sinais</Text>
            </View>
            <View style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' }}>
               <GlowText text={`${count}/6`} color="#FFF" style={{ fontSize: 20, fontWeight: '900' }} />
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView contentContainerStyle={{ padding: NavSpacing.xl, paddingBottom: 120 }} showsVerticalScrollIndicator={false} bounces={false}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {MEASUREMENT_TYPES.map((item, idx) => {
            const dataVal = measurementState.measurements[item.id as keyof typeof measurementState.measurements];
            const isFilled = !!dataVal;
            const severity = getMetricSeverity(item.id, dataVal);
            const statusColor = isFilled ? getSeverityColor(severity) : item.color;
            const cardBgColor = isFilled ? `${statusColor}15` : NavColors.bg2; 
            const cardBorderColor = isFilled ? statusColor : 'rgba(255, 255, 255, 0.1)';

            return (
              <Animated.View key={item.id} entering={FadeInDown.duration(600).delay(idx * 60)} style={{ width: '48%', marginBottom: 16 }}>
                <TouchableOpacity 
                   style={{
                     padding: 14,
                     borderRadius: NavRadius.lg,
                     borderWidth: 1,
                     height: 120,
                     justifyContent: 'space-between',
                     backgroundColor: cardBgColor,
                     borderColor: cardBorderColor,
                     shadowColor: statusColor,
                     shadowOffset: { width: 0, height: 4 },
                     shadowOpacity: isFilled ? 0.3 : 0,
                     shadowRadius: 10,
                   }} 
                   onPress={() => openModal(item.id)}
                   activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                     <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: isFilled ? statusColor : 'rgba(255, 255, 255, 0.05)', justifyContent: 'center', alignItems: 'center' }}>
                        {isFilled && <PulseRing color={statusColor} />}
                        <Ionicons name={item.icon as any} size={22} color={isFilled ? '#FFF' : statusColor} />
                     </View>
                  </View>
                  
                  <View style={{ marginTop: 8 }}>
                     <Text style={{ fontSize: 13, fontWeight: '800', color: isFilled ? statusColor : '#A0AEC0', letterSpacing: 0.5 }}>{item.title}</Text>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 }}>
                     <View>
                        {isFilled ? (
                           <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                             <Text style={{ fontSize: 22, fontWeight: '900', color: NavColors.textPrimary }}>
                               {item.id === 'pa' ? `${(dataVal as any).sistolica}/${(dataVal as any).diastolica}` : (dataVal as any).value}
                             </Text>
                             <Text style={{ fontSize: 12, fontWeight: '700', color: NavColors.textMuted, marginLeft: 4 }}>
                               {item.unit}
                             </Text>
                           </View>
                        ) : (
                           <Text style={{ fontSize: 12, color: '#4A5568', fontWeight: '700' }}>Dados Pendentes</Text>
                        )}
                     </View>
                     {isFilled && <Ionicons name={severity === 'normal' ? 'checkmark-circle' : 'warning'} size={20} color={statusColor} style={{ marginLeft: 'auto' }} />}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>

      {/* Futuristic Finalize Button */}
      <View style={{ position: 'absolute', bottom: 30, left: 20, right: 20 }}>
        <TouchableOpacity
          style={[{ height: 60, borderRadius: 30, overflow: 'hidden' }]}
          onPress={handleRegistrar}
          disabled={count === 0}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={count === 0 ? [NavColors.bg1, NavColors.bg2] : ['#00D4FF', '#7B2FFF']}
            style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: count === 0 ? NavColors.borderSoft : 'rgba(255,255,255,0.4)', borderRadius: 30 }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <GlowText 
              text={count === 0 ? 'INSIRA MÍNIMO DE 1 SINAL' : 'FINALIZAR REGISTRO'} 
              color={count === 0 ? NavColors.textMuted : '#FFF'} 
              style={{ fontSize: 16, fontWeight: '900', letterSpacing: 1 }} 
            />
            {count > 0 && <Ionicons name="checkmark-done" size={20} color="#FFF" />}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Modal / Dialog Input */}
      <Modal 
        visible={!!activeModal} 
        transparent 
        animationType="fade"
        onShow={() => { 
          setTimeout(() => {
            inputRef.current?.focus();
          }, 150);
        }}
      >
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: 'rgba(2, 4, 14, 0.9)', justifyContent: 'center', padding: 20 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Animated.View entering={FadeInDown.duration(400)} style={{ borderRadius: 30, overflow: 'hidden', backgroundColor: NavColors.bg1, borderWidth: 1, borderColor: activeItemData?.color ? `${activeItemData.color}50` : 'rgba(255,255,255,0.1)', shadowColor: activeItemData?.color, shadowOpacity: 0.2, shadowRadius: 20 }}>
             {activeItemData && (
                <>
                  <View style={{ padding: 30, alignItems: 'center' }}>
                     <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: activeItemData.color, opacity: 0.1 }} />
                     <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: `${activeItemData.color}20`, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: activeItemData.color }}>
                        <PulseRing color={activeItemData.color} />
                        <Ionicons name={activeItemData.icon as any} size={40} color={activeItemData.color} />
                     </View>
                     <Text style={{ fontSize: 24, fontWeight: '900', color: NavColors.textPrimary, marginTop: 20 }}>{activeItemData.title}</Text>
                     <Text style={{ color: NavColors.textMuted, marginTop: 8, fontWeight: '700' }}>Hoje às {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
                  
                  <View style={{ padding: 25, backgroundColor: NavColors.bg2 }}>
                          {activeModal === 'pa' ? (
                       <View style={{ flexDirection: 'row', gap: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 30 }}>
                         <View style={{ backgroundColor: NavColors.bg0, borderRadius: 20, width: 110, height: 80, borderWidth: 1, borderColor: NavColors.borderSoft, alignItems: 'center', justifyContent: 'center' }}>
                           <TextInput 
                             ref={inputRef}
                             style={{ color: NavColors.textPrimary, fontSize: 28, fontWeight: '900', textAlign: 'center', width: '100%' }} 
                             placeholder="120" 
                             keyboardType="numeric" 
                             value={val1} 
                             onChangeText={setVal1} 
                             placeholderTextColor={NavColors.textMuted} 
                             returnKeyType="next"
                             onSubmitEditing={() => diastolicRef.current?.focus()}
                             blurOnSubmit={false}
                           />
                         </View>
                         <Text style={{ color: activeItemData.color, fontSize: 32, fontWeight: '900', opacity: 0.8 }}>/</Text>
                         <View style={{ backgroundColor: NavColors.bg0, borderRadius: 20, width: 110, height: 80, borderWidth: 1, borderColor: NavColors.borderSoft, alignItems: 'center', justifyContent: 'center' }}>
                           <TextInput 
                             ref={diastolicRef}
                             style={{ color: NavColors.textPrimary, fontSize: 28, fontWeight: '900', textAlign: 'center', width: '100%' }} 
                             placeholder="80" 
                             keyboardType="numeric" 
                             value={val2} 
                             onChangeText={setVal2} 
                             placeholderTextColor={NavColors.textMuted} 
                             returnKeyType="done"
                             onSubmitEditing={() => handleSaveItem(activeModal as string)}
                           />
                         </View>
                       </View>
                    ) : (
                       <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: NavColors.bg0, borderRadius: 20, height: 80, borderWidth: 1, borderColor: NavColors.borderSoft, paddingHorizontal: 20, marginBottom: 30 }}>
                         <TextInput 
                           ref={inputRef}
                           style={{ color: NavColors.textPrimary, fontSize: 32, fontWeight: '900', textAlign: 'center', minWidth: 50 }} 
                           placeholder="0" 
                           keyboardType="numeric" 
                           value={val1} 
                           onChangeText={(t) => {
                             if (activeModal === 'dor') {
                               const n = Number(t);
                               if (n > 10) return;
                             }
                             setVal1(t);
                           }} 
                           placeholderTextColor={NavColors.textMuted} 
                           returnKeyType="done"
                           onSubmitEditing={() => handleSaveItem(activeModal as string)}
                         />
                         <Text style={{ color: activeItemData.color, fontSize: 20, fontWeight: '800', marginLeft: 8, opacity: 0.8 }}>
                           {activeItemData.unit}
                         </Text>
                       </View>
                    )}
                    
                    <View style={{ flexDirection: 'row', gap: 15 }}>
                       <TouchableOpacity style={{ flex: 1, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: NavColors.bg0, borderWidth: 1, borderColor: NavColors.borderSoft }} onPress={() => setActiveModal(null)}>
                         <Text style={{ color: NavColors.textMuted, fontWeight: '800' }}>CANCELAR</Text>
                       </TouchableOpacity>
                       <TouchableOpacity style={{ flex: 1, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: activeItemData.color, shadowColor: activeItemData.color, shadowOpacity: 0.4, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10 }} onPress={() => handleSaveItem(activeModal as string)}>
                         <Text style={{ color: '#FFF', fontWeight: '900' }}>SALVAR</Text>
                       </TouchableOpacity>
                    </View>
                  </View>
                </>
             )}
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
