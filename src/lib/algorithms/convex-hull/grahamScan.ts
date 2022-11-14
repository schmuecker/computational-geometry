import { Point, Vector } from "../../geometry";
import { checkClockwiseTurn, radToDegrees, ORIENTATION } from "../../helper";

function grahamScan(points: Point[]): Vector[] {
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

  // 2. Step
  // sort the remaining points by the angle, relative to the lowest point and the horizontal
  const remainingPoints = points.filter(function (item) {
    return item.id != highestPoint.id;
  });

  const relativePointList = [];
  for (const point of remainingPoints) {
    // const angle = horizontal.cross(new Vector(highestPoint, point));
    const angle = radToDegrees(
      Math.atan2(point.y - highestPoint.y, point.x - highestPoint.x)
    );

    relativePointList.push({ point, angle });
  }

  // Sort remaining points by angle to the highest point
  relativePointList.sort((a, b) => {
    if (a.angle >= b.angle) {
      return 1;
    }
    if (a.angle < b.angle) {
      return -1;
    }
    if (a.angle == b.angle) {
      // Todo check which point is further away
      return 0;
    }
    return 0;
  });

  // 3. Step
  // iterate over points in sorted order
  // Put Point on stack if it makes a COUNTERCLOCKWISE turn relative to the previous 2 points on stack
  // the highest point, and the point with the minimal angle are guarenteed in the convex hull
  const secondPoint = relativePointList.shift()?.point;
  if (!secondPoint) return [];

  const stack: Point[] = [highestPoint, secondPoint];

  for (const relativePoint of relativePointList) {
    const next = relativePoint.point;

    // pop points off the stack as long as the vector makes a clockwise turn
    while (
      checkClockwiseTurn(
        stack[stack.length - 2],
        stack[stack.length - 1],
        next
      ) === ORIENTATION.CW
    ) {
      // delete points that create clockwise turn
      stack.pop();
    }

    stack.push(next);
  }

  // Step 4
  // from the points in the Stack create a List of Vectors which can be displayed on the canvas
  let lastPoint = stack[0];
  let vectorList = [];
  for (let i = 1; i < stack.length; i++) {
    vectorList.push(new Vector(lastPoint, stack[i]));
    lastPoint = stack[i];
  }

  vectorList.push(new Vector(lastPoint, stack[0]));
  return vectorList;
}

export { grahamScan };
