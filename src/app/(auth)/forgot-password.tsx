import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
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

/* ─────────────────────────────────────────────────────────── */
/*  Design Tokens (mirrors login.tsx palette)                  */
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
  white: '#FFFFFF',
} as const;

const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;

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
}, ref) => {
  const borderColor = useSharedValue<string>(palette.border);
  const bgColor = useSharedValue<string>(palette.bgInput);
  const [isFocused, setIsFocused] = useState(false);

  React.useEffect(() => {
    borderColor.value = withTiming(isFocused ? palette.borderFocus : palette.border, { duration: 200 });
  }, [isFocused, borderColor]);

  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Reanimated.View style={[styles.inputContainer, useAnimatedStyle(() => ({
        borderColor: borderColor.value,
        backgroundColor: bgColor.value,
      }))]}>
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor={palette.textMuted}
          value={value}
          onChangeText={onChange}
          onFocus={() => {
            setIsFocused(true);
            bgColor.value = withTiming(palette.bgInputFocus, { duration: 200 });
          }}
          onBlur={() => {
            setIsFocused(false);
            bgColor.value = withTiming(palette.bgInput, { duration: 200 });
          }}
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

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const submitScale = useSharedValue(1);
  const submitStyle = useAnimatedStyle(() => ({ transform: [{ scale: submitScale.value }] }));

  function handleAction() {
    if (step === 1 && email.includes('@')) {
      setStep(2);
    } else if (step === 2 && code.length >= 6) {
      setStep(3);
    } else if (step === 3 && newPassword.length >= 8) {
      setIsSuccess(true);
    }
  }

  // Máscara para o código OTP: 000 - 000
  const maskedCode = code
    .replace(/\D/g, '')
    .slice(0, 6)
    .replace(/(\d{3})(\d{1,3})/, '$1 - $2');

  function compilePasswordStrength(pwd: string) {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { value: 1, color: palette.textError, label: 'Fraca' };
    if (score === 2 || score === 3) return { value: 2, color: palette.amber500, label: 'Média' };
    if (score >= 4) return { value: 3, color: palette.emerald500, label: 'Forte' };
    return { value: 0, color: palette.border, label: '' };
  }

  const pStrength = compilePasswordStrength(newPassword);

  /* Tela de Sucesso */
  if (isSuccess) {
    return (
      <View style={styles.root}>
        <Reanimated.View entering={FadeInDown.duration(500)} style={styles.successView}>
          <View style={styles.successIconOuter}>
            <Ionicons name="shield-checkmark" size={64} color={palette.emerald500} />
          </View>
          <Text style={styles.cardTitle}>Senha Redefinida!</Text>
          <Text style={styles.cardSubtitle}>Sua nova senha foi salva. Faça login com suas novas credenciais.</Text>
          <Pressable style={styles.submitButton} onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.submitText}>Entrar na conta →</Text>
          </Pressable>
        </Reanimated.View>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView 
      style={styles.root}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      enableOnAndroid={true}
      extraScrollHeight={24}
      bounces={false}
    >
        
        {/* Header */}
        <Reanimated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <Logo size="lg" />
        </Reanimated.View>

        {/* Card */}
        <Reanimated.View entering={FadeInUp.duration(500).delay(100)} style={styles.card}>
          
          <Pressable onPress={() => { if (step > 1) setStep((s) => (s - 1) as any); else router.back(); }} style={styles.backButton}>
            <Ionicons name="chevron-back" size={20} color={palette.textMuted} />
            <Text style={styles.backText}>{step === 1 ? 'Voltar ao Login' : 'Passo anterior'}</Text>
          </Pressable>

          {/* Passo 1 */}
          {step === 1 && (
            <Reanimated.View entering={FadeInLeft.duration(300)}>
              <Text style={styles.cardTitle}>Esqueci minha senha</Text>
              <Text style={styles.cardSubtitle}>
                Digite o e-mail cadastrado na sua conta. Vamos enviar um código de 6 dígitos para você confirmar sua identidade.
              </Text>

              <View style={{ marginTop: spacing.md, gap: spacing.md }}>
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
                    <Text style={styles.submitText}>Enviar Código →</Text>
                  </Pressable>
                </Reanimated.View>
              </View>
            </Reanimated.View>
          )}

          {/* Passo 2 */}
          {step === 2 && (
            <Reanimated.View entering={FadeInRight.duration(300)}>
              <Text style={styles.cardTitle}>Código de verificação</Text>
              <Text style={styles.cardSubtitle}>
                Enviamos um código para <Text style={{ color: palette.textPrimary, fontWeight: 'bold' }}>{email}</Text>. Digite-o abaixo:
              </Text>

              <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
                <TextInput
                  style={styles.otpInput}
                  placeholder="000 - 000"
                  placeholderTextColor={palette.border}
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
                    <Text style={styles.submitText}>Verificar Código →</Text>
                  </Pressable>
                </Reanimated.View>
                <Pressable style={styles.resendWrapper}>
                  <Text style={styles.resendText}>Não recebeu? <Text style={styles.resendHighlight}>Reenviar código</Text></Text>
                </Pressable>
              </View>
            </Reanimated.View>
          )}

          {/* Passo 3 */}
          {step === 3 && (
            <Reanimated.View entering={FadeInRight.duration(300)}>
              <Text style={styles.cardTitle}>Nova senha</Text>
              <Text style={styles.cardSubtitle}>O código foi verificado. Crie uma nova senha segura para sua conta.</Text>

              <View style={{ marginTop: spacing.md, gap: spacing.md }}>
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
                      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={palette.textSecondary} />
                    </Pressable>
                  }
                />
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBars}>
                    <View style={[styles.strengthBar, pStrength.value >= 1 && { backgroundColor: pStrength.color }]} />
                    <View style={[styles.strengthBar, pStrength.value >= 2 && { backgroundColor: pStrength.color }]} />
                    <View style={[styles.strengthBar, pStrength.value >= 3 && { backgroundColor: pStrength.color }]} />
                  </View>
                  <Text style={[styles.strengthLabel, { color: pStrength.color }]}>{pStrength.label}</Text>
                </View>

                <Reanimated.View style={[submitStyle, { marginTop: spacing.sm }]}>
                  <Pressable
                    onPressIn={() => submitScale.value = withSpring(0.97)}
                    onPressOut={() => submitScale.value = withSpring(1)}
                    onPress={handleAction}
                    style={[styles.submitButton, newPassword.length < 8 && styles.disabled]}
                  >
                    <Text style={styles.submitText}>Redefinir Senha →</Text>
                  </Pressable>
                </Reanimated.View>
              </View>
            </Reanimated.View>
          )}

        </Reanimated.View>
    </KeyboardAwareScrollView>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Styles                                                     */
/* ─────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.md, paddingTop: spacing.xxl + 40, paddingBottom: spacing.xxl },

  header: { alignItems: 'center', marginBottom: spacing.xl },

  card: { backgroundColor: palette.bgCard, borderRadius: 24, borderWidth: 1, borderColor: palette.border, padding: spacing.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 24, elevation: 10 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: spacing.md, alignSelf: 'flex-start', paddingVertical: 4, paddingRight: 8 },
  backText: { fontSize: 13, color: palette.textMuted, fontWeight: '600' },
  cardTitle: { fontSize: 22, fontWeight: '700', color: palette.textPrimary },
  cardSubtitle: { fontSize: 14, color: palette.textSecondary, marginTop: 8, lineHeight: 21 },

  fieldWrapper: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: palette.textSecondary },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 14, paddingHorizontal: spacing.md, height: 52 },
  textInput: { flex: 1, fontSize: 15, color: palette.textPrimary, height: '100%' },
  inputRight: { marginLeft: spacing.sm },

  otpInput: { backgroundColor: palette.bgInput, borderWidth: 1.5, borderColor: palette.border, borderRadius: 16, color: palette.teal400, fontSize: 28, fontWeight: '800', textAlign: 'center', paddingVertical: 18, letterSpacing: 4 },

  strengthContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: -4 },
  strengthBars: { flex: 1, flexDirection: 'row', gap: 4 },
  strengthBar: { height: 4, flex: 1, backgroundColor: palette.border, borderRadius: 2 },
  strengthLabel: { fontSize: 11, fontWeight: '700', minWidth: 40, textAlign: 'right' },

  submitButton: { height: 52, borderRadius: 14, backgroundColor: palette.teal500, alignItems: 'center', justifyContent: 'center', shadowColor: palette.teal500, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 6 },
  submitText: { fontSize: 16, fontWeight: '700', color: palette.white, letterSpacing: 0.4 },
  disabled: { opacity: 0.65 },

  resendWrapper: { alignItems: 'center', marginTop: spacing.sm },
  resendText: { fontSize: 13, color: palette.textMuted },
  resendHighlight: { color: palette.teal400, fontWeight: '600' },

  successView: { alignItems: 'center', justifyContent: 'center', backgroundColor: palette.bgCard, borderRadius: 24, padding: spacing.lg, gap: spacing.md },
  successIconOuter: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
});
