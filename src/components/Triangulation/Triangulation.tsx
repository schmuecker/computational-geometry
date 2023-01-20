import { useState } from "react";
import { isoSweep } from "../../lib/algorithms";
import { Vector } from "../../lib/geometry";
import { ResetButton } from "../Button/ResetButton";
import TriangulationCanvas from "./TriangulationCanvas/TriangulationCanvas";

function Triangulation() {
  const [segments, setSegments] = useState<Vector[]>([]);
  const canvasHeight = window.innerHeight * 0.6;
  const { events, intersections } = isoSweep(segments);

  const handleAddSegment = (newSegment: Vector) => {
    setSegments((state) => [...state, newSegment]);
  };

  const handleReset = () => {
    setSegments([]);
  };

  return (
    <div>
      <div className="mb-8 flex w-full items-end justify-between">
        <p className="text-base font-medium text-gray-900">
          Delaunay Triangulation
        </p>
        <ResetButton onClick={handleReset} />
      </div>
      <TriangulationCanvas
        events={events}
        intersections={intersections}
        height={canvasHeight}
        segments={segments}
        onAddSegment={handleAddSegment}
      />
    </div>
  );
}

export default Triangulation;
