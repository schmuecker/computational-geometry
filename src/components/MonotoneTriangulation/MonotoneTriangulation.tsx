import { useState } from "react";
import { triangulatePolygon } from "../../lib/algorithms/triangulation/triangulation";

import { Point, Vector } from "../../lib/geometry";
import { ResetButton } from "../Button/ResetButton";
import { IconButton } from "../Button/IconButton";
import TriangulationCanvas from "./MonotoneTriangulationCanvas/MonotoneTriangulationCanvas";
import { PlayIcon } from "@heroicons/react/24/outline";

function MonotoneTriangulation() {
  const [points, setPoints] = useState<Point[]>([]);
  const [diagonals, setDiagonals] = useState<Vector[]>([]);

  const vectors = points.map((point, index) => {
    const nextIndex = (index + 1) % points.length;
    return new Vector(point, points[nextIndex]);
  });

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

  const handleDraw = () => {
    const newDiagonals = triangulatePolygon(points) || [];
    console.log("diagonals", newDiagonals);
    setDiagonals(newDiagonals);
  };

  const handleReset = () => {
    setPoints([]);
    setDiagonals([]);
  };

  return (
    <div>
      <div className="mb-8 flex w-full items-end justify-between">
        <div className="flex space-x-2">
          <IconButton onClick={handleDraw} icon={<PlayIcon />} />
          <ResetButton onClick={handleReset} />
        </div>
      </div>
      <TriangulationCanvas
        points={points}
        vectors={vectors}
        diagonals={diagonals}
        onAddPoint={handleAddPoint}
      />
    </div>
  );
}

export default MonotoneTriangulation;
