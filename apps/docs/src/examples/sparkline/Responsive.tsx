import { Sparkline } from '@jafari/charts';
import { activity } from '../data';

const ROLES = ['students', 'teachers', 'staff'] as const;

/** Sparklines inside a narrow table: each fills its cell. */
export default function Responsive() {
  return (
    <table style={{ width: '100%', maxWidth: 320, borderCollapse: 'collapse', fontSize: 13 }}>
      <tbody>
        {ROLES.map((role, i) => (
          <tr key={role}>
            <th scope="row" style={{ textAlign: 'left', fontWeight: 500, width: 80 }}>
              {role}
            </th>
            <td style={{ padding: '4px 0' }}>
              <Sparkline
                data={activity}
                xKey="date"
                yKey={role}
                color={`var(--jc-series-${i + 1})`}
                height={28}
                title={`${role} trend`}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
