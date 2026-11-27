import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { App } from './App';
import { LANG_STORAGE_KEY } from './i18n';

function open(search: string) {
  history.replaceState(null, '', `/${search}`);
  return render(<App />);
}

const title = () => screen.getByRole('heading', { level: 1 }).textContent;

// Radix Select scrolls the chosen option into view and captures the pointer: jsdom has
// neither API.
beforeAll(() => {
  Element.prototype.scrollIntoView ??= () => {};
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.releasePointerCapture ??= () => {};
});

/** The interface language select (StudentHub's: flags and endonyms) in the sidebar. */
const langSelect = () =>
  screen.getAllByRole('combobox', {
    name: /^(Interface language|Язык интерфейса|Интерфейс тілі)$/,
  })[0] as HTMLElement;

/** Opens the language select from the keyboard and picks a language by its endonym. */
function chooseLang(name: string) {
  act(() => fireEvent.keyDown(langSelect(), { key: 'Enter' }));
  act(() => fireEvent.click(screen.getByRole('option', { name })));
}

describe('interface language switch', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    localStorage.clear();
    document.documentElement.lang = 'en';
  });

  it('starts in English in an English browser, without a stored choice', () => {
    open('?scene=overview');
    expect(title()).toBe('Overview');
    expect(document.documentElement.lang).toBe('en');
    expect(document.title).toBe('Overview · Jafari Charts Playground');
    expect(langSelect().textContent).toBe('English');
  });

  it('switches the chrome, <html lang> and the title, and remembers the choice', () => {
    open('?scene=overview');
    chooseLang('Русский');
    expect(title()).toBe('Обзор');
    expect(document.documentElement.lang).toBe('ru');
    expect(document.title).toBe('Обзор · Песочница Jafari Charts');
    expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe('ru');
    expect(screen.getByRole('navigation', { name: 'Сцены' })).toBeTruthy();
    expect(screen.getAllByText('Перейти к содержимому').length).toBeGreaterThan(0);

    chooseLang('Қазақша');
    expect(title()).toBe('Шолу');
    expect(document.documentElement.lang).toBe('kk');
    expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe('kk');
    expect(screen.getAllByText('Сынақ алаңы').length).toBeGreaterThan(0);
  });

  it('restores the saved language on the next visit', () => {
    localStorage.setItem(LANG_STORAGE_KEY, 'kk');
    open('?scene=gallery');
    expect(title()).toBe('Галерея');
    expect(screen.getAllByText('Аймақтық диаграмма').length).toBe(1);
  });

  it('?lang= overrides the saved choice; switching drops it from the address', () => {
    localStorage.setItem(LANG_STORAGE_KEY, 'kk');
    open('?scene=overview&lang=ru');
    expect(title()).toBe('Обзор');
    chooseLang('English');
    expect(title()).toBe('Overview');
    expect(new URLSearchParams(location.search).has('lang')).toBe(false);
    expect(new URLSearchParams(location.search).get('scene')).toBe('overview');
    expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe('en');
  });

  it('keeps English card test ids in every language', () => {
    open('?scene=polar&lang=ru&animation=off');
    const card = screen.getByTestId('Donut chart');
    expect(within(card).getByRole('heading').textContent).toBe('Кольцевая диаграмма');
    expect(screen.getByText('5 диаграмм')).toBeTruthy();
  });

  it('chart locale follows the interface language unless ?locale= is set', () => {
    open('?scene=overview&lang=kk');
    expect(langSelect().textContent).toBe('Қазақша');
    expect(screen.getByRole('combobox', { name: 'Сандар мен күндер пішімі' }).textContent).toBe(
      'Интерфейстегідей',
    );
  });

  it('an explicit ?locale= is shown and kept', () => {
    open('?scene=overview&lang=ru&locale=kk');
    expect(screen.getByRole('combobox', { name: 'Локаль чисел и дат' }).textContent).toBe(
      'Қазақша',
    );
    expect(new URLSearchParams(location.search).get('locale')).toBe('kk');
  });
});

describe('preview controls (StudentHub components)', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  const optionNames = () => screen.getAllByRole('option').map((o) => o.textContent);

  it('lists languages in StudentHub order, each with its flag', () => {
    open('?scene=overview');
    act(() => fireEvent.keyDown(langSelect(), { key: 'Enter' }));
    expect(optionNames()).toEqual(['Русский', 'Қазақша', 'English']);
    for (const option of screen.getAllByRole('option')) {
      expect(option.querySelector('[lang] > svg')).toBeTruthy();
    }
  });

  it('switches the theme from a select of System, Light and Dark', () => {
    open('?scene=overview&theme=light');
    const theme = screen.getByRole('combobox', { name: 'Theme' });
    expect(theme.textContent).toBe('Light');
    act(() => fireEvent.keyDown(theme, { key: 'Enter' }));
    expect(optionNames()).toEqual(['System', 'Light', 'Dark']);
    act(() => fireEvent.click(screen.getByRole('option', { name: 'Dark' })));
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(new URLSearchParams(location.search).has('theme')).toBe(false);
  });

  it('turns entry animations off with a switch', () => {
    open('?scene=overview');
    const toggle = screen.getByRole('switch', { name: 'Entry animations' });
    expect(toggle.getAttribute('aria-checked')).toBe('true');
    act(() => fireEvent.click(toggle));
    expect(toggle.getAttribute('aria-checked')).toBe('false');
    expect(new URLSearchParams(location.search).get('animation')).toBe('off');
  });
});
