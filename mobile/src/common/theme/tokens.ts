import { Easing } from 'react-native-reanimated';
import { Platform, TextStyle, ViewStyle } from 'react-native';

// VIC 2.0 design tokens (approved mobile redesign, canvas v22).
// Colors and fonts are the app's own: yellow #FFD209 only on the primary action, with navy text.
export const colors = {
  yellow: '#FFD209',
  yellowPressed: '#F5C800',
  navy: '#01344F',
  ink: '#1F2937',
  muted: '#6B7280',
  subtle: '#9CA3AF',
  line: '#E5E7EB',
  soft: '#F3F4F6',
  // page background behind white cards (Andrew, 9 Nov: less white on white)
  canvas: '#EEF2F6',
  navyTint: '#E3ECF2',
  tealTint: '#DDF3F1',
  grab: '#D1D5DB',
  white: '#FFFFFF',
  black: '#000000',
  danger: '#E23D3D',
  teal: '#0AA5A5',
  tealLight: '#3BC9BC',
  scrim: 'rgba(0,0,0,0.4)',
  status: {
    ok: { bg: '#E7F6EC', fg: '#166534' },
    wait: { bg: '#FEF3C7', fg: '#92400E' },
    no: { bg: '#FEE2E2', fg: '#991B1B' },
    neutral: { bg: '#F3F4F6', fg: '#374151' },
    accent: { bg: '#FFD209', fg: '#01344F' },
  },
} as const;

export type StatusTone = keyof typeof colors.status;

export const radius = {
  badge: 6,
  button: 12,
  field: 12,
  card: 16,
  chip: 18,
  sheet: 20,
  pill: 28,
} as const;

export const spacing = {
  gutter: 20,
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  xxl: 32,
} as const;

// Font families are registered in App.tsx.
export const fonts = {
  title: 'titillium-bold',
  regular: 'roboto-regular',
  medium: 'roboto-medium',
  bold: 'roboto-bold',
} as const;

export const typography: Record<
  'largeTitle' | 'h2' | 'h3' | 'body' | 'bodyStrong' | 'sub' | 'cap' | 'label' | 'button',
  TextStyle
> = {
  largeTitle: { fontFamily: fonts.title, fontSize: 32, lineHeight: 38, color: colors.ink },
  h2: { fontFamily: fonts.title, fontSize: 21, lineHeight: 26, color: colors.ink },
  h3: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 22, color: colors.ink },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.ink },
  bodyStrong: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22, color: colors.ink },
  sub: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.muted },
  cap: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16, color: colors.muted },
  label: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 18, color: colors.ink },
  button: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 20 },
};

// Card shadow: 0 0 0 1px rgba(0,0,0,.04), 0 2px 4px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.06).
// React Native has one shadow per view, so the 1px ring becomes a hairline border.
export const shadows: Record<'card' | 'floating' | 'back', ViewStyle> = {
  card: {
    borderWidth: Platform.OS === 'ios' ? 1 : 0,
    borderColor: 'rgba(0,0,0,0.04)',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  floating: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  back: {
    shadowColor: '#000',
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
