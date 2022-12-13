import { useEffect, useState } from "react";
import { TwoDTree } from "../../lib/algorithms/two-d-tree/twoDTree";
import generateRandomPoints from "../../lib/generator/randomPoints";
import { Point } from "../../lib/geometry";
import TwoDTreesCanvas from "./TwoDTreesCanvas/TwoDTreesCanvas";

const TwoDTrees = () => {
  const [points, setPoints] = useState<Point[]>([]);

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

  useEffect(() => {
    const twoDTree = new TwoDTree(points);
    twoDTree.rootNode?.walk({ strategy: "breadth" }, (node) => {
      console.log("visited", node);
      return true;
    });
  }, [points]);

  return (
    <TwoDTreesCanvas
      points={points}
      vectors={[]}
      onAddPoint={handleAddPoint}
      onDeletePoint={handleDeletePoint}
    />
  );
};

export default TwoDTrees;
