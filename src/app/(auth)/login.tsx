import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Reanimated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { loginSchema, type LoginFormSchemaType } from '@lib/schemas/auth.schema';
import { useAuth } from '@hooks/use-auth';

/* ─────────────────────────────────────────────────────────── */
/*  Design Tokens                                              */
/* ─────────────────────────────────────────────────────────── */

const palette = {
  // Brand teal — VigiDoc
  teal500: '#0D9488',
  teal400: '#2DD4BF',
  teal300: '#5EEAD4',
  emerald500: '#10B981',
  // Dark backgrounds
  bg: '#0A0F1E',
  bgCard: '#111827',
  bgInput: '#1A2236',
  bgInputFocus: '#1E2A45',
  border: '#1F2D48',
  borderFocus: '#0D9488',
  borderError: '#EF4444',
  // Text
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  textError: '#F87171',
  // Google (disabled)
  googleBg: '#1F2937',
  white: '#FFFFFF',
} as const;

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/* ─────────────────────────────────────────────────────────── */
/*  Sub-components                                             */
/* ─────────────────────────────────────────────────────────── */

/** Ícone SVG inline para o Google (como texto placeholder) */
function GoogleIcon() {
  return (
    <Text style={styles.googleIconText}>G</Text>
  );
}

type FieldInputProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'email-address' | 'default';
  autoComplete?: 'email' | 'current-password' | 'off';
  autoCapitalize?: 'none' | 'sentences';
  rightElement?: React.ReactNode;
  testID?: string;
};

function FieldInput({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoComplete = 'off',
  autoCapitalize = 'none',
  rightElement,
  testID,
}: FieldInputProps) {
  const borderColor = useSharedValue(palette.border);
  const bgColor = useSharedValue(palette.bgInput);

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: borderColor.value,
    backgroundColor: bgColor.value,
  }));

  function handleFocus() {
    borderColor.value = withTiming(
      error ? palette.borderError : palette.borderFocus,
      { duration: 200 }
    );
    bgColor.value = withTiming(palette.bgInputFocus, { duration: 200 });
  }

  function handleBlur() {
    borderColor.value = withTiming(
      error ? palette.borderError : palette.border,
      { duration: 200 }
    );
    bgColor.value = withTiming(palette.bgInput, { duration: 200 });
    onBlur();
  }

  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Reanimated.View style={[styles.inputContainer, animatedStyle]}>
        <TextInput
          testID={testID}
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor={palette.textMuted}
          value={value}
          onChangeText={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoComplete={autoComplete}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
        />
        {rightElement && (
          <View style={styles.inputRight}>{rightElement}</View>
        )}
      </Reanimated.View>
      {error ? (
        <Reanimated.Text
          entering={FadeInDown.duration(180)}
          style={styles.errorText}
        >
          {error}
        </Reanimated.Text>
      ) : null}
    </View>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Main Screen                                                */
/* ─────────────────────────────────────────────────────────── */

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error: authError } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: false },
    mode: 'onBlur',
  });

  const onSubmit = async (data: LoginFormSchemaType) => {
    await login(data.email, data.password, data.remember ?? false);
  };

  // Animated submit button press scale
  const submitScale = useSharedValue(1);
  const submitAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: submitScale.value }],
  }));

  function handlePressIn() {
    submitScale.value = withSpring(0.97, { damping: 15 });
  }
  function handlePressOut() {
    submitScale.value = withSpring(1, { damping: 15 });
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Logo + Header ── */}
        <Reanimated.View entering={FadeInDown.duration(500).delay(0)} style={styles.header}>
          {/* Logo mark */}
          <View style={styles.logoWrapper}>
            <View style={styles.logoPill}>
              <Text style={styles.logoActivity}>♥</Text>
            </View>
          </View>
          <Text style={styles.brandName}>
            Vigi<Text style={styles.brandAccent}>Doc</Text>
          </Text>
          <Text style={styles.brandTagline}>
            Monitoramento inteligente de saúde
          </Text>
        </Reanimated.View>

        {/* ── Card ── */}
        <Reanimated.View entering={FadeInUp.duration(500).delay(100)} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Bem-vindo de volta</Text>
            <Text style={styles.cardSubtitle}>
              Entre com suas credenciais para acessar a plataforma
            </Text>
          </View>

          {/* Google (desabilitado) */}
          <View style={styles.googleButton} accessibilityState={{ disabled: true }}>
            <GoogleIcon />
            <Text style={styles.googleText}>Continuar com Google</Text>
            <View style={styles.googleBadge}>
              <Text style={styles.googleBadgeText}>Em breve</Text>
            </View>
          </View>

          {/* Divisor */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou entre com e-mail</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Erro global da API */}
          {authError && (
            <Reanimated.View entering={FadeInDown.duration(200)} style={styles.apiErrorBox}>
              <Text style={styles.apiErrorText}>⚠ {authError}</Text>
            </Reanimated.View>
          )}

          {/* E-mail */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <FieldInput
                label="E-mail"
                placeholder="voce@hospital.com.br"
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
                testID="input-email"
              />
            )}
          />

          {/* Senha */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <FieldInput
                label="Senha"
                placeholder="••••••••"
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                secureTextEntry={!showPassword}
                autoComplete="current-password"
                testID="input-password"
                rightElement={
                  <Pressable
                    onPress={() => setShowPassword((v) => !v)}
                    hitSlop={8}
                    accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
                  </Pressable>
                }
              />
            )}
          />

          {/* Lembrar + Esqueci a senha */}
          <View style={styles.row}>
            <Controller
              control={control}
              name="remember"
              render={({ field: { onChange, value } }) => (
                <Pressable
                  style={styles.rememberRow}
                  onPress={() => onChange(!value)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: !!value }}
                  testID="checkbox-remember"
                >
                  <View style={[styles.checkbox, value && styles.checkboxActive]}>
                    {value && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.rememberText}>Lembrar de mim</Text>
                </Pressable>
              )}
            />

            <Pressable
              onPress={() => router.push('/(auth)/forgot-password' as never)}
              hitSlop={8}
              testID="btn-forgot-password"
            >
              <Text style={styles.forgotText}>Esqueci a senha</Text>
            </Pressable>
          </View>

          {/* Botão de Login */}
          <Reanimated.View style={submitAnimatedStyle}>
            <Pressable
              testID="btn-login"
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              accessibilityRole="button"
              accessibilityLabel="Entrar na plataforma"
              accessibilityState={{ disabled: isLoading }}
            >
              {isLoading ? (
                <ActivityIndicator color={palette.white} size="small" />
              ) : (
                <Text style={styles.submitText}>Entrar →</Text>
              )}
            </Pressable>
          </Reanimated.View>

          {/* Solicitar acesso */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Sem acesso?</Text>
            <Pressable
              disabled
              accessibilityState={{ disabled: true }}
              testID="btn-request-access"
            >
              <Text style={styles.requestAccessText}>Solicitar acesso</Text>
            </Pressable>
          </View>
        </Reanimated.View>

        {/* Copyright */}
        <Reanimated.Text
          entering={FadeInDown.duration(400).delay(300)}
          style={styles.copyright}
        >
          © {new Date().getFullYear()} VigiDoc · Todos os direitos reservados
        </Reanimated.Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Styles                                                     */
/* ─────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxl,
  },

  /* Header */
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoWrapper: {
    marginBottom: spacing.sm,
  },
  logoPill: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: palette.teal500,
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow
    shadowColor: palette.teal400,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  logoActivity: {
    fontSize: 26,
    color: palette.white,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    color: palette.textPrimary,
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  brandAccent: {
    color: palette.teal400,
  },
  brandTagline: {
    fontSize: 13,
    color: palette.textMuted,
    letterSpacing: 0.2,
  },

  /* Card */
  card: {
    backgroundColor: palette.bgCard,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.lg,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
    gap: spacing.md,
  },
  cardHeader: {
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: palette.textPrimary,
    letterSpacing: 0.2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: palette.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },

  /* Google button (disabled) */
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.googleBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    paddingVertical: 13,
    paddingHorizontal: spacing.md,
    opacity: 0.55,
  },
  googleIconText: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.textSecondary,
    width: 24,
    textAlign: 'center',
  },
  googleText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: palette.textSecondary,
  },
  googleBadge: {
    backgroundColor: palette.bgInput,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  googleBadgeText: {
    fontSize: 11,
    color: palette.textMuted,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  /* Divider */
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: palette.border,
  },
  dividerText: {
    fontSize: 12,
    color: palette.textMuted,
    letterSpacing: 0.3,
  },

  /* API error */
  apiErrorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: 12,
    padding: spacing.sm + 4,
  },
  apiErrorText: {
    color: palette.textError,
    fontSize: 13,
    lineHeight: 18,
  },

  /* Field */
  fieldWrapper: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.textSecondary,
    letterSpacing: 0.3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    height: 52,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: palette.textPrimary,
    height: '100%',
  },
  inputRight: {
    marginLeft: spacing.sm,
  },
  eyeIcon: {
    fontSize: 18,
  },
  errorText: {
    fontSize: 12,
    color: palette.textError,
    marginTop: 2,
  },

  /* Remember + Forgot */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: palette.border,
    backgroundColor: palette.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: palette.teal500,
    borderColor: palette.teal500,
  },
  checkmark: {
    color: palette.white,
    fontSize: 12,
    fontWeight: '700',
  },
  rememberText: {
    fontSize: 13,
    color: palette.textSecondary,
  },
  forgotText: {
    fontSize: 13,
    color: palette.teal400,
    fontWeight: '600',
  },

  /* Submit */
  submitButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: palette.teal500,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    // Glow
    shadowColor: palette.teal500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.65,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.white,
    letterSpacing: 0.4,
  },

  /* Footer */
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  footerText: {
    fontSize: 13,
    color: palette.textMuted,
  },
  requestAccessText: {
    fontSize: 13,
    color: palette.textMuted,
    fontWeight: '600',
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },

  /* Copyright */
  copyright: {
    fontSize: 11,
    color: palette.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
    letterSpacing: 0.3,
  },
});
