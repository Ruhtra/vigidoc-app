import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Reanimated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  FadeInLeft,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { registerSchema, type RegisterFormSchemaType } from '@lib/schemas/register.schema';
import { AuthService } from '@lib/services/auth.service';
import { Logo } from '@components/ui/logo';

/* ─────────────────────────────────────────────────────────── */
/*  Design Tokens                                              */
/* ─────────────────────────────────────────────────────────── */

const palette = {
  teal500: '#2DD4BF',
  teal400: '#5EEAD4',
  teal300: '#99F6E4',
  tealDim: 'rgba(45,212,191,0.12)',
  emerald500: '#10B981',
  bg: '#020617',
  bgCard: '#0F172A',
  bgInput: '#1E293B',
  bgInputFocus: '#334155',
  border: '#334155',
  borderFocus: '#2DD4BF',
  borderError: '#F43F5E',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textError: '#FB7185',
  amber500: '#F59E0B',
  successBg: 'rgba(16,185,129,0.08)',
  successBorder: 'rgba(16,185,129,0.25)',
  successText: '#34D399',
  white: '#FFFFFF',
  whatsapp: '#25D366',
} as const;

const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
} as const;

/* ─────────────────────────────────────────────────────────── */
/*  Helpers                                                    */
/* ─────────────────────────────────────────────────────────── */

function maskCpf(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function maskPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function maskDate(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

function calculatePasswordStrength(pwd: string) {
  if (!pwd) return { strength: 0, color: palette.border, label: '' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 1) return { strength: 1, color: palette.textError, label: 'Fraca' };
  if (score === 2 || score === 3) return { strength: 2, color: palette.amber500, label: 'Média' };
  return { strength: 3, color: palette.emerald500, label: 'Forte' };
}

/* ─────────────────────────────────────────────────────────── */
/*  Shared sub-component – FieldInput                          */
/* ─────────────────────────────────────────────────────────── */

type FieldInputProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'email-address' | 'default' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'words' | 'sentences';
  autoComplete?: 'email' | 'new-password' | 'off' | 'name' | 'tel';
  rightElement?: React.ReactNode;
  leftElement?: React.ReactNode;
  hint?: string;
  testID?: string;
  bottomComponent?: React.ReactNode;
  returnKeyType?: 'next' | 'done' | 'send';
  onSubmitEditing?: () => void;
  blurOnSubmit?: boolean;
};

const FieldInput = React.forwardRef<TextInput, FieldInputProps>(({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete = 'off',
  rightElement,
  leftElement,
  hint,
  testID,
  bottomComponent,
  returnKeyType,
  onSubmitEditing,
  blurOnSubmit,
}, ref) => {
  const borderColor = useSharedValue<string>(palette.border);
  const bgColor = useSharedValue<string>(palette.bgInput);

  const animStyle = useAnimatedStyle(() => ({
    borderColor: withTiming(borderColor.value, { duration: 200 }),
    backgroundColor: withTiming(bgColor.value, { duration: 200 }),
  }));

  function handleFocus() {
    borderColor.value = error ? palette.borderError : palette.borderFocus;
    bgColor.value = palette.bgInputFocus;
  }

  function handleBlurInternal() {
    borderColor.value = error ? palette.borderError : palette.border;
    bgColor.value = palette.bgInput;
    onBlur && onBlur();
  }

  React.useEffect(() => {
    borderColor.value = error ? palette.borderError : palette.border;
  }, [error, borderColor]);

  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Reanimated.View style={[styles.inputContainer, animStyle]}>
        {leftElement && <View style={styles.inputLeft}>{leftElement}</View>}
        <TextInput
          testID={testID}
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor={palette.textMuted}
          value={value}
          onChangeText={onChange}
          onFocus={handleFocus}
          onBlur={handleBlurInternal}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          autoCorrect={false}
          ref={ref}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={blurOnSubmit}
        />
        {rightElement && <View style={styles.inputRight}>{rightElement}</View>}
      </Reanimated.View>
      {bottomComponent && <View style={styles.bottomComponentContainer}>{bottomComponent}</View>}
      {hint && !error && !bottomComponent && <Text style={styles.hintText}>{hint}</Text>}
      {error && (
        <Reanimated.Text entering={FadeInDown.duration(180)} style={styles.errorText}>
          {error}
        </Reanimated.Text>
      )}
    </View>
  );
});

/* ─────────────────────────────────────────────────────────── */
/*  Stepper                                                    */
/* ─────────────────────────────────────────────────────────── */

function FormStepper({ currentStep }: { currentStep: 1 | 2 }) {
  const isStep2 = currentStep === 2;

  return (
    <View style={styles.stepperContainer}>
      <View style={[styles.stepperCircle, { backgroundColor: palette.teal500 }]}>
        {isStep2 ? (
          <Ionicons name="checkmark" size={14} color={palette.white} />
        ) : (
          <Text style={[styles.stepperNumber, { color: palette.white }]}>1</Text>
        )}
      </View>
      
      <View style={[styles.stepperLine, isStep2 && styles.stepperLineActive]} />
      
      <View style={[styles.stepperCircle, isStep2 ? { backgroundColor: palette.teal500 } : { backgroundColor: palette.border }]}>
        <Text style={[styles.stepperNumber, isStep2 && { color: palette.white }]}>2</Text>
      </View>
    </View>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Success State                                              */
/* ─────────────────────────────────────────────────────────── */

type SuccessViewProps = {
  email: string;
  onGoToLogin: () => void;
};

function SuccessView({ email, onGoToLogin }: SuccessViewProps) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withSpring(1, { damping: 14, stiffness: 120 });
    opacity.value = withTiming(1, { duration: 400 });
  }, [opacity, scale]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Reanimated.View entering={FadeIn.duration(400)} style={styles.successRoot}>
      <Reanimated.View style={[styles.successIconWrapper, iconStyle]}>
        <View style={styles.successIconOuter}>
          <Ionicons name="checkmark-circle" size={72} color={palette.emerald500} />
        </View>
      </Reanimated.View>
      <Text style={styles.successTitle}>Solicitação enviada! 🎉</Text>
      <Text style={styles.successBody}>
        Sua conta foi criada com sucesso e está{' '}
        <Text style={styles.successHighlight}>aguardando aprovação</Text>.
      </Text>
      <View style={styles.successInfoCard}>
        <Ionicons name="information-circle-outline" size={18} color={palette.teal400} />
        <Text style={styles.successInfoText}>
          Você já pode fazer login com{'\n'}
          <Text style={{ color: palette.textPrimary, fontWeight: '700' }}>{email}</Text>
          {'\n'}mas o acesso estará disponível assim que um administrador aprovar o seu cadastro.
        </Text>
      </View>
      <Pressable style={styles.successButton} onPress={onGoToLogin} testID="btn-go-to-login">
        <Text style={styles.successButtonText}>Ir para o Login →</Text>
      </Pressable>
    </Reanimated.View>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Main Screen                                                */
/* ─────────────────────────────────────────────────────────── */

export default function RequestAccessScreen() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const scrollRef = useRef<KeyboardAwareScrollView>(null);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);
  
  const phoneRef = useRef<TextInput>(null);
  const cpfRef = useRef<TextInput>(null);

  const rawPhoneRef = useRef('');
  const rawCpfRef = useRef('');

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    trigger,
    watch,
  } = useForm<RegisterFormSchemaType>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      birthDate: '',
      phone: '',
      cpf: '',
    },
    mode: 'onChange',
  });

  const passwordValue = watch('password');
  const passwordStatus = useMemo(() => calculatePasswordStrength(passwordValue), [passwordValue]);

  const submitScale = useSharedValue(1);
  const submitStyle = useAnimatedStyle(() => ({ transform: [{ scale: submitScale.value }] }));

  const handleNextStep = async () => {
    // Valida apenas os campos do passo 1 antes de avançar
    const isStep1Valid = await trigger(['name', 'email', 'password', 'confirmPassword']);
    if (isStep1Valid) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const onSubmit = async (data: RegisterFormSchemaType) => {
    setIsLoading(true);
    setApiError(null);

    const { error } = await AuthService.register({
      name: data.name,
      email: data.email,
      password: data.password,
      birthDate: data.birthDate,
      phone: rawPhoneRef.current || data.phone.replace(/\D/g, ''),
      cpf: rawCpfRef.current || data.cpf.replace(/\D/g, ''),
    });

    setIsLoading(false);

    if (error) {
      setApiError(error.message);
      return;
    }

    setSubmittedEmail(data.email);
    setSuccess(true);
  };

  if (success) {
    return (
      <View style={styles.root}>
        <SuccessView email={submittedEmail} onGoToLogin={() => router.replace('/(auth)/login')} />
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView 
      ref={scrollRef}
      style={styles.root}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      enableOnAndroid={true}
      extraHeight={160}
      extraScrollHeight={32}
      bounces={false}
      enableResetScrollToCoords={false}
      keyboardOpeningTime={0}
      enableAutomaticScroll={true}
    >
      <Reanimated.View entering={FadeInDown.duration(500).delay(0)} style={styles.header}>
        <Logo size="lg" showTagline />
      </Reanimated.View>

      <Reanimated.View entering={FadeInUp.duration(500).delay(100)} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerRow}>
            <Text style={styles.cardTitle}>Solicitar Acesso</Text>
            <FormStepper currentStep={step} />
          </View>
          <Text style={styles.cardSubtitle}>
            {step === 1 
              ? 'Preencha suas credenciais de login para criar a conta.'
              : 'Informe seus dados pessoais para contato e segurança.'}
          </Text>
        </View>

        {apiError && (
          <Reanimated.View entering={FadeInDown.duration(200)} style={styles.apiErrorBox}>
            <Text style={styles.apiErrorText}>⚠ {apiError}</Text>
          </Reanimated.View>
        )}

        {/* ── STEP 1: Credenciais ── */}
        {step === 1 && (
          <Reanimated.View entering={FadeInLeft.duration(300)} style={{ gap: spacing.md }}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <FieldInput
                  label="Nome completo"
                  placeholder="Ex: João da Silva"
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                  autoCapitalize="words"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => setTimeout(() => emailRef.current?.focus(), 150)}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <FieldInput
                  ref={emailRef}
                  label="E-mail"
                  placeholder="joao@hospital.com.br"
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoComplete="email"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => setTimeout(() => passwordRef.current?.focus(), 150)}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <FieldInput
                  ref={passwordRef}
                  label="Senha"
                  placeholder="Mínimo 8 caracteres"
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => setTimeout(() => confirmRef.current?.focus(), 150)}
                  rightElement={
                    <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={palette.textSecondary} />
                    </Pressable>
                  }
                  bottomComponent={
                    <View style={styles.strengthContainer}>
                      <View style={styles.strengthBars}>
                        <View style={[styles.strengthBar, passwordStatus.strength >= 1 && { backgroundColor: passwordStatus.color }]} />
                        <View style={[styles.strengthBar, passwordStatus.strength >= 2 && { backgroundColor: passwordStatus.color }]} />
                        <View style={[styles.strengthBar, passwordStatus.strength >= 3 && { backgroundColor: passwordStatus.color }]} />
                      </View>
                      <Text style={[styles.strengthLabel, { color: passwordStatus.color }]}>
                        {passwordStatus.label}
                      </Text>
                    </View>
                  }
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <FieldInput
                  ref={confirmRef}
                  label="Confirmar senha"
                  placeholder="Confirme a senha definida"
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={errors.confirmPassword?.message}
                  secureTextEntry={!showConfirm}
                  returnKeyType="done"
                  onSubmitEditing={handleNextStep}
                  rightElement={
                    <Pressable onPress={() => setShowConfirm(!showConfirm)} hitSlop={8}>
                      <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color={palette.textSecondary} />
                    </Pressable>
                  }
                />
              )}
            />

            <Pressable
              onPress={handleNextStep}
              style={[styles.submitButton, { marginTop: 4 }]}
            >
              <Text style={styles.submitText}>Próximo Passo →</Text>
            </Pressable>
          </Reanimated.View>
        )}

        {/* ── STEP 2: Dados Pessoais ── */}
        {step === 2 && (
          <Reanimated.View entering={FadeInRight.duration(300)} style={{ gap: spacing.md }}>
            <Controller
              control={control}
              name="birthDate"
              render={({ field: { onChange, onBlur, value } }) => (
                <FieldInput
                  label="Data de nascimento"
                  placeholder="DD/MM/AAAA"
                  value={value}
                  onChange={(r) => onChange(maskDate(r))}
                  onBlur={onBlur}
                  error={errors.birthDate?.message}
                  keyboardType="numeric"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => setTimeout(() => phoneRef.current?.focus(), 150)}
                />
              )}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <FieldInput
                  ref={phoneRef}
                  label="Telefone (WhatsApp)"
                  placeholder="(00) 00000-0000"
                  value={value}
                  onChange={(r) => {
                    rawPhoneRef.current = r.replace(/\D/g, '');
                    onChange(maskPhone(r));
                  }}
                  onBlur={onBlur}
                  error={errors.phone?.message}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => setTimeout(() => cpfRef.current?.focus(), 150)}
                  hint="Será usado para notificações seguras"
                  leftElement={
                    <Ionicons name="logo-whatsapp" size={20} color={palette.whatsapp} style={{ marginRight: 8 }} />
                  }
                />
              )}
            />

            <Controller
              control={control}
              name="cpf"
              render={({ field: { onChange, onBlur, value } }) => (
                <FieldInput
                  ref={cpfRef}
                  label="CPF"
                  placeholder="000.000.000-00"
                  value={value}
                  onChange={(r) => {
                    rawCpfRef.current = r.replace(/\D/g, '');
                    onChange(maskCpf(r));
                  }}
                  onBlur={onBlur}
                  error={errors.cpf?.message}
                  keyboardType="numeric"
                  returnKeyType="send"
                  onSubmitEditing={handleSubmit(onSubmit)}
                />
              )}
            />

            <View style={styles.step2Actions}>
              <Pressable onPress={handlePrevStep} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>← Voltar</Text>
              </Pressable>

              <Reanimated.View style={[submitStyle, { flex: 2 }]}>
                <Pressable
                  onPressIn={() => { submitScale.value = withSpring(0.97, { damping: 15 }); }}
                  onPressOut={() => { submitScale.value = withSpring(1, { damping: 15 }); }}
                  onPress={handleSubmit(onSubmit)}
                  disabled={isLoading}
                  style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                >
                  {isLoading ? (
                    <ActivityIndicator color={palette.white} size="small" />
                  ) : (
                    <Text style={styles.submitText}>Concluir 🎉</Text>
                  )}
                </Pressable>
              </Reanimated.View>
            </View>
          </Reanimated.View>
        )}

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Já tem acesso?</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.footerLink}>Fazer Login</Text>
          </Pressable>
        </View>
      </Reanimated.View>

      <Reanimated.Text entering={FadeInDown.duration(400).delay(300)} style={styles.copyright}>
        © {new Date().getFullYear()} VigiDoc · Todos os direitos reservados
      </Reanimated.Text>
    </KeyboardAwareScrollView>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Styles                                                     */
/* ─────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.xxl },

  header: { alignItems: 'center', marginBottom: spacing.lg },

  card: {
    backgroundColor: palette.bgCard, borderRadius: 24, borderWidth: 1, borderColor: palette.border,
    padding: spacing.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 24, elevation: 10,
    gap: spacing.md,
  },
  cardHeader: { marginBottom: spacing.xs },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 22, fontWeight: '700', color: palette.textPrimary, letterSpacing: 0.2 },
  cardSubtitle: { fontSize: 13, color: palette.textSecondary, marginTop: 8, lineHeight: 20 },

  stepperContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepperCircle: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stepperNumber: { fontSize: 12, fontWeight: '700', color: palette.textSecondary },
  stepperLine: { width: 30, height: 2, backgroundColor: palette.border, borderRadius: 1 },
  stepperLineActive: { backgroundColor: palette.teal500 },

  apiErrorBox: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 12, padding: spacing.sm + 4 },
  apiErrorText: { color: palette.textError, fontSize: 13, lineHeight: 18 },

  fieldWrapper: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: palette.textSecondary, letterSpacing: 0.3 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 14, paddingHorizontal: spacing.md, height: 52 },
  textInput: { flex: 1, fontSize: 15, color: palette.textPrimary, height: '100%' },
  inputLeft: { marginRight: 0 },
  inputRight: { marginLeft: spacing.sm },
  eyeIcon: { fontSize: 18 },
  hintText: { fontSize: 11, color: palette.textMuted, marginTop: 2, lineHeight: 16 },
  errorText: { fontSize: 12, color: palette.textError, marginTop: 2 },
  bottomComponentContainer: { marginTop: 4 },

  strengthContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 2 },
  strengthBars: { flex: 1, flexDirection: 'row', gap: 4 },
  strengthBar: { height: 4, flex: 1, backgroundColor: palette.border, borderRadius: 2 },
  strengthLabel: { fontSize: 11, fontWeight: '700', minWidth: 40, textAlign: 'right' },

  submitButton: {
    height: 52, borderRadius: 14, backgroundColor: palette.teal500, alignItems: 'center', justifyContent: 'center',
    shadowColor: palette.teal500, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 6,
  },
  submitButtonDisabled: { opacity: 0.65 },
  submitText: { fontSize: 16, fontWeight: '700', color: palette.white, letterSpacing: 0.4 },

  step2Actions: { flexDirection: 'row', gap: spacing.sm, marginTop: 4 },
  secondaryButton: {
    flex: 1, height: 52, borderRadius: 14, backgroundColor: 'transparent',
    borderWidth: 1.5, borderColor: palette.border, alignItems: 'center', justifyContent: 'center',
  },
  secondaryButtonText: { fontSize: 15, fontWeight: '600', color: palette.textSecondary },

  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8 },
  footerText: { fontSize: 13, color: palette.textMuted },
  footerLink: { fontSize: 13, color: palette.teal400, fontWeight: '600' },

  copyright: { fontSize: 11, color: palette.textMuted, textAlign: 'center', marginTop: spacing.xl, letterSpacing: 0.3 },

  successRoot: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg, gap: spacing.lg },
  successIconWrapper: { marginBottom: spacing.sm },
  successIconOuter: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1.5, borderColor: 'rgba(16,185,129,0.3)', alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: 26, fontWeight: '800', color: palette.textPrimary, textAlign: 'center', letterSpacing: 0.3 },
  successBody: { fontSize: 15, color: palette.textSecondary, textAlign: 'center', lineHeight: 22 },
  successHighlight: { color: palette.teal400, fontWeight: '700' },
  successInfoCard: { flexDirection: 'row', gap: spacing.sm, backgroundColor: palette.tealDim, borderWidth: 1, borderColor: 'rgba(45,212,191,0.2)', borderRadius: 16, padding: spacing.md, maxWidth: 360 },
  successInfoText: { flex: 1, fontSize: 13, color: palette.textSecondary, lineHeight: 20 },
  successButton: { width: '100%', maxWidth: 360, height: 52, borderRadius: 14, backgroundColor: palette.teal500, alignItems: 'center', justifyContent: 'center', shadowColor: palette.teal500, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 6, marginTop: spacing.sm },
  successButtonText: { fontSize: 16, fontWeight: '700', color: palette.white, letterSpacing: 0.4 },
});
