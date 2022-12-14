import { Point, Vector } from "../../geometry";
import { checkClockwiseTurn, ORIENTATION } from "../../helper";

function jarvisMarch(points: Point[]): Vector[] {
  if (points.length < 2) {
    return [];
  }

  // 1. Step
  // Loop over list of Points and select the one with the lowest Y coordinate
  // lowest point is guarenteed to be part of the convex Hull
  // Top Left corner is [0,0]
  let highestPoint = points[0];

  for (const point of points) {
    if (point.y < highestPoint.y) {
      highestPoint = point;
    }
  }

  const startingPoint = highestPoint;
  const convexHull: Point[] = [startingPoint];
  let prevVertex = startingPoint;

  // Step 2
  //
  let complete = false;
  while (!complete) {
    let canditate = null;
    for (const point of points) {
      if (point == prevVertex) continue;
      if (canditate == null) {
        canditate = point;
        continue;
      }
      const cw = checkClockwiseTurn(prevVertex, canditate, point);
      // TODO: distance comparison
      // if ( cw === ORIENTATION.EQUAL && distance(prevVertex, canditate) < distance(prevVertex, point)){
      //   canditate = point
      // }
      if (cw === ORIENTATION.CCW) {
        canditate = point;
      }
    }
    if (canditate === startingPoint) complete = true;
    if (!canditate) continue;

    convexHull.push(canditate);
    prevVertex = canditate;
  }

  // Step 4
  // from the points in the Stack create a List of Vectors which can be displayed on the canvas
  let lastPoint = convexHull[0];
  const vectorList = [];
  for (let i = 1; i < convexHull.length; i++) {
    vectorList.push(new Vector(lastPoint, convexHull[i]));
    lastPoint = convexHull[i];
  }

  vectorList.push(new Vector(lastPoint, convexHull[0]));
  return vectorList;
}

export { jarvisMarch };
