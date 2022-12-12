// Pseudo Code from : https://www.youtube.com/watch?v=G84XQfP4FTU :)
import { Node as NodeType } from "tree-model/types";
import Tree, { Node } from "tree-model";
import { produce } from "immer";
import { Point } from "../../geometry";

const sortPoints = (points: Point[], coordinate: "x" | "y") => {
  const sortedPoints = produce(points, (draft) => {
    draft.sort((a, b) => {
      if (a[coordinate] >= b[coordinate]) {
        return 1;
      }
      if (a[coordinate] < b[coordinate]) {
        return -1;
      }
      return 0;
    });
  });
  return sortedPoints;
};

const getMedian = (points: Point[]) => {
  const mid = Math.floor(points.length / 2);
  return points[mid];
};

const partitionField = (
  X: Point[],
  Y: Point[],
  points: Point[],
  leftIdx: number,
  rightIdx: number,
  medianIdx: number,
  direction: "hor" | "ver"
) => {
  console.log({ X, Y });
  let multipleCoords = false;
  const tmpPoints1: Point[] = [];
  const tmpPoints2: Point[] = [];
  // When the direction is vertical, the x coordinate is used
  const coordKey = direction === "ver" ? "x" : "y";
  // When the direction is vertical, the x list is used for partitioning
  const medianPoint = direction === "ver" ? X[medianIdx] : Y[medianIdx];
  // Partition the point list
  // (depends on direction)
  for (let i = leftIdx; i < rightIdx; i++) {
    const point = points[i];
    console.log({ point });
    const pointCoord = point[coordKey];
    const medianCoord = medianPoint[coordKey];
    if (pointCoord < medianCoord) {
      tmpPoints1.push(point);
    }
    if (pointCoord > medianCoord) {
      tmpPoints2.push(point);
    }
    if (pointCoord === medianCoord) {
      if (multipleCoords) {
        console.error("Warning: multiple X/Y coordinates");
      }
      multipleCoords = true;
    }
  }
  // Update median point
  points[medianIdx] = new Point(medianPoint.x, medianPoint.y);
  // Copy back temporary list
  for (let i = 0; i < tmpPoints1.length; i++) {
    points[leftIdx + i] = tmpPoints1[i];
  }
  for (let i = 0; i < tmpPoints2.length; i++) {
    points[medianIdx + i + 1] = tmpPoints2[i];
  }
};

type Knot = NodeType<Point>;

const build2DTree = (
  X: Point[],
  Y: Point[],
  leftIdx: number,
  rightIdx: number,
  knot: Knot,
  direction: "hor" | "ver"
) => {
  if (leftIdx <= rightIdx) {
    const medianIdx = Math.floor((leftIdx + rightIdx) / 2);
    if (direction === "ver") {
      knot.model = X[medianIdx];
      partitionField(X, Y, Y, leftIdx, rightIdx, medianIdx, direction);
    } else {
      knot.model = Y[medianIdx];
      partitionField(X, Y, X, leftIdx, rightIdx, medianIdx, direction);
    }
    const leftPoint = new Point(0, 0);
    const rightPoint = new Point(0, 0);
    const leftNode = new Node(undefined, {
      key: leftPoint.id,
      value: leftPoint,
    });
    console.log({ leftNode });
    const rightNode = new Node(undefined, {
      key: rightPoint.id,
      value: rightPoint,
    });
    knot.addChild(leftNode);
    knot.addChild(rightNode);
    console.log({ knot });
    const invertedDirection = direction === "hor" ? "ver" : "hor";
    // build2DTree(leftIdx, medianIdx - 1, knot.left, invertedDirection);
    // build2DTree(medianIdx + 1, rightIdx, knot.right, invertedDirection);
  }
  // if (points.length === 1) {
  //   // retun leaf storing the pt in P
  //   // create new leaf object instead of returning only the point?
  //   return points[0];
  // } else {
  //   if (depth % 2 === 0) {
  //     // Depth is even
  //     // split P with vertical line at median
  //     const median = getMedian(points, "ver");
  //   } else {
  //     // Depth is odd
  //     // split P with horizontal line at median
  //     const median = getMedian(points, "hor");
  //   }
  // }
};

class TwoDTree {
  pointsX: Point[] = [];
  pointsY: Point[] = [];

  constructor(points: Point[]) {
    this.pointsX = sortPoints(points, "x");
    this.pointsY = sortPoints(points, "y");
    const medianPoint = getMedian(this.pointsX);
    const tree = new Tree();
    const rootNode = tree.parse({ key: medianPoint.id, value: medianPoint });
    build2DTree(this.pointsX, this.pointsY, 0, points.length, rootNode, "ver");
  }
}

export { TwoDTree };
