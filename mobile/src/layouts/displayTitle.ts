/**
 * Bricolage Grotesque title metrics for the auth, onboarding and layout titles: font size, the
 * handbook's tight line height (≈ .96em for large titles, 1.1 for titles) and letter spacing in
 * points for the size used. Only for `AppText`, which trims tight Bricolage lines itself (padding
 * and negative margins, see design/components/Text.tsx), so nothing here adds a trim. For a plain
 * `Text`, use `tight()` from design/components/Text instead.
 */
export const displayTitle = (size: number, ratio = 0.96, tracking = -0.04) => ({
  fontSize: size,
  lineHeight: Math.round(size * ratio),
  letterSpacing: Math.round(size * tracking * 100) / 100,
  includeFontPadding: false,
});

export default displayTitle;
