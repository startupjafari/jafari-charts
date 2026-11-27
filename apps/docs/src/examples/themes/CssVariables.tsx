import { DonutChart } from '@startupjafari/charts';
import type { CSSProperties } from 'react';
import { roles } from '../data';

/** Any `--jc-*` token can be set with plain CSS — here inline, usually in your stylesheet. */
const tokens = {
  '--jc-series-1': '#F43F5E',
  '--jc-series-2': '#FB923C',
  '--jc-series-3': '#FACC15',
  '--jc-series-4': '#A3E635',
  '--jc-font-family': 'Georgia, serif',
} as CSSProperties;

export default function CssVariables() {
  return <DonutChart data={roles} labelKey="role" valueKey="count" style={tokens} />;
}
