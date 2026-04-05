import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';

import { NavColorsDark as NavColors, NavSpacing, NavRadius } from '@/constants/nav-theme';

/**
 * Interface para representar os dados de uma aferição
 */
interface MeasurementData {
  pa?: string; // Pressão Arterial
  fc?: number; // Frequência Cardíaca
  temp?: number; // Temperatura
  spo2?: number; // Saturação
  peso?: number; // Peso
  dor: number | null; // Nível de Dor (0-10)
  observacoes?: string;
  timestamp: string;
}

export default function NewMeasurementScreen() {
  const router = useRouter();

  // Estado local para os inputs
  const [pa, setPa] = useState('');
  const [fc, setFc] = useState('');
  const [temp, setTemp] = useState('');
  const [spo2, setSpo2] = useState('');
  const [peso, setPeso] = useState('');
  const [dor, setDor] = useState<number | null>(null);
  const [observacoes, setObservacoes] = useState('');

  // Máscara simples para Pressão Arterial (ex: 120/80)
  const handlePaChange = (text: string) => {
    // Remove tudo que não for número ou barra
    const cleaned = text.replace(/[^0-9/]/g, '');
    
    // Auto-insere a barra após o 3º dígito se não houver
    if (cleaned.length === 3 && !cleaned.includes('/')) {
      setPa(cleaned + '/');
    } else if (cleaned.length > 7) {
      setPa(cleaned.slice(0, 7)); // Limita tamanho
    } else {
      setPa(cleaned);
    }
  };

  const isFormValid = () => {
    return (
      pa.length > 0 ||
      fc.length > 0 ||
      temp.length > 0 ||
      spo2.length > 0 ||
      peso.length > 0 ||
      dor !== null ||
      observacoes.length > 0
    );
  };

  const handleSave = () => {
    if (!isFormValid()) {
      Alert.alert('Dados insuficientes', 'Por favor, preencha pelo menos um campo para salvar.');
      return;
    }

    const finalData: MeasurementData = {
      pa: pa || undefined,
      fc: fc ? Number(fc) : undefined,
      temp: temp ? Number(temp.replace(',', '.')) : undefined,
      spo2: spo2 ? Number(spo2) : undefined,
      peso: peso ? Number(peso.replace(',', '.')) : undefined,
      dor,
      observacoes: observacoes || undefined,
      timestamp: new Date().toISOString(),
    };

    console.log('✅ Nova Aferição Salva:', finalData);
    
    Alert.alert(
      'Sucesso', 
      'Aferição registrada com sucesso!',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Registrar Sinais Vitais</Text>
          <Text style={styles.subtitle}>
            {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.closeButton}
          accessibilityLabel="Fechar"
        >
          <Ionicons name="close" size={24} color={NavColors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          {/* Card: Sinais Vitais */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sinais Vitais</Text>
            
            <View style={styles.grid}>
              <VitalInput
                label="Pressão Arterial"
                placeholder="120/80"
                value={pa}
                onChangeText={handlePaChange}
                icon="heart-outline"
                unit="mmHg"
                keyboardType="numeric"
              />
              <VitalInput
                label="Frequência Cardíaca"
                placeholder="75"
                value={fc}
                onChangeText={setFc}
                icon="speedometer-outline"
                unit="bpm"
                keyboardType="numeric"
              />
              <VitalInput
                label="Temperatura"
                placeholder="36.5"
                value={temp}
                onChangeText={setTemp}
                icon="thermometer-outline"
                unit="°C"
                keyboardType="decimal-pad"
              />
              <VitalInput
                label="Saturação (SPO2)"
                placeholder="98"
                value={spo2}
                onChangeText={setSpo2}
                icon="water-outline"
                unit="%"
                keyboardType="numeric"
              />
              <VitalInput
                label="Peso Atual"
                placeholder="70.0"
                value={peso}
                onChangeText={setPeso}
                icon="fitness-outline"
                unit="kg"
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Card: Nível de Dor */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nível de Dor</Text>
            <Text style={styles.sectionSubtitle}>Como você avalia sua dor agora?</Text>
            
            <View style={styles.painContainer}>
              <View style={styles.painGrid}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.painButton,
                      dor === level && styles.painButtonSelected,
                      dor === level && { backgroundColor: getPainColor(level) }
                    ]}
                    onPress={() => setDor(level)}
                  >
                    <Text style={[
                      styles.painButtonText,
                      dor === level && styles.painButtonTextSelected
                    ]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.painLabels}>
                <Text style={styles.painLabel}>Sem dor</Text>
                <Text style={styles.painLabel}>Pior dor possível</Text>
              </View>
            </View>
          </View>

          {/* Card: Observações */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observações Extras</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Descreva sintomas extras ou como você está se sentindo..."
              placeholderTextColor={NavColors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={observacoes}
              onChangeText={setObservacoes}
            />
          </View>
          
          {/* Espaçamento para o botão fixo */}
          <View style={{ height: 100 }} />
        </Animated.View>
      </ScrollView>

      {/* Action Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            !isFormValid() && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={!isFormValid()}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>Salvar Aferição</Text>
          <Ionicons name="chevron-forward" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// Sub-componente para Inputs de Sinais Vitais
function VitalInput({ 
  label, 
  placeholder, 
  value, 
  onChangeText, 
  icon, 
  unit,
  keyboardType 
}: any) {
  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputContainer}>
        <Ionicons name={icon} size={20} color={NavColors.cyan} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={NavColors.textMuted}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
        />
        <Text style={styles.unitText}>{unit}</Text>
      </View>
    </View>
  );
}

// Helpers
function getPainColor(level: number) {
  if (level === 0) return '#10B981'; // Green
  if (level <= 3) return '#F59E0B'; // Yellow/Orange
  if (level <= 7) return '#EF4444'; // Red
  return '#7F1D1D'; // Dark Red
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NavColors.bg0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: NavSpacing.xl,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: NavSpacing.lg,
    backgroundColor: NavColors.bg1,
    borderBottomWidth: 1,
    borderBottomColor: NavColors.borderSoft,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: NavColors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: NavColors.textSecondary,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: NavColors.bg3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: NavSpacing.xl,
  },
  section: {
    backgroundColor: NavColors.bg1,
    borderRadius: NavRadius.lg,
    padding: NavSpacing.lg,
    marginBottom: NavSpacing.lg,
    // Sombra leve para efeito de profundidade
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: NavColors.textPrimary,
    marginBottom: NavSpacing.md,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: NavColors.textSecondary,
    marginBottom: NavSpacing.lg,
  },
  grid: {
    gap: NavSpacing.lg,
  },
  inputWrapper: {
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: NavColors.textSecondary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NavColors.bg0,
    borderRadius: NavRadius.md,
    borderWidth: 1,
    borderColor: NavColors.border,
    paddingHorizontal: NavSpacing.md,
    height: 56,
  },
  inputIcon: {
    marginRight: NavSpacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: NavColors.textPrimary,
    fontWeight: '500',
  },
  unitText: {
    fontSize: 14,
    color: NavColors.textMuted,
    fontWeight: '600',
    marginLeft: 8,
  },
  painContainer: {
    marginTop: 8,
  },
  painGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  painButton: {
    width: '16.5%', // Aproximadamente 6 por linha ou ajustado para 11 itens
    aspectRatio: 1,
    borderRadius: NavRadius.sm,
    backgroundColor: NavColors.bg3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: NavColors.border,
  },
  painButtonSelected: {
    borderColor: 'transparent',
    transform: [{ scale: 1.1 }],
  },
  painButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: NavColors.textSecondary,
  },
  painButtonTextSelected: {
    color: '#FFF',
  },
  painLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  painLabel: {
    fontSize: 12,
    color: NavColors.textMuted,
    fontWeight: '600',
  },
  textArea: {
    backgroundColor: NavColors.bg0,
    borderRadius: NavRadius.md,
    borderWidth: 1,
    borderColor: NavColors.border,
    padding: NavSpacing.md,
    color: NavColors.textPrimary,
    fontSize: 16,
    minHeight: 120,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: NavSpacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    backgroundColor: NavColors.bg1,
    borderTopWidth: 1,
    borderTopColor: NavColors.borderSoft,
  },
  saveButton: {
    backgroundColor: '#F97316', // Laranja solicitado (Orange-500)
    height: 60,
    borderRadius: NavRadius.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  saveButtonDisabled: {
    backgroundColor: NavColors.bg3,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    marginRight: 8,
  },
});
