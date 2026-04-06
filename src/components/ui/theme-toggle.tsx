import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Reanimated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { useThemeStore } from '@stores/theme.store';
import { useThemeColors } from '@hooks/use-theme-colors';
import { NavRadius } from '@constants/nav-theme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const NavColors = useThemeColors();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(1) }],
  }));

  return (
    <Pressable 
      onPress={toggleTheme} 
      style={({ pressed }) => [
        styles.container, 
        { 
          backgroundColor: NavColors.bg3, 
          borderColor: NavColors.borderBright,
          opacity: pressed ? 0.7 : 1 
        }
      ]}
    >
      <Reanimated.View style={animatedStyle}>
        <Ionicons 
          name={theme === 'dark' ? 'moon' : 'sunny'} 
          size={20} 
          color={NavColors.cyan} 
        />
      </Reanimated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    borderRadius: NavRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
