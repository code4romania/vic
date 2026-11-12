import { Easing } from 'react-native-reanimated';
import { TextStyle, ViewStyle } from 'react-native';
import { elevation, fontFamily, palette, radius as dsRadius, space, status, type } from '../../design/tokens';

// Legacy token names, now backed by the „Îndrăzneț” design system (src/design/tokens.ts).
// Screens that still import from here pick up the new palette and type; new code imports src/design.
export const colors = {
  yellow: palette.yellow,
  yellowPressed: palette.yellowPress,
  navy: palette.navy,
  ink: palette.ink,
  // secondary text: 5.5:1 on paper
  muted: palette.ink2,
  subtle: palette.ink2,
  line: palette.line,
  soft: palette.paper,
  // page background behind white cards: warm paper, so white never sits on white
  canvas: palette.paper,
  navyTint: palette.sand,
  tealTint: palette.paper,
  // solid figure colors (no pastel blocks)
  figure: { green: palette.green, amber: '#9A4A00', red: palette.red, teal: palette.navy },
  grab: 'rgba(1,52,79,0.25)',
  white: palette.white,
  black: palette.black,
  danger: palette.red,
  teal: palette.navy,
  tealLight: palette.navy2,
  scrim: palette.scrim,
  // Solid status pills, white or navy text on the status color (all AA).
  status: {
    ok: { bg: status.ok.bg, fg: status.ok.fg },
    wait: { bg: status.wait.bg, fg: status.wait.fg },
    no: { bg: status.no.bg, fg: status.no.fg },
    neutral: { bg: status.exp.bg, fg: status.exp.fg },
    accent: { bg: palette.yellow, fg: palette.navy },
  },
} as const;

export type StatusTone = keyof typeof colors.status;

export const radius = {
  badge: 10,
  button: dsRadius.button,
  field: dsRadius.control,
  card: dsRadius.card,
  chip: dsRadius.chip,
  sheet: dsRadius.sheet,
  pill: dsRadius.bar,
} as const;

export const spacing = {
  gutter: space.gutter,
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  xxl: 32,
} as const;

// Font families are registered in App.tsx: Bricolage Grotesque for titles, Manrope for text.
export const fonts = {
  title: fontFamily.display,
  regular: fontFamily.text,
  medium: fontFamily.textBold,
  bold: fontFamily.textHeavy,
} as const;

export const typography: Record<
  'largeTitle' | 'h2' | 'h3' | 'body' | 'bodyStrong' | 'sub' | 'cap' | 'label' | 'button',
  TextStyle
> = {
  largeTitle: { ...type.largeTitle, color: colors.ink },
  h2: { ...type.title, color: colors.ink },
  h3: { ...type.headline, color: colors.ink },
  body: { ...type.body, color: colors.ink },
  bodyStrong: { ...type.bodyStrong, color: colors.ink },
  sub: { fontFamily: fontFamily.text, fontSize: 14, lineHeight: 20, color: colors.muted },
  cap: { ...type.caption, color: colors.muted },
  label: { fontFamily: fontFamily.textBold, fontSize: 14, lineHeight: 18, color: colors.ink },
  button: { ...type.button },
};

// Cards have no shadow: their contrast comes from the paper behind them. Only floating
// elements (tab bar, action bars, toasts) are elevated.
export const shadows: Record<'card' | 'floating' | 'back', ViewStyle> = {
  card: {},
  floating: elevation.float,
  back: {
    shadowColor: '#011A29',
    shadowOpacity: 0.18,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
};

export const motion = {
  enter: { duration: 320, translateY: 10, stagger: 40, easing: Easing.bezier(0.22, 1, 0.36, 1) },
  push: { duration: 340, easing: Easing.bezier(0.22, 1, 0.36, 1) },
  sheet: { duration: 360, easing: Easing.bezier(0.22, 1, 0.36, 1) },
  press: { scale: 0.98, duration: 120 },
  tabBar: {
    collapse: { duration: 240, easing: Easing.bezier(0.4, 0, 0.2, 1) },
    expand: { duration: 340, easing: Easing.bezier(0.16, 1.06, 0.3, 1) },
  },
  indicator: { duration: 260, easing: Easing.bezier(0.22, 1, 0.36, 1) },
} as const;

export const tabBar = {
  width: 358,
  height: 62,
  collapsedWidth: 252,
  collapsedHeight: 46,
  bottom: 22,
  // Scroll rules from the canvas: collapse after 24pt of scroll and another 10pt down; grow on 10pt up.
  collapseAfter: 24,
  directionThreshold: 10,
} as const;
