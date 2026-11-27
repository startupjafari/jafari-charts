import { CHARTS } from '../docs/charts';
import type { ChartDoc, ChartGroup } from '../docs/types';
import { ruPlural, useLang, useT, useText, type L } from '../i18n';
import { Link } from '../lib/router';
import { PageHeader } from '../ui/Callout';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { Badge } from '../ui/badge';
import { ChartIcon } from '../nav';
import { ArrowRight } from 'lucide-react';

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
    <div className="card chart-card gap-0 overflow-hidden p-0">
      {/* Decorative preview: not focusable, hidden from assistive technology. */}
      <div
        className="pointer-events-none border-b border-border bg-preview px-3 pt-3 pb-1"
        aria-hidden="true"
        inert
      >
        <ErrorBoundary label={doc.component}>
          <Thumb />
        </ErrorBoundary>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="flex items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary-ink">
            <ChartIcon slug={doc.slug} className="size-4" />
          </span>
          <Link to={`/charts/${doc.slug}`} className="card-link min-w-0 truncate">
            {doc.component}
          </Link>
          <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground" aria-hidden />
        </h3>
        <p className="text-xs font-medium text-muted-foreground">{doc.title[lang]}</p>
        <p>{doc.summary[lang]}</p>
      </div>
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
            <h2 id={`group-${group}`}>
              <span>{ui.chartGroups[group]}</span>
              <Badge variant="secondary" className="tabular-nums">
                {docs.length}
              </Badge>
            </h2>
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
