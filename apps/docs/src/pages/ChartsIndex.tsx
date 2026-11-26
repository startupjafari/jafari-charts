import { CHARTS } from '../docs/charts';
import type { ChartDoc } from '../docs/types';
import { Link } from '../lib/router';
import { PageHeader } from '../ui/Callout';
import { ErrorBoundary } from '../ui/ErrorBoundary';

const GROUPS: { group: ChartDoc['group']; lead: string }[] = [
  { group: 'Core', lead: 'The charts most dashboards are made of.' },
  { group: 'Advanced', lead: 'Distributions, relationships, hierarchies and single values.' },
  { group: 'Professional', lead: 'Financial and analytical compositions.' },
];

export function ChartCard({ doc }: { doc: ChartDoc }) {
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
      <p>{doc.summary}</p>
    </div>
  );
}

export function ChartsIndex() {
  return (
    <article>
      <PageHeader
        title="Charts"
        lead={`${CHARTS.length} chart types, one engine. Every chart shares the same props for theming, locale, animation, states, accessibility and interaction — learn one and you know them all.`}
      />
      {GROUPS.map(({ group, lead }) => {
        const docs = CHARTS.filter((c) => c.group === group);
        if (!docs.length) return null;
        return (
          <section key={group} className="doc-section" aria-labelledby={`group-${group}`}>
            <h2 id={`group-${group}`}>{group}</h2>
            <p className="section-lead">{lead}</p>
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
