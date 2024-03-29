import { useEffect, useState } from "react";

import { Point, Vector } from "../../lib/geometry";
import { ResetButton } from "../Button/ResetButton";
import DelaunyCanvas from "./DelaunyCanvas/DelaunyCanvas";
import {
  delaunyTriangulation,
  ITriangle,
} from "../../lib/algorithms/delauny-triangulation/delauny-triangulation";

function Delauny() {
  const [points, setPoints] = useState<Point[]>([]);
  const [vectors, setVectors] = useState<Vector[]>([]);

  useEffect(() => {
    function triangulate() {
      try {
        const triangles: ITriangle[] = delaunyTriangulation(points);
        const vectors: Vector[] = [];
        triangles.forEach((triangle) => {
          vectors.push(new Vector(triangle.i, triangle.j));
          vectors.push(new Vector(triangle.j, triangle.k));
          vectors.push(new Vector(triangle.k, triangle.i));
        });
        setVectors(vectors);
      } catch (error) {
        console.error(error);
        triangulate();
      }
    }
    triangulate();
  }, [points]);

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

  const handleDeletePoint = (id: Point["id"]) => {
    const newPoints = points.filter((point) => point.id !== id);
    setPoints(newPoints);
  };

  const handleReset = () => {
    setPoints([]);
  };

  // Todo. set origin of coordinate system to bottom left
  return (
    <div>
      <div className="mb-8 flex w-full items-end justify-between">
        <div>
          <ResetButton onClick={handleReset} />
        </div>
      </div>
      <DelaunyCanvas
        points={points}
        vectors={vectors}
        onAddPoint={handleAddPoint}
        onDeletePoint={handleDeletePoint}
      />
    </div>
  );
}

export default Delauny;
