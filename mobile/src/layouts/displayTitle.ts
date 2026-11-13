/**
 * Bricolage Grotesque title metrics for the auth, onboarding and layout titles.
 *
 * The font's ascent (.93em) and descent (.27em) are tall, so with the tight line height of the
 * handbook (≈ .96em for large titles) the accents of Î / Ș / Ă and the commas of ș / ț reach
 * outside the text box: iOS lays the glyphs from the bottom of a short line (no baseline offset
 * when the line is shorter than the font), Android clips at the view's edge. The box gets that
 * headroom as padding, cancelled by negative margins, so the layout keeps the tight line height
 * and nothing is clipped. Letter spacing is in points, computed for the size used.
 */
export const displayTitle = (size: number, ratio = 0.96, tracking = -0.04) => {
  const top = Math.ceil(size * 0.18);
  const bottom = Math.ceil(size * 0.1);
  return {
    fontSize: size,
    lineHeight: Math.round(size * ratio),
    letterSpacing: Math.round(size * tracking * 100) / 100,
    includeFontPadding: false,
    paddingTop: top,
    marginTop: -top,
    paddingBottom: bottom,
    marginBottom: -bottom,
  };
};

export default displayTitle;
