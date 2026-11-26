import type { ChartDoc, ChartSectionId, PropGroup } from '../docs/types';
import { Link, useLocation } from '../lib/router';
import { Callout, Kbd, PageHeader, Section } from '../ui/Callout';
import { CodeBlock } from '../ui/CodeBlock';
import { Example } from '../ui/Example';
import { inlineCode, PropsTable } from '../ui/PropsTable';

const SECTIONS: { id: ChartSectionId; title: string; short: string; lead: string }[] = [
  { id: 'usage', title: 'Usage', short: 'Usage', lead: '' },
  {
    id: 'styling',
    title: 'Styling variants',
    short: 'Styling',
    lead: 'Every visual parameter has a sensible default; these examples show the props that change them. Use the Light/Dark switch above each preview to check both themes.',
  },
  {
    id: 'interaction',
    title: 'Interaction',
    short: 'Interaction',
    lead: 'Tooltips, legend toggling and keyboard navigation work without configuration. Controlled props let your app read and drive the state.',
  },
  {
    id: 'responsive',
    title: 'Responsive',
    short: 'Responsive',
    lead: 'Charts fill their container and follow resizes through one shared ResizeObserver. Tick labels are thinned so they never overlap. Try the 480 and 320 width switches on any example.',
  },
  {
    id: 'empty',
    title: 'Empty, loading and error states',
    short: 'States',
    lead: 'States keep the chart’s footprint, so the layout never jumps while data loads.',
  },
];

function PropGroupView({ group, open }: { group: PropGroup; open: boolean }) {
  return (
    <details className="prop-group" open={open}>
      <summary>
        {group.title} <span className="muted">({group.props.length})</span>
      </summary>
      {group.note ? (
        <p className="prop-group-note">
          {typeof group.note === 'string' ? inlineCode(group.note) : group.note}
        </p>
      ) : null}
      <PropsTable props={group.props} />
    </details>
  );
}

function KeyboardTable({ keys }: { keys: ChartDoc['keyboard'] }) {
  return (
    <div className="table-wrap">
      <table>
        <caption>Keyboard (focus the chart with Tab first)</caption>
        <thead>
          <tr>
            <th scope="col">Keys</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {keys.map(([k, action]) => (
            <tr key={k}>
              <th scope="row">
                <span className="kbd-list">
                  {k.split(' ').map((part) => (
                    <Kbd key={part}>{part}</Kbd>
                  ))}
                </span>
              </th>
              <td>{action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ChartPage({ doc }: { doc: ChartDoc }) {
  const { path } = useLocation();
  const usage = doc.sections.usage;
  const importLine = `import { ${doc.component} } from '@jafari/charts';`;
  const toc = [
    ...SECTIONS.filter((s) => doc.sections[s.id].length > 0).map((s) => ({
      id: s.id,
      title: s.short,
    })),
    { id: 'props', title: 'Props' },
  ];
  return (
    <article>
      <PageHeader eyebrow={`${doc.group} chart`} title={doc.component} lead={doc.summary}>
        <nav aria-label="On this page">
          <ul className="page-toc">
            {toc.map((t) => (
              <li key={t.id}>
                <Link to={path} section={t.id}>
                  {t.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </PageHeader>
      <div className="prose">{doc.description}</div>
      <CodeBlock code={importLine} language="tsx" title="Import" />
      {SECTIONS.map((s) => {
        const examples = doc.sections[s.id];
        if (!examples.length) return null;
        return (
          <Section key={s.id} id={s.id} title={s.title} lead={s.lead || undefined}>
            {doc.sectionNotes?.[s.id] ? (
              <div className="prose">{doc.sectionNotes[s.id]}</div>
            ) : null}
            {s.id === 'interaction' ? <KeyboardTable keys={doc.keyboard} /> : null}
            {examples.map((e, i) => (
              <Example
                key={e.id}
                id={e.id}
                anchor={`${s.id}-${e.id.split('/').pop()?.toLowerCase() ?? i}`}
                title={e.title}
                description={e.description}
                codeOpen={s.id === 'usage' && i === 0 && e === usage[0]}
                {...(e.width !== undefined ? { width: e.width } : {})}
              />
            ))}
          </Section>
        );
      })}
      <Section id="props" title="Props">
        <Callout>
          Types are exact: keys such as <code>xKey</code> and series keys are checked against your
          data type, so a typo or a non-numeric field is a compile error.
        </Callout>
        {doc.props.map((g, i) => (
          <PropGroupView key={g.title} group={g} open={!g.collapsed || i === 0} />
        ))}
        <p className="muted">
          See the <Link to="/api">API reference</Link> for exported types.
        </p>
      </Section>
    </article>
  );
}
