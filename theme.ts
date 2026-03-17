// src/theme.ts

export const Colors = {
  // Brand
  primary: "#0F766E",
  primarySoft: "#CCFBF1",
  accent: "#F97316",

  // Backgrounds / surfaces
  bg: "#F8FAFC",
  card: "#FFFFFF",

  // Text
  text: "#0B1220",
  muted: "#52607A",
  muted2: "#94A3B8",
  white: "#FFFFFF",

  // Borders
  border: "#E2E8F0",
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
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  floating: {
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
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
