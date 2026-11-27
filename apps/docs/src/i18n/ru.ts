import type { Messages } from './en';

/** Russian UI strings. Typed as `Messages`: a missing or extra key is a compile error. */
export const ru: Messages = {
  langName: 'Русский',
  meta: {
    description:
      'Jafari Charts — библиотека диаграмм для React, написанная с нуля. Спроектирована для производительности. Красивые диаграммы. Без компромиссов.',
    tagline: 'Спроектирована для производительности. Красивые диаграммы. Без компромиссов.',
  },
  a11y: {
    skipToContent: 'Перейти к содержимому',
    openNavigation: 'Открыть навигацию',
    closeNavigation: 'Закрыть навигацию',
    home: 'Jafari Charts — на главную',
    primaryNav: 'Основная навигация',
    docsNav: 'Документация',
    sidebar: 'Боковая панель',
    prevNext: 'Предыдущая и следующая страницы',
    onThisPage: 'На этой странице',
    language: 'Язык',
    breadcrumb: 'Навигационная цепочка',
    backToTop: 'Наверх',
    sectionLink: (title) => `Ссылка на раздел «${title}»`,
  },
  theme: {
    label: 'Цветовая тема',
    light: 'Светлая',
    dark: 'Тёмная',
    system: 'Системная',
  },
  search: {
    label: 'Фильтр страниц',
    placeholder: 'Найти страницу…',
    clear: 'Очистить фильтр',
    empty: (query) => `Нет страниц по запросу «${query}».`,
    results: (count) => {
      const n = count % 100;
      const last = n % 10;
      const word =
        n > 10 && n < 20
          ? 'страниц'
          : last === 1
            ? 'страница'
            : last >= 2 && last <= 4
              ? 'страницы'
              : 'страниц';
      return `${count} ${word}`;
    },
  },
  top: {
    docs: 'Документация',
    charts: 'Диаграммы',
    playground: 'Песочница',
    examples: 'Примеры',
    performance: 'Производительность',
  },
  nav: {
    gettingStarted: 'Начало работы',
    charts: 'Диаграммы',
    advancedCharts: 'Продвинутые диаграммы',
    professionalCharts: 'Профессиональные диаграммы',
    guides: 'Руководства',
    tools: 'Инструменты',
    reference: 'Справочник',
  },
  pages: {
    home: 'Главная',
    introduction: 'Введение',
    installation: 'Установка',
    quickStart: 'Быстрый старт',
    charts: 'Диаграммы',
    allCharts: 'Все диаграммы',
    components: 'Компоненты',
    themes: 'Темы',
    performance: 'Производительность',
    playground: 'Песочница',
    examples: 'Примеры',
    api: 'Справочник API',
    changelog: 'Журнал изменений',
    github: 'GitHub',
    notFound: 'Страница не найдена',
  },
  pager: { previous: 'Предыдущая', next: 'Следующая' },
  chartPage: {
    whenToUse: 'Когда использовать',
    import: 'Импорт',
    install: 'Установка',
  },
  footer: {
    rendered:
      'Все диаграммы на этом сайте построены с помощью Jafari Charts. © Mehman Jafari · MIT (планируется).',
  },
  chartGroups: {
    Core: 'Базовые',
    Advanced: 'Продвинутые',
    Professional: 'Профессиональные',
  },
  chartEyebrow: (group, title) =>
    `${{ Core: 'Базовые', Advanced: 'Продвинутые', Professional: 'Профессиональные' }[group]} диаграммы · ${title}`,
  example: {
    themeAuto: 'Авто',
    themeLight: 'Светлая',
    themeDark: 'Тёмная',
    widthFill: 'Полная',
    previewTheme: (title) => `Тема превью: ${title}`,
    previewWidth: (title) => `Ширина превью: ${title}`,
    preview: 'Превью',
    code: 'Код',
    views: (title) => `${title}: превью или код`,
    showCode: 'Показать код',
    hideCode: 'Скрыть код',
    loadingCode: 'Загрузка кода…',
  },
  code: {
    files: 'Файлы',
    code: 'Код',
    codeOf: (name) => `Код: ${name}`,
    copy: 'Копировать',
    copied: 'Скопировано',
    copyFailed: 'Не удалось скопировать',
  },
  propsTable: {
    prop: 'Проп',
    type: 'Тип',
    default: 'По умолчанию',
    description: 'Описание',
    required: 'обязательный',
    requiredTitle: 'Обязательный',
    none: 'нет',
  },
  errors: {
    failed: (subject) => `Не удалось отобразить ${subject}.`,
    page: 'эту страницу',
    thisExample: 'этот пример',
    example: (title) => `пример «${title}»`,
    chart: 'диаграмму',
    code: 'исходный код',
  },
};
