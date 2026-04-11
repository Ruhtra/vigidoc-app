import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Reanimated, {
  FadeIn,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';

import { NavSpacing } from '@/constants/nav-theme';
import { Logo } from '@components/ui/logo';
import { ThemeToggle } from '@components/ui/theme-toggle';
import { useThemeColors } from '@hooks/use-theme-colors';
import { registerSchema, type RegisterFormSchemaType } from '@lib/schemas/register.schema';
import { AuthService } from '@lib/services/auth.service';
import { useThemeStore } from '@stores/theme.store';

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
  const NavColors = useThemeColors();
  const borderColor = useSharedValue<string>(NavColors.border);
  const bgColor = useSharedValue<string>(NavColors.bg2);

  const animStyle = useAnimatedStyle(() => ({
    borderColor: withTiming(borderColor.value, { duration: 200 }),
    backgroundColor: withTiming(bgColor.value, { duration: 200 }),
  }));

  function handleFocus() {
    borderColor.value = error ? NavColors.danger : NavColors.cyan;
    bgColor.value = NavColors.bg3;
  }

  function handleBlurInternal() {
    borderColor.value = error ? NavColors.danger : NavColors.border;
    bgColor.value = NavColors.bg2;
    onBlur && onBlur();
  }

  React.useEffect(() => {
    borderColor.value = error ? NavColors.danger : NavColors.border;
    bgColor.value = NavColors.bg2;
  }, [error, NavColors, borderColor, bgColor]);

  return (
    <View style={styles.fieldWrapper}>
      <Text style={[styles.fieldLabel, { color: NavColors.textSecondary }]}>{label}</Text>
      <Reanimated.View style={[styles.inputContainer, animStyle]}>
        {leftElement && <View style={styles.inputLeft}>{leftElement}</View>}
        <TextInput
          testID={testID}
          style={[styles.textInput, { color: NavColors.textPrimary }]}
          placeholder={placeholder}
          placeholderTextColor={NavColors.textMuted}
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
      {hint && !error && !bottomComponent && <Text style={[styles.hintText, { color: NavColors.textMuted }]}>{hint}</Text>}
      {error && (
        <Reanimated.Text entering={FadeInDown.duration(180)} style={[styles.errorText, { color: NavColors.danger }]}>
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
  const NavColors = useThemeColors();
  const isStep2 = currentStep === 2;

  return (
    <View style={styles.stepperContainer}>
      <View style={[styles.stepperCircle, { backgroundColor: NavColors.cyan }]}>
        {isStep2 ? (
          <Ionicons name="checkmark" size={14} color="#FFF" />
        ) : (
          <Text style={[styles.stepperNumber, { color: '#FFF' }]}>1</Text>
        )}
      </View>
      
      <View style={[styles.stepperLine, { backgroundColor: NavColors.border }, isStep2 && { backgroundColor: NavColors.cyan }]} />
      
      <View style={[styles.stepperCircle, isStep2 ? { backgroundColor: NavColors.cyan } : { backgroundColor: NavColors.bg3, borderWidth: 1, borderColor: NavColors.border }]}>
        <Text style={[styles.stepperNumber, { color: isStep2 ? '#FFF' : NavColors.textMuted }]}>2</Text>
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
  const NavColors = useThemeColors();
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

  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
    backgroundColor: withTiming(NavColors.cyan, { duration: 250 }),
    shadowColor: withTiming(NavColors.cyan, { duration: 250 }),
    borderRadius: 14,
  }));

  return (
    <Reanimated.View entering={FadeIn.duration(400)} style={styles.successRoot}>
      <Reanimated.View style={[styles.successIconWrapper, iconStyle]}>
        <View style={[styles.successIconOuter, { backgroundColor: NavColors.greenDim, borderColor: NavColors.green + '40' }]}>
          <Ionicons name="checkmark-circle" size={72} color={NavColors.green} />
        </View>
      </Reanimated.View>
      <Text style={[styles.successTitle, { color: NavColors.textPrimary }]}>Solicitação efetuada! 🎉</Text>
      <Text style={[styles.successBody, { color: NavColors.textSecondary }]}>
        Seu pré-registro foi criado com sucesso e no momento está{' '}
        <Text style={[styles.successHighlight, { color: NavColors.cyan }]}>aguardando aprovação</Text>.
      </Text>
      <View style={[styles.successInfoCard, { backgroundColor: NavColors.cyanDim, borderColor: NavColors.cyan + '40' }]}>
        <Ionicons name="information-circle-outline" size={20} color={NavColors.cyan} style={{ marginTop: 2 }} />
        <Text style={[styles.successInfoText, { color: NavColors.textSecondary }]}>
          A sua solicitação foi recebida e você já pode voltar ao aplicativo.{'\n\n'}
          Assim que um administrador aprovar, seu acesso estará liberado para o login com o e-mail:{'\n'}
          <Text style={{ color: NavColors.textPrimary, fontWeight: '700' }}>{email}</Text>
        </Text>
      </View>
      <Reanimated.View style={[btnStyle, { width: '100%', maxWidth: 360 }]}>
        <Pressable 
          onPressIn={() => { btnScale.value = withSpring(0.97, { damping: 15 }); }} 
          onPressOut={() => { btnScale.value = withSpring(1, { damping: 15 }); }} 
          onPress={onGoToLogin} 
          style={styles.submitButton}
        >
          <Text style={[styles.successButtonText, { color: '#FFF' }]}>Voltar para o Login</Text>
        </Pressable>
      </Reanimated.View>
    </Reanimated.View>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Loading State                                              */
/* ─────────────────────────────────────────────────────────── */

function LoadingView() {
  const NavColors = useThemeColors();
  const pulse = useSharedValue(1);

  React.useEffect(() => {
    pulse.value = withRepeat(withTiming(1.3, { duration: 1000 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 1.5 - pulse.value,
  }));

  return (
    <Reanimated.View entering={FadeIn.duration(400)} style={styles.successRoot}>
      <View style={styles.loadingCircleContainer}>
         <Reanimated.View style={[styles.loadingCirclePulse, { backgroundColor: NavColors.cyan }, animatedStyle]} />
         <View style={[styles.loadingCircleInner, { backgroundColor: NavColors.cyan }]}>
           <Ionicons name="cloud-upload-outline" size={36} color="#FFF" />
         </View>
      </View>
      <Text style={[styles.successTitle, { color: NavColors.textPrimary }]}>Criando pré-registro...</Text>
      <Text style={[styles.successBody, { color: NavColors.textSecondary }]}>
        Por favor, <Text style={{fontWeight: '700', color: NavColors.textPrimary}}>não feche esta tela</Text>. Isso levará alguns segundos enquanto processamos os seus dados com segurança.
      </Text>
    </Reanimated.View>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Main Screen                                                */
/* ─────────────────────────────────────────────────────────── */

export default function RequestAccessScreen() {
  const router = useRouter();
  const NavColors = useThemeColors();
  const storeTheme = useThemeStore(s => s.theme);
  const isDark = storeTheme === 'dark';

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
    formState: { errors },
    trigger,
    watch,
  } = useForm<RegisterFormSchemaType>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '', email: '', password: '', confirmPassword: '', birthDate: '', phone: '', cpf: '',
    },
    mode: 'onChange',
  });

  const passwordValue = watch('password');
  const passwordStatus = useMemo(() => {
    if (!passwordValue) return { strength: 0, color: NavColors.border, label: '' };
    let score = 0;
    if (passwordValue.length >= 8) score++;
    if (/[A-Z]/.test(passwordValue)) score++;
    if (/[0-9]/.test(passwordValue)) score++;
    if (/[^A-Za-z0-9]/.test(passwordValue)) score++;

    if (score <= 1) return { strength: 1, color: NavColors.danger, label: 'Fraca' };
    if (score === 2 || score === 3) return { strength: 2, color: NavColors.warning, label: 'Média' };
    return { strength: 3, color: NavColors.green, label: 'Forte' };
  }, [passwordValue, NavColors]);

  const submitScale = useSharedValue(1);
  const submitStyle = useAnimatedStyle(() => ({ 
    transform: [{ scale: submitScale.value }],
    backgroundColor: withTiming(NavColors.cyan, { duration: 250 }),
    shadowColor: withTiming(NavColors.cyan, { duration: 250 }),
    borderRadius: 14,
  }));

  const handleNextStep = async () => {
    const isStep1Valid = await trigger(['name', 'email', 'password', 'confirmPassword']);
    if (isStep1Valid) setStep(2);
  };

  const handlePrevStep = () => setStep(1);

  const onSubmit = async (data: RegisterFormSchemaType) => {
    setIsLoading(true);
    setApiError(null);
    const { error } = await AuthService.register({
      name: data.name, email: data.email, password: data.password, birthDate: data.birthDate,
      phone: rawPhoneRef.current || data.phone.replace(/\D/g, ''),
      cpf: rawCpfRef.current || data.cpf.replace(/\D/g, ''),
    });
    setIsLoading(false);
    if (error) { setApiError(error.message); return; }
    setSubmittedEmail(data.email);
    setSuccess(true);
  };

  if (success) {
    return (
      <View style={[styles.root, { backgroundColor: NavColors.bg0 }]}>
        <SuccessView email={submittedEmail} onGoToLogin={() => router.replace('/(auth)/login')} />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.root, { backgroundColor: NavColors.bg0 }]}>
        <LoadingView />
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView 
      ref={scrollRef}
      style={[styles.root, { backgroundColor: NavColors.bg0 }]}
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
        <View style={styles.topRightActions}>
          <ThemeToggle />
        </View>

        <Reanimated.View entering={FadeInDown.duration(500).delay(0)} style={styles.header}>
        <Logo size="lg" showTagline />
      </Reanimated.View>

      <Reanimated.View entering={FadeInUp.duration(500).delay(100)} style={[styles.card, { backgroundColor: NavColors.bg1, borderColor: NavColors.borderSoft, shadowOpacity: isDark ? 0.3 : 0.1 }]}>
        <View style={styles.cardHeader}>
          <View style={styles.headerRow}>
            <Text style={[styles.cardTitle, { color: NavColors.textPrimary }]}>Solicitar Acesso</Text>
            <FormStepper currentStep={step} />
          </View>
          <Text style={[styles.cardSubtitle, { color: NavColors.textSecondary }]}>
            {step === 1 ? 'Preencha suas credenciais de login para criar a conta.' : 'Informe seus dados pessoais para contato e segurança.'}
          </Text>
        </View>

        {apiError && (
          <Reanimated.View entering={FadeInDown.duration(200)} style={[styles.apiErrorBox, { backgroundColor: NavColors.danger + '15', borderColor: NavColors.danger + '40' }]}>
            <Text style={[styles.apiErrorText, { color: NavColors.danger, fontWeight: 'bold' }]}>
              ⚠ Ocorreu um erro: {apiError}
            </Text>
            <Text style={[styles.apiErrorText, { color: NavColors.danger, marginTop: 4 }]}>
              Você pode tentar novamente agora ou mais tarde. A nossa equipe de desenvolvimento já está ciente desse erro e irá buscar o motivo da falha para corrigir.
            </Text>
          </Reanimated.View>
        )}

        {step === 1 && (
          <Reanimated.View entering={FadeInLeft.duration(300)} style={{ gap: NavSpacing.md }}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <FieldInput label="Nome completo" placeholder="Ex: João da Silva" value={value} onChange={onChange} onBlur={onBlur} error={errors.name?.message} autoCapitalize="words" returnKeyType="next" blurOnSubmit={false} onSubmitEditing={() => setTimeout(() => emailRef.current?.focus(), 150)} />
              )}
            />
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <FieldInput ref={emailRef} label="E-mail" placeholder="joao@hospital.com.br" value={value} onChange={onChange} onBlur={onBlur} error={errors.email?.message} keyboardType="email-address" autoComplete="email" returnKeyType="next" blurOnSubmit={false} onSubmitEditing={() => setTimeout(() => passwordRef.current?.focus(), 150)} />
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <FieldInput
                  ref={passwordRef} label="Senha" placeholder="Mínimo 8 caracteres" value={value} onChange={onChange} onBlur={onBlur} error={errors.password?.message} secureTextEntry={!showPassword} autoComplete="new-password" returnKeyType="next" blurOnSubmit={false} onSubmitEditing={() => setTimeout(() => confirmRef.current?.focus(), 150)}
                  rightElement={<Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}><Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={NavColors.textSecondary} /></Pressable>}
                  bottomComponent={
                    <View style={styles.strengthContainer}>
                      <View style={styles.strengthBars}>
                        <View style={[styles.strengthBar, { backgroundColor: NavColors.border }, passwordStatus.strength >= 1 && { backgroundColor: passwordStatus.color }]} />
                        <View style={[styles.strengthBar, { backgroundColor: NavColors.border }, passwordStatus.strength >= 2 && { backgroundColor: passwordStatus.color }]} />
                        <View style={[styles.strengthBar, { backgroundColor: NavColors.border }, passwordStatus.strength >= 3 && { backgroundColor: passwordStatus.color }]} />
                      </View>
                      <Text style={[styles.strengthLabel, { color: passwordStatus.color }]}>{passwordStatus.label}</Text>
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
                  ref={confirmRef} label="Confirmar senha" placeholder="Confirme a senha definida" value={value} onChange={onChange} onBlur={onBlur} error={errors.confirmPassword?.message} secureTextEntry={!showConfirm} returnKeyType="done" onSubmitEditing={handleNextStep}
                  rightElement={<Pressable onPress={() => setShowConfirm(!showConfirm)} hitSlop={8}><Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color={NavColors.textSecondary} /></Pressable>}
                />
              )}
            />
            <Reanimated.View style={[submitStyle, { marginTop: 4 }]}>
              <Pressable 
                onPressIn={() => { submitScale.value = withSpring(0.97, { damping: 15 }); }} 
                onPressOut={() => { submitScale.value = withSpring(1, { damping: 15 }); }} 
                onPress={handleNextStep} 
                style={styles.submitButton}
              >
                <Text style={[styles.submitText, { color: isDark ? NavColors.bg0 : '#FFF' }]}>Próximo Passo →</Text>
              </Pressable>
            </Reanimated.View>
          </Reanimated.View>
        )}

        {step === 2 && (
          <Reanimated.View entering={FadeInRight.duration(300)} style={{ gap: NavSpacing.md }}>
            <Controller
              control={control}
              name="birthDate"
              render={({ field: { onChange, onBlur, value } }) => (
                <FieldInput label="Data de nascimento" placeholder="DD/MM/AAAA" value={value} onChange={(r) => onChange(maskDate(r))} onBlur={onBlur} error={errors.birthDate?.message} keyboardType="numeric" returnKeyType="next" blurOnSubmit={false} onSubmitEditing={() => setTimeout(() => phoneRef.current?.focus(), 150)} />
              )}
            />
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <FieldInput
                  ref={phoneRef} label="Telefone (WhatsApp)" placeholder="(00) 00000-0000" value={value} onChange={(r) => { rawPhoneRef.current = r.replace(/\D/g, ''); onChange(maskPhone(r)); }} onBlur={onBlur} error={errors.phone?.message} keyboardType="phone-pad" returnKeyType="next" blurOnSubmit={false} onSubmitEditing={() => setTimeout(() => cpfRef.current?.focus(), 150)} hint="Será usado para notificações seguras"
                  leftElement={<Ionicons name="logo-whatsapp" size={20} color="#25D366" style={{ marginRight: 8 }} />}
                />
              )}
            />
            <Controller
              control={control}
              name="cpf"
              render={({ field: { onChange, onBlur, value } }) => (
                <FieldInput ref={cpfRef} label="CPF" placeholder="000.000.000-00" value={value} onChange={(r) => { rawCpfRef.current = r.replace(/\D/g, ''); onChange(maskCpf(r)); }} onBlur={onBlur} error={errors.cpf?.message} keyboardType="numeric" returnKeyType="send" onSubmitEditing={handleSubmit(onSubmit)} />
              )}
            />
            <View style={styles.step2Actions}>
              <Pressable onPress={handlePrevStep} style={[styles.secondaryButton, { borderColor: NavColors.border }]}>
                <Text style={[styles.secondaryButtonText, { color: NavColors.textSecondary }]}>← Voltar</Text>
              </Pressable>
              <Reanimated.View style={[submitStyle, { flex: 2 }]}>
                <Pressable onPressIn={() => { submitScale.value = withSpring(0.97, { damping: 15 }); }} onPressOut={() => { submitScale.value = withSpring(1, { damping: 15 }); }} onPress={handleSubmit(onSubmit)} disabled={isLoading} style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}>
                  <Text style={[styles.submitText, { color: isDark ? NavColors.bg0 : '#FFF' }]}>Concluir 🎉</Text>
                </Pressable>
              </Reanimated.View>
            </View>
          </Reanimated.View>
        )}

        {/* ── Rodapé ── */}
        <View style={styles.compactFooterRow}>
          <Text style={[styles.footerText, { color: NavColors.textSecondary }]}>
            Já possui uma conta ativa?{' '}
          </Text>
          <Text 
              onPress={() => router.back()} 
              style={[styles.footerLinkText, { color: NavColors.cyan }]}
            >
              Fazer Login
            </Text>
        </View>
      </Reanimated.View>

      <Reanimated.Text entering={FadeInDown.duration(400).delay(300)} style={[styles.copyright, { color: NavColors.textMuted }]}>
        © {new Date().getFullYear()} VigiDoc · Todos os direitos reservados
      </Reanimated.Text>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: NavSpacing.md, paddingVertical: NavSpacing.xxl, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: NavSpacing.lg },
  card: { borderRadius: 24, borderWidth: 1, padding: NavSpacing.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowRadius: 24, elevation: 8, minHeight: 460 },
  cardHeader: { marginBottom: NavSpacing.xs },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 22, fontWeight: '700', letterSpacing: 0.2 },
  cardSubtitle: { fontSize: 14, marginTop: 8, lineHeight: 20 },
  stepperContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepperCircle: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stepperNumber: { fontSize: 12, fontWeight: '700' },
  stepperLine: { width: 30, height: 2, borderRadius: 1 },
  apiErrorBox: { borderWidth: 1, borderRadius: 12, padding: NavSpacing.sm + 4 },
  apiErrorText: { fontSize: 13, lineHeight: 18 },
  fieldWrapper: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '600', letterSpacing: 0.3 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 14, paddingHorizontal: NavSpacing.md, height: 52 },
  textInput: { flex: 1, fontSize: 15, height: '100%' },
  inputLeft: { marginRight: 0 },
  inputRight: { marginLeft: NavSpacing.sm },
  hintText: { fontSize: 11, marginTop: 2, lineHeight: 16 },
  errorText: { fontSize: 12, marginTop: 2 },
  bottomComponentContainer: { marginTop: 4 },
  strengthContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 2 },
  strengthBars: { flex: 1, flexDirection: 'row', gap: 4 },
  strengthBar: { height: 4, flex: 1, borderRadius: 2 },
  strengthLabel: { fontSize: 11, fontWeight: '700', minWidth: 40, textAlign: 'right' },
  submitButton: { height: 52, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6, width: '100%' },
  submitButtonDisabled: { opacity: 0.7 },
  submitText: { fontSize: 16, fontWeight: '700', letterSpacing: 0.4 },
  step2Actions: { flexDirection: 'row', gap: NavSpacing.sm, marginTop: 4 },
  secondaryButton: { flex: 1, height: 52, borderRadius: 14, backgroundColor: 'transparent', borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  secondaryButtonText: { fontSize: 15, fontWeight: '600' },
  compactFooterRow: {
    marginTop: 12,
    width: '100%',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 13,
    letterSpacing: 0.2,
    textAlign: 'center',
    lineHeight: 20,
  },
  footerLinkButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  footerLinkText: {
    fontSize: 14,
    fontWeight: '700',
  },
  copyright: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: NavSpacing.xxl,
    opacity: 0.5,
    letterSpacing: 0.5,
  },
  topRightActions: {
    paddingHorizontal: NavSpacing.md,
    alignItems: 'flex-end',
    marginTop: NavSpacing.md,
  },
  successRoot: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: NavSpacing.lg, gap: NavSpacing.lg },
  successIconWrapper: { marginBottom: NavSpacing.sm },
  successIconOuter: { width: 120, height: 120, borderRadius: 60, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: 26, fontWeight: '800', textAlign: 'center', letterSpacing: 0.3 },
  successBody: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  successHighlight: { fontWeight: '700' },
  successInfoCard: { flexDirection: 'row', gap: NavSpacing.sm, borderWidth: 1, borderRadius: 16, padding: NavSpacing.md, maxWidth: 360 },
  successInfoText: { flex: 1, fontSize: 13, lineHeight: 20 },
  successButton: { width: '100%', maxWidth: 360, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6, marginTop: NavSpacing.sm },
  successButtonText: { fontSize: 16, fontWeight: '700', letterSpacing: 0.4 },
  loadingCircleContainer: { width: 100, height: 100, alignItems: 'center', justifyContent: 'center', marginBottom: NavSpacing.lg },
  loadingCirclePulse: { position: 'absolute', width: 80, height: 80, borderRadius: 40 },
  loadingCircleInner: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8 },
});
