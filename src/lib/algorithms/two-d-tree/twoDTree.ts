// Pseudo Code from : https://www.youtube.com/watch?v=G84XQfP4FTU :)

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

const getMedian = (points: Point[], alignment: "hor" | "ver") => {
  let sortedPoints;
  if (alignment === "hor") {
    sortedPoints = sortPoints(points, "y");
  } else {
    sortedPoints = sortPoints(points, "x");
  }

  const mid = Math.floor(points.length / 2);

  return points[mid];
};

const X: Point[] = [];
const Y: Point[] = [];

const partitionField = (
  points: Point[],
  leftIdx: number,
  rightIdx: number,
  medianIdx: number,
  direction: "hor" | "ver"
) => {
  let multipleCoords = false;
  const tmpPoints1: Point[] = [];
  const tmpPoints2: Point[] = [];
  const coordKey = direction === "ver" ? "x" : "y";
  const medianPoint = direction === "ver" ? X[medianIdx] : Y[medianIdx];
  // Partition the point list
  // (depends on direction)
  for (let i = leftIdx; i <= rightIdx; i++) {
    const point = points[i];
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

type Knot = {
  value: any;
  direction: "ver" | "hor";
  parent: Knot;
  left: Knot;
  right: Knot;
};

const build2DTree = (
  leftIdx: number,
  rightIdx: number,
  knot: Knot,
  direction: "hor" | "ver"
) => {
  if (leftIdx <= rightIdx) {
    const medianIdx = Math.floor((leftIdx + rightIdx) / 2);
    if (direction === "ver") {
      knot.value = X[medianIdx];
      partitionField(Y, leftIdx, rightIdx, medianIdx, direction);
    } else {
      knot.value = Y[medianIdx];
      partitionField(X, leftIdx, rightIdx, medianIdx, direction);
    }
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
    build2DTree(0, points.length);
  }
}

export { TwoDTree };
