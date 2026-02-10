// src/theme.ts

export const Colors = {
  // Brand
  primary: "#2563EB",
  primarySoft: "#EEF2FF",
  accent: "#6366F1",

  // Backgrounds / surfaces
  bg: "#F5F7FF",
  card: "#FFFFFF",

  // Text
  text: "#111827",
  muted: "#6B7280",
  muted2: "#9CA3AF",
  white: "#FFFFFF",

  // Borders
  border: "#E5E7EB",
  borderSoft: "#CBD5E1",

  // Status
  success: "#16A34A",
  successSoft: "#DCFCE7",
  warning: "#D97706",
  warningSoft: "#FEF3C7",
  danger: "#DC2626",
  dangerSoft: "#FEE2E2",
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  card: 20,
  pill: 999,
};

export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  hero: 64,
};

export const Shadows = {
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  floating: {
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
};


export const theme = {
  colors: Colors,
  spacing: Spacing,
  radius: Radius,
  fontSizes: FontSizes,
  shadows: Shadows,
};


export const Theme = theme;
export type AppTheme = typeof theme;
