/**
 * VigiDoc — Navigation Design System
 * Tema: Dark Space / Cyberpunk Medical
 */

export const NavColorsDark = {
  // ── Backgrounds (Medical Dark Slate-Blue) ──
  bg0: '#020617',        // Slate-950 (Absolute depth)
  bg1: '#0F172A',        // Slate-900 (Main Background)
  bg2: '#1E293B',        // Slate-800 (Card/Surface)
  bg3: '#334155',        // Slate-700
  bg4: '#475569',        // Slate-600

  // ── Primary: Soft Medical Cyan / Teal ────────────────
  cyan: '#2DD4BF',       // Teal-400 (Soft & Medical)
  cyanBright: '#5EEAD4',  // Teal-300
  cyanDim: 'rgba(45,212,191,0.12)',
  cyanGlow: 'rgba(45,212,191,0.3)',
  cyanSoft: 'rgba(45,212,191,0.06)',

  // ── Accent: Calm Violet ───────────────────
  violet: '#A78BFA',     // Violet-400
  violetDim: 'rgba(167,139,250,0.15)',
  violetGlow: 'rgba(167,139,250,0.25)',

  // ── Health: Minty Green (Success) ──────────
  green: '#10B981',
  greenDim: 'rgba(16,185,129,0.1)',

  // ── Status ────────────────────────────────
  danger: '#F43F5E',     // Rose-500
  dangerDim: 'rgba(244,63,94,0.1)',
  warning: '#F59E0B',
  success: '#10B981',

  // ── Text (Slate High-Contrast) ────────────
  textPrimary: '#F8FAFC', // Slate-50
  textSecondary: '#94A3B8', // Slate-400
  textMuted: '#64748B',    // Slate-500
  textDisabled: '#334155',  // Slate-700

  // ── Borders ───────────────────────────────
  border: 'rgba(45,212,191,0.08)',
  borderBright: 'rgba(45,212,191,0.2)',
  borderSoft: 'rgba(255,255,255,0.03)',

  // ── Overlay ───────────────────────────────
  overlay: 'rgba(2,6,23,0.85)',
} as const;

export const NavColorsLight = {
  // ── Backgrounds ──────────────────────────
  bg0: '#F1F5F9',        // Background mais distante (base da tela)
  bg1: '#FFFFFF',        // Fundo principal de conteúdo
  bg2: '#FFFFFF',        // Cards / Superfícies
  bg3: '#F8FAFC',        // Superfície elevada leve
  bg4: '#F1F5F9',        // Hover / Destaques suaves

  // ── Primary: Teal-600 ─────────────────────
  cyan: '#0D9488',       // Teal-600 do HTML Reference
  cyanBright: '#14B8A6',
  cyanDim: 'rgba(13,148,136,0.12)',
  cyanGlow: 'rgba(13,148,136,0.25)',
  cyanSoft: 'rgba(13,148,136,0.08)',

  // ── Accent: Violet ────────────────────────
  violet: '#7B2FFF',
  violetDim: 'rgba(123,47,255,0.15)',
  violetGlow: 'rgba(123,47,255,0.3)',

  // ── Health: Neon Green ────────────────────
  green: '#059669',      // Mais escuro para destaque no fundo claro
  greenDim: 'rgba(5,150,105,0.1)',

  // ── Status ────────────────────────────────
  danger: '#EF4444',
  dangerDim: 'rgba(239,68,68,0.12)',
  warning: '#F59E0B',
  success: '#10B981',

  // ── Text ──────────────────────────────────
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textDisabled: '#CBD5E1',

  // ── Borders ───────────────────────────────
  border: 'rgba(15,23,42,0.08)',
  borderBright: 'rgba(15,23,42,0.15)',
  borderSoft: 'rgba(15,23,42,0.04)',

  // ── Overlay ───────────────────────────────
  overlay: 'rgba(15,23,42,0.6)',
} as const;

export type ThemeColors = Record<keyof typeof NavColorsDark, string>;

export function getThemeColors(mode: 'dark' | 'light'): ThemeColors {
  return mode === 'light' ? NavColorsLight : NavColorsDark;
}

// Fallback estático para manter compatibilidade
export const NavColors = NavColorsDark;

export const NavSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const NavRadius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999,
} as const;

export const TAB_BAR_HEIGHT = 72;
export const DRAWER_WIDTH = 300;
