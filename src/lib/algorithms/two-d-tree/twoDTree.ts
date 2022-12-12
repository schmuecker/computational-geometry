// Pseudo Code from : https://www.youtube.com/watch?v=G84XQfP4FTU :)
import TreeModel, { Node as NodeType } from "tree-model/types";
import Tree from "tree-model";
import { klona } from "klona";
import { Point } from "../../geometry";

type Knot = NodeType<Point>;

const sortPointsInPlace = (points: Point[], coordinate: "x" | "y") => {
  points.sort((a, b) => {
    if (a[coordinate] >= b[coordinate]) {
      return 1;
    }
    if (a[coordinate] < b[coordinate]) {
      return -1;
    }
    return 0;
  });
};

const getMedian = (points: Point[]) => {
  const mid = Math.floor(points.length / 2);
  return points[mid];
};

class TwoDTree {
  pointsX: Point[] = [];
  pointsY: Point[] = [];
  tree: TreeModel;

  constructor(points: Point[]) {
    this.pointsX = klona(points);
    this.pointsY = klona(points);
    sortPointsInPlace(this.pointsX, "x");
    sortPointsInPlace(this.pointsY, "y");
    const medianPoint = getMedian(this.pointsX);
    this.tree = new Tree();
    const rootNode = this.tree.parse(medianPoint);
    this.build2DTree(0, points.length - 1, "ver", rootNode);
  }

  partitionField(
    points: Point[],
    leftIdx: number,
    rightIdx: number,
    medianIdx: number,
    direction: "hor" | "ver"
  ) {
    let multipleCoords = false;
    const tmpPoints1: Point[] = [];
    const tmpPoints2: Point[] = [];
    // When the direction is vertical, the x coordinate is used
    const coordKey = direction === "ver" ? "x" : "y";
    // When the direction is vertical, the x list is used for partitioning
    const medianPoint =
      direction === "ver" ? this.pointsX[medianIdx] : this.pointsY[medianIdx];
    // Partition the point list
    // (depends on direction)
    for (let i = leftIdx; i < rightIdx; i++) {
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
          console.error("Second duplicate found.", points);
          console.error("Warning: multiple X/Y coordinates");
        }
        multipleCoords = true;
      }
    }
    // Update median point
    points[medianIdx] = medianPoint;
    // Copy back temporary list
    for (let i = 0; i < tmpPoints1.length; i++) {
      points[leftIdx + i] = tmpPoints1[i];
    }
    for (let i = 0; i < tmpPoints2.length; i++) {
      points[medianIdx + i + 1] = tmpPoints2[i];
    }
  }

  build2DTree(
    leftIdx: number,
    rightIdx: number,
    direction: "hor" | "ver",
    knot?: Knot,
    parentKnot?: Knot
  ) {
    if (leftIdx <= rightIdx) {
      const medianIdx = Math.floor((leftIdx + rightIdx) / 2);
      if (direction === "ver") {
        const medianPoint = this.pointsX[medianIdx];
        knot = this.tree.parse(medianPoint);
        this.partitionField(
          this.pointsY,
          leftIdx,
          rightIdx,
          medianIdx,
          direction
        );
      } else {
        const medianPoint = this.pointsY[medianIdx];
        knot = this.tree.parse(medianPoint);
        this.partitionField(
          this.pointsX,
          leftIdx,
          rightIdx,
          medianIdx,
          direction
        );
      }
      if (parentKnot) {
        parentKnot.addChild(knot);
      }
      const invertedDirection = direction === "hor" ? "ver" : "hor";
      this.build2DTree(
        leftIdx,
        medianIdx - 1,
        invertedDirection,
        undefined,
        knot
      );
      this.build2DTree(
        medianIdx + 1,
        rightIdx,
        invertedDirection,
        undefined,
        knot
      );
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
  }
}

export { TwoDTree };
