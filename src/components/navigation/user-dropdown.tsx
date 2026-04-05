import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Reanimated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { NavColors, NavRadius, NavSpacing } from '@constants/nav-theme';
import type { ThemeColors } from '@constants/nav-theme';
import { useAuthStore } from '@stores/auth.store';
import { useAuth } from '@hooks/use-auth';
import { useThemeStore } from '@stores/theme.store';
import { APP_ROUTES } from '@constants/routes';

type UserDropdownProps = {
  visible: boolean;
  onClose: () => void;
  colors: ThemeColors;
  // Dynamic positioning depending on whether it mounts from Header or Drawer
  position?: { top?: number; right?: number; bottom?: number; left?: number; };
};

export function UserDropdown({ visible, onClose, colors, position }: UserDropdownProps) {
  const router = useRouter();
  const { session } = useAuthStore();
  const { logout } = useAuth();
  const { theme, setTheme } = useThemeStore();
  
  const styles = useStyles(colors);

  if (!visible) return null;

  const firstName = session?.user?.name?.split(' ')[0] ?? 'Usuário';

  const handleNavigate = (path: string) => {
    onClose();
    router.push(path as any);
  };

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Background layer para fechar o menu ao clicar fora */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      <Reanimated.View 
        entering={FadeInDown.duration(200).springify()}
        exiting={FadeOutDown.duration(150)}
        style={[styles.dropdown, position]}
      >
        {/* 1. Perfil completo */}
        <View style={styles.dropdownProfileSection}>
          <View style={styles.dropdownAvatar}>
            <Text style={styles.dropdownAvatarInitials}>{firstName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.dropdownUserInfo}>
            <Text style={styles.dropdownUserName} numberOfLines={1}>
              {session?.user?.name ?? 'Usuário'}
            </Text>
            <Text style={styles.dropdownUserEmail} numberOfLines={1}>
              {session?.user?.email ?? 'usuario@vigidoc.com'}
            </Text>
            <View style={styles.dropdownRolePill}>
              <Text style={styles.dropdownRoleText}>
                {session?.user?.role?.toUpperCase() ?? 'PACIENTE'}
              </Text>
            </View>
          </View>
        </View>

        {/* 2. Theme Toggle (Segmented) */}
        <View style={styles.themeToggleContainer}>
          <Pressable 
            onPress={() => setTheme('light')}
            style={theme === 'light' ? styles.themeToggleButtonActive : styles.themeToggleButton}
          >
            <Ionicons 
              name="sunny-outline" 
              size={16} 
              color={theme === 'light' ? colors.bg0 : colors.textMuted} 
            />
            <Text style={theme === 'light' ? styles.themeToggleTextActive : styles.themeToggleText}>
              Claro
            </Text>
          </Pressable>
          <Pressable 
            onPress={() => setTheme('dark')}
            style={theme === 'dark' ? styles.themeToggleButtonActive : styles.themeToggleButton}
          >
            <Ionicons 
              name="moon-outline" 
              size={16} 
              color={theme === 'dark' ? colors.bg0 : colors.textMuted} 
            />
            <Text style={theme === 'dark' ? styles.themeToggleTextActive : styles.themeToggleText}>
              Escuro
            </Text>
          </Pressable>
        </View>

        <View style={styles.dropdownDivider} />

        {/* 3. Ações */}
        <Pressable 
          style={styles.dropdownItem} 
          onPress={() => handleNavigate(APP_ROUTES.find(r => r.name === 'perfil')?.path || '/(tabs)/perfil')}
        >
          <Ionicons name="settings-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.dropdownItemText}>Configurações da Conta</Text>
        </Pressable>
        
        <View style={[styles.dropdownDivider, { opacity: 0.5 }]} />
        
        <Pressable 
          style={styles.dropdownItem} 
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={[styles.dropdownItemText, { color: colors.danger }]}>Sair</Text>
        </Pressable>

        {/* 4. Versão / Footer */}
        <View style={styles.dropdownFooter}>
          <Text style={styles.dropdownFooterText}>v2.6.0 (Beta PT-BR)</Text>
        </View>
      </Reanimated.View>
    </Modal>
  );
}

const useStyles = (NavColors: ThemeColors) => React.useMemo(() => StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  
  dropdown: {
    position: 'absolute',
    width: 280,
    backgroundColor: NavColors.bg1,
    borderRadius: NavRadius.lg,
    borderWidth: 1,
    borderColor: NavColors.borderBright,
    overflow: 'hidden',
    shadowColor: NavColors.cyan,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 20,
    zIndex: 100,
  },

  dropdownProfileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: NavSpacing.lg,
    paddingBottom: NavSpacing.sm,
    gap: NavSpacing.md,
  },

  dropdownAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: NavColors.bg3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: NavColors.border,
  },

  dropdownAvatarInitials: {
    fontSize: 18,
    fontWeight: '800',
    color: NavColors.textPrimary,
  },

  dropdownUserInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 3,
  },

  dropdownUserName: {
    fontSize: 15,
    fontWeight: '800',
    color: NavColors.textPrimary,
  },

  dropdownUserEmail: {
    fontSize: 12,
    color: NavColors.textMuted,
  },

  dropdownRolePill: {
    alignSelf: 'flex-start',
    backgroundColor: NavColors.cyanDim,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },

  dropdownRoleText: {
    fontSize: 10,
    fontWeight: '800',
    color: NavColors.cyan,
    letterSpacing: 0.5,
  },

  themeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: NavColors.bg2,
    borderRadius: NavRadius.md,
    marginHorizontal: NavSpacing.lg,
    marginVertical: NavSpacing.md,
    padding: 4,
    borderWidth: 1,
    borderColor: NavColors.border,
  },

  themeToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: NavRadius.sm - 2,
  },

  themeToggleButtonActive: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: NavRadius.sm - 2,
    backgroundColor: NavColors.textPrimary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  themeToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: NavColors.textMuted,
  },

  themeToggleTextActive: {
    fontSize: 13,
    fontWeight: '700',
    color: NavColors.bg0,
  },

  dropdownDivider: {
    height: 1,
    backgroundColor: NavColors.border,
  },

  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: NavSpacing.md,
    paddingHorizontal: NavSpacing.lg,
    gap: NavSpacing.md,
  },

  dropdownItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: NavColors.textSecondary,
  },

  dropdownFooter: {
    backgroundColor: NavColors.bg2,
    paddingVertical: NavSpacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: NavColors.border,
  },

  dropdownFooterText: {
    fontSize: 11,
    color: NavColors.textMuted,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
}), [NavColors]);
