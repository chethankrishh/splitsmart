// ─── Brand palette (mode-independent) ────────────────────────────────────────
export const Brand = {
  indigo:        '#6366F1',  // primary — richer indigo
  indigoDark:    '#4F46E5',
  indigoDeep:    '#3730A3',
  indigoLight:   '#EEF2FF',

  rose:          '#F43F5E',  // secondary — vivid rose
  roseLight:     '#FFF1F2',

  emerald:       '#10B981',  // success / accent green
  emeraldLight:  '#ECFDF5',

  amber:         '#F59E0B',  // warning / budget
  amberLight:    '#FFFBEB',

  sky:           '#0EA5E9',  // info / splitter accent
  skyLight:      '#F0F9FF',

  violet:        '#8B5CF6',  // categories accent
  violetLight:   '#F5F3FF',

  pink:          '#EC4899',  // coral accent
  pinkLight:     '#FDF2F8',
};

// ─── Category preset palette ──────────────────────────────────────────────────
export const CategoryColors = [
  '#6366F1', '#F43F5E', '#10B981', '#0EA5E9',
  '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6',
];

// ─── Shared spacing / radius ──────────────────────────────────────────────────
export const Radius = {
  xs:   6,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  xxl:  32,
  full: 999,
};

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

// ─── Typography scale ─────────────────────────────────────────────────────────
export const Typography = {
  xs:   { fontSize: 11, lineHeight: 16 },
  sm:   { fontSize: 13, lineHeight: 18 },
  base: { fontSize: 15, lineHeight: 22 },
  md:   { fontSize: 17, lineHeight: 24 },
  lg:   { fontSize: 20, lineHeight: 28 },
  xl:   { fontSize: 24, lineHeight: 32 },
  xxl:  { fontSize: 30, lineHeight: 38 },
  xxxl: { fontSize: 36, lineHeight: 44 },
};

// ─── Light palette ────────────────────────────────────────────────────────────
export const LightColors = {
  // Brand
  primary:        Brand.indigo,
  primaryDark:    Brand.indigoDark,
  primaryDeep:    Brand.indigoDeep,
  primaryMuted:   Brand.indigoLight,

  secondary:      Brand.rose,
  secondaryMuted: Brand.roseLight,

  success:        Brand.emerald,
  successMuted:   Brand.emeraldLight,

  warning:        Brand.amber,
  warningMuted:   Brand.amberLight,

  danger:         Brand.rose,
  dangerMuted:    Brand.roseLight,

  info:           Brand.sky,
  infoMuted:      Brand.skyLight,

  accent:         Brand.violet,
  accentMuted:    Brand.violetLight,

  accentOrange:   Brand.amber,
  accentPurple:   Brand.violet,
  accentBlue:     Brand.sky,
  accentPink:     Brand.pink,
  accentGreen:    Brand.emerald,

  // Surfaces — layered for depth
  bg:             '#F8F9FF',   // page background
  bgElevated:     '#F0F2FE',   // slightly elevated surface (e.g. section bg)
  surface:        '#FFFFFF',   // cards, sheets
  surfaceRaised:  '#FAFBFF',   // tooltips, popovers
  overlay:        '#00000066',

  // Borders & separators
  border:         '#E5E7F5',
  borderStrong:   '#C7CBE8',
  divider:        '#EDEEF8',

  // Text
  text:           '#0F0F1A',   // near-black for max contrast
  textSecondary:  '#374151',
  textSub:        '#6B7280',
  textMuted:      '#9CA3B0',
  textInverse:    '#FFFFFF',

  // Stat card backgrounds (rich gradient stops simulated with flat colors)
  card1:          '#6366F1',
  card2:          '#F43F5E',
  card3:          '#10B981',
  card4:          '#F59E0B',

  // Tab bar
  tabBarBg:       '#FFFFFF',
  tabBarBorder:   'transparent',
  tabIconActive:  Brand.indigo,
  tabIconInactive:'#9CA3AF',
  tabActivePill:  Brand.indigoLight,
};

// ─── Dark palette ─────────────────────────────────────────────────────────────
export const DarkColors = {
  // Brand (slightly lighter for dark bg contrast)
  primary:        '#818CF8',
  primaryDark:    '#6366F1',
  primaryDeep:    '#4F46E5',
  primaryMuted:   '#1E1B4B',

  secondary:      '#FB7185',
  secondaryMuted: '#4C0519',

  success:        '#34D399',
  successMuted:   '#064E3B',

  warning:        '#FCD34D',
  warningMuted:   '#451A03',

  danger:         '#FB7185',
  dangerMuted:    '#4C0519',

  info:           '#38BDF8',
  infoMuted:      '#0C4A6E',

  accent:         '#A78BFA',
  accentMuted:    '#2E1065',

  accentOrange:   '#FCD34D',
  accentPurple:   '#A78BFA',
  accentBlue:     '#38BDF8',
  accentPink:     '#F472B6',
  accentGreen:    '#34D399',

  // Surfaces — dark layered
  bg:             '#0D0D14',   // deepest dark
  bgElevated:     '#13131F',
  surface:        '#1A1A2E',   // cards
  surfaceRaised:  '#22223A',   // modals / sheets
  overlay:        '#000000AA',

  // Borders
  border:         '#2A2A45',
  borderStrong:   '#3D3D65',
  divider:        '#1F1F38',

  // Text
  text:           '#F1F1FA',
  textSecondary:  '#C4C4D4',
  textSub:        '#8B8BA8',
  textMuted:      '#5A5A78',
  textInverse:    '#0F0F1A',

  // Stat card backgrounds (darker, still vivid)
  card1:          '#4F46E5',
  card2:          '#E11D48',
  card3:          '#059669',
  card4:          '#D97706',

  // Tab bar
  tabBarBg:       '#12121E',
  tabBarBorder:   'transparent',
  tabIconActive:  '#818CF8',
  tabIconInactive:'#4B5563',
  tabActivePill:  '#1E1B4B',
};

export type ThemeColors = typeof LightColors;

// ─── Shadow factory (uses theme-aware color) ──────────────────────────────────
export function makeShadow(isDark: boolean) {
  const color = isDark ? '#000000' : '#6366F1';
  return {
    sm: {
      shadowColor: color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.4 : 0.08,
      shadowRadius: 6,
      elevation: 3,
    },
    md: {
      shadowColor: color,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.5 : 0.12,
      shadowRadius: 12,
      elevation: 6,
    },
    lg: {
      shadowColor: color,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.6 : 0.16,
      shadowRadius: 20,
      elevation: 10,
    },
  };
}

// ─── Default exports kept for backward compat ─────────────────────────────────
// These are the LIGHT values; prefer useTheme() in components.
export const Colors = LightColors;
export const Shadow = makeShadow(false);
