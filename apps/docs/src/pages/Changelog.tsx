import changelog from '../../../../CHANGELOG.md?raw';
import { Markdown } from '../lib/markdown';
import { PageHeader } from '../ui/Callout';

export function Changelog() {
  return (
    <article>
      <PageHeader
        eyebrow="Reference"
        title="Changelog"
        lead="Rendered from CHANGELOG.md in the repository at build time."
      />
      <Markdown source={changelog} skipTitle />
    </article>
  );
}
