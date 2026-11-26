import { BarChart, type ThemeMode } from '@jafari/charts';
import { registrations } from '../data';

const MODES: ThemeMode[] = ['light', 'dark', 'auto'];

/** `light` and `dark` force a mode; `auto` (the default) follows the page. */
export default function Modes() {
  return (
    <div className="demo-grid">
      {MODES.map((mode) => (
        <div key={mode}>
          <p className="demo-caption">theme="{mode}"</p>
          <BarChart
            theme={mode}
            data={registrations}
            xKey="month"
            series={[
              { key: 'students', label: 'Students' },
              { key: 'teachers', label: 'Teachers' },
            ]}
            height={180}
            style={{ padding: 8, borderRadius: 10, background: 'var(--jc-bg)' }}
          />
        </div>
      ))}
    </div>
  );
}
