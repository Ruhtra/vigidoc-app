import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useRef, useState, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Reanimated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@hooks/use-auth';
import { NavSpacing, NavRadius } from '@/constants/nav-theme';
import { loginSchema, type LoginFormSchemaType } from '@lib/schemas/auth.schema';
import { Logo } from '@components/ui/logo';
import { useThemeColors } from '@hooks/use-theme-colors';
import { useThemeStore } from '@stores/theme.store';
import { ThemeToggle } from '@components/ui/theme-toggle';

/* ─────────────────────────────────────────────────────────── */
/*  Sub-components                                             */
/* ─────────────────────────────────────────────────────────── */

function GoogleIcon() {
  return <Text style={styles.googleIconText}>G</Text>;
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
  autoComplete = 'off',
  autoCapitalize = 'none',
  rightElement,
  testID,
  returnKeyType,
  onSubmitEditing,
  blurOnSubmit,
}, ref) => {
  const NavColors = useThemeColors();
  const borderColor = useSharedValue<string>(NavColors.border);
  const bgColor = useSharedValue<string>(NavColors.bg2);

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: withTiming(borderColor.value, { duration: 200 }),
    backgroundColor: withTiming(bgColor.value, { duration: 200 }),
  }));

  function handleFocus() {
    borderColor.value = error ? NavColors.danger : NavColors.cyan;
    bgColor.value = NavColors.bg3;
  }

  function handleBlur() {
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
      <Reanimated.View style={[styles.inputContainer, animatedStyle]}>
        <TextInput
          testID={testID}
          style={[styles.textInput, { color: NavColors.textPrimary }]}
          placeholder={placeholder}
          placeholderTextColor={NavColors.textMuted}
          value={value}
          onChangeText={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoComplete={autoComplete}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          ref={ref}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={blurOnSubmit}
        />
        {rightElement && (
          <View style={styles.inputRight}>{rightElement}</View>
        )}
      </Reanimated.View>
      {error ? (
        <Reanimated.Text
          entering={FadeInDown.duration(180)}
          style={[styles.errorText, { color: NavColors.danger }]}
        >
          {error}
        </Reanimated.Text>
      ) : null}
    </View>
  );
});

/* ─────────────────────────────────────────────────────────── */
/*  Main Screen                                                */
/* ─────────────────────────────────────────────────────────── */

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error: authError } = useAuth();
  const NavColors = useThemeColors();
  const storeTheme = useThemeStore(s => s.theme);
  const isDark = storeTheme === 'dark';

  const [showPassword, setShowPassword] = useState(false);
  const scrollRef = useRef<KeyboardAwareScrollView>(null);
  const passwordRef = useRef<TextInput>(null);

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

  const submitScale = useSharedValue(1);
  const submitAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: submitScale.value }],
    backgroundColor: withTiming(NavColors.cyan, { duration: 250 }),
    shadowColor: withTiming(NavColors.cyan, { duration: 250 }),
    borderRadius: 14,
  }));

  function handlePressIn() {
    submitScale.value = withSpring(0.97, { damping: 15 });
  }
  function handlePressOut() {
    submitScale.value = withSpring(1, { damping: 15 });
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
        {/* ── Theme Switcher ── */}
        <View style={styles.topRightActions}>
          <ThemeToggle />
        </View>

        {/* ── Logo + Header ── */}
        <Reanimated.View entering={FadeInDown.duration(500).delay(0)} style={styles.header}>
          <Logo size="lg" showTagline />
        </Reanimated.View>

        {/* ── Card ── */}
        <Reanimated.View 
          entering={FadeInUp.duration(500).delay(100)} 
          style={[
            styles.card, 
            { 
              backgroundColor: NavColors.bg1, 
              borderColor: NavColors.borderSoft,
              shadowOpacity: isDark ? 0.3 : 0.1
            }
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: NavColors.textPrimary }]}>Bem-vindo de volta</Text>
            <Text style={[styles.cardSubtitle, { color: NavColors.textSecondary }]}>
              Entre com suas credenciais para acessar a plataforma
            </Text>
          </View>

          {/* Google (desabilitado) */}
          <View 
            style={[
              styles.googleButton, 
              { backgroundColor: NavColors.bg3, borderColor: NavColors.border }
            ]} 
            accessibilityState={{ disabled: true }}
          >
            <Text style={[styles.googleIconText, { color: NavColors.textSecondary }]}>G</Text>
            <Text style={[styles.googleText, { color: NavColors.textSecondary }]}>Continuar com Google</Text>
            <View style={[styles.googleBadge, { backgroundColor: NavColors.bg4, borderColor: NavColors.borderBright }]}>
              <Text style={[styles.googleBadgeText, { color: NavColors.cyan }]}>Em breve</Text>
            </View>
          </View>

          {/* Divisor */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: NavColors.border }]} />
            <Text style={[styles.dividerText, { color: NavColors.textMuted }]}>OU E-MAIL</Text>
            <View style={[styles.dividerLine, { backgroundColor: NavColors.border }]} />
          </View>

          {/* Erro global da API */}
          {authError && (
            <Reanimated.View 
              entering={FadeInDown.duration(200)} 
              style={[
                styles.apiErrorBox, 
                { backgroundColor: NavColors.danger + '15', borderColor: NavColors.danger + '30' }
              ]}
            >
              <Text style={[styles.apiErrorText, { color: NavColors.danger }]}>⚠ {authError}</Text>
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
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => setTimeout(() => passwordRef.current?.focus(), 150)}
              />
            )}
          />

          {/* Senha */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <FieldInput
                ref={passwordRef}
                label="Senha"
                placeholder="••••••••"
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                secureTextEntry={!showPassword}
                autoComplete="current-password"
                testID="input-password"
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSubmit)}
                rightElement={
                  <Pressable
                    onPress={() => setShowPassword((v) => !v)}
                    hitSlop={8}
                    accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    <Ionicons 
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                      size={20} 
                      color={NavColors.textSecondary} 
                    />
                  </Pressable>
                }
              />
            )}
          />

          {/* Lembrar me & Esqueci Senha */}
          <View style={styles.actionRow}>
            <Controller
              control={control}
              name="remember"
              render={({ field: { onChange, value } }) => (
                <Pressable
                  style={styles.rememberRow}
                  onPress={() => onChange(!value)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: !!value }}
                >
                  <View 
                    style={[
                      styles.checkbox, 
                      { borderColor: NavColors.borderBright, backgroundColor: NavColors.bg3 }, 
                      value && { backgroundColor: NavColors.cyan, borderColor: NavColors.cyan }
                    ]}
                  >
                    {value && <Text style={[styles.checkmark, { color: isDark ? NavColors.bg0 : '#FFF' }]}>✓</Text>}
                  </View>
                  <Text style={[styles.rememberText, { color: NavColors.textSecondary }]}>Lembrar de mim</Text>
                </Pressable>
              )}
            />

            <Pressable onPress={() => router.push('/(auth)/forgot-password' as any)}>
              <Text style={[styles.forgotText, { color: NavColors.cyan }]}>Esqueci a senha?</Text>
            </Pressable>
          </View>

          {/* Botão de Login */}
          <Reanimated.View style={[submitAnimatedStyle, { marginVertical: NavSpacing.md }]}>
            <Pressable
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            >
              {isLoading ? (
                <ActivityIndicator color={isDark ? NavColors.bg0 : '#FFF'} size="small" />
              ) : (
                <Text style={[styles.submitText, { color: isDark ? NavColors.bg0 : '#FFF' }]}>Entrar na Plataforma →</Text>
              )}
            </Pressable>
          </Reanimated.View>

          {/* Solicitar acesso */}
          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: NavColors.textMuted }]}>Sem acesso?</Text>
            <Pressable
              onPress={() => router.push('/(auth)/request-access')}
              testID="btn-request-access"
            >
              <Text style={[styles.requestAccessText, { color: NavColors.cyan }]}>Solicitar acesso</Text>
            </Pressable>
          </View>
        </Reanimated.View>

        {/* Copyright */}
        <Reanimated.Text
          entering={FadeInDown.duration(400).delay(300)}
          style={[styles.copyright, { color: NavColors.textMuted }]}
        >
          © {new Date().getFullYear()} VigiDoc · Todos os direitos reservados
        </Reanimated.Text>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: NavSpacing.md,
    paddingVertical: NavSpacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: NavSpacing.xl,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: NavSpacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 8,
    gap: NavSpacing.md,
    minHeight: 460, // Mantendo padrão de altura entre telas
  },
  cardHeader: {
    marginBottom: NavSpacing.xs,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  cardSubtitle: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: NavSpacing.sm,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 13,
    paddingHorizontal: NavSpacing.md,
    opacity: 0.6,
  },
  googleIconText: {
    fontSize: 18,
    fontWeight: '700',
    width: 24,
    textAlign: 'center',
  },
  googleText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  googleBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  googleBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: NavSpacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    letterSpacing: 0.3,
  },
  apiErrorBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: NavSpacing.sm + 4,
  },
  apiErrorText: {
    fontSize: 13,
    lineHeight: 18,
  },
  fieldWrapper: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: NavSpacing.md,
    height: 52,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  inputRight: {
    marginLeft: NavSpacing.sm,
  },
  errorText: {
    fontSize: 12,
    marginTop: 2,
  },
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 12,
    fontWeight: '700',
  },
  rememberText: {
    fontSize: 13,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
  },
  submitButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
    width: '100%',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    columnGap: 8,
    rowGap: 12,
    marginVertical: NavSpacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.65,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: NavSpacing.sm,
    paddingVertical: NavSpacing.xs,
  },
  footerText: {
    fontSize: 14,
    lineHeight: 20,
  },
  requestAccessText: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  copyright: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: NavSpacing.xxl,
    letterSpacing: 0.3,
  },
  topRightActions: {
    paddingHorizontal: NavSpacing.md,
    alignItems: 'flex-end',
    marginTop: NavSpacing.md,
  },
});
