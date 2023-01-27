import { Point, Vector } from "../../geometry";
import { grahamScan } from "../convex-hull/grahamScan";

// shuffle the point array
function shuffle(array: Point[]) {
  let j, x, i;
  for (i = array.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = array[i];
    array[i] = array[j];
    array[j] = x;
  }
  return array;
}

// connect the corners of the Hull to the points
function connect(point: Point, hull: Vector[]) {
  const triangles = hull.map((edge) => {
    // triangle forms a linked list ( all vectors in he same direction)
    const triangle = [new Vector(edge.a, edge.b)];
    triangle[1] = new Vector(edge.b, point);
    triangle[2] = new Vector(point, edge.a);
    return triangle;
  });

  return triangles;
}

function sign(p1: Point, p2: Point, p3: Point) {
  return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
}

function pointInTriangle(pt: Point, triangle: Vector[]) {
  const p1 = triangle[0].a;
  const p2 = triangle[1].a;
  const p3 = triangle[2].a;

  const d1 = sign(pt, p1, p2);
  const d2 = sign(pt, p2, p3);
  const d3 = sign(pt, p3, p1);

  const has_neg = d1 < 0 || d2 < 0 || d3 < 0;
  const has_pos = d1 > 0 || d2 > 0 || d3 > 0;

  return !(has_neg && has_pos);
}

function pointInCircle(point: Point, p1: Point, p2: Point, p3: Point) {
  // calculate the area of the triangle formed by the three points
  const area =
    0.5 *
    (-p2.y * p3.x + p1.y * (-p2.x + p3.x) + p1.x * (p2.y - p3.y) + p2.x * p3.y);

  // calculate the center of the circle by averaging the x and y coordinates of the three points
  const center = {
    x: (1 / (3 * area)) * (p1.x + p2.x + p3.x),
    y: (1 / (3 * area)) * (p1.y + p2.y + p3.y),
  };

  // calculate the radius of the circle using the distance formula
  const radius = Math.sqrt(
    Math.pow(p1.x - center.x, 2) + Math.pow(p1.y - center.y, 2)
  );

  // check if the point is within the circle using the distance formula
  return (
    Math.sqrt(
      Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2)
    ) <= radius
  );
}

function delaunyTriangulation(points: Point[]): Vector[] {
  if (points.length < 3) {
    return [];
  }
  // compute the convex Hull of P
  const convexHull = grahamScan(points);

  // Get the points that lie on the Convex Hull
  const hullPoints = convexHull.map((vector) => {
    return vector.a;
  });

  // compute the set of inner Points
  const innerPoints = points.filter((point) => {
    if (!hullPoints.includes(point)) return point;
  });

  if (innerPoints.length === 0) {
    return convexHull;
  }

  // shuffle the Inner points
  const shuffledInnerPoints = shuffle([...innerPoints]);

  // Compute init Triangulation D
  let triangulation = connect(shuffledInnerPoints[0], convexHull);

  for (let index = 1; index < shuffledInnerPoints.length; index++) {
    const point_r = shuffledInnerPoints[index];

    // find the triangle containing p_r
    const containingTriangle = triangulation.filter((triangle) => {
      if (pointInTriangle(point_r, triangle)) return triangle;
    });

    // find all triangles which delauny is violated ?
    // >>> this approach does not use the adjacency of the triangles <<<
    // and it doesnt even work

    // const valid: Vector[][] = [];
    // const violated: Vector[][] = [];

    // triangulation.forEach((triangle) => {
    //   const point_a = triangle[0].a;
    //   const point_b = triangle[1].a;
    //   const point_c = triangle[2].a;

    //   if (pointInCircle(point_r, point_a, point_b, point_c)) {
    //     violated.push(triangle);
    //   } else {
    //     valid.push(triangle);
    //   }
    // });

    // const holePoints: Point[] = [];
    // violated.forEach((triangle) => {
    //   holePoints.push(triangle[0].a);
    //   holePoints.push(triangle[1].a);
    //   holePoints.push(triangle[2].a);
    // });

    // const innerHull = grahamScan([...new Set(holePoints)]);

    // const innerTriangulation =  connect(point_r, innerHull);

    // triangles in violated are the ones that are violated
    // the temaining triangulation with the hole is in valid

    // we have the 3 Points of the containing Triangle
    // search for the neighbour triangles and check if the delauny condition is violated.
    // if yes remove the triangle and add the new corner to the hole
    triangulation = [...triangulation];

    console.log("Containing Triangle", containingTriangle);
  }

  return triangulation.flat();
}

export { delaunyTriangulation };
