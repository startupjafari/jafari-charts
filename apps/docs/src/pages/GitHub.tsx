import { Link } from '../lib/router';
import { REPO_URL } from '../lib/repo';
import { Callout, PageHeader } from '../ui/Callout';

export function GitHub() {
  if (REPO_URL) {
    return (
      <article>
        <PageHeader eyebrow="Reference" title="GitHub" lead="Source code, issues and releases." />
        <p>
          <a className="btn btn-primary" href={REPO_URL} target="_blank" rel="noopener noreferrer">
            Open the repository
          </a>
        </p>
        <p className="muted">
          <code>{REPO_URL}</code>
        </p>
      </article>
    );
  }
  return (
    <article>
      <PageHeader eyebrow="Reference" title="GitHub" />
      <Callout title="Repository not public yet">
        <p>
          The Jafari Charts repository has not been published. Once it is, this page will link to
          it.
        </p>
      </Callout>
      <p>
        In the meantime, see the <Link to="/changelog">changelog</Link> for what has changed and the{' '}
        <Link to="/getting-started">introduction</Link> for the project’s status.
      </p>
    </article>
  );
}
