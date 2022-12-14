import { useEffect, useState } from "react";
import { TwoDTree } from "../../lib/algorithms/two-d-tree/twoDTree";
import generateRandomPoints from "../../lib/generator/randomPoints";
import { Point, Vector } from "../../lib/geometry";
import TwoDTreesCanvas from "./TwoDTreesCanvas/TwoDTreesCanvas";

const TwoDTrees = () => {
  const [points, setPoints] = useState<Point[]>([]);
  const [vectors, setVectors] = useState<Vector[]>([]);

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
    console.log("tree", twoDTree.rootNode);
    const vectors: Vector[] = [];
    // let layer = 0;
    // twoDTree.rootNode?.walk({ strategy: "breadth" }, (node) => {
    //   if (layer === 0) {
    //     const a = new Point(0, node.model.y);
    //     const b = new Point(1000, node.model.y);
    //     vectors.push(new Vector(a, b));
    //   }
    //   if (lay)
    //   layer++;
    //   return true;
    // });
    const drawPartition = (node, boundary = 0, direction = "ver") => {
      const isHor = direction === "hor";
      const startX = isHor && node.model.x < boundary ? 0 : boundary;
      const endX = startX === 0 ? boundary : 1000;
      const startY = !isHor && node.model.y < boundary ? 0 : boundary;
      const endY = startY === 0 ? boundary : 1000;
      const start = new Point(
        isHor ? startX : node.model.x,
        isHor ? node.model.y : startY
      );
      const end = new Point(
        isHor ? endX : node.model.x,
        isHor ? node.model.y : endY
      );
      vectors.push(new Vector(start, end));
      if (node.children) {
        node.children.forEach((childNode) => {
          const newBoundary = isHor ? node.model.y : node.model.x;
          const invertedDirection = isHor ? "ver" : "hor";
          drawPartition(childNode, newBoundary, invertedDirection);
        });
      }
    };
    if (points.length > 0) {
      drawPartition(twoDTree.rootNode);
    }
    setVectors(vectors);
  }, [points]);

  return (
    <TwoDTreesCanvas
      points={points}
      vectors={vectors}
      onAddPoint={handleAddPoint}
      onDeletePoint={handleDeletePoint}
    />
  );
};

export default TwoDTrees;
