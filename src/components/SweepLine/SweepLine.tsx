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

  const seg1 = new Vector(new Point(10, 2), new Point(0, 2));
  const seg2 = new Vector(new Point(2, 0), new Point(2, 5));
  const seg3 = new Vector(new Point(6, 3), new Point(6, 6));
  const seg4 = new Vector(new Point(1, 4), new Point(8, 4));
  const result = isoSweep([seg1, seg2, seg3, seg4]);
  console.log(result);
  return (
    <div>
      <p className="mb-8 text-base font-medium text-gray-900">Sweep Line</p>
      <SweepLineCanvas segments={segments} onAddSegment={handleAddSegment} />
    </div>
  );
}

export default SweepLine;
