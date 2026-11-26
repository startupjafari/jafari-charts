import { TreemapChart } from '@jafari/charts';
import { courseLoad } from '../data';

/** Flat rows grouped by `groupKey` and `subgroupKey`; `labelKey` names the tiles. */
export default function Rows() {
  return (
    <TreemapChart
      data={courseLoad}
      groupKey="faculty"
      subgroupKey="department"
      labelKey="course"
      valueKey="hours"
      valueFormatter={(v) => `${v} h`}
      height={340}
    />
  );
}
