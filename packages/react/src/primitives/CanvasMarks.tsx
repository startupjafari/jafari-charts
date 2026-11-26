import type * as CanvasModuleNs from '@jafari/charts-canvas';
import type { Mark, Rect } from '@jafari/charts-core';
import { useEffect, useRef, useState } from 'react';
import { useIsomorphicLayoutEffect } from '../internal/env';

type CanvasModule = typeof CanvasModuleNs;
type Renderer = InstanceType<CanvasModule['CanvasRenderer']>;
type Resolver = ReturnType<CanvasModule['createColorResolver']>;

// The canvas renderer is an optional module: SVG-only apps never download it.
let loaded: CanvasModule | null = null;
let loading: Promise<CanvasModule> | null = null;
function loadCanvas(): Promise<CanvasModule> {
  loading ??= import('@jafari/charts-canvas').then((m) => (loaded = m));
  return loading;
}

/** Increments when the page's colour scheme may have changed (OS setting or app theme class). */
function useColorSchemeVersion(): number {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const bump = () => setVersion((v) => v + 1);
    const mql = window.matchMedia?.('(prefers-color-scheme: dark)');
    mql?.addEventListener?.('change', bump);
    const mo = typeof MutationObserver !== 'undefined' ? new MutationObserver(bump) : null;
    mo?.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'data-mode', 'style'],
    });
    return () => {
      mql?.removeEventListener?.('change', bump);
      mo?.disconnect();
    };
  }, []);
  return version;
}

export interface CanvasMarksProps {
  marks: readonly Mark[];
  width: number;
  height: number;
  clip?: Rect | undefined;
  /** Changes when the theme mode changes, to re-resolve CSS variables. */
  themeKey: string;
}

/**
 * Canvas data layer: same marks as the SVG renderer, drawn on a HiDPI canvas.
 * Loads the renderer on first use and redraws only when marks, size or theme change.
 */
export function CanvasMarks({ marks, width, height, clip, themeKey }: CanvasMarksProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const renderer = useRef<Renderer | null>(null);
  const resolver = useRef<Resolver | null>(null);
  const [mod, setMod] = useState<CanvasModule | null>(loaded);
  const scheme = useColorSchemeVersion();

  useEffect(() => {
    if (mod) return;
    let alive = true;
    void loadCanvas().then((m) => alive && setMod(m));
    return () => {
      alive = false;
    };
  }, [mod]);

  useIsomorphicLayoutEffect(() => {
    const canvas = ref.current;
    if (!canvas || !mod) return;
    try {
      renderer.current = new mod.CanvasRenderer(canvas);
    } catch {
      return; // no 2D context (e.g. test environment)
    }
    resolver.current = mod.createColorResolver(canvas.parentElement ?? canvas);
    return () => {
      resolver.current?.dispose();
      resolver.current = null;
      renderer.current = null;
    };
  }, [mod]);

  useIsomorphicLayoutEffect(() => {
    resolver.current?.invalidate();
  }, [themeKey, scheme]);

  useIsomorphicLayoutEffect(() => {
    const r = renderer.current;
    if (!r) return;
    r.resize(width, height, typeof window !== 'undefined' ? window.devicePixelRatio : 1);
    r.render(marks, {
      ...(clip ? { clip } : {}),
      ...(resolver.current ? { resolveColor: resolver.current } : {}),
    });
  }, [mod, marks, width, height, clip?.x, clip?.y, clip?.width, clip?.height, themeKey, scheme]);

  return (
    <canvas
      ref={ref}
      className="jc-canvas"
      width={width}
      height={height}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
