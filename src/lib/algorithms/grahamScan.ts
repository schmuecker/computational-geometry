import { Point, Vector } from "../geometry";
import { checkClockwiseTurn, ORIENTATION } from "../helper";

function grahamScan(points: Point[]): Vector[] {
  console.log("Graham Scan");
  if (points.length < 3) {
    return [];
  }

  // Step 1 Sort points
  // Sort points by x coordinate
  points.sort((a, b) => {
    if (a.x < b.x) {
      return 1;
    } else if (a.x > b.x) {
      return -1;
    } else {
      // sort y coordinate if x is equal
      if (a.y < b.y) {
        return 1;
      } else {
        return -1;
      }
    }
  });

  // 2. Step
  // iterate over points in sorted order
  // Put Point in upper Hull if it makes a CLOCKWISE turn relative to the previous 2 points on stack
  // Repeat for lower Hull with reversed points

  // Upper Hull
  const upperHalf: Point[] = [points[0], points[1]];

  for (const next of points.slice(2)) {
    // pop points off the stack as long as the vector makes a counterclockwise turn
    while (
      upperHalf[upperHalf.length - 2] != undefined &&
      checkClockwiseTurn(
        upperHalf[upperHalf.length - 2],
        upperHalf[upperHalf.length - 1],
        next
      ) === ORIENTATION.CCW
    ) {
      // delete points that create counterclockwise turn
      upperHalf.pop();
    }

    upperHalf.push(next);
  }

  // Lower Hull
  const reversePoints = points.slice().reverse();
  const lowerHalf: Point[] = [reversePoints[0], reversePoints[1]];

  for (const next of reversePoints.slice(2)) {
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

  // 3. Step
  // Remove first and last points of one Half (since they occure in both halfs)
  // and concat both halfs
  lowerHalf.pop();
  lowerHalf.shift();

  const hull = lowerHalf.concat(upperHalf);

  // Step 4
  // from the points in the hull create a List of Vectors which can be displayed on the canvas
  let lastPoint = hull[0];
  let vectorList = [];
  for (let i = 1; i < hull.length; i++) {
    vectorList.push(new Vector(lastPoint, hull[i]));
    lastPoint = hull[i];
  }

  vectorList.push(new Vector(lastPoint, hull[0]));
  return vectorList;
}

export { grahamScan };
