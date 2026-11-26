import { Link, useLocation } from '../lib/router';
import { PageHeader } from '../ui/Callout';

export function NotFound() {
  const { path } = useLocation();
  return (
    <article>
      <PageHeader title="Page not found" lead={`There is no page at “${path}”.`} />
      <p>
        Go to the <Link to="/">home page</Link>, browse the <Link to="/charts">charts</Link> or the{' '}
        <Link to="/api">API reference</Link>.
      </p>
    </article>
  );
}
