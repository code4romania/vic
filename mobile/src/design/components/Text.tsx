// Text „Îndrăzneț”: one component for the whole type scale (Bricolage for numbers and titles,
// Manrope for the rest). Dynamic Type: text grows to 1.35×, display and largeTitle stop at 1.15×.
//
// Tight Bricolage lines (display 0.86, largeTitle 0.96, title 1.1) are smaller than the font's own
// 1.2 em box. Left alone, iOS bottom-aligns each line and cuts the top of the glyphs (42h, Î, Ă)
// and Android cuts both ends. AppText therefore „trims” such text: the Text view grows so every
// glyph is inside it (padding), and negative margins pull its layout box back to exactly the
// designed line height, with the baseline where CSS puts it. Result: the layout matches the
// prototype, line pitch stays tight on wrapped lines, and nothing is clipped.
//
// Screen code:
// - <AppText variant="display|largeTitle|title"> trims automatically, also with your own
//   fontSize / lineHeight / margins in `style` (your margins and paddings are kept, the trim is
//   added to them). Pass `trim={false}` to opt out.
// - Plain `Text` with a tight Bricolage line: spread `tight(size, ratio, scale)` (one shared
//   generator; HomeParts `tightLine` and layouts/displayTitle.ts can migrate to it).
// - For a Bricolage `Text` / `Animated.Text` you style yourself, spread `useTextTrim(style, cap)`
//   after your style, or the static `trimFor(fontSize, lineHeight)` (exact at 1×, a few points off
//   at the 1.15× cap).
// - The glyphs overflow the layout box by half the trim (≈ 13pt for display, 5pt for largeTitle),
//   like in CSS: don't hug a tight Bricolage title with a parent that has `overflow: 'hidden'`.
import React from 'react';
import {
  Platform,
  StyleProp,
  StyleSheet as RNStyleSheet,
  Text,
  TextProps,
  TextStyle,
  useWindowDimensions,
} from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { fontFamily, fontMetrics, fontScaleCap, type, TypeVariant } from '../tokens';

export interface AppTextProps extends TextProps {
  variant?: TypeVariant;
  /** text color; defaults to the theme ink */
  color?: string;
  /**
   * Keep tight Bricolage lines unclipped while their layout box stays at the designed line height
   * (default true). Only acts when the line height is below the font's 1.2 em.
   */
  trim?: boolean;
}

const DISPLAY_VARIANTS: TypeVariant[] = ['display', 'largeTitle'];
const DISPLAY_FAMILIES: string[] = [fontFamily.display, fontFamily.displayBold];
const NATURAL_LINE = fontMetrics.display.ascent + fontMetrics.display.descent;

export const maxScaleFor = (variant: TypeVariant) =>
  DISPLAY_VARIANTS.includes(variant) ? fontScaleCap.display : fontScaleCap.text;

/**
 * Padding and margins that keep a Bricolage line of `lineHeight` (< 1.2 em) unclipped while its
 * layout box stays `lineHeight` tall. `scale` is the font scale the text is drawn at.
 * iOS bottom-aligns a squeezed line (the extra goes on top); Android centres it (CSS-like).
 */
export const trimFor = (fontSize: number, lineHeight: number, scale = 1) => {
  const d = (fontSize * NATURAL_LINE - lineHeight) * scale;
  if (!(d > 0.5)) {
    return null;
  }
  return Platform.OS === 'android'
    ? { paddingTop: d / 2, paddingBottom: d / 2, marginTop: -d / 2, marginBottom: -d / 2 }
    : { paddingTop: d, paddingBottom: 0, marginTop: -d / 2, marginBottom: -d / 2 };
};

/**
 * Style generator for a tight Bricolage line drawn with a plain `Text`: font size, designed line
 * height (`ratio` × size, e.g. 0.86 display, 0.96 largeTitle, 1.1 title) and the trim. Replaces
 * the per-screen helpers (HomeParts `tightLine`, layouts/displayTitle.ts): spread it last and add
 * your own vertical margins to the returned ones. `scale` = the drawn font scale
 * (`useEffectiveFontScale(cap)`); AppText does all of this by itself.
 */
export const tight = (fontSize: number, ratio: number, scale = 1): TextStyle => {
  const lineHeight = Math.round(ratio * fontSize * 10) / 10;
  return { fontSize, lineHeight, ...(trimFor(fontSize, lineHeight, scale) ?? {}) };
};

/** First defined value; null when it is not a number (percent, 'auto'). */
const num = (...values: unknown[]): number | null => {
  for (const value of values) {
    if (value !== undefined && value !== null) {
      return typeof value === 'number' ? value : null;
    }
  }
  return 0;
};

/**
 * The trim for an arbitrary text style: null unless it is Bricolage with a line height under
 * 1.2 em. Your own vertical margins and paddings are added in, never replaced.
 */
export const trimStyleFor = (style: StyleProp<TextStyle>, scale = 1): TextStyle | null => {
  const flat = RNStyleSheet.flatten(style) ?? {};
  const { fontFamily: family, fontSize, lineHeight } = flat;
  if (!family || !DISPLAY_FAMILIES.includes(family) || !fontSize || !lineHeight) {
    return null;
  }
  const trim = trimFor(fontSize, lineHeight, scale);
  if (!trim) {
    return null;
  }
  const mt = num(flat.marginTop, flat.marginVertical, flat.margin);
  const mb = num(flat.marginBottom, flat.marginVertical, flat.margin);
  const pt = num(flat.paddingTop, flat.paddingVertical, flat.padding);
  const pb = num(flat.paddingBottom, flat.paddingVertical, flat.padding);
  if (mt === null || mb === null || pt === null || pb === null) {
    // percentages / 'auto': leave the text as it is rather than guess
    return null;
  }
  return {
    marginTop: mt + trim.marginTop,
    marginBottom: mb + trim.marginBottom,
    paddingTop: pt + trim.paddingTop,
    paddingBottom: pb + trim.paddingBottom,
  };
};

/** The font scale a Text is drawn at: the system scale, capped by maxFontSizeMultiplier. */
export const useEffectiveFontScale = (maxFontSizeMultiplier?: number | null, allow = true) => {
  const { fontScale } = useWindowDimensions();
  if (!allow) {
    return 1;
  }
  return maxFontSizeMultiplier && maxFontSizeMultiplier >= 1
    ? Math.min(fontScale, maxFontSizeMultiplier)
    : fontScale;
};

/** Hook form of `trimStyleFor` for your own `Text` / `Animated.Text`: spread it after your style. */
export const useTextTrim = (style: StyleProp<TextStyle>, maxFontSizeMultiplier?: number) =>
  trimStyleFor(style, useEffectiveFontScale(maxFontSizeMultiplier));

export const AppText = ({
  variant = 'body',
  color,
  style,
  trim = true,
  maxFontSizeMultiplier,
  allowFontScaling = true,
  ...props
}: AppTextProps) => {
  const cap = maxFontSizeMultiplier ?? maxScaleFor(variant);
  const scale = useEffectiveFontScale(cap, allowFontScaling);
  const trimStyle = trim ? trimStyleFor([type[variant] as TextStyle, style], scale) : null;
  return (
    <Text
      allowFontScaling={allowFontScaling}
      maxFontSizeMultiplier={cap}
      {...props}
      style={[styles.base, type[variant] as TextStyle, color ? { color } : null, style, trimStyle]}
    />
  );
};

export default AppText;

const styles = StyleSheet.create((theme) => ({
  base: { color: theme.colors.text },
}));
