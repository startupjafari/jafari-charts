import type { ComponentType } from 'react';

// Every file in ./scenes registers itself: ?scene=<FileName> (case-insensitive).
const modules = import.meta.glob<Record<string, ComponentType>>('./scenes/*.tsx', { eager: true });
const scenes = new Map<string, ComponentType>();
for (const [path, mod] of Object.entries(modules)) {
  const name = path.replace(/^.*\/(.*)\.tsx$/, '$1');
  const component = mod[name] ?? Object.values(mod).find((v) => typeof v === 'function');
  if (component) scenes.set(name.toLowerCase(), component);
}

const requested = (new URLSearchParams(location.search).get('scene') ?? 'gallery').toLowerCase();
const Scene = scenes.get(requested);

export function App() {
  if (!Scene) {
    return (
      <nav>
        {[...scenes.keys()].map((s) => (
          <a key={s} href={`?scene=${s}`}>
            {s}
          </a>
        ))}
      </nav>
    );
  }
  return <Scene />;
}
