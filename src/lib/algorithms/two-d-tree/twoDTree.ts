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
  tree: TreeModel = new Tree();
  rootNode: Knot | undefined;

  constructor(points: Point[]) {
    if (points.length === 0) {
      return;
    }
    this.pointsX = klona(points);
    this.pointsY = klona(points);
    sortPointsInPlace(this.pointsX, "x");
    sortPointsInPlace(this.pointsY, "y");
    const { pointsX, pointsY } = this;
    console.log(pointsX, pointsY);
    const medianPoint = getMedian(this.pointsX);
    this.tree = new Tree();
    this.rootNode = this.tree.parse(medianPoint);
    this.build2DTree(0, points.length - 1, this.rootNode, "ver");
    console.log("Done.", this.rootNode);
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
        console.log("First duplicate found", points);
        multipleCoords = true;
      }
    }
    // Update median point
    console.log("Update median point", points[medianIdx]);
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
    knot: Knot,
    direction: "hor" | "ver"
  ) {
    console.log({ leftIdx, rightIdx, knot, direction });
    if (leftIdx <= rightIdx) {
      const medianIdx = Math.floor((leftIdx + rightIdx) / 2);
      console.log({ medianIdx });
      if (direction === "ver") {
        console.log("| Vertical |");
        console.log("Knot is", { ...knot });
        const medianPoint = this.pointsX[medianIdx];
        knot.model = {
          ...knot.model,
          id: medianPoint.id,
          x: medianPoint.x,
          y: medianPoint.y,
        };
        this.partitionField(
          this.pointsY,
          leftIdx,
          rightIdx,
          medianIdx,
          direction
        );
      } else {
        console.log("- Horizontal -");
        console.log("Knot is", { ...knot });
        const medianPoint = this.pointsY[medianIdx];
        knot.model = {
          ...knot.model,
          id: medianPoint.id,
          x: medianPoint.x,
          y: medianPoint.y,
        };
        this.partitionField(
          this.pointsX,
          leftIdx,
          rightIdx,
          medianIdx,
          direction
        );
      }
      const leftPoint = new Point(0, 0);
      const rightPoint = new Point(0, 0);
      const leftNode = this.tree.parse(leftPoint);
      const rightNode = this.tree.parse(rightPoint);
      knot.addChild(leftNode);
      knot.addChild(rightNode);
      const invertedDirection = direction === "hor" ? "ver" : "hor";
      console.log({ parentNode: knot, leftIdx, medianIdx });
      this.build2DTree(leftIdx, medianIdx - 1, leftNode, invertedDirection);
      console.log({ medianIdx, rightIdx });
      this.build2DTree(medianIdx + 1, rightIdx, rightNode, invertedDirection);
    }
  }
}

export { TwoDTree };
