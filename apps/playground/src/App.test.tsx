import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from './App';
import { LANG_STORAGE_KEY } from './i18n';

function open(search: string) {
  history.replaceState(null, '', `/${search}`);
  return render(<App />);
}

const title = () => screen.getByRole('heading', { level: 1 }).textContent;
/** The interface language switch (EN / RU / ҚАЗ) in the sidebar. */
const langButton = (name: string) =>
  within(screen.getAllByRole('group', { name: /language|язык|тілі/i })[0] as HTMLElement).getByRole(
    'button',
    { name },
  );

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
    expect(langButton('EN').getAttribute('aria-pressed')).toBe('true');
  });

  it('switches the chrome, <html lang> and the title, and remembers the choice', () => {
    open('?scene=overview');
    act(() => fireEvent.click(langButton('RU')));
    expect(title()).toBe('Обзор');
    expect(document.documentElement.lang).toBe('ru');
    expect(document.title).toBe('Обзор · Песочница Jafari Charts');
    expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe('ru');
    expect(screen.getByRole('navigation', { name: 'Сцены' })).toBeTruthy();
    expect(screen.getAllByText('Перейти к содержимому').length).toBeGreaterThan(0);

    act(() => fireEvent.click(langButton('ҚАЗ')));
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
    act(() => fireEvent.click(langButton('EN')));
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
    expect(screen.getByRole('combobox').textContent).toContain('Интерфейстегідей');
  });

  it('an explicit ?locale= is shown and kept', () => {
    open('?scene=overview&lang=ru&locale=kk');
    expect(screen.getByRole('combobox').textContent).toContain('Қазақша');
    expect(new URLSearchParams(location.search).get('locale')).toBe('kk');
  });
});
