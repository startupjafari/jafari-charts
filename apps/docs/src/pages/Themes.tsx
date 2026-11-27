import { cssVar, darkTheme, lightTheme, palette, type ThemeTokens } from '@startupjafari/charts';
import { useLang, useT, useText, type L } from '../i18n';
import { Callout, PageHeader, Section } from '../ui/Callout';
import { CodeBlock } from '../ui/CodeBlock';
import { Example } from '../ui/Example';

type TokenName = Exclude<keyof ThemeTokens, 'series'>;

const TOKEN_NOTES: Record<TokenName, L<string>> = {
  background: {
    en: 'Surface behind the chart; also the 2 px ring around markers.',
    ru: 'Фон под диаграммой; также кольцо толщиной 2 px вокруг маркеров.',
  },
  surface: {
    en: 'Tooltip and popover surface.',
    ru: 'Фон подсказок и всплывающих панелей.',
  },
  textPrimary: {
    en: 'Values, titles, centre labels.',
    ru: 'Значения, заголовки, подписи в центре.',
  },
  textSecondary: {
    en: 'Axis labels, legend, tooltip labels.',
    ru: 'Подписи осей, легенда, подписи в подсказке.',
  },
  textMuted: {
    en: 'Reference lines, de-emphasised text.',
    ru: 'Опорные линии, второстепенный текст.',
  },
  border: { en: 'Tooltip and button borders.', ru: 'Границы подсказок и кнопок.' },
  grid: { en: 'Gridlines.', ru: 'Линии сетки.' },
  axis: {
    en: 'Axis baselines and the zero line.',
    ru: 'Базовые линии осей и нулевая линия.',
  },
  crosshair: { en: 'Crosshair line.', ru: 'Линия перекрестия.' },
  track: {
    en: 'Unfilled tracks (radial progress, gauge) and placeholders.',
    ru: 'Незаполненные дорожки (радиальный прогресс, gauge) и заглушки.',
  },
  focus: {
    en: 'Focus rings and brush selection.',
    ru: 'Кольца фокуса и выделение диапазона (brush).',
  },
  onFill: { en: 'Text drawn inside filled marks.', ru: 'Текст внутри залитых меток.' },
  positive: {
    en: 'Increases (waterfall), good values.',
    ru: 'Рост (каскадная диаграмма), хорошие значения.',
  },
  negative: {
    en: 'Decreases (waterfall), bad values.',
    ru: 'Снижение (каскадная диаграмма), плохие значения.',
  },
  warning: {
    en: 'Warnings (gauge bands).',
    ru: 'Предупреждения (цветовые диапазоны gauge).',
  },
  neutral: { en: 'Neutral values.', ru: 'Нейтральные значения.' },
  fontFamily: {
    en: 'Font family (inherits from the page).',
    ru: 'Семейство шрифтов (наследуется от страницы).',
  },
  fontSize: {
    en: 'Tick and label size.',
    ru: 'Размер подписей делений и других подписей.',
  },
  fontSizeSmall: { en: 'Small text.', ru: 'Мелкий текст.' },
  fontSizeLarge: { en: 'Large text.', ru: 'Крупный текст.' },
  radius: { en: 'Bar corner radius.', ru: 'Радиус скругления столбцов.' },
  tooltipRadius: { en: 'Tooltip corner radius.', ru: 'Радиус скругления подсказки.' },
  tooltipShadow: { en: 'Tooltip shadow.', ru: 'Тень подсказки.' },
  duration: { en: 'Transition duration.', ru: 'Длительность переходов.' },
  easing: { en: 'Transition easing.', ru: 'Функция плавности переходов.' },
};

const TOKENS = Object.keys(TOKEN_NOTES) as TokenName[];

const en = {
  lead: 'Every visual parameter is a design token exposed as a CSS custom property (--jc-*). Themes are just token values — switch them with a prop, a provider or plain CSS.',
  modes: {
    title: 'Light, dark and auto',
    body: (
      <>
        <p>
          <code>theme="auto"</code> (the default) follows <strong>the host application</strong>, not
          the operating system:
        </p>
        <ol>
          <li>
            a <code>.dark</code>, <code>[data-theme=dark]</code>, <code>[data-mode=dark]</code> or{' '}
            <code>[data-color-scheme=dark]</code> ancestor (Tailwind, next-themes) → dark; the{' '}
            <code>.light</code> equivalents force light;
          </li>
          <li>
            otherwise the app’s <code>color-scheme</code>, through CSS <code>light-dark()</code>;
          </li>
          <li>an app that declares no dark support stays light even when the OS is dark.</li>
        </ol>
        <p>
          This site toggles a <code>dark</code> class on <code>&lt;html&gt;</code>; every chart uses{' '}
          <code>theme="auto"</code>. The per-example Light/Dark switches add a <code>.light</code>/
          <code>.dark</code> class to the preview.
        </p>
      </>
    ),
    example: 'Forced and automatic modes',
  },
  createTheme: {
    body: (
      <p>
        <code>createTheme</code> overrides any tokens, for every mode or per mode. Pass the result
        to a chart’s <code>theme</code> prop or to <code>ChartProvider</code>. Overrides for all
        modes are inlined as CSS variables; per-mode overrides are scoped to the chart with a
        generated style element.
      </p>
    ),
    example: 'Brand theme',
  },
  css: {
    title: 'Plain CSS',
    body: (
      <p>
        Tokens are CSS custom properties on <code>.jc-root</code>, so a stylesheet is enough:
      </p>
    ),
    example: 'Tokens set inline',
    calloutTitle: 'Canvas uses the same colours',
    calloutBody: (
      <>
        The Canvas renderer resolves colours through a hidden probe element, so it paints exactly
        what CSS computes — including <code>light-dark()</code>, <code>color-mix()</code> and CSS
        variables.
      </>
    ),
  },
  palette: {
    title: 'Categorical palette',
    body: (
      <p>
        Series colours are assigned in order. The order was validated for colour-vision deficiency:
        every adjacent pair stays distinguishable (OKLab ΔE ≥ 8 under protanopia/deuteranopia
        simulation) in both modes, so stacks, legends and neighbouring bars stay readable. Dark mode
        uses darker steps of the same hues. For identity without colour, use{' '}
        <code>differentiate</code>.
      </p>
    ),
    brand: (
      <p>
        The brand palette is exported as <code>palette</code>:
      </p>
    ),
  },
  tokens: {
    title: 'Token reference',
    body: (
      <p>
        Names as used by <code>createTheme</code> and <code>cssVar()</code>, with their CSS
        variables and default values.
      </p>
    ),
  },
  table: {
    slot: 'Slot',
    token: 'Token',
    light: 'Light',
    dark: 'Dark',
    usedFor: 'Used for',
  },
};

const TEXT: L<typeof en> = {
  en,
  ru: {
    lead: 'Каждый визуальный параметр — это дизайн-токен, доступный как пользовательское CSS-свойство (--jc-*). Тема — это просто набор значений токенов: переключайте её пропом, провайдером или обычным CSS.',
    modes: {
      title: 'Светлая, тёмная и автоматическая',
      body: (
        <>
          <p>
            <code>theme="auto"</code> (значение по умолчанию) следует за{' '}
            <strong>приложением</strong>, а не за операционной системой:
          </p>
          <ol>
            <li>
              предок с <code>.dark</code>, <code>[data-theme=dark]</code>,{' '}
              <code>[data-mode=dark]</code> или <code>[data-color-scheme=dark]</code> (Tailwind,
              next-themes) → тёмная тема; аналоги с <code>.light</code> принудительно включают
              светлую;
            </li>
            <li>
              иначе — <code>color-scheme</code> приложения, через CSS <code>light-dark()</code>;
            </li>
            <li>
              в приложении, которое не объявляет поддержку тёмной темы, диаграммы остаются светлыми,
              даже если в ОС включена тёмная тема.
            </li>
          </ol>
          <p>
            Этот сайт переключает класс <code>dark</code> на <code>&lt;html&gt;</code>; все
            диаграммы используют <code>theme="auto"</code>. Переключатели «Светлая»/«Тёмная» у
            каждого примера добавляют к превью класс <code>.light</code>/<code>.dark</code>.
          </p>
        </>
      ),
      example: 'Принудительный и автоматический режимы',
    },
    createTheme: {
      body: (
        <p>
          <code>createTheme</code> переопределяет любые токены — сразу для всех режимов или для
          каждого режима отдельно. Передайте результат в проп <code>theme</code> диаграммы или в{' '}
          <code>ChartProvider</code>. Переопределения для всех режимов встраиваются как
          CSS-переменные, а переопределения для отдельных режимов применяются только к этой
          диаграмме через сгенерированный элемент style.
        </p>
      ),
      example: 'Фирменная тема',
    },
    css: {
      title: 'Обычный CSS',
      body: (
        <p>
          Токены — это пользовательские CSS-свойства на <code>.jc-root</code>, поэтому достаточно
          таблицы стилей:
        </p>
      ),
      example: 'Токены в инлайн-стилях',
      calloutTitle: 'Canvas использует те же цвета',
      calloutBody: (
        <>
          Canvas-рендерер вычисляет цвета через скрытый элемент-пробник, поэтому рисует ровно то,
          что вычисляет CSS, — включая <code>light-dark()</code>, <code>color-mix()</code> и
          CSS-переменные.
        </>
      ),
    },
    palette: {
      title: 'Категориальная палитра',
      body: (
        <p>
          Цвета назначаются рядам по порядку. Этот порядок проверен на устойчивость к нарушениям
          цветовосприятия: любые два соседних цвета остаются различимыми (OKLab ΔE ≥ 8 при симуляции
          протанопии и дейтеранопии) в обоих режимах, поэтому стеки, легенды и соседние столбцы
          легко читаются. В тёмном режиме используются более тёмные ступени тех же оттенков. Чтобы
          ряды различались не только цветом, используйте <code>differentiate</code>.
        </p>
      ),
      brand: (
        <p>
          Фирменная палитра экспортируется как <code>palette</code>:
        </p>
      ),
    },
    tokens: {
      title: 'Справочник токенов',
      body: (
        <p>
          Имена в том виде, в каком их принимают <code>createTheme</code> и <code>cssVar()</code>, с
          соответствующими CSS-переменными и значениями по умолчанию.
        </p>
      ),
    },
    table: {
      slot: 'Слот',
      token: 'Токен',
      light: 'Светлая',
      dark: 'Тёмная',
      usedFor: 'Назначение',
    },
  },
};

function isColor(value: string): boolean {
  return /^#|^rgb/.test(value);
}

function Swatch({ color }: { color: string }) {
  return <span className="swatch" style={{ background: color }} aria-hidden="true" />;
}

function Value({ value }: { value: string }) {
  return (
    <span className="token-value">
      {isColor(value) ? <Swatch color={value} /> : null}
      <code>{value}</code>
    </span>
  );
}

export function Themes() {
  const t = useText(TEXT);
  const lang = useLang();
  const ui = useT();
  return (
    <article>
      <PageHeader eyebrow={ui.nav.guides} title={ui.pages.themes} lead={t.lead} />

      <Section id="modes" title={t.modes.title}>
        {t.modes.body}
        <Example id="themes/Modes" title={t.modes.example} codeOpen />
      </Section>

      <Section id="create-theme" title="createTheme">
        {t.createTheme.body}
        <Example id="themes/Brand" title={t.createTheme.example} codeOpen />
      </Section>

      <Section id="css" title={t.css.title}>
        {t.css.body}
        <CodeBlock
          title="styles.css"
          language="css"
          code={`.jc-root {
  --jc-series-1: #0ea5e9;
  --jc-radius: 6px;
}

.dark .jc-root {
  --jc-grid: #1f2937;
}`}
        />
        <Example id="themes/CssVariables" title={t.css.example} />
        <Callout tone="info" title={t.css.calloutTitle}>
          {t.css.calloutBody}
        </Callout>
      </Section>

      <Section id="palette" title={t.palette.title}>
        {t.palette.body}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">{t.table.slot}</th>
                <th scope="col">{t.table.light}</th>
                <th scope="col">{t.table.dark}</th>
              </tr>
            </thead>
            <tbody>
              {lightTheme.series.map((c, i) => (
                <tr key={c}>
                  <th scope="row">
                    <code>--jc-series-{i + 1}</code>
                  </th>
                  <td>
                    <Value value={c} />
                  </td>
                  <td>
                    <Value value={darkTheme.series[i] ?? ''} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {t.palette.brand}
        <div className="palette-row">
          {Object.entries(palette).map(([name, color]) => (
            <span key={name} className="palette-chip">
              <Swatch color={color} />
              <span>{name}</span>
              <code>{color}</code>
            </span>
          ))}
        </div>
      </Section>

      <Section id="tokens" title={t.tokens.title}>
        {t.tokens.body}
        <div className="table-wrap tokens-table">
          <table>
            <thead>
              <tr>
                <th scope="col">{t.table.token}</th>
                <th scope="col">{t.table.light}</th>
                <th scope="col">{t.table.dark}</th>
                <th scope="col">{t.table.usedFor}</th>
              </tr>
            </thead>
            <tbody>
              {TOKENS.map((token) => (
                <tr key={token}>
                  <th scope="row">
                    <code>{token}</code>
                    <br />
                    <code className="muted">{cssVar(token).slice(4, -1)}</code>
                  </th>
                  <td>
                    <Value value={lightTheme[token]} />
                  </td>
                  <td>
                    <Value value={darkTheme[token]} />
                  </td>
                  <td>{TOKEN_NOTES[token][lang]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </article>
  );
}
