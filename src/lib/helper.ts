import { Point, Vector } from "./geometry";

const radToDegrees = function (radians: number) {
  return (radians * 180) / Math.PI;
};

const ORIENTATION = {
  CW: 1, // clockwise
  CCW: -1, // counterclockwise
  EQUAL: 0,
};

const checkClockwiseTurn = (pointA: Point, pointB: Point, next: Point) => {
  const baseVector = new Vector(pointA, pointB);
  const newVector = new Vector(pointB, next);

  const cross = baseVector.cross(newVector);

  if (Math.sign(cross) < 0) {
    // clockwise
    return ORIENTATION.CW;
  } else if (Math.sign(cross) > 0) {
    // counter clockwise
    return ORIENTATION.CCW;
  } else {
    return ORIENTATION.EQUAL;
  }
};

const isVectorHorizontal = (vector: Vector) => {
  if (vector.a.y === vector.b.y) {
    return true;
  }
  return false;
};

const isVectorVertical = (vector: Vector) => {
  if (vector.a.x === vector.b.x) {
    return true;
  }
  return false;
};

export {
  checkClockwiseTurn,
  radToDegrees,
  ORIENTATION,
  isVectorHorizontal,
  isVectorVertical,
};
