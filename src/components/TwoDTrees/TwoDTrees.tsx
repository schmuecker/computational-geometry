import { useEffect, useMemo, useState } from "react";
import { IKnot, TwoDTree } from "../../lib/algorithms/two-d-tree/twoDTree";
import { Point, Vector } from "../../lib/geometry";
import TreeVisualization from "./TreeVisualization/TreeVisualization";
import TwoDTreesCanvas from "./TwoDTreesCanvas/TwoDTreesCanvas";

interface SearchRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const useDrawPartition = (tree: TwoDTree, points: Point[]) => {
  const [vectors, setVectors] = useState<Vector[]>([]);

  useEffect(() => {
    const vectors: Vector[] = [];
    const drawPartition = (
      node: IKnot,
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
        node.children.forEach((childNode: IKnot) => {
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
    if (points.length > 0 && tree.rootNode) {
      drawPartition(tree.rootNode);
    }
    setVectors(vectors);
  }, [points]);

  return vectors;
};

const useRangeSearch = (tree: TwoDTree, searchRect: SearchRect | undefined) => {
  const [result, setResult] = useState<{ output: IKnot[]; visited: IKnot[] }>({
    output: [],
    visited: [],
  });
  useEffect(() => {
    if (
      !searchRect ||
      Math.abs(searchRect.width) < 2 ||
      Math.abs(searchRect.height) < 2
    ) {
      setResult({ output: [], visited: [] });
      return;
    }
    const { x, y, width, height } = searchRect;

    const searchQuery = { x1: 0, x2: 0, y1: 0, y2: 0 };
    if (width > 0) {
      searchQuery.x1 = x;
      searchQuery.x2 = x + width;
    } else {
      searchQuery.x1 = x + width;
      searchQuery.x2 = x;
    }

    if (height > 0) {
      searchQuery.y1 = y;
      searchQuery.y2 = y + height;
    } else {
      searchQuery.y1 = y + height;
      searchQuery.y2 = y;
    }

    const result = tree.rangeSearchCall(searchQuery);
    if (result) {
      setResult(result);
    }
  }, [searchRect]);
  return result;
};

const TwoDTrees = () => {
  const [points, setPoints] = useState<Point[]>([]);
  const [hoverPoint, setHoverPoint] = useState<Point>();
  const [searchRect, setSearchRect] = useState<SearchRect>();

  const twoDTree = new TwoDTree(points);
  const vectors = useDrawPartition(twoDTree, points);
  const searchResult = useRangeSearch(twoDTree, searchRect);

  const handleAddPoint = (newPoint: Point) => {
    if (points.length >= 31) {
      console.warn("Maximum amount of diplayable points is 32");
      return;
    }
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

  const handleHoverPoint = (point?: Point) => {
    setHoverPoint(point);
  };

  const handleReset = () => {
    setPoints([]);
  };

  return (
    <div className="columns-2">
      <TwoDTreesCanvas
        points={points}
        vectors={vectors}
        searchRect={searchRect}
        onSearchRectChange={setSearchRect}
        onAddPoint={handleAddPoint}
        onDeletePoint={handleDeletePoint}
        onHoverPoint={handleHoverPoint}
        markedPoint={hoverPoint}
        searchResult={searchResult}
      />
      <TreeVisualization
        rootNode={twoDTree.rootNode}
        onHoverPoint={handleHoverPoint}
        markedPoint={hoverPoint}
        searchResult={searchResult}
      />
    </div>
  );
};

export default TwoDTrees;
