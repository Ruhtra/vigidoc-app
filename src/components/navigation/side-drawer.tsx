import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Reanimated, {
  FadeInDown,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  DRAWER_WIDTH,
  NavRadius,
  NavSpacing,
} from '@constants/nav-theme';
import type { ThemeColors } from '@constants/nav-theme';
import { useAuth } from '@hooks/use-auth';
import { useAuthStore } from '@stores/auth.store';
import { useThemeColors } from '@hooks/use-theme-colors';
import { UserDropdown } from '@components/navigation/user-dropdown';
import { Logo } from '@components/ui/logo';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

import { APP_ROUTES, type AppRouteConfig } from '@constants/routes';

/* ─────────────────────────────────────────── */
/*  Drawer route item                          */
/* ─────────────────────────────────────────── */

type DrawerItemProps = {
  route: AppRouteConfig;
  onPress: () => void;
  colors: ThemeColors;
};

function DrawerItem({ route, onPress, colors }: DrawerItemProps) {
  const styles = useStyles(colors);
  const scale = useSharedValue(1);
  const bgOpacity = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: `rgba(0,212,255,${bgOpacity.value * 0.08})`,
  }));

  return (
    <Pressable
      onPress={route.disabled ? undefined : onPress}
      onPressIn={() => {
        if (route.disabled) return;
        scale.value = withSpring(0.97, { damping: 12 });
        bgOpacity.value = withTiming(1, { duration: 120 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12 });
        bgOpacity.value = withTiming(0, { duration: 200 });
      }}
      accessibilityRole="menuitem"
      accessibilityLabel={route.label}
      disabled={route.disabled}
    >
      <Reanimated.View style={[styles.drawerItem, animStyle, route.disabled && { opacity: 0.3 }]}>
        {/* Icon container with colored glow */}
        <View
          style={[
            styles.drawerItemIcon,
            { backgroundColor: `${colors[route.colorKey as keyof ThemeColors]}18` },
          ]}
        >
          <Ionicons name={route.icon} size={19} color={colors[route.colorKey as keyof ThemeColors] as string} />
        </View>

        {/* Label */}
        <Text style={styles.drawerItemLabel}>{route.label}</Text>

        {/* Arrow */}
        <Ionicons name="chevron-forward" size={15} color={colors.textMuted} />
      </Reanimated.View>
    </Pressable>
  );
}

/* ─────────────────────────────────────────── */
/*  Main Drawer                                */
/* ─────────────────────────────────────────── */

type SideDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function SideDrawer({ open, onClose }: SideDrawerProps) {
  const NavColors = useThemeColors();
  const styles = useStyles(NavColors);
  
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const { session } = useAuthStore();

  const translateX = useSharedValue(DRAWER_WIDTH);
  const backdropOpacity = useSharedValue(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (open) {
      translateX.value = withTiming(0, { duration: 250 });
      backdropOpacity.value = withTiming(1, { duration: 250 });
    } else {
      translateX.value = withTiming(DRAWER_WIDTH, { duration: 250 });
      backdropOpacity.value = withTiming(0, { duration: 250 });
      setTimeout(() => setDropdownOpen(false), 300); // Close dropdown when drawer closes
    }
  }, [open, translateX, backdropOpacity]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
    pointerEvents: backdropOpacity.value > 0 ? 'auto' : 'none',
  } as object));

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleNavigate = useCallback(
    (path: string) => {
      onClose();
      setTimeout(() => router.push(path as never), 180);
    },
    [onClose, router]
  );

  const handleLogout = useCallback(async () => {
    onClose();
    await logout();
  }, [onClose, logout]);

  const userName = session?.user?.name ?? 'Usuário';
  const userRole = session?.user?.role ?? 'paciente';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <>
      {/* Backdrop */}
      <Reanimated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
      </Reanimated.View>

      {/* Drawer panel */}
      <Reanimated.View
        style={[
          styles.drawer,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 },
          drawerStyle,
        ]}
      >
        {/* Decorative scan-line at left edge */}
        <View style={styles.edgeGlow} />

        {/* ── Header: Simple Brand ── */}
        <View style={styles.drawerHeader}>
          <Logo size="md" style={{ alignItems: 'flex-start' }} />
          <Pressable onPress={onClose} style={styles.closeButton} hitSlop={12}>
            <Ionicons name="close" size={20} color={NavColors.textSecondary} />
          </Pressable>
        </View>

        {/* ── Divider ── */}
        <View style={styles.divider} />

        {/* ── Nav routes ── */}
        <View style={styles.drawerRoutes}>
          {APP_ROUTES.filter(r => r.showInDrawer && r.name !== 'perfil').map((route) => {
            return (
              <DrawerItem
                key={route.name}
                route={route}
                onPress={() => handleNavigate(route.path)}
                colors={NavColors}
              />
            );
          })}
        </View>

        {/* ── Footer actions & User Profile Dropup ── */}
        <View style={styles.drawerFooter}>
          <UserDropdown
            visible={dropdownOpen}
            onClose={() => setDropdownOpen(false)}
            colors={NavColors}
            position={{ bottom: 85, right: 20 }} // Exatamente acima do perfil
          />

          <View style={styles.divider} />

          {/* User info now at bottom (Clickable for dropdown) */}
          <Pressable 
            style={styles.bottomProfile}
            onPress={() => setDropdownOpen(!dropdownOpen)}
          >
            <View style={styles.avatarWrapper}>
              <View style={styles.avatar}>
                <Text style={styles.avatarInitial}>{userInitial}</Text>
              </View>
              <View style={styles.onlineIndicator} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                {userName}
              </Text>
              <View style={styles.rolePill}>
                <View style={styles.roleDot} />
                <Text style={styles.roleText}>{userRole}</Text>
              </View>
            </View>
            
            <Ionicons 
              name={dropdownOpen ? "chevron-down" : "chevron-up"} 
              size={18} 
              color={NavColors.textMuted} 
            />
          </Pressable>
        </View>
      </Reanimated.View>
    </>
  );
}

/* ─────────────────────────────────────────── */
/*  Styles                                     */
/* ─────────────────────────────────────────── */

const useStyles = (NavColors: ThemeColors) => React.useMemo(() => StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: NavColors.overlay,
    zIndex: 100,
  },

  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: NavColors.bg1,
    borderLeftWidth: 1,
    borderLeftColor: NavColors.border,
    zIndex: 101,
    // Shadow
    shadowColor: NavColors.cyan,
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 30,
    paddingHorizontal: NavSpacing.lg,
    gap: NavSpacing.md,
  },

  edgeGlow: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: NavColors.borderBright,
    opacity: 0.6,
  },

  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: NavSpacing.sm,
  },

  avatarWrapper: {
    position: 'relative',
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: NavColors.bg4,
    borderWidth: 1.5,
    borderColor: NavColors.borderBright,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarInitial: {
    fontSize: 16,
    fontWeight: '800',
    color: NavColors.cyan,
  },

  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: NavColors.green,
    borderWidth: 2,
    borderColor: NavColors.bg1,
  },

  userInfo: {
    flex: 1,
    gap: 4,
  },

  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: NavColors.textPrimary,
    letterSpacing: 0.2,
  },

  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  roleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: NavColors.cyan,
  },

  roleText: {
    fontSize: 12,
    color: NavColors.textSecondary,
    textTransform: 'capitalize',
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: NavRadius.sm,
    backgroundColor: NavColors.bg3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: NavColors.border,
  },

  divider: {
    height: 1,
    backgroundColor: NavColors.border,
    marginVertical: NavSpacing.sm,
  },

  // ── Routes ──
  drawerRoutes: {
    flex: 1,
    gap: 4,
  },

  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: NavSpacing.md,
    paddingVertical: 12,
    paddingHorizontal: NavSpacing.md,
    borderRadius: NavRadius.md,
  },

  drawerItemIcon: {
    width: 34,
    height: 34,
    borderRadius: NavRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  drawerItemLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: NavColors.textPrimary,
    letterSpacing: 0.2,
  },

  // ── Footer ──
  drawerFooter: {
    gap: NavSpacing.sm,
    position: 'relative',
  },

  bottomProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: NavSpacing.md,
    paddingVertical: NavSpacing.sm,
    paddingHorizontal: NavSpacing.xs,
    borderRadius: NavRadius.md,
    marginBottom: NavSpacing.sm,
  },


}), [NavColors]);
