import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle, TextStyle } from 'react-native';
import { useThemeColors } from '@hooks/use-theme-colors';
import { NavRadius } from '@constants/nav-theme';

export type LogoProps = {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  style?: ViewStyle;
};

export function Logo({ size = 'md', showTagline = false, style }: LogoProps) {
  const colors = useThemeColors();

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 26,
  };

  const boxSizes = {
    sm: 24,
    md: 32,
    lg: 56,
  };

  const titleSizes = {
    sm: 16,
    md: 22,
    lg: 28,
  };

  const radiusSizes = {
    sm: 6,
    md: NavRadius.sm,
    lg: 16,
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        <View 
          style={[
            styles.brandIconBox, 
            { 
              width: boxSizes[size], 
              height: boxSizes[size], 
              borderRadius: radiusSizes[size],
              backgroundColor: colors.cyan,
              shadowColor: colors.cyan,
            }
          ]}
        >
          <Ionicons name="pulse" size={iconSizes[size]} color={colors.bg0} />
        </View>
        <Text style={[styles.brandTitle, { fontSize: titleSizes[size], color: colors.textPrimary }]}>
          Vigi<Text style={{ color: colors.cyan }}>Doc</Text>
        </Text>
      </View>
      {showTagline && size === 'lg' && (
        <Text style={[styles.brandTagline, { color: colors.textMuted }]}>
          Monitoramento inteligente de saúde
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIconBox: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  brandTitle: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 13,
    marginTop: 4,
    letterSpacing: 0.2,
  },
});
