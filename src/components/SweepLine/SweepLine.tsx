import { useState } from "react";
import { isoSweep } from "../../lib/algorithms";
import { Vector } from "../../lib/geometry";
import SweepLineCanvas from "./SweepLineCanvas/SweepLineCanvas";

function SweepLine() {
  const [segments, setSegments] = useState<Vector[]>([]);

  const handleAddSegment = (newSegment: Vector) => {
    setSegments((state) => [...state, newSegment]);
  };

  const { events, intersections } = isoSweep(segments);

  return (
    <div>
      <p className="mb-8 text-base font-medium text-gray-900">Sweep Line</p>
      <SweepLineCanvas
        events={events}
        intersections={intersections}
        segments={segments}
        onAddSegment={handleAddSegment}
      />
    </div>
  );
}

export default SweepLine;
