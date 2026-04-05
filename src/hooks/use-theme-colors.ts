import { getThemeColors, ThemeColors } from '@constants/nav-theme';
import { useThemeStore } from '@stores/theme.store';

export function useThemeColors(): ThemeColors {
  const theme = useThemeStore((state) => state.theme);
  return getThemeColors(theme);
}
