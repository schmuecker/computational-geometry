import { useState } from "react";
import { isoSweep } from "../../lib/algorithms";
import { Point, Vector } from "../../lib/geometry";
import SweepLineCanvas from "./SweepLineCanvas/SweepLineCanvas";

function SweepLine() {
  const [segments, setSegments] = useState<Vector[]>([]);

  const handleAddSegment = (newSegment: Vector) => {
    console.log("New segment", newSegment);
    setSegments((state) => [...state, newSegment]);
  };

  const result = isoSweep(segments);
  console.log(result);
  return (
    <div>
      <p className="mb-8 text-base font-medium text-gray-900">Sweep Line</p>
      <SweepLineCanvas segments={segments} onAddSegment={handleAddSegment} />
    </div>
  );
}

export default SweepLine;
