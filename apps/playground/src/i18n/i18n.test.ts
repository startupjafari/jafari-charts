import { afterEach, describe, expect, it } from 'vitest';
import { SCENES } from '../catalog';
import { en, type Messages } from './en';
import {
  browserLang,
  defineCards,
  enPlural,
  formatNum,
  initialLang,
  kkPlural,
  kkPluralCategory,
  LANG_STORAGE_KEY,
  langOfTag,
  LANGS,
  MESSAGES,
  ruPlural,
} from './index';

/** Every leaf of a catalogue as `path → value`, functions called with sample arguments. */
function leaves(value: unknown, path = ''): Array<[string, unknown]> {
  if (typeof value === 'function') return [[path, (value as (...a: unknown[]) => unknown)(3)]];
  if (value && typeof value === 'object')
    return Object.entries(value).flatMap(([k, v]) => leaves(v, path ? `${path}.${k}` : k));
  return [[path, value]];
}

describe('interface catalogue', () => {
  const english = new Map(leaves(en));

  for (const lang of LANGS) {
    it(`${lang} has exactly the keys of English, none of them empty`, () => {
      const entries = leaves(MESSAGES[lang]);
      expect(entries.map(([k]) => k).sort()).toEqual([...english.keys()].sort());
      for (const [key, text] of entries) {
        expect(typeof text, key).toBe('string');
        if (key !== 'groups.start.description') expect(text, key).not.toBe('');
      }
    });
  }

  for (const lang of ['ru', 'kk'] as const) {
    it(`${lang} translates the chrome (only names and codes stay as in English)`, () => {
      const same = leaves(MESSAGES[lang])
        .filter(([key, text]) => text !== '' && english.get(key) === text)
        .map(([key]) => key);
      expect(same).toEqual(['app.name']);
    });

    it(`${lang} texts are Cyrillic`, () => {
      expect(MESSAGES[lang].preview.language).toMatch(/[А-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі]/);
      for (const scene of SCENES) expect(MESSAGES[lang].scenes[scene.id].title).toMatch(/[А-я]/);
    });
  }

  it('Kazakh uses Kazakh letters, not Russian look-alikes only', () => {
    const all = leaves(MESSAGES.kk)
      .map(([, text]) => text)
      .join(' ');
    expect(all).toMatch(/[ӘәҒғҚқҢңӨөҰұҮүІі]/);
  });

  it('interpolates values into texts', () => {
    expect(MESSAGES.en.notFound.subtitle('nope')).toBe('There is no scene called “nope”.');
    expect(MESSAGES.ru.notFound.subtitle('nope')).toBe('Сцены «nope» не существует.');
    expect(MESSAGES.kk.app.documentTitle('Шолу')).toBe('Шолу · Jafari Charts сынақ алаңы');
  });

  it('a card missing in one language does not compile', () => {
    const ok = defineCards({
      en: { a: { title: 'A', description: 'a' } },
      ru: { a: { title: 'А', description: 'а' } },
      kk: { a: { title: 'Ә', description: 'ә' } },
    });
    expect(ok.kk.a.title).toBe('Ә');
    defineCards({
      en: { a: { title: 'A', description: 'a' } },
      // @ts-expect-error the Russian card `a` is missing
      ru: {},
      kk: { a: { title: 'Ә', description: 'ә' } },
    });
    // @ts-expect-error a language without every shared message is not a `Messages`
    const partial: Messages = { ...en, sections: { showcase: 'x', edgeCases: 'y' } };
    expect(partial).toBeTruthy();
  });
});

describe('plurals', () => {
  it('Russian: one / few / many', () => {
    const forms = ['диаграмма', 'диаграммы', 'диаграмм'] as const;
    const cases: Array<[number, string]> = [
      [0, 'диаграмм'],
      [1, 'диаграмма'],
      [2, 'диаграммы'],
      [4, 'диаграммы'],
      [5, 'диаграмм'],
      [11, 'диаграмм'],
      [12, 'диаграмм'],
      [14, 'диаграмм'],
      [21, 'диаграмма'],
      [22, 'диаграммы'],
      [25, 'диаграмм'],
      [101, 'диаграмма'],
      [111, 'диаграмм'],
      [1000, 'диаграмм'],
    ];
    for (const [n, word] of cases) expect(ruPlural(n, forms), String(n)).toBe(word);
    expect(MESSAGES.ru.sections.chartCount(3)).toBe('3 диаграммы');
    expect(MESSAGES.ru.sections.chartCount(11)).toBe('11 диаграмм');
  });

  it('Kazakh follows Intl.PluralRules("kk"): one for 1, other otherwise', () => {
    const rules = new Intl.PluralRules('kk');
    for (const n of [0, 1, 2, 5, 11, 21, 100]) {
      expect(kkPluralCategory(n)).toBe(rules.select(n) === 'one' ? 'one' : 'other');
    }
    expect(kkPlural(1, ['a', 'b'])).toBe('a');
    expect(kkPlural(7, ['a', 'b'])).toBe('b');
    // After a numeral the noun stays singular in Kazakh.
    expect(MESSAGES.kk.sections.chartCount(5)).toBe('5 диаграмма');
  });

  it('English: one / other', () => {
    expect(enPlural(1, ['chart', 'charts'])).toBe('chart');
    expect(MESSAGES.en.sections.chartCount(1)).toBe('1 chart');
    expect(MESSAGES.en.sections.chartCount(9)).toBe('9 charts');
  });

  it('formats numbers in the interface language', () => {
    expect(formatNum('en', 10000)).toBe('10,000');
    expect(formatNum('ru', 10000)).toBe('10 000');
    expect(formatNum('kk', 10000)).toBe('10 000');
    expect(formatNum('ru', 12.34, { minimumFractionDigits: 1, maximumFractionDigits: 1 })).toBe(
      '12,3',
    );
  });
});

describe('language detection', () => {
  afterEach(() => localStorage.clear());

  it('maps tags: ru* → ru, kk*/kz* → kk, en* → en, others → null', () => {
    expect(langOfTag('ru-RU')).toBe('ru');
    expect(langOfTag('kk')).toBe('kk');
    expect(langOfTag('kk-KZ')).toBe('kk');
    expect(langOfTag('kz')).toBe('kk');
    expect(langOfTag('en-GB')).toBe('en');
    expect(langOfTag('de-DE')).toBeNull();
    expect(langOfTag('')).toBeNull();
  });

  it('takes the first supported browser language, English otherwise', () => {
    expect(browserLang(['de-DE', 'ru-RU', 'en-US'])).toBe('ru');
    expect(browserLang(['kk-KZ', 'ru'])).toBe('kk');
    expect(browserLang(['en-US', 'ru'])).toBe('en');
    expect(browserLang(['fr', 'de'])).toBe('en');
    expect(browserLang([])).toBe('en');
  });

  it('?lang= wins over the saved choice, which wins over the browser', () => {
    expect(initialLang('')).toBe(browserLang());
    localStorage.setItem(LANG_STORAGE_KEY, 'kk');
    expect(initialLang('')).toBe('kk');
    expect(initialLang('?scene=gallery&lang=ru')).toBe('ru');
    expect(initialLang('?lang=xx')).toBe('kk');
    localStorage.setItem(LANG_STORAGE_KEY, 'garbage');
    expect(initialLang('')).toBe(browserLang());
  });
});
