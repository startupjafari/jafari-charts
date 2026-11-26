import type { ComponentType } from 'react';
import type { CodeFile } from '../ui/CodeBlock';

/**
 * Every `*.tsx` file under `src/examples/<group>/` is a live example. The same
 * file is imported twice: once as a module (rendered) and once with `?raw`
 * (shown as code), so the code on the page is exactly the code that runs.
 * Sources are loaded lazily, when a code panel opens.
 *
 * Example ids are `<group>/<FileName>`, e.g. `line-chart/Basic`.
 */
const modules = import.meta.glob<{ default: ComponentType }>('./*/*.tsx', { eager: true });
const sources = import.meta.glob<string>('./*/*.tsx', { query: '?raw', import: 'default' });

function toPath(id: string): string {
  return `./${id}.tsx`;
}

export interface LoadedExample {
  id: string;
  /** Module-level component (stable identity across renders). */
  Component: ComponentType;
}

const loaded = new Map<string, LoadedExample>();

/** The example component (bundled eagerly so pages render without waterfalls). */
export function loadExample(id: string): LoadedExample {
  const hit = loaded.get(id);
  if (hit) return hit;
  const mod = modules[toPath(id)];
  if (!mod) throw new Error(`Unknown example "${id}"`);
  const example = { id, Component: mod.default };
  loaded.set(id, example);
  return example;
}

let dataSource: Promise<string> | null = null;
const codeCache = new Map<string, Promise<CodeFile[]>>();

/**
 * The example's source, plus the shared demo data module (`src/examples/data.ts`)
 * when the example imports it. Cached, so the promise is stable for `use()`.
 */
export function loadCode(id: string): Promise<CodeFile[]> {
  const hit = codeCache.get(id);
  if (hit) return hit;
  const loader = sources[toPath(id)];
  const name = `${id.split('/').pop() ?? 'Example'}.tsx`;
  const promise = (loader ? loader() : Promise.reject(new Error(`Unknown example "${id}"`))).then(
    async (code): Promise<CodeFile[]> => {
      const files: CodeFile[] = [{ name, code, language: 'tsx' }];
      if (/from '\.\.\/data'/.test(code)) {
        dataSource ??= import('./data.ts?raw').then((m: { default: string }) => m.default);
        files.push({ name: 'data.ts', code: await dataSource, language: 'ts' });
      }
      return files;
    },
  );
  codeCache.set(id, promise);
  return promise;
}
