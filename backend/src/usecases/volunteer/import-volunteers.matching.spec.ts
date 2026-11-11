import { CityRow, matchCities, normalize } from './import-volunteers.usecase';

// #637: city names now carry diacritics; files written without them (or with ş/ţ cedilla) still match.
describe('import volunteers: city matching', () => {
  const cities: CityRow[] = [
    { id: 1, name: 'Târgu Mureș', county: 'Mureș', abbreviation: 'MS' },
    { id: 2, name: 'Ștefănești', county: 'Argeș', abbreviation: 'AG' },
    { id: 3, name: 'Ștefănești', county: 'Botoșani', abbreviation: 'BT' },
    { id: 4, name: 'Brașov', county: 'Brașov', abbreviation: 'BV' },
    { id: 5, name: 'Reșița', county: 'Caraș-Severin', abbreviation: 'CS' },
  ];
  const ids = (city: string, county = ''): number[] =>
    matchCities(cities, city, county).map(({ id }) => id);

  it('folds case, spaces and every Romanian diacritic, comma below or cedilla', () => {
    expect(normalize('  TÂRGU   Mureș ')).toBe('targu mures');
    expect(normalize('Târgu Mureş')).toBe('targu mures');
    expect(normalize('ŞTEFĂNEŞTI')).toBe(normalize('Ștefănești'));
    expect(normalize('Ţăndărei')).toBe('tandarei');
    expect(normalize('Ilieni Îngust')).toBe('ilieni ingust');
  });

  it('finds a city with diacritics from a name written without them', () => {
    expect(ids('Targu Mures')).toEqual([1]);
    expect(ids('targu mures', 'mures')).toEqual([1]);
    expect(ids('BRASOV', 'Brasov')).toEqual([4]);
  });

  it('finds it from ş and ţ with cedilla (older keyboards and Windows-1250 files)', () => {
    expect(ids('Târgu Mureş', 'Mureş')).toEqual([1]);
    expect(ids('Reşiţa', 'Caras Severin')).toEqual([5]);
  });

  it('narrows same-named cities by county name or abbreviation', () => {
    expect(ids('Stefanesti')).toEqual([2, 3]);
    expect(ids('Stefanesti', 'Arges')).toEqual([2]);
    expect(ids('ştefăneşti', 'bt')).toEqual([3]);
  });

  it('does not match another county or another city', () => {
    expect(ids('Targu Mures', 'Cluj')).toEqual([]);
    expect(ids('Targu')).toEqual([]);
  });
});
