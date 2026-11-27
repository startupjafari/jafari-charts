import { stylesheet } from '@startupjafari/charts-themes';
import * as React from 'react';
import { useChartConfig } from '../providers/ChartProvider';

const STYLE_ID = 'jafari-charts-styles';
// React 19 hoists and de-duplicates <style href precedence> (also during SSR streaming).
const canHoist = typeof (React as { use?: unknown }).use === 'function';

function LegacyStyles() {
  React.useInsertionEffect(() => {
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = stylesheet;
    document.head.prepend(el);
  }, []);
  return null;
}

/**
 * Injects the Jafari Charts stylesheet once per document. Disable with
 * `<ChartProvider injectStyles={false}>` when importing `@startupjafari/charts/styles.css`.
 */
export function ChartStyles() {
  const { injectStyles = true } = useChartConfig();
  if (!injectStyles) return null;
  if (canHoist) {
    return (
      <style href={STYLE_ID} precedence="low">
        {stylesheet}
      </style>
    );
  }
  return <LegacyStyles />;
}
