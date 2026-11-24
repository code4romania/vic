import ro from './ro/translation.json';
import en from './en/translation.json';
import { InternalErrors } from '../../common/errors/internal-errors.class';
import { ErrorClass } from '../../common/errors/base-error.class';

// The two translation files must say the same things. A key added to one language only would show
// the other language (or the raw key) to half of the users, so this spec fails until both have it.

type Tree = { [key: string]: Tree | string | string[] };
type Leaf = string | string[];

const flatten = (tree: Tree, prefix = ''): Record<string, Leaf> =>
  Object.entries(tree).reduce<Record<string, Leaf>>((all, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'string' || Array.isArray(value)
      ? { ...all, [path]: value }
      : { ...all, ...flatten(value, path) };
  }, {});

const FILES = { ro: flatten(ro as Tree), en: flatten(en as Tree) };
type Lang = keyof typeof FILES;
const LANGS = Object.keys(FILES) as Lang[];

// i18next (JSON v4) plural keys: "found_one", "found_few", "found_other". Romanian has three forms,
// English two, so the files differ in these suffixes and nowhere else. "_zero" is an optional extra.
const PLURAL = /_(zero|one|two|few|many|other)$/;
const pluralBase = (key: string, keys: Record<string, Leaf>): string | null => {
  const match = key.match(PLURAL);
  if (!match) return null;
  const base = key.slice(0, -match[0].length);
  return `${base}_other` in keys ? base : null;
};
const normalized = (lang: Lang): string[] =>
  Array.from(new Set(Object.keys(FILES[lang]).map((key) => pluralBase(key, FILES[lang]) ?? key)));

const text = (value: Leaf): string => (Array.isArray(value) ? value.join('\n') : value);
const placeholders = (value: Leaf): string[] =>
  Array.from(
    new Set(Array.from(text(value).matchAll(/{{\s*([\w.]+)/g), (match) => match[1])),
  ).sort();

describe('ro and en translation files', () => {
  it('have the same keys', () => {
    const [roKeys, enKeys] = [normalized('ro'), normalized('en')];
    expect(roKeys.filter((key) => !enKeys.includes(key))).toEqual([]);
    expect(enKeys.filter((key) => !roKeys.includes(key))).toEqual([]);
  });

  it.each(LANGS)('%s: every plural has exactly the forms the language needs', (lang) => {
    const needed = new Intl.PluralRules(lang).resolvedOptions().pluralCategories;
    const keys = FILES[lang];
    const groups: Record<string, string[]> = {};
    Object.keys(keys).forEach((key) => {
      const base = pluralBase(key, keys);
      if (base) (groups[base] ??= []).push(key.slice(base.length + 1));
    });

    const wrong = Object.entries(groups)
      .filter(([, forms]) => {
        const withoutZero = forms.filter((form) => form !== 'zero').sort();
        return JSON.stringify(withoutZero) !== JSON.stringify([...needed].sort());
      })
      .map(([base, forms]) => `${base}: ${forms.join(', ')} (needs ${needed.join(', ')})`);
    expect(wrong).toEqual([]);
  });

  it('use the same {{placeholders}} for a key in both languages', () => {
    const different = Object.keys(FILES.ro)
      .filter((key) => key in FILES.en)
      .filter(
        (key) =>
          JSON.stringify(placeholders(FILES.ro[key])) !==
          JSON.stringify(placeholders(FILES.en[key])),
      );
    expect(different).toEqual([]);
  });

  it('a list has the same number of entries in both languages', () => {
    const different = Object.keys(FILES.ro).filter(
      (key) =>
        Array.isArray(FILES.ro[key]) &&
        (FILES.ro[key] as string[]).length !== (FILES.en[key] as string[] | undefined)?.length,
    );
    expect(different).toEqual([]);
  });

  it.each(LANGS)('%s: no empty text', (lang) => {
    const empty = Object.entries(FILES[lang])
      .filter(([, value]) => !text(value).trim())
      .map(([key]) => key);
    expect(empty).toEqual([]);
  });

  it('en: no Romanian letters, so no text left untranslated', () => {
    const romanian = Object.entries(FILES.en)
      .filter(([, value]) => /[ăâîșțşţ]/i.test(text(value)))
      .map(([key]) => key);
    expect(romanian).toEqual([]);
  });

  // Words that are the same in both languages. A new identical value is either one of these or a
  // text someone forgot to translate: add it here only in the first case.
  const SAME_IN_BOTH = [
    'Active',
    'Backup',
    'Contact',
    'Contract',
    'Contract 2023',
    'Contracts.xlsx',
    'Dashboard',
    'Document',
    'Email',
    'Email*',
    'Export',
    'Inactive',
    'Login',
    'Logo',
    'PDF',
    'Sex {{sex_type}}',
    'Status',
    'Status*',
    'Target',
    'Template*',
    'Templates.xlsx',
    'Website',
    'active',
  ];
  // only placeholders, digits, units and punctuation: nothing to translate
  const hasNoWords = (value: string): boolean =>
    !/[a-zăâîșț]{2,}/i.test(value.replace(/{{[^}]*}}/g, ''));

  it('en: differs from ro, apart from the words both languages share', () => {
    const untranslated = Object.entries(FILES.en)
      .filter(([key, value]) => text(value) === text(FILES.ro[key] ?? ''))
      .filter(([, value]) => !SAME_IN_BOTH.includes(text(value)) && !hasNoWords(text(value)))
      .map(([key, value]) => `${key}: ${text(value)}`);
    expect(untranslated).toEqual([]);
  });

  it.each(LANGS)('%s: every message an error class can show exists', (lang) => {
    const classes = Object.values(InternalErrors).filter(
      (value): value is ErrorClass<string> => value instanceof ErrorClass,
    );
    expect(classes.length).toBeGreaterThan(10);

    // "auth:errors.AUTH_001" → "auth.errors.AUTH_001"
    const keys = Array.from(new Set(classes.flatMap((errors) => errors.getKeys()))).map((key) =>
      key.replace(':', '.'),
    );
    expect(keys.length).toBeGreaterThan(50);
    expect(keys.filter((key) => !(key in FILES[lang]))).toEqual([]);
  });
});
