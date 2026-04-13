import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
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
import { LinearGradient } from 'expo-linear-gradient';

import { NavSpacing } from '@/constants/nav-theme';
import { Logo } from '@components/ui/logo';
import { ThemeToggle } from '@components/ui/theme-toggle';
import { useThemeColors } from '@hooks/use-theme-colors';
import { useThemeStore } from '@stores/theme.store';

/* ─────────────────────────────────────────────────────────── */
/*  Sub-components (Clonados do Login para consistência total)  */
/* ─────────────────────────────────────────────────────────── */

type FieldInputProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
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

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const NavColors = useThemeColors();
  const storeTheme = useThemeStore(s => s.theme);
  const isDark = storeTheme === 'dark';
  const [email, setEmail] = useState('');

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
      style={[styles.root, { backgroundColor: NavColors.bg0 }]}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      enableOnAndroid={true}
      extraHeight={160}
      extraScrollHeight={32}
      bounces={false}
    >
        {/* ── Theme Switcher ── */}
        <View style={styles.topRightActions}>
          <ThemeToggle />
        </View>

        {/* ── Logo ── */}
        <Reanimated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <Logo size="lg" />
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
          {/* Back Button */}
          <Pressable 
            onPress={() => router.back()} 
            style={styles.backButton}
            hitSlop={12}
          >
            <Ionicons name="chevron-back" size={20} color={NavColors.textMuted} />
            <Text style={[styles.backText, { color: NavColors.textMuted }]}>Voltar ao Login</Text>
          </Pressable>

          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: NavColors.textPrimary }]}>Recuperar senha</Text>
            <Text style={[styles.cardSubtitle, { color: NavColors.textSecondary }]}>
              Identifique-se para receber as instruções de redefinição de acesso.
            </Text>
          </View>

          {/* Aviso de Desenvolvimento (Standard) */}
          <Reanimated.View 
            entering={FadeInDown.duration(200)} 
            style={[
              styles.apiErrorBox, 
              { backgroundColor: NavColors.warning + '15', borderColor: NavColors.warning + '30', marginVertical: NavSpacing.md }
            ]}
          >
            <Text style={[styles.apiErrorText, { color: NavColors.warning }]}>
              ⚠ Esta funcionalidade está em desenvolvimento e será liberada em breve.
            </Text>
          </Reanimated.View>

          {/* E-mail Input (Pixel Perfect Copy) */}
          <FieldInput
            label="E-mail da conta"
            placeholder="voce@hospital.com.br"
            value={email}
            onChange={setEmail}
            keyboardType="email-address"
            autoComplete="email"
            autoCapitalize="none"
            testID="input-forgot-email"
            returnKeyType="done"
          />

          {/* Botão de Ação (Desabilitado + Estilo do Login) */}
          <Reanimated.View style={[submitAnimatedStyle, { marginVertical: NavSpacing.md }]}>
            <Pressable
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={true}
              style={[styles.submitButton, styles.submitButtonDisabled]}
            >
              <Text style={[styles.submitText, { color: isDark ? NavColors.bg0 : '#FFF' }]}>
                Enviar instruções →
              </Text>
            </Pressable>
          </Reanimated.View>

          {/* Rodapé Interno */}
          <View style={styles.compactFooterRow}>
            <Text style={[styles.footerText, { color: NavColors.textSecondary }]}>
              Lembrou sua senha?{' '}
            </Text>
              <Text
                onPress={() => router.back()}
                style={[styles.footerText, { color: NavColors.cyan }]}
              >
                Voltar para o login
              </Text>
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
    paddingTop: NavSpacing.xxl,
    paddingBottom: 80,
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
    minHeight: 440,
  },
  backButton: {
    // flexDirection: 'row',
    // alignItems: 'center',
    gap: 4,
    marginBottom: NavSpacing.md,
    // alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  backText: {
    fontSize: 13,
    fontWeight: '600',
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
  apiErrorBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: NavSpacing.sm + 4,
  },
  apiErrorText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
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
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  compactFooterRow: {
    marginTop: 12,
    width: '100%',
    // alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
  },
  footerLinkText: {
    fontWeight: '700',
  },
  copyright: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: NavSpacing.xl,
    opacity: 0.5,
    letterSpacing: 0.5,
  },
  topRightActions: {
    paddingHorizontal: NavSpacing.md,
    alignItems: 'flex-end',
    marginTop: NavSpacing.md,
  },
});
