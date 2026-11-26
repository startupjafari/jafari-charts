import { Link, useLocation } from '../lib/router';
import { PageHeader, Section } from '../ui/Callout';
import { Example } from '../ui/Example';

export function Examples() {
  const { path } = useLocation();
  return (
    <article>
      <PageHeader
        eyebrow="Tools"
        title="Examples"
        lead="Complete, realistic compositions you can copy: a university analytics dashboard, synchronised charts and localised charts."
      >
        <nav aria-label="On this page">
          <ul className="page-toc">
            <li>
              <Link to={path} section="dashboard">
                University dashboard
              </Link>
            </li>
            <li>
              <Link to={path} section="sync">
                Synchronised charts
              </Link>
            </li>
            <li>
              <Link to={path} section="localized">
                Russian and Kazakh
              </Link>
            </li>
          </ul>
        </nav>
      </PageHeader>

      <Section
        id="dashboard"
        title="University analytics dashboard"
        lead="KPI cards with sparklines, user growth, activity by role, registrations, ratings, roles, complaints, a login calendar and plan completion — nine chart types, one consistent look, in both themes. Switch the preview to 480 or 320 px to see it reflow."
      >
        <Example id="dashboard/Dashboard" title="Dashboard" />
      </Section>

      <Section
        id="sync"
        title="Synchronised charts"
        lead="Charts that share a syncId show the crosshair and tooltip at the same x value. Each chart resolves the value in its own data with a binary search; a chart whose range does not contain it shows nothing."
      >
        <Example id="dashboard/SyncDemo" title="Shared crosshair" codeOpen />
      </Section>

      <Section
        id="localized"
        title="Russian and Kazakh"
        lead="Dates, numbers, week starts (Monday for ru and kk) and built-in texts such as “Total” follow the locale. Kazakh uses built-in CLDR data when the browser’s Intl lacks it."
      >
        <Example id="dashboard/Localized" title="ru / kk" codeOpen />
      </Section>
    </article>
  );
}
