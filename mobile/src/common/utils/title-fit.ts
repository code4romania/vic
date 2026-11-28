// The event page's big title („Îndrăzneț” hero) sits beside the date block. A long word such as
// „supermarketuri” did not fit its column and iOS cut it mid-word ("supermarketur / i"). The title
// is now a bit smaller (32 instead of 38) and shrinks further, down to 22, until its longest word
// fits on one line.

export const TITLE_MAX_SIZE = 32;
export const TITLE_MIN_SIZE = 22;
// width of a character of Bricolage Grotesque 800 at 1pt with the title's -0.035em tracking:
// 0.53 for "supermarketuri", up to 0.6 for wide words; 0.6 leaves room for both
const CHAR_EM = 0.6;

/** The title size, in points before the font scale, so that its longest word fits `width`. */
export const fitTitleSize = (title: string, width: number, fontScale = 1): number => {
  const longest = Math.max(0, ...title.split(/\s+/).map((word) => [...word].length));
  if (!width || !longest) {
    return TITLE_MAX_SIZE;
  }
  const fitting = Math.floor(width / (longest * CHAR_EM * fontScale));
  return Math.max(TITLE_MIN_SIZE, Math.min(TITLE_MAX_SIZE, fitting));
};
