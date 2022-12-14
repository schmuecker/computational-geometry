import { useEffect, useMemo, useState } from "react";
import { TwoDTree } from "../../lib/algorithms/two-d-tree/twoDTree";
import { Point, Vector } from "../../lib/geometry";
import TreeVisualization from "./TreeVisualization/TreeVisualization";
import TwoDTreesCanvas from "./TwoDTreesCanvas/TwoDTreesCanvas";

const useDrawPartition = (tree, points) => {
  const [vectors, setVectors] = useState<Vector[]>([]);

  useEffect(() => {
    const vectors: Vector[] = [];
    const drawPartition = (
      node,
      verBounds = { cur: 0, prev: 0 },
      horBounds = { cur: 1000, prev: 0 },
      direction = "ver"
    ) => {
      const isHor = direction === "hor";
      const isVer = direction === "ver";

      const xCoord = node.model.x;
      const yCoord = node.model.y;

      let startX = isHor && xCoord < verBounds.cur ? 0 : verBounds.cur;
      let startY = isVer && yCoord < horBounds.cur ? 0 : horBounds.cur;
      let endX = startX === 0 ? verBounds.cur : 1000;
      let endY = startY === 0 ? horBounds.cur : 1000;

      if (
        isVer &&
        ((horBounds.cur > yCoord && yCoord > horBounds.prev) ||
          (horBounds.prev > yCoord && yCoord > horBounds.cur))
      ) {
        startY = horBounds.cur;
        endY = horBounds.prev;
      }

      if (
        isHor &&
        ((verBounds.cur > xCoord && xCoord > verBounds.prev) ||
          (verBounds.prev > xCoord && xCoord > verBounds.cur))
      ) {
        startX = verBounds.cur;
        endX = verBounds.prev;
      }

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
          const invertedDirection = isHor ? "ver" : "hor";

          if (isHor) {
            const newHorBounds = { cur: yCoord, prev: horBounds.cur };
            drawPartition(
              childNode,
              verBounds,
              newHorBounds,
              invertedDirection
            );
          } else {
            const newVerBounds = { cur: xCoord, prev: verBounds.cur };
            drawPartition(
              childNode,
              newVerBounds,
              horBounds,
              invertedDirection
            );
          }
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
