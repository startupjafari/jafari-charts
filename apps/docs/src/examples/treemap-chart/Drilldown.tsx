import { TreemapChart } from '@startupjafari/charts';
import { useState } from 'react';
import { courseLoad } from '../data';

/** Click a faculty to zoom in; the breadcrumb or Backspace zooms out. */
export default function Drilldown() {
  const [path, setPath] = useState<string[]>([]);
  return (
    <>
      <TreemapChart
        data={courseLoad}
        groupKey="faculty"
        subgroupKey="department"
        labelKey="course"
        valueKey="hours"
        drilldown
        onDrilldown={setPath}
        height={340}
      />
      <output className="demo-output">
        path: {path.length ? path.join(' / ') : '(top level)'}
      </output>
    </>
  );
}
