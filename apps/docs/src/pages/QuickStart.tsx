import type { ReactNode } from 'react';
import { useT, useText, type L } from '../i18n';
import { Link } from '../lib/router';
import { PageHeader, Section } from '../ui/Callout';
import { Example } from '../ui/Example';

interface Step {
  title: string;
  body: ReactNode;
  example: string;
}

interface QuickStartText {
  lead: string;
  first: Step;
  series: Step;
  formatting: Step;
  composition: Step;
  provider: Step;
  next: ReactNode;
}

const timeAxis = (
  <code>
    xAxis={'{{'} type: 'time' {'}}'}
  </code>
);

const TEXT: L<QuickStartText> = {
  en: {
    lead: 'From one line of JSX to a localised, themed, interactive chart in five steps.',
    first: {
      title: '1. Your first chart',
      body: (
        <>
          Pass an array of objects, the field for the x axis and the field for the values.{' '}
          <code>Date</code> objects and ISO date strings are detected as time; numeric timestamps
          are plain numbers unless you set {timeAxis}.
        </>
      ),
      example: 'AreaChart',
    },
    series: {
      title: '2. Several series and a locale',
      body: (
        <>
          Use <code>series</code> for more than one value field. With two or more series a legend
          appears; its items toggle series. <code>locale</code> switches number and date formatting
          (here Russian).
        </>
      ),
      example: 'LineChart in Russian',
    },
    formatting: {
      title: '3. Format values',
      body: (
        <>
          <code>valueFormatter</code> formats tooltips, labels and the data table;{' '}
          <code>yAxis.format</code> formats tick labels. The formatting helpers (
          <code>formatNumber</code>, <code>formatCompact</code>, <code>formatPercent</code>,{' '}
          <code>formatCurrency</code>, <code>formatDate</code>) use cached Intl formatters.
        </>
      ),
      example: 'Currency in the tooltip',
    },
    composition: {
      title: '4. Add reference lines and areas',
      body: (
        <>
          Primitives go inside the chart as children and use the chart’s scales — pass data values,
          not pixels.
        </>
      ),
      example: 'Goal line and an exam period',
    },
    provider: {
      title: '5. Set defaults once',
      body: (
        <>
          <code>ChartProvider</code> sets locale, theme, animation and renderer for every chart
          below it. This example uses Kazakh, which has built-in CLDR data for browsers whose Intl
          lacks it.
        </>
      ),
      example: 'ChartProvider with locale kk',
    },
    next: (
      <>
        Next: explore the <Link to="/charts">charts</Link>, the{' '}
        <Link to="/components">components</Link> you can compose, or the{' '}
        <Link to="/themes">theming</Link> options.
      </>
    ),
  },
  ru: {
    lead: 'От одной строки JSX до локализованной, оформленной и интерактивной диаграммы — за пять шагов.',
    first: {
      title: '1. Первая диаграмма',
      body: (
        <>
          Передайте массив объектов, поле для оси X и поле значений. Объекты <code>Date</code> и
          даты в виде ISO-строк распознаются как время; числовые временные метки считаются обычными
          числами, если не задать {timeAxis}.
        </>
      ),
      example: 'AreaChart',
    },
    series: {
      title: '2. Несколько рядов и локаль',
      body: (
        <>
          Если полей со значениями больше одного, используйте <code>series</code>. Когда рядов два и
          больше, появляется легенда; её элементы скрывают и показывают ряды. <code>locale</code>{' '}
          переключает форматирование чисел и дат — здесь это русский язык. На русской версии сайта
          все диаграммы и так получают <code>locale="ru"</code> от общего <code>ChartProvider</code>
          ; в примере локаль задана явно, чтобы код так же работал и в вашем приложении.
        </>
      ),
      example: 'LineChart на русском',
    },
    formatting: {
      title: '3. Форматирование значений',
      body: (
        <>
          <code>valueFormatter</code> форматирует подсказки, подписи и таблицу данных,{' '}
          <code>yAxis.format</code> — подписи делений. Функции форматирования (
          <code>formatNumber</code>, <code>formatCompact</code>, <code>formatPercent</code>,{' '}
          <code>formatCurrency</code>, <code>formatDate</code>) используют кешированные форматтеры
          Intl.
        </>
      ),
      example: 'Валюта в подсказке',
    },
    composition: {
      title: '4. Опорные линии и области',
      body: (
        <>
          Примитивы размещаются внутри диаграммы как дочерние элементы и используют её шкалы —
          передавайте значения данных, а не пиксели.
        </>
      ),
      example: 'Целевая линия и период экзаменов',
    },
    provider: {
      title: '5. Значения по умолчанию — один раз',
      body: (
        <>
          <code>ChartProvider</code> задаёт локаль, тему, анимацию и рендерер для всех диаграмм
          внутри него. В этом примере используется казахский язык: для браузеров, в Intl которых его
          нет, библиотека содержит встроенные данные CLDR.
        </>
      ),
      example: 'ChartProvider с локалью kk',
    },
    next: (
      <>
        Дальше: изучите <Link to="/charts">диаграммы</Link>,{' '}
        <Link to="/components">компоненты</Link>, из которых их можно собирать, или настройку{' '}
        <Link to="/themes">тем</Link>.
      </>
    ),
  },
  kk: {
    lead: 'Бір жол JSX-тен локализацияланған, безендірілген және интерактивті диаграммаға дейін — бес қадамда.',
    first: {
      title: '1. Алғашқы диаграмма',
      body: (
        <>
          Объектілер массивін, X осіне арналған өрісті және мәндер өрісін беріңіз. <code>Date</code>{' '}
          объектілері мен ISO жолы түріндегі күндер уақыт ретінде танылады; сандық уақыт белгілері{' '}
          {timeAxis} орнатылмаса, қарапайым сан болып есептеледі.
        </>
      ),
      example: 'AreaChart',
    },
    series: {
      title: '2. Бірнеше қатар және локаль',
      body: (
        <>
          Мәндер өрісі біреуден көп болса, <code>series</code> пропын пайдаланыңыз. Екі не одан көп
          қатар болғанда шартты белгілер пайда болады; олардың элементтері қатарларды жасырады және
          көрсетеді. <code>locale</code> сандар мен күндердің пішімін ауыстырады — мұнда орыс тілі.
          Сайттың қазақша нұсқасында барлық диаграмма ортақ <code>ChartProvider</code> арқылы{' '}
          <code>locale="kk"</code> алады; мысалда локаль анық көрсетілген, сондықтан код сіздің
          қолданбаңызда да дәл солай жұмыс істейді.
        </>
      ),
      example: 'LineChart орыс тілінде',
    },
    formatting: {
      title: '3. Мәндерді пішімдеу',
      body: (
        <>
          <code>valueFormatter</code> қалқымалы кеңестерді, жазуларды және деректер кестесін
          пішімдейді, <code>yAxis.format</code> — бөліктердің жазуларын. Пішімдеу функциялары (
          <code>formatNumber</code>, <code>formatCompact</code>, <code>formatPercent</code>,{' '}
          <code>formatCurrency</code>, <code>formatDate</code>) кэштелген Intl форматтерлерін
          пайдаланады.
        </>
      ),
      example: 'Қалқымалы кеңестегі валюта',
    },
    composition: {
      title: '4. Тірек сызықтар мен аймақтар',
      body: (
        <>
          Примитивтер диаграмманың ішіне еншілес элементтер ретінде орналасады және оның шкалаларын
          пайдаланады — пиксельдерді емес, деректер мәндерін беріңіз.
        </>
      ),
      example: 'Мақсат сызығы және емтихан кезеңі',
    },
    provider: {
      title: '5. Әдепкі мәндерді бір рет орнату',
      body: (
        <>
          <code>ChartProvider</code> өзінің ішіндегі барлық диаграмма үшін локальді, тақырыпты,
          анимацияны және рендерерді орнатады. Бұл мысалда қазақ тілі қолданылады: Intl-інде бұл тіл
          жоқ браузерлер үшін кітапханада кірістірілген CLDR деректері бар.
        </>
      ),
      example: 'kk локалі бар ChartProvider',
    },
    next: (
      <>
        Әрі қарай: <Link to="/charts">диаграммаларды</Link>, біріктіріп қолдануға болатын{' '}
        <Link to="/components">компоненттерді</Link> немесе <Link to="/themes">тақырып</Link>{' '}
        баптауларын қараңыз.
      </>
    ),
  },
};

export function QuickStart() {
  const ui = useT();
  const t = useText(TEXT);
  return (
    <article>
      <PageHeader eyebrow={ui.nav.gettingStarted} title={ui.pages.quickStart} lead={t.lead} />
      <Section id="first-chart" title={t.first.title}>
        <p>{t.first.body}</p>
        <Example id="quick-start/FirstChart" title={t.first.example} codeOpen />
      </Section>
      <Section id="series" title={t.series.title}>
        <p>{t.series.body}</p>
        <Example id="quick-start/Series" title={t.series.example} codeOpen />
      </Section>
      <Section id="formatting" title={t.formatting.title}>
        <p>{t.formatting.body}</p>
        <Example id="quick-start/Formatting" title={t.formatting.example} />
      </Section>
      <Section id="composition" title={t.composition.title}>
        <p>{t.composition.body}</p>
        <Example id="quick-start/Composition" title={t.composition.example} />
      </Section>
      <Section id="provider" title={t.provider.title}>
        <p>{t.provider.body}</p>
        <Example id="quick-start/Provider" title={t.provider.example} />
        <p>{t.next}</p>
      </Section>
    </article>
  );
}
