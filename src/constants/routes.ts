import type { ThemeColors } from './nav-theme';
import type { Ionicons } from '@expo/vector-icons';

export type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export type AppRouteConfig = {
  name: string;
  label: string;
  icon: IoniconName;
  iconActive: IoniconName;
  path: string;
  colorKey: keyof ThemeColors;
  showInTabBar?: boolean;
  showInDrawer?: boolean;
};

/**
 * Fonte única da verdade (Single Source of Truth) para as definições do menu.
 * Evita nomes, caminhos ou ícones dessincronizados entre TabBar e SideDrawer.
 */
export const APP_ROUTES: AppRouteConfig[] = [
  {
    name: 'index',
    label: 'Início',
    icon: 'home-outline',
    iconActive: 'home',
    path: '/(tabs)',
    colorKey: 'cyan',
    showInTabBar: true,
    showInDrawer: true,
  },
  {
    name: 'historico',
    label: 'Histórico',
    icon: 'time-outline',
    iconActive: 'time',
    path: '/(tabs)/historico',
    colorKey: 'violet',
    showInTabBar: true,
    showInDrawer: true,
  },
  {
    name: 'notificacoes',
    label: 'Notificações',
    icon: 'notifications-outline',
    iconActive: 'notifications',
    path: '/(tabs)/notificacoes',
    colorKey: 'warning',
    showInTabBar: true,
    showInDrawer: true,
  },
  {
    name: 'meu-medico',
    label: 'Meu Médico',
    icon: 'medkit-outline',
    iconActive: 'medkit',
    path: '/(tabs)/meu-medico',
    colorKey: 'green',
    showInTabBar: true,
    showInDrawer: true,
  },
  {
    name: 'perfil',
    label: 'Configurações de Conta',
    icon: 'person-outline',
    iconActive: 'person',
    path: '/(tabs)/perfil',
    colorKey: 'textSecondary',
    showInTabBar: false,
    showInDrawer: true, 
  },
  {
    name: 'dev',
    label: 'Laboratório IoT',
    icon: 'flask-outline',
    iconActive: 'flask',
    path: '/(tabs)/dev',
    colorKey: 'cyan',
    showInTabBar: false,
    showInDrawer: true,
  },
];
