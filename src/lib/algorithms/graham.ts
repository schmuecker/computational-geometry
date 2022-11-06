import { Point, Vector } from "../geometry";

function grahamScan(points: Point[]): Vector[] {
  if (points.length < 2) {
    return [];
  }
  return [new Vector(points[0], points[1])];
}

export { grahamScan };
