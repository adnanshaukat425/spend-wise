export const palette = {
  amber500: "#F59E0B",
  blue600: "#1976D2",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray700: "#374151",
  gray900: "#111827",
  green50: "#EEF9F2",
  green100: "#DCFCE7",
  green700: "#2E7D52",
  red100: "#FEE2E2",
  red700: "#B91C1C",
  white: "#FFFFFF",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const typography = {
  caption: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  body: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
  bodyMedium: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
  },
  bodySemibold: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
  },
  headline: {
    fontFamily: "Inter_700Bold",
    fontSize: 32,
  },
  statValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
  },
} as const;

export const touchTarget = {
  min: 44,
} as const;

export const shadows = {
  card: {
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  floating: {
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
  },
} as const;
