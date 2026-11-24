import i18n from '../../common/config/i18n';
import { InternalErrors } from '../../common/errors/internal-errors.class';
import ro from './ro/translation.json';
import en from './en/translation.json';

// The two translation files must say the same things: a key in one language and not in the other
// shows the raw key (or the other language) to half of the users.
//
// Plurals use the i18next v3 format (compatibilityJSON: 'v3'): Romanian has three forms,
// `key_0` (1), `key_1` (2–19) and `key_2` (20+, "de"); English has `key` and `key_plural`.

type Tree = { [key: string]: string | Tree };

const flatten = (tree: Tree, prefix = ''): Record<string, string> =>
  Object.entries(tree).reduce<Record<string, string>>((all, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'string'
      ? { ...all, [path]: value }
      : { ...all, ...flatten(value, path) };
  }, {});

const RO = flatten(ro as Tree);
const EN = flatten(en as Tree);

const RO_FORMS = ['_0', '_1', '_2'];
const pluralBasesRo = Object.keys(RO)
  .filter((key) => key.endsWith('_0') && `${key.slice(0, -2)}_1` in RO)
  .map((key) => key.slice(0, -2));
const pluralBasesEn = Object.keys(EN)
  .filter((key) => key.endsWith('_plural'))
  .map((key) => key.slice(0, -'_plural'.length));

// Romanian-only: the "de" variant of a plural, picked with `context: 'de'` for 20, 21… hours.
// English has no such variant: i18next falls back to `description_plural`.
const RO_ONLY = ['activity_log.confirmation_modal.description_de_2'];

// The same text in both languages on purpose (a name, a number format, a word both share).
const SAME_IN_BOTH = [
  'activity_log.total',
  'documents.contract_prefix',
  'documents.viewer.page',
  'events.card.public',
  'events.card.public_tag',
  'general.sex',
  'general.sex_label',
  'notifications.by.options.email',
  'onboarding.sample.org3_meta',
];

// English texts that keep Romanian letters: the place and organization names of the intro samples.
const ROMANIAN_NAMES_IN_ENGLISH = [
  'onboarding.sample.org2_meta',
  'onboarding.sample.event_meta',
  'onboarding.sample.cert_meta',
];

const plainKeys = (
  flat: Record<string, string>,
  bases: string[],
  forms: (base: string) => string[],
) => {
  const pluralKeys = new Set(bases.flatMap(forms));
  return Object.keys(flat).filter((key) => !pluralKeys.has(key));
};
const roForms = (base: string) => RO_FORMS.map((form) => `${base}${form}`);
const enForms = (base: string) => [base, `${base}_plural`];

const placeholders = (text: string) =>
  [...text.matchAll(/{{\s*([\w.]+)\s*}}/g)].map((m) => m[1]).sort();

describe('the Romanian and English translations', () => {
  it('have the same keys (plural forms aside)', () => {
    const roPlain = plainKeys(RO, pluralBasesRo, roForms).filter((key) => !RO_ONLY.includes(key));
    const enPlain = plainKeys(EN, pluralBasesEn, enForms);

    expect(roPlain.filter((key) => !(key in EN))).toEqual([]);
    expect(enPlain.filter((key) => !(key in RO))).toEqual([]);
  });

  it('have the same plurals, each with all its forms', () => {
    expect([...pluralBasesRo].sort()).toEqual([...pluralBasesEn].sort());
    for (const base of pluralBasesRo) {
      expect(roForms(base).filter((key) => !(key in RO))).toEqual([]);
      expect(enForms(base).filter((key) => !(key in EN))).toEqual([]);
    }
  });

  it('the keys only Romanian has are the known ones, and they exist', () => {
    expect(RO_ONLY.filter((key) => !(key in RO))).toEqual([]);
    expect(RO_ONLY.filter((key) => key in EN)).toEqual([]);
  });

  it('use the same {{placeholders}} for the same key', () => {
    const different: string[] = [];
    const compare = (roKey: string, enKey: string) => {
      if (`${placeholders(RO[roKey])}` !== `${placeholders(EN[enKey])}`) {
        different.push(
          `${roKey}: ${placeholders(RO[roKey])} / ${enKey}: ${placeholders(EN[enKey])}`,
        );
      }
    };
    plainKeys(RO, pluralBasesRo, roForms)
      .filter((key) => key in EN)
      .forEach((key) => compare(key, key));
    for (const base of pluralBasesRo) {
      // one ↔ singular, the two "many" forms ↔ plural
      compare(`${base}_0`, base);
      compare(`${base}_1`, `${base}_plural`);
      compare(`${base}_2`, `${base}_plural`);
    }
    expect(different).toEqual([]);
  });

  it.each([
    ['ro', RO],
    ['en', EN],
  ])('%s has no empty text', (_, flat) => {
    expect(Object.keys(flat).filter((key) => flat[key].trim() === '')).toEqual([]);
  });

  it('English has no Romanian letters, besides the names in the intro samples', () => {
    const withDiacritics = Object.keys(EN).filter((key) => /[ăâîșțĂÂÎȘȚ]/.test(EN[key]));
    expect(withDiacritics.sort()).toEqual([...ROMANIAN_NAMES_IN_ENGLISH].sort());
  });

  it('no text was left untranslated: the same in both languages only where it is meant to be', () => {
    const same = Object.keys(RO).filter((key) => key in EN && RO[key] === EN[key]);
    expect(same.sort()).toEqual([...SAME_IN_BOTH].sort());
  });

  it.each(['ro', 'en'])('every message an error class can show exists in %s', (language) => {
    const keys = Object.values(InternalErrors).flatMap((errors) => errors.getKeys());
    expect(keys.length).toBeGreaterThan(50);
    const missing = [...new Set(keys)].filter(
      (key) => !i18n.exists(key, { lng: language, fallbackLng: [] }),
    );
    expect(missing).toEqual([]);
  });
});
