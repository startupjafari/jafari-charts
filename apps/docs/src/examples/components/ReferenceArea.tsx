import { BarChart, ChartReferenceArea } from '@jafari/charts';
import { registrations } from '../data';

/** A target band on the value axis (y1–y2) and a highlighted range of categories (x1–x2). */
export default function ReferenceArea() {
  return (
    <BarChart data={registrations} xKey="month" yKey="students" label="Students" height={260}>
      <ChartReferenceArea
        y1={180}
        y2={240}
        label="Target range"
        color="var(--jc-positive)"
        opacity={0.08}
      />
      <ChartReferenceArea x1="Jun" x2="Aug" label="Summer" />
    </BarChart>
  );
}
