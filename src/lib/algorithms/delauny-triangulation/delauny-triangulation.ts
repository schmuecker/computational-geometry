import { Point, Vector } from "../../geometry";
import { grahamScan } from "../convex-hull/grahamScan";

export interface ITriangle {
  i: Point;
  j: Point;
  k: Point;
  neighbours?: {
    i_j?: ITriangle;
    j_k?: ITriangle;
    k_i?: ITriangle;
  };
  checked: boolean;
  removed: boolean;
}

interface IHullEdge {
  edge: Vector;
  neighbour?: ITriangle;
}

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
function connect(point: Point, hull: IHullEdge[], triangulation: ITriangle[]) {
  let firstTriangle: ITriangle | null = null;
  let prevTriangle: ITriangle | null = null;

  for (let index = 0; index < hull.length; index++) {
    const hullEdge = hull[index];

    // here you use the hull, because of the hull you know the triangles that are around the hull
    // these you can easy use to add the neighbours to the new triangle!
    // triangle forms a linked list
    const triangle: ITriangle = {
      i: point,
      j: hullEdge.edge.a,
      k: hullEdge.edge.b,
      checked: false,
      removed: false,
    };

    if (index === 0) {
      firstTriangle = triangle;
    }

    // prev triangle and this triangle are neighbours
    if (prevTriangle) {
      triangle.neighbours = { ...triangle.neighbours, i_j: prevTriangle };
      prevTriangle.neighbours = { ...prevTriangle.neighbours, k_i: triangle };
    }

    // last and first triangle are neighbours (because its a circle)
    if (index === hull.length - 1 && firstTriangle) {
      triangle.neighbours = { ...triangle.neighbours, k_i: firstTriangle };
      firstTriangle.neighbours = { ...firstTriangle.neighbours, i_j: triangle };
    }

    // the triangle on the hull edge is also a neighbour
    // the hullEdge has to know which edge it is from the outer triangle
    if (hullEdge.neighbour) {
      triangle.neighbours = { ...triangle.neighbours, j_k: hullEdge.neighbour };

      if (hullEdge.neighbour.neighbours?.i_j) {
        if (hullEdge.neighbour.neighbours.i_j.removed) {
          hullEdge.neighbour.neighbours.i_j = triangle;
        }
      }
      if (hullEdge.neighbour.neighbours?.j_k) {
        if (hullEdge.neighbour.neighbours.j_k.removed) {
          hullEdge.neighbour.neighbours.j_k = triangle;
        }
      }
      if (hullEdge.neighbour.neighbours?.k_i) {
        if (hullEdge.neighbour.neighbours.k_i.removed) {
          hullEdge.neighbour.neighbours.k_i = triangle;
        }
      }
    }

    triangulation.push(triangle);
    prevTriangle = triangle;
  }

  if (firstTriangle && prevTriangle) {
    firstTriangle.neighbours = {
      ...firstTriangle.neighbours,
      i_j: prevTriangle,
    };
  }

  console.log("Triangulation", triangulation);
  return triangulation;
}

function sign(p1: Point, p2: Point, p3: Point) {
  return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
}

function pointInTriangle(pt: Point, triangle: ITriangle) {
  const p1 = triangle.i;
  const p2 = triangle.j;
  const p3 = triangle.k;

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

function checkDelaunyCondition(point: Point, triangle: ITriangle) {
  return pointInCircle(point, triangle.i, triangle.j, triangle.k);
}

function findViolatedTriangles(triangle: ITriangle, point: Point) {
  let violatedTriangles: ITriangle[] = [];

  if (checkDelaunyCondition(point, triangle)) {
    return violatedTriangles;
  }

  violatedTriangles.push(triangle);
  triangle.checked = true;

  console.log("Start recursion");
  violatedTriangles = findViolatedNeighboursRecursion(
    triangle,
    point,
    violatedTriangles
  );

  return violatedTriangles;
}

function findViolatedNeighboursRecursion(
  triangle: ITriangle,
  point: Point,
  violatedTriangles: ITriangle[]
) {
  if (triangle.checked) {
    return violatedTriangles;
  }
  // code duplicates ... :)
  if (triangle.neighbours?.i_j) {
    const neighbour = triangle.neighbours.i_j;
    neighbour.checked = true;
    if (!checkDelaunyCondition(point, neighbour)) {
      violatedTriangles.push(neighbour);
      findViolatedNeighboursRecursion(neighbour, point, violatedTriangles);
    }
  }

  if (triangle.neighbours?.j_k) {
    const neighbour = triangle.neighbours.j_k;
    neighbour.checked = true;
    if (!checkDelaunyCondition(point, neighbour)) {
      violatedTriangles.push(neighbour);
      findViolatedNeighboursRecursion(neighbour, point, violatedTriangles);
    }
  }

  if (triangle.neighbours?.k_i) {
    const neighbour = triangle.neighbours.k_i;
    neighbour.checked = true;
    if (!checkDelaunyCondition(point, neighbour)) {
      violatedTriangles.push(neighbour);
      findViolatedNeighboursRecursion(neighbour, point, violatedTriangles);
    }
  }

  return violatedTriangles;
}

function removeTriangles(
  triangulation: ITriangle[],
  trianglesToRemove: ITriangle[]
) {
  return triangulation.filter((triangle) => {
    if (trianglesToRemove.includes(triangle)) {
      triangle.removed = true;
      return false;
    }
    return true;
  });
}

function getHull(violatedTriangles: ITriangle[]) {
  const innerHull: IHullEdge[] = [];

  violatedTriangles.forEach((triangle) => {
    // check all nieghboursof the violated triangles
    // if a neighbour is not violated it lies on the border of the hole
    // then add the edge with the neighbour triangle to the innerHull
    // when the edge has no neighbour it is the edge of the outer convex hull
    // then add the edge without a neighbour triangle
    if (triangle.neighbours?.i_j) {
      const neighbour = triangle.neighbours.i_j;
      if (!violatedTriangles.includes(neighbour)) {
        const edge = new Vector(triangle.i, triangle.j);
        innerHull.push({ edge, neighbour });
      }
    } else {
      const edge = new Vector(triangle.i, triangle.j);
      innerHull.push({ edge });
    }

    if (triangle.neighbours?.j_k) {
      const neighbour = triangle.neighbours.j_k;
      if (!violatedTriangles.includes(neighbour)) {
        const edge = new Vector(triangle.i, triangle.j);
        innerHull.push({ edge, neighbour });
      }
    } else {
      const edge = new Vector(triangle.i, triangle.j);
      innerHull.push({ edge });
    }

    if (triangle.neighbours?.k_i) {
      const neighbour = triangle.neighbours.k_i;
      if (!violatedTriangles.includes(neighbour)) {
        const edge = new Vector(triangle.i, triangle.j);
        innerHull.push({ edge, neighbour });
      }
    } else {
      const edge = new Vector(triangle.i, triangle.j);
      innerHull.push({ edge });
    }
  });

  return innerHull;
}

function delaunyTriangulation(points: Point[]): ITriangle[] {
  if (points.length < 3) {
    return [];
  }
  // compute the convex Hull of P
  const convexHullVectors = grahamScan(points);
  const convexHull: IHullEdge[] = [];

  convexHullVectors.forEach((edgeVector) => {
    convexHull.push({ edge: edgeVector });
  });

  // Get the points that lie on the Convex Hull
  const hullPoints = convexHull.map((hullEdge) => {
    return hullEdge.edge.a;
  });

  // compute the set of inner Points
  const innerPoints = points.filter((point) => {
    if (!hullPoints.includes(point)) return point;
  });

  // this algo needs inner points (we could add one random point in this case)
  if (innerPoints.length === 0) {
    return [];
  }

  // shuffle the Inner points
  const shuffledInnerPoints = shuffle([...innerPoints]);

  let triangulation: ITriangle[] = [];
  // Compute init Triangulation D
  triangulation = connect(shuffledInnerPoints[0], convexHull, triangulation);

  for (let index = 1; index < shuffledInnerPoints.length; index++) {
    console.log("In Loop Iteration #", index);
    const point_r = shuffledInnerPoints[index];

    // find the triangle containing p_r
    const containingTriangle = triangulation.filter((triangle) => {
      if (pointInTriangle(point_r, triangle)) return triangle;
    });

    console.log("Containing Triangle:", containingTriangle);

    // find all triangles which delauny is violated
    const violatedTriangles = findViolatedTriangles(
      containingTriangle[0],
      point_r
    );

    console.log("Violated Triangles", violatedTriangles);

    triangulation = removeTriangles(triangulation, violatedTriangles);

    const innerHull = getHull(violatedTriangles);

    console.log("Inner Hull", innerHull);

    triangulation = connect(point_r, innerHull, triangulation);

    triangulation.forEach((triangle) => {
      triangle.checked = false;
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
  }

  console.log("Final Triangulation", triangulation);

  return triangulation;
}

export { delaunyTriangulation };
