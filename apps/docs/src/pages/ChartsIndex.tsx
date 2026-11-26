import { CHARTS } from '../docs/charts';
import type { ChartDoc, ChartGroup } from '../docs/types';
import { ruPlural, useLang, useT, useText, type L } from '../i18n';
import { Link } from '../lib/router';
import { PageHeader } from '../ui/Callout';
import { ErrorBoundary } from '../ui/ErrorBoundary';

interface ChartsIndexText {
  lead: (count: number) => string;
  groupLeads: Record<ChartGroup, string>;
}

const TEXT: L<ChartsIndexText> = {
  en: {
    lead: (n) =>
      `${n} chart types, one engine. Every chart shares the same props for theming, locale, animation, states, accessibility and interaction — learn one and you know them all.`,
    groupLeads: {
      Core: 'The charts most dashboards are made of.',
      Advanced: 'Distributions, relationships, hierarchies and single values.',
      Professional: 'Financial and analytical compositions.',
    },
  },
  ru: {
    lead: (n) =>
      `${n} ${ruPlural(n, ['тип', 'типа', 'типов'])} диаграмм — один движок. У всех диаграмм одни и те же пропсы для темы, локали, анимации, состояний, доступности и взаимодействия: освоив одну, вы знаете их все.`,
    groupLeads: {
      Core: 'Диаграммы, из которых состоит большинство дашбордов.',
      Advanced: 'Распределения, взаимосвязи, иерархии и отдельные показатели.',
      Professional: 'Финансовые и аналитические композиции.',
    },
  },
};

const GROUPS: readonly ChartGroup[] = ['Core', 'Advanced', 'Professional'];

export function ChartCard({ doc }: { doc: ChartDoc }) {
  const lang = useLang();
  const Thumb = doc.thumbnail;
  return (
    <div className="card chart-card">
      {/* Decorative preview: not focusable, hidden from assistive technology. */}
      <div className="thumb" aria-hidden="true" inert>
        <ErrorBoundary label={doc.component}>
          <Thumb />
        </ErrorBoundary>
      </div>
      <h3>
        <Link to={`/charts/${doc.slug}`} className="card-link">
          {doc.component}
        </Link>
      </h3>
      <p>{doc.summary[lang]}</p>
    </div>
  );
}

export function ChartsIndex() {
  const ui = useT();
  const t = useText(TEXT);
  return (
    <article>
      <PageHeader title={ui.pages.charts} lead={t.lead(CHARTS.length)} />
      {GROUPS.map((group) => {
        const docs = CHARTS.filter((c) => c.group === group);
        if (!docs.length) return null;
        return (
          <section key={group} className="doc-section" aria-labelledby={`group-${group}`}>
            <h2 id={`group-${group}`}>{ui.chartGroups[group]}</h2>
            <p className="section-lead">{t.groupLeads[group]}</p>
            <div className="card-grid">
              {docs.map((d) => (
                <ChartCard key={d.slug} doc={d} />
              ))}
            </div>
          </section>
        );
      })}
    </article>
  );
}
