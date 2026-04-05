import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React, { useEffect } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  NavRadius,
  NavSpacing,
  TAB_BAR_HEIGHT,
} from '@constants/nav-theme';
import type { ThemeColors } from '@constants/nav-theme';
import { useThemeColors } from '@hooks/use-theme-colors';

import { APP_ROUTES } from '@constants/routes';
import type { IoniconName } from '@constants/routes';

/* ─────────────────────────────────────────── */
/*  Single animated tab item                    */
/* ─────────────────────────────────────────── */

type TabItemProps = {
  label: string;
  icon: IoniconName;
  iconActive: IoniconName;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onLayout?: (width: number) => void;
  colors: ThemeColors;
};

function TabItem({
  label,
  icon,
  iconActive,
  isFocused,
  onPress,
  onLongPress,
  onLayout,
  colors,
}: TabItemProps) {
  const styles = useStyles(colors);
  const scale = useSharedValue(1);


  const animatedIconWrapper = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePressIn() {
    scale.value = withSpring(0.88, { damping: 10, stiffness: 260 });
  }

  function handlePressOut() {
    scale.value = withSpring(1, { damping: 10, stiffness: 220 });
  }

  return (
    <Pressable
      style={styles.tabItem}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={label}
      onLayout={(e) => {
        if (onLayout) onLayout(e.nativeEvent.layout.width);
      }}
    >
      {/* Icon wrapper */}
      <Reanimated.View style={animatedIconWrapper}>
        <Ionicons
          name={isFocused ? iconActive : icon}
          size={22}
          color={isFocused ? colors.cyan : colors.textMuted}
        />
      </Reanimated.View>

      {/* Label */}
      <Text
        style={[styles.tabLabel, { color: colors.textMuted }, isFocused && { color: colors.cyan, fontWeight: '700' }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/* ─────────────────────────────────────────── */
/*  Menu button (opens side drawer)            */
/* ─────────────────────────────────────────── */

type MenuButtonProps = {
  onPress: () => void;
  colors: ThemeColors;
};

function MenuButton({ onPress, colors }: MenuButtonProps) {
  const styles = useStyles(colors);
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      style={styles.menuButton}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.88, { damping: 10 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 10 });
      }}
      accessibilityRole="button"
      accessibilityLabel="Abrir menu"
    >
      <Reanimated.View style={[styles.menuButtonInner, animStyle]}>
        {/* 3×2 dot grid icon */}
        <View style={styles.menuGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.menuDot,
                { backgroundColor: colors.textSecondary },
                i < 3 && { backgroundColor: colors.violet },
              ]}
            />
          ))}
        </View>
        <Text style={[styles.menuLabel, { color: colors.textSecondary }]}>Menu</Text>
      </Reanimated.View>
    </Pressable>
  );
}

/* ─────────────────────────────────────────── */
/*  Main export                                */
/* ─────────────────────────────────────────── */

type CustomTabBarProps = BottomTabBarProps & {
  onMenuPress: () => void;
};

export function CustomTabBar({
  state,
  descriptors,
  navigation,
  onMenuPress,
}: CustomTabBarProps) {
  const NavColors = useThemeColors();
  const styles = useStyles(NavColors);
  
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 10);
  
  const [tabWidth, setTabWidth] = React.useState(0);
  
  const animatedBgStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: withTiming(state.index * tabWidth, { duration: 200 }) }
      ]
    };
  });

  return (
    <View style={[styles.wrapper, { paddingBottom: bottomInset }]}>
      {/* Outer glow border */}
      <View style={styles.outerGlow} />

      {/* Tab bar container */}
      <View style={styles.container}>
        {/* Subtle scan-line at top */}
        <View style={styles.scanLine} />

        {/* Tab items */}
        <View style={styles.tabRow}>
          {/* Sliding Background */}
          {tabWidth > 0 && (
            <Reanimated.View 
              style={[styles.slidingBackground, { width: tabWidth }, animatedBgStyle]} 
            />
          )}

          {state.routes.map((route, index) => {
            const meta = APP_ROUTES.find((r) => r.name === route.name && r.showInTabBar);
            if (!meta) return null;

            const isFocused = state.index === index;
            const { options } = descriptors[route.key];

            function handlePress() {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }

            function handleLongPress() {
              navigation.emit({ type: 'tabLongPress', target: route.key });
            }

            return (
              <TabItem
                key={route.key}
                label={meta.label}
                icon={meta.icon as any}
                iconActive={meta.iconActive as any}
                isFocused={isFocused}
                onPress={handlePress}
                onLongPress={handleLongPress}
                onLayout={index === 0 ? setTabWidth : undefined}
                colors={NavColors}
              />
            );
          })}

          <View style={styles.separator} />

          <MenuButton onPress={onMenuPress} colors={NavColors} />
        </View>
      </View>
    </View>
  );
}

/* ─────────────────────────────────────────── */
/*  Styles                                     */
/* ─────────────────────────────────────────── */

const useStyles = (NavColors: ThemeColors) => React.useMemo(() => StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: NavSpacing.lg,
  },

  outerGlow: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: TAB_BAR_HEIGHT + 20,
    borderRadius: NavRadius.xl,
    // Shadow glow
    shadowColor: NavColors.cyan,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 0,
  },

  container: {
    height: TAB_BAR_HEIGHT,
    backgroundColor: NavColors.bg2,
    borderRadius: NavRadius.xl,
    borderWidth: 1,
    borderColor: NavColors.border,
    overflow: 'hidden',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 20,
  },

  scanLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: NavColors.borderBright,
    opacity: 0.5,
  },

  tabRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: NavSpacing.sm,
  },

  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: NavSpacing.sm,
    gap: 3,
    position: 'relative',
  },

  slidingBackground: {
    position: 'absolute',
    left: NavSpacing.sm,
    top: 6,
    bottom: 6,
    borderRadius: NavRadius.md,
    backgroundColor: NavColors.cyanSoft,
  },

  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: NavColors.textMuted,
    letterSpacing: 0.3,
  },

  tabLabelActive: {
    color: NavColors.cyan,
    fontWeight: '700',
  },

  separator: {
    width: 1,
    height: 32,
    backgroundColor: NavColors.border,
    marginHorizontal: NavSpacing.xs,
  },

  menuButton: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: NavSpacing.sm,
  },

  menuButtonInner: {
    alignItems: 'center',
    gap: 3,
  },

  menuGrid: {
    width: 22,
    height: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    alignContent: 'center',
    justifyContent: 'center',
  },

  menuDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },

  menuLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
}), [NavColors]);
