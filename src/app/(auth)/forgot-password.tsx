import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useMemo } from 'react';
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
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  FadeIn,
  FadeInRight,
  FadeInLeft,
} from 'react-native-reanimated';

import { Logo } from '@components/ui/logo';
import { NavSpacing, NavRadius } from '@/constants/nav-theme';
import { useThemeColors } from '@hooks/use-theme-colors';
import { useThemeStore } from '@stores/theme.store';
import { ThemeToggle } from '@components/ui/theme-toggle';

/* ─────────────────────────────────────────────────────────── */
/*  Helper Component: FieldInput                               */
/* ─────────────────────────────────────────────────────────── */

type FieldInputProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'email-address' | 'default' | 'numeric' | 'phone-pad' | 'number-pad';
  autoComplete?: 'email' | 'new-password' | 'off' | 'current-password';
  rightElement?: React.ReactNode;
  returnKeyType?: 'next' | 'done' | 'send';
  onSubmitEditing?: () => void;
  blurOnSubmit?: boolean;
  error?: string;
};

const FieldInput = React.forwardRef<TextInput, FieldInputProps>(({
  label,
  placeholder,
  value,
  onChange,
  secureTextEntry = false,
  keyboardType = 'default',
  autoComplete = 'off',
  rightElement,
  returnKeyType,
  onSubmitEditing,
  blurOnSubmit,
  error,
}, ref) => {
  const NavColors = useThemeColors();
  const borderColor = useSharedValue<string>(NavColors.border);
  const bgColor = useSharedValue<string>(NavColors.bg2);

  const animStyle = useAnimatedStyle(() => ({
    borderColor: withTiming(borderColor.value, { duration: 200 }),
    backgroundColor: withTiming(bgColor.value, { duration: 200 }),
  }));

  React.useEffect(() => {
    borderColor.value = error ? NavColors.danger : NavColors.border;
    bgColor.value = NavColors.bg2;
  }, [error, NavColors, borderColor, bgColor]);

  function handleFocus() {
    borderColor.value = NavColors.cyan;
    bgColor.value = NavColors.bg3;
  }

  function handleBlur() {
    borderColor.value = error ? NavColors.danger : NavColors.border;
    bgColor.value = NavColors.bg2;
  }

  return (
    <View style={styles.fieldWrapper}>
      <Text style={[styles.fieldLabel, { color: NavColors.textSecondary }]}>{label}</Text>
      <Reanimated.View style={[styles.inputContainer, animStyle]}>
        <TextInput
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
          autoCapitalize="none"
          autoCorrect={false}
          ref={ref}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={blurOnSubmit}
        />
        {rightElement && <View style={styles.inputRight}>{rightElement}</View>}
      </Reanimated.View>
    </View>
  );
});

/* ─────────────────────────────────────────────────────────── */
/*  Main Screen                                                */
/* ─────────────────────────────────────────────────────────── */

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const NavColors = useThemeColors();
  const storeTheme = useThemeStore(s => s.theme);
  const isDark = storeTheme === 'dark';

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const submitScale = useSharedValue(1);
  const submitStyle = useAnimatedStyle(() => ({ 
    transform: [{ scale: submitScale.value }],
    backgroundColor: withTiming(NavColors.cyan, { duration: 250 }),
    shadowColor: withTiming(NavColors.cyan, { duration: 250 }),
    borderRadius: NavRadius.md,
  }));

  function handleAction() {
    if (step === 1 && email.includes('@')) {
      setStep(2);
    } else if (step === 2 && code.length >= 6) {
      setStep(3);
    } else if (step === 3 && newPassword.length >= 8) {
      setIsSuccess(true);
    }
  }

  const maskedCode = code
    .replace(/\D/g, '')
    .slice(0, 6)
    .replace(/(\d{3})(\d{1,3})/, '$1 - $2');

  const pStrength = useMemo(() => {
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;

    if (score <= 1) return { value: 1, color: NavColors.danger, label: 'Fraca' };
    if (score === 2 || score === 3) return { value: 2, color: NavColors.warning, label: 'Média' };
    if (score >= 4) return { value: 3, color: NavColors.green, label: 'Forte' };
    return { value: 0, color: NavColors.border, label: '' };
  }, [newPassword, NavColors]);

  if (isSuccess) {
    return (
      <View style={[styles.root, { backgroundColor: NavColors.bg0 }]}>
        <Reanimated.View entering={FadeInDown.duration(500)} style={[styles.successView, { backgroundColor: NavColors.bg1, borderColor: NavColors.borderSoft }]}>
          <View style={[styles.successIconOuter, { backgroundColor: NavColors.greenDim, borderColor: NavColors.green + '40' }]}>
            <Ionicons name="shield-checkmark" size={64} color={NavColors.green} />
          </View>
          <Text style={[styles.cardTitle, { color: NavColors.textPrimary }]}>Senha Redefinida!</Text>
          <Text style={[styles.cardSubtitle, { color: NavColors.textSecondary }]}>Sua nova senha foi salva. Faça login com suas novas credenciais.</Text>
          <Pressable style={[styles.submitButton, { backgroundColor: NavColors.cyan }]} onPress={() => router.replace('/(auth)/login')}>
            <Text style={[styles.submitText, { color: isDark ? NavColors.bg0 : '#FFF' }]}>Entrar na conta →</Text>
          </Pressable>
        </Reanimated.View>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView 
      style={[styles.root, { backgroundColor: NavColors.bg0 }]}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      enableOnAndroid={true}
      extraScrollHeight={24}
      bounces={false}
    >
        {/* Theme Toggle */}
        <View style={styles.topRightActions}>
          <ThemeToggle />
        </View>
        
        {/* Header */}
        <Reanimated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <Logo size="lg" />
        </Reanimated.View>

        {/* Card */}
        <Reanimated.View entering={FadeInUp.duration(500).delay(100)} style={[styles.card, { backgroundColor: NavColors.bg1, borderColor: NavColors.borderSoft }]}>
          
          <Pressable onPress={() => { if (step > 1) setStep((s) => (s - 1) as any); else router.back(); }} style={styles.backButton}>
            <Ionicons name="chevron-back" size={20} color={NavColors.textMuted} />
            <Text style={[styles.backText, { color: NavColors.textMuted }]}>{step === 1 ? 'Voltar ao Login' : 'Passo anterior'}</Text>
          </Pressable>

          {/* Passo 1 */}
          {step === 1 && (
            <Reanimated.View entering={FadeInLeft.duration(300)}>
              <Text style={[styles.cardTitle, { color: NavColors.textPrimary }]}>Esqueci minha senha</Text>
              <Text style={[styles.cardSubtitle, { color: NavColors.textSecondary }]}>
                Digite o e-mail cadastrado na sua conta. Vamos enviar um código de 6 dígitos para você confirmar sua identidade.
              </Text>

              <View style={{ marginTop: NavSpacing.md, gap: NavSpacing.md }}>
                <FieldInput
                  label="E-mail"
                  placeholder="voce@hospital.com.br"
                  value={email}
                  onChange={setEmail}
                  keyboardType="email-address"
                  returnKeyType="next"
                  onSubmitEditing={handleAction}
                  blurOnSubmit={true}
                />

                <Reanimated.View style={submitStyle}>
                  <Pressable
                    onPressIn={() => submitScale.value = withSpring(0.97)}
                    onPressOut={() => submitScale.value = withSpring(1)}
                    onPress={handleAction}
                    style={[styles.submitButton, !email.includes('@') && styles.disabled]}
                  >
                    <Text style={[styles.submitText, { color: isDark ? NavColors.bg0 : '#FFF' }]}>Enviar Código →</Text>
                  </Pressable>
                </Reanimated.View>
              </View>
            </Reanimated.View>
          )}

          {/* Passo 2 */}
          {step === 2 && (
            <Reanimated.View entering={FadeInRight.duration(300)}>
              <Text style={[styles.cardTitle, { color: NavColors.textPrimary }]}>Código de verificação</Text>
              <Text style={[styles.cardSubtitle, { color: NavColors.textSecondary }]}>
                Enviamos um código para <Text style={{ color: NavColors.textPrimary, fontWeight: 'bold' }}>{email}</Text>. Digite-o abaixo:
              </Text>

              <View style={{ marginTop: NavSpacing.lg, gap: NavSpacing.md }}>
                <TextInput
                  style={[styles.otpInput, { backgroundColor: NavColors.bg3, borderColor: NavColors.border, color: NavColors.cyan }]}
                  placeholder="000 - 000"
                  placeholderTextColor={NavColors.border}
                  keyboardType="number-pad"
                  maxLength={9} // "xxx - xxx" length
                  value={maskedCode}
                  onChangeText={(t) => setCode(t.replace(/\D/g, ''))}
                  returnKeyType="next"
                  onSubmitEditing={handleAction}
                  blurOnSubmit={true}
                />
                
                <Reanimated.View style={submitStyle}>
                  <Pressable
                    onPressIn={() => submitScale.value = withSpring(0.97)}
                    onPressOut={() => submitScale.value = withSpring(1)}
                    onPress={handleAction}
                    style={[styles.submitButton, code.length < 6 && styles.disabled]}
                  >
                    <Text style={[styles.submitText, { color: isDark ? NavColors.bg0 : '#FFF' }]}>Verificar Código →</Text>
                  </Pressable>
                </Reanimated.View>
                <Pressable style={styles.resendWrapper}>
                  <Text style={[styles.resendText, { color: NavColors.textMuted }]}>Não recebeu? <Text style={[styles.resendHighlight, { color: NavColors.cyan }]}>Reenviar código</Text></Text>
                </Pressable>
              </View>
            </Reanimated.View>
          )}

          {/* Passo 3 */}
          {step === 3 && (
            <Reanimated.View entering={FadeInRight.duration(300)}>
              <Text style={[styles.cardTitle, { color: NavColors.textPrimary }]}>Nova senha</Text>
              <Text style={[styles.cardSubtitle, { color: NavColors.textSecondary }]}>O código foi verificado. Crie uma nova senha segura para sua conta.</Text>

              <View style={{ marginTop: NavSpacing.md, gap: NavSpacing.md }}>
                <FieldInput
                  label="Nova Senha"
                  placeholder="Mínimo 8 caracteres"
                  value={newPassword}
                  onChange={setNewPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="send"
                  onSubmitEditing={handleAction}
                  rightElement={
                    <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={NavColors.textSecondary} />
                    </Pressable>
                  }
                />
                <View style={[styles.strengthContainer, { gap: 10, marginTop: -4 }]}>
                  <View style={[styles.strengthBars, { flex: 1, flexDirection: 'row', gap: 4 }]}>
                    <View style={[styles.strengthBar, { height: 4, flex: 1, backgroundColor: NavColors.border, borderRadius: 2 }, pStrength.value >= 1 && { backgroundColor: pStrength.color }]} />
                    <View style={[styles.strengthBar, { height: 4, flex: 1, backgroundColor: NavColors.border, borderRadius: 2 }, pStrength.value >= 2 && { backgroundColor: pStrength.color }]} />
                    <View style={[styles.strengthBar, { height: 4, flex: 1, backgroundColor: NavColors.border, borderRadius: 2 }, pStrength.value >= 3 && { backgroundColor: pStrength.color }]} />
                  </View>
                  <Text style={[styles.strengthLabel, { fontSize: 11, fontWeight: '700', minWidth: 40, textAlign: 'right', color: pStrength.color }]}>{pStrength.label}</Text>
                </View>

                <Reanimated.View style={[submitStyle, { marginTop: NavSpacing.sm }]}>
                  <Pressable
                    onPressIn={() => submitScale.value = withSpring(0.97)}
                    onPressOut={() => submitScale.value = withSpring(1)}
                    onPress={handleAction}
                    style={[styles.submitButton, newPassword.length < 8 && styles.disabled]}
                  >
                    <Text style={[styles.submitText, { color: isDark ? NavColors.bg0 : '#FFF' }]}>Redefinir Senha →</Text>
                  </Pressable>
                </Reanimated.View>
              </View>
            </Reanimated.View>
          )}

        </Reanimated.View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: NavSpacing.md, paddingTop: NavSpacing.xxl + 40, paddingBottom: NavSpacing.xxl },

  header: { alignItems: 'center', marginBottom: NavSpacing.xl },

  card: { borderRadius: 24, borderWidth: 1, padding: NavSpacing.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 24, elevation: 8, minHeight: 460 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: NavSpacing.md, alignSelf: 'flex-start', paddingVertical: 4, paddingRight: 8 },
  backText: { fontSize: 13, fontWeight: '600' },
  cardTitle: { fontSize: 22, fontWeight: '700' },
  cardSubtitle: { fontSize: 14, marginTop: 8, lineHeight: 21 },

  fieldWrapper: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '600' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 14, paddingHorizontal: NavSpacing.md, height: 52 },
  textInput: { flex: 1, fontSize: 15, height: '100%' },
  inputRight: { marginLeft: NavSpacing.sm },

  otpInput: { borderWidth: 1.5, borderRadius: 16, fontSize: 28, fontWeight: '800', textAlign: 'center', paddingVertical: 18, letterSpacing: 4 },

  strengthContainer: { flexDirection: 'row', alignItems: 'center' },
  strengthBars: {},
  strengthBar: {},
  strengthLabel: {},

  submitButton: { height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  submitText: { fontSize: 16, fontWeight: '700', letterSpacing: 0.4 },
  disabled: { opacity: 0.65 },

  resendWrapper: { alignItems: 'center', marginTop: NavSpacing.sm },
  resendText: { fontSize: 13 },
  resendHighlight: { fontWeight: '600' },

  topRightActions: {
    paddingHorizontal: NavSpacing.md,
    alignItems: 'flex-end',
    marginTop: NavSpacing.md,
  },

  successView: { alignItems: 'center', justifyContent: 'center', borderRadius: 24, padding: NavSpacing.lg, gap: NavSpacing.md, borderWidth: 1 },
  successIconOuter: { width: 100, height: 100, borderRadius: 50, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: NavSpacing.md },
});
