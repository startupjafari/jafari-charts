import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { UserConfig } from 'vite';

interface LibOptions {
  /** Entry name → source path (relative to the package). */
  entries?: Record<string, string>;
  /** Prepended to output chunks, e.g. '"use client";' for React components. */
  banner?: string | ((chunk: { fileName: string }) => string);
}

/**
 * Shared library build: ESM only, one output module per source module
 * (preserveModules) for precise tree shaking, all dependencies external.
 * Type declarations are emitted separately by `tsc -p tsconfig.build.json`.
 */
export function libConfig(dir: string, options: LibOptions = {}): UserConfig {
  const pkg = JSON.parse(readFileSync(resolve(dir, 'package.json'), 'utf8')) as {
    dependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
  };
  const externals = [
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.peerDependencies ?? {}),
  ];
  const entries = options.entries ?? { index: 'src/index.ts' };
  return {
    build: {
      target: 'es2022',
      sourcemap: true,
      minify: false,
      emptyOutDir: true,
      reportCompressedSize: false,
      lib: {
        entry: Object.fromEntries(Object.entries(entries).map(([k, v]) => [k, resolve(dir, v)])),
        formats: ['es'],
      },
      rollupOptions: {
        external: (id) => externals.some((dep) => id === dep || id.startsWith(`${dep}/`)),
        output: {
          preserveModules: true,
          preserveModulesRoot: resolve(dir, 'src'),
          entryFileNames: '[name].js',
          ...(options.banner ? { banner: options.banner } : {}),
        },
      },
    },
  };
}
