// Pseudo Code from : https://www.youtube.com/watch?v=G84XQfP4FTU :)

import { Point } from "../../geometry";

const sortPoints = (points: Point[], coordinate: "x" | "y") => {
  points.sort((a, b) => {
    if (a[coordinate] >= b[coordinate]) {
      return 1;
    }
    if (a[coordinate] < b[coordinate]) {
      return -1;
    }
    return 0;
  });

  return points;
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

const build2DTree = (points: Point[], depth: number) => {
  if (points.length === 1) {
    // retun leaf storing the pt in P
    // create new leaf object instead of returning only the point?
    return points[0];
  } else {
    if (depth % 2 === 0) {
      // Depth is even
      // split P with vertical line at median
      const median = getMedian(points, "ver");
    } else {
      // Depth is odd
      // split P with horizontal line at median
      const median = getMedian(points, "hor");
    }
  }
};
