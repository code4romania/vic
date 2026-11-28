import { fitTitleSize, TITLE_MAX_SIZE, TITLE_MIN_SIZE } from './title-fit';

describe('fitTitleSize (event hero title)', () => {
  it('keeps short titles at the full size', () => {
    expect(fitTitleSize('Plantare de copaci', 255)).toBe(TITLE_MAX_SIZE);
  });

  it('shrinks so "supermarketuri" fits beside the date block (Andrew, 28 Nov)', () => {
    const size = fitTitleSize('Colectă de alimente în supermarketuri', 255);
    expect(size).toBeLessThan(TITLE_MAX_SIZE);
    // its measured width is 7.37em: it fits at the chosen size
    expect(7.37 * size).toBeLessThanOrEqual(255);
  });

  it('accounts for the font scale and never goes under the minimum', () => {
    expect(fitTitleSize('supermarketuri', 255, 1.15)).toBeLessThan(
      fitTitleSize('supermarketuri', 255),
    );
    expect(fitTitleSize('Supercalifragilisticexpialidocious', 200)).toBe(TITLE_MIN_SIZE);
  });

  it('uses the full size before the column is measured', () => {
    expect(fitTitleSize('supermarketuri', 0)).toBe(TITLE_MAX_SIZE);
  });
});
