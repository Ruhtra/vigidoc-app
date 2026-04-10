import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as LocalAuthentication from 'expo-local-authentication';
import Animated, { FadeIn, FadeInDown, SlideInRight } from 'react-native-reanimated';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { NavSpacing, NavRadius } from '@constants/nav-theme';
import { useThemeColors } from '@hooks/use-theme-colors';
import { registerSchema, type RegisterFormSchemaType } from '@lib/schemas/register.schema';
import { AuthService } from '@lib/services/auth.service';
import { useThemeStore } from '@stores/theme.store';
import { useMutation } from '@tanstack/react-query';

export default function RequestAccessScreen() {
  const NavColors = useThemeColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const registerMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { error } = await AuthService.register(payload);
      if (error) throw new Error(error.message);
    },
    onSuccess: (_, variables) => {
      setSubmittedEmail(variables.email);
      setSuccess(true);
    },
  });

  const isLoading = registerMutation.isPending;
  const apiError = (registerMutation.error as Error)?.message || null;

  const { control, handleSubmit, formState: { errors }, trigger, watch } = useForm<RegisterFormSchemaType>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      cpf: '',
      phone: '',
      birthDate: '',
    }
  });

  const handleNextStep = async () => {
    const isValid = await trigger(['name', 'email', 'password', 'confirmPassword']);
    if (isValid) setStep(2);
  };

  const handlePrevStep = () => setStep(1);

  const onSubmit = async (data: RegisterFormSchemaType) => {
    registerMutation.mutate({
      name: data.name, 
      email: data.email, 
      password: data.password, 
      birthDate: data.birthDate,
      phone: data.phone.replace(/\D/g, ''),
      cpf: data.cpf.replace(/\D/g, ''),
    });
  };

  if (success) {
    return (
      <View style={[styles.container, { backgroundColor: NavColors.bg0 }]}>
        <View style={styles.content}>
          <Ionicons name="checkmark-circle" size={80} color={NavColors.cyan} />
          <Text style={[styles.title, { color: NavColors.textPrimary }]}>Sucesso!</Text>
          <Text style={[styles.description, { color: NavColors.textMuted }]}>
            Sua solicitação para {submittedEmail} foi enviada. Aguarde a aprovação administrativa.
          </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={[styles.button, { backgroundColor: NavColors.cyan }]}>
            <Text style={styles.buttonText}>Voltar ao Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView style={{ flex: 1, backgroundColor: NavColors.bg0 }} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={NavColors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: NavColors.textPrimary }]}>Criar Conta</Text>
        </View>

        <View style={styles.stepIndicator}>
           <View style={[styles.stepItem, step >= 1 && { backgroundColor: NavColors.cyan }]} />
           <View style={[styles.stepItem, step >= 2 && { backgroundColor: NavColors.cyan }]} />
        </View>

        {step === 1 ? (
          <Animated.View entering={FadeInDown} style={styles.form}>
            <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
              <TextInput style={[styles.input, { color: NavColors.textPrimary, borderColor: errors.name ? NavColors.error : NavColors.border }]} placeholder="Nome Completo" placeholderTextColor={NavColors.textMuted} value={value} onChangeText={onChange} />
            )} />
            <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
              <TextInput style={[styles.input, { color: NavColors.textPrimary, borderColor: errors.email ? NavColors.error : NavColors.border }]} placeholder="E-mail" placeholderTextColor={NavColors.textMuted} keyboardType="email-address" autoCapitalize="none" value={value} onChangeText={onChange} />
            )} />
            <TouchableOpacity onPress={handleNextStep} style={[styles.button, { backgroundColor: NavColors.cyan }]}>
              <Text style={styles.buttonText}>Próximo</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Animated.View entering={SlideInRight} style={styles.form}>
            <Controller control={control} name="cpf" render={({ field: { onChange, value } }) => (
              <TextInput style={[styles.input, { color: NavColors.textPrimary, borderColor: errors.cpf ? NavColors.error : NavColors.border }]} placeholder="CPF" placeholderTextColor={NavColors.textMuted} keyboardType="numeric" value={value} onChangeText={onChange} />
            )} />
            <TouchableOpacity onPress={handleSubmit(onSubmit)} disabled={isLoading} style={[styles.button, { backgroundColor: NavColors.cyan }]}>
              {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Enviar Solicitação</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePrevStep} style={styles.linkButton}>
              <Text style={[styles.linkText, { color: NavColors.cyan }]}>Voltar</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  backButton: { marginRight: 16 },
  title: { fontSize: 24, fontWeight: '900' },
  stepIndicator: { flexDirection: 'row', gap: 8, marginBottom: 32 },
  stepItem: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB' },
  form: { gap: 16 },
  input: { height: 56, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, fontSize: 16 },
  button: { height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  linkButton: { alignItems: 'center', marginTop: 16 },
  linkText: { fontSize: 14, fontWeight: '700' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  description: { textAlign: 'center', marginTop: 16, marginBottom: 32, fontSize: 16, lineHeight: 24 }
});
