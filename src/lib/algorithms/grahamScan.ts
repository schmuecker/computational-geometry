import { Point, Vector } from "../geometry";
import { checkClockwiseTurn, radToDegrees, ORIENTATION } from "../helper";

function grahamScan(points: Point[]): Vector[] {
  console.log("Graham Scan");
  if (points.length < 3) {
    return [];
  }

  // Sort remaining points by angle to the highest point
  points.sort((a, b) => {
    if (a.x < b.x) {
      return 1;
    } else if (a.x > b.x) {
      return -1;
    } else {
      // Todo check which point is further away
      if (a.y < b.y) {
        return 1;
      } else {
        return -1;
      }
    }
  });

  // 3. Step
  // iterate over points in sorted order
  // Put Point on stack if it makes a CLOCKWISE turn relative to the previous 2 points on stack
  // the highest point, and the point with the minimal angle are guarenteed in the convex hull

  const upperHalf: Point[] = [points[0], points[1]];

  for (const next of points.slice(2)) {
    // pop points off the stack as long as the vector makes a clockwise turn
    console.log("upper");
    while (
      upperHalf[upperHalf.length - 2] != undefined &&
      checkClockwiseTurn(
        upperHalf[upperHalf.length - 2],
        upperHalf[upperHalf.length - 1],
        next
      ) === ORIENTATION.CCW
    ) {
      // delete points that create clockwise turn
      upperHalf.pop();
    }

    upperHalf.push(next);
  }

  const reversePoints = points.slice().reverse();
  // Lower Half
  const lowerHalf: Point[] = [reversePoints[0], reversePoints[1]];

  for (const next of reversePoints.slice(2)) {
    console.log("lower");
    // pop points off the stack as long as the vector makes a clockwise turn
    while (
      lowerHalf[lowerHalf.length - 2] != undefined &&
      checkClockwiseTurn(
        lowerHalf[lowerHalf.length - 2],
        lowerHalf[lowerHalf.length - 1],
        next
      ) === ORIENTATION.CCW
    ) {
      // delete points that create clockwise turn
      lowerHalf.pop();
    }

    lowerHalf.push(next);
  }

  lowerHalf.pop();
  lowerHalf.shift();

  const polygonPoints = lowerHalf.concat(upperHalf);

  // Step 4
  // from the points in the Stack create a List of Vectors which can be displayed on the canvas
  let lastPoint = polygonPoints[0];
  let vectorList = [];
  for (let i = 1; i < polygonPoints.length; i++) {
    vectorList.push(new Vector(lastPoint, polygonPoints[i]));
    lastPoint = polygonPoints[i];
  }

  vectorList.push(new Vector(lastPoint, polygonPoints[0]));
  return vectorList;
}

export { grahamScan };
