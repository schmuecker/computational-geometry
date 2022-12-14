import { useEffect, useMemo, useState } from "react";
import { TwoDTree } from "../../lib/algorithms/two-d-tree/twoDTree";
import { Point, Vector } from "../../lib/geometry";
import TreeVisualization from "./TreeVisualization/TreeVisualization";
import TwoDTreesCanvas from "./TwoDTreesCanvas/TwoDTreesCanvas";

const useDrawPartition = (tree, points) => {
  const [vectors, setVectors] = useState<Vector[]>([]);

  useEffect(() => {
    const vectors: Vector[] = [];
    const drawPartition = (node, boundary = 1000, direction = "ver") => {
      const isHor = direction === "hor";
      const isVer = direction === "ver";
      const startX = isHor && node.model.x < boundary ? 0 : boundary;
      const startY = isVer && node.model.y < boundary ? 0 : boundary;
      const endX = startX === 0 ? boundary : 1000;
      const endY = startY === 0 ? boundary : 1000;
      const start = new Point(
        isHor ? startX : node.model.x,
        isHor ? node.model.y : startY
      );
      const end = new Point(
        isHor ? endX : node.model.x,
        isHor ? node.model.y : endY
      );
      const vector = new Vector(start, end);
      // console.log(vector.a, vector.b);
      vectors.push(vector);
      if (node.children) {
        node.children.forEach((childNode) => {
          const newBoundary = isHor ? node.model.y : node.model.x;
          const invertedDirection = isHor ? "ver" : "hor";
          drawPartition(childNode, newBoundary, invertedDirection);
        });
      }
    };
    if (points.length > 0) {
      drawPartition(tree.rootNode);
    }
    setVectors(vectors);
  }, [points]);

  return vectors;
};

const TwoDTrees = () => {
  const [points, setPoints] = useState<Point[]>([]);

  const twoDTree = new TwoDTree(points);
  const vectors = useDrawPartition(twoDTree, points);

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

  return (
    <div className="columns-2">
      <TwoDTreesCanvas
        points={points}
        vectors={vectors}
        onAddPoint={handleAddPoint}
        onDeletePoint={handleDeletePoint}
      />
      <TreeVisualization rootNode={twoDTree.rootNode} />
    </div>
  );
};

export default TwoDTrees;
