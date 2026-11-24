import {
  LANGUAGE_STORAGE_KEY,
  detectBrowserLanguage,
  initialLanguage,
  readStoredLanguage,
  storeLanguage,
} from './language';

const browserLanguage = (language: string) =>
  vi.spyOn(window.navigator, 'language', 'get').mockReturnValue(language);

describe('language detection and the choice kept on this browser', () => {
  afterEach(() => vi.restoreAllMocks());

  it.each([
    ['ro-RO', 'ro'],
    ['ro', 'ro'],
    ['en-US', 'en'],
    ['en-GB', 'en'],
    ['EN', 'en'],
    // every other language starts in Romanian
    ['hu-HU', 'ro'],
    ['de', 'ro'],
    ['', 'ro'],
  ])('a browser set to "%s" starts in %s', (browser, expected) => {
    browserLanguage(browser);
    expect(detectBrowserLanguage()).toBe(expected);
    expect(initialLanguage()).toBe(expected);
  });

  it('the stored language wins over the browser', () => {
    browserLanguage('en-US');
    storeLanguage('ro', false);
    expect(initialLanguage()).toBe('ro');

    browserLanguage('ro-RO');
    storeLanguage('en', true);
    expect(initialLanguage()).toBe('en');
  });

  it('remembers whether the choice still has to reach the account', () => {
    storeLanguage('en', true);
    expect(readStoredLanguage()).toEqual({ language: 'en', pending: true });
    storeLanguage('en', false);
    expect(readStoredLanguage()).toEqual({ language: 'en', pending: false });
  });

  it.each([
    ['not json', '{oops'],
    ['an unknown language', JSON.stringify({ language: 'fr', pending: false })],
    ['another shape', JSON.stringify('en')],
  ])('ignores a stored value that is %s', (_, raw) => {
    browserLanguage('en-US');
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, raw);
    expect(readStoredLanguage()).toBeNull();
    expect(initialLanguage()).toBe('en');
  });

  it('works without localStorage (blocked site data)', () => {
    browserLanguage('en-US');
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied');
    });
    expect(() => storeLanguage('ro', true)).not.toThrow();
    expect(initialLanguage()).toBe('en');
  });
});
