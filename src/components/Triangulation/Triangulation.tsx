import { useState } from "react";
import { triangulatePolygon } from "../../lib/algorithms/triangulation/triangulation";

import { Point } from "../../lib/geometry";
import { ResetButton } from "../Button/ResetButton";
import TriangulationCanvas from "./TriangulationCanvas/TriangulationCanvas";

function Triangulation() {
  const [points, setPoints] = useState<Point[]>([]);
  console.log(triangulatePolygon(points));

  const handleAddPoint = (newPoint: Point) => {
    const fitleredPoints = points.filter((point) => {
      if (point.x == newPoint.x && point.y == newPoint.y) {
        return false;
      }
      return true;
    });
    const newPoints = [...fitleredPoints, newPoint];
    setPoints(newPoints);
  };

  const handleReset = () => {
    setPoints([]);
  };

  return (
    <div>
      <div className="mb-8 flex w-full items-end justify-between">
        <div>
          <ResetButton onClick={handleReset} />
        </div>
      </div>
      <TriangulationCanvas
        points={points}
        vectors={[]}
        onAddPoint={handleAddPoint}
      />
    </div>
  );
}

export default Triangulation;
