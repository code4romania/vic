// VIC „Îndrăzneț” design tokens (handbook v1.0, 12 Nov 2026).
// One small palette used on big surfaces: warm paper behind white cards, navy ink, VIC yellow only
// for what you can press now or what you achieved. Status colors are solid and pass WCAG AA.

export const palette = {
  yellow: '#FFD209',
  yellowPress: '#F2C600',
  navy: '#01344F',
  navy2: '#012A40',
  navy3: '#001A29',
  paper: '#F4F1E9',
  card: '#FFFFFF',
  sand: '#E4DFD2',
  ink: '#01344F',
  // secondary text: 5.5:1 on paper
  ink2: '#4A6573',
  line: 'rgba(1,52,79,0.12)',
  green: '#0B7A47',
  red: '#C8321F',
  orange: '#FF8A1F',
  slate: '#5D6B75',
  white: '#FFFFFF',
  black: '#000000',
  // field in error: very light rose behind the red outline
  errorTint: '#FFF5F3',
  // new row highlight in Ore
  highlight: '#FFF6CC',
  scrim: 'rgba(0,16,26,0.5)',
} as const;

/** Colors by role, so dark mode (phase 2) is a theme swap in Unistyles. */
export const lightColors = {
  ...palette,
  background: palette.paper,
  surface: palette.card,
  text: palette.ink,
  textSecondary: palette.ink2,
  primary: palette.yellow,
  onPrimary: palette.navy,
  danger: palette.red,
  glassTint: 'rgba(255,255,255,0.58)',
  glassTintStrong: 'rgba(255,255,255,0.62)',
  glassStroke: 'rgba(255,255,255,0.75)',
  topBarTint: 'rgba(244,241,233,0.72)',
} as const;

export type AppColors = typeof lightColors;

/** Status pills: solid, each with a color plus an icon or texture (approved→ok, pending→wait…). */
export const status = {
  ok: { bg: palette.green, fg: palette.white },
  no: { bg: palette.red, fg: palette.white },
  exp: { bg: palette.slate, fg: palette.white },
  soon: { bg: palette.orange, fg: palette.navy },
  // pending is a texture (yellow/white stripes + navy outline), not a color
  wait: { bg: palette.white, fg: palette.navy },
  act: { bg: palette.navy, fg: palette.yellow },
  plain: { bg: palette.card, fg: palette.navy },
  glass: { bg: 'rgba(255,255,255,0.14)', fg: palette.white },
} as const;

export type StatusKind = keyof typeof status;

export const space = {
  xxs: 4,
  xs: 8,
  s: 10,
  m: 12,
  l: 14,
  gutter: 18,
  section: 22,
  xl: 28,
} as const;

export const radius = {
  chip: 14,
  control: 18,
  button: 20,
  card: 24,
  row: 22,
  hero: 30,
  sheet: 34,
  bar: 34,
  pill: 999,
} as const;

/** Bricolage Grotesque for numbers and titles, Manrope for everything else. Registered in App.tsx. */
export const fontFamily = {
  display: 'BricolageGrotesque_800ExtraBold',
  displayBold: 'BricolageGrotesque_700Bold',
  text: 'Manrope_600SemiBold',
  textMedium: 'Manrope_500Medium',
  textBold: 'Manrope_700Bold',
  textHeavy: 'Manrope_800ExtraBold',
} as const;

// Letter spacing in RN is in points: em × fontSize.
const em = (value: number, size: number) => Math.round(value * size * 100) / 100;

export const type = {
  display: {
    fontFamily: fontFamily.display,
    fontSize: 76,
    lineHeight: 66,
    letterSpacing: em(-0.055, 76),
    fontVariant: ['tabular-nums'],
  },
  largeTitle: {
    fontFamily: fontFamily.display,
    fontSize: 44,
    lineHeight: 44,
    letterSpacing: em(-0.04, 44),
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: 24,
    lineHeight: 27,
    letterSpacing: em(-0.025, 24),
  },
  headline: { fontFamily: fontFamily.textHeavy, fontSize: 16, lineHeight: 20 },
  body: { fontFamily: fontFamily.text, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fontFamily.textBold, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fontFamily.text, fontSize: 13, lineHeight: 17.5 },
  overline: {
    fontFamily: fontFamily.textHeavy,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: em(0.09, 11),
    textTransform: 'uppercase',
  },
  label: { fontFamily: fontFamily.textHeavy, fontSize: 13, lineHeight: 17 },
  button: { fontFamily: fontFamily.textHeavy, fontSize: 16, lineHeight: 20 },
} as const;

export type TypeVariant = keyof typeof type;

/** Dynamic Type: text grows to 1.35×, display and large titles stop at 1.15×. */
export const fontScaleCap = { text: 1.35, display: 1.15 } as const;

export const glass = {
  tint: lightColors.glassTint,
  blur: 22,
  // expo-blur intensity that reads like the 22pt CSS blur
  blurIntensity: 60,
  stroke: lightColors.glassStroke,
} as const;

/** Only floating elements have elevation; cards get their contrast from paper. */
export const elevation = {
  float: {
    shadowColor: '#011A29',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  yellow: {
    shadowColor: palette.yellow,
    shadowOpacity: 0.32,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
} as const;

export const hit = { min: 44 } as const;

/** Glass tab bar geometry. Equal slots, the lens slides; nothing grows. */
export const tabBar = {
  height: 68,
  side: 14,
  bottom: 24,
  padding: 6,
  // minimised (iOS 26 style): one glass pill with the active icon inside the lens
  pill: 56,
  // scroll rules: collapse after 24pt of downward scroll, expand on 10pt up
  collapseAfter: 24,
  expandAfter: 10,
} as const;
