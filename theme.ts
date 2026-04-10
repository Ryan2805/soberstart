// src/theme.ts

export const Colors = {
  // Brand
  primary: "#0F766E",
  primarySoft: "#CCFBF1",
  primaryDeep: "#115E59",
  accent: "#3B82A6",
  accentSoft: "#DCEFFA",

  // Backgrounds / surfaces
  bg: "#F4F7F5",
  bgSoft: "#ECF4F1",
  bgElevated: "#FAFCFB",
  card: "#FFFFFF",
  cardMuted: "#F7FBF9",

  // Text
  text: "#0B1220",
  muted: "#52607A",
  muted2: "#94A3B8",
  white: "#FFFFFF",

  // Borders
  border: "#E2E8F0",
  borderSoft: "#CBD5E1",
  borderStrong: "#BFD3CD",

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
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 7,
  },
  floating: {
    shadowColor: "#0B1220",
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
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
