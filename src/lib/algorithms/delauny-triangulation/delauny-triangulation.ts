import { klona } from "klona";
import { nanoid } from "nanoid";
import { Point, Vector } from "../../geometry";
import { grahamScan } from "../convex-hull/grahamScan";

export interface ITriangle {
  id: string;
  i: Point;
  j: Point;
  k: Point;
  checked: boolean;
  removed: boolean;
}

interface ITriangleNeighbor {
  i_j?: ITriangle;
  j_k?: ITriangle;
  k_i?: ITriangle;
}

interface ITriangleNeighbors {
  [key: string]: ITriangleNeighbor;
}

interface IEdgeNeighbors {
  [key: string]: ITriangle;
}

interface IHullEdge {
  edge: Vector;
}

// shuffle the point array
function shuffle(array: Point[]) {
  const newArray = [...array];
  let j, x, i;
  for (i = newArray.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = newArray[i];
    newArray[i] = newArray[j];
    newArray[j] = x;
  }
  return newArray;
}

// connect the corners of the Hull to the points
function connect(
  point: Point,
  hull: IHullEdge[],
  triangulation: ITriangle[],
  triangleNeighbors: ITriangleNeighbors,
  edgeNeighbors: IEdgeNeighbors
) {
  const inputTriangulation = [...triangulation];
  const createdTriangles: ITriangle[] = [];

  for (let index = 0; index < hull.length; index++) {
    const hullEdge = hull[index];
    // here you use the hull, because of the hull you know the triangles that are around the hull
    // these you can easy use to add the neighbours to the new triangle!
    // triangle forms a linked list
    const triangle: ITriangle = {
      id: nanoid(),
      i: point,
      j: hullEdge.edge.a,
      k: hullEdge.edge.b,
      checked: false,
      removed: false,
    };

    // prev triangle and this triangle are neighbours
    if (index > 0) {
      const prevTriangle = createdTriangles[createdTriangles.length - 1];

      triangleNeighbors[triangle.id] = {
        ...triangleNeighbors[triangle.id],
        i_j: prevTriangle,
      };
      triangleNeighbors[prevTriangle.id] = {
        ...triangleNeighbors[prevTriangle.id],
        k_i: triangle,
      };
    }

    // last and first triangle are neighbours (because its a circle)
    if (index === hull.length - 1) {
      const firstTriangle = createdTriangles[0];
      triangleNeighbors[triangle.id] = {
        ...triangleNeighbors[triangle.id],
        k_i: firstTriangle,
      };
      triangleNeighbors[firstTriangle.id] = {
        ...triangleNeighbors[firstTriangle.id],
        i_j: triangle,
      };
    }

    // the triangle on the hull edge is also a neighbour
    // the hullEdge has to know which edge it is from the outer triangle
    const hullEdgeNeighbor = edgeNeighbors[hullEdge.edge.id];
    if (hullEdgeNeighbor) {
      triangleNeighbors[triangle.id] = {
        ...triangleNeighbors[triangle.id],
        j_k: hullEdgeNeighbor,
      };
      const neighborsNeighbor = triangleNeighbors[hullEdgeNeighbor.id];
      if (neighborsNeighbor.i_j) {
        if (neighborsNeighbor.i_j.removed) {
          neighborsNeighbor.i_j = triangle;
        }
      }
      if (neighborsNeighbor.j_k) {
        if (neighborsNeighbor.j_k.removed) {
          neighborsNeighbor.j_k = triangle;
        }
      }
      if (neighborsNeighbor.k_i) {
        if (neighborsNeighbor.k_i.removed) {
          neighborsNeighbor.k_i = triangle;
        }
      }
    }

    createdTriangles.push(triangle);
  }

  const outputTriangulation = [...inputTriangulation, ...createdTriangles];

  // console.log("Connected Triangulation", outputTriangulation);
  return outputTriangulation;
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

function findCircle(p1: Point, p2: Point, p3: Point) {
  // p1, p2, and p3 are objects representing the x, y coordinates of the points
  // Example: { x: 1, y: 2 }

  // Find the slope of the perpendicular bisector of line segment p1p2
  const m1 = -(p2.x - p1.x) / (p2.y - p1.y);
  const mid1 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
  const b1 = mid1.y - m1 * mid1.x;

  // Find the slope of the perpendicular bisector of line segment p2p3
  const m2 = -(p3.x - p2.x) / (p3.y - p2.y);
  const mid2 = { x: (p2.x + p3.x) / 2, y: (p2.y + p3.y) / 2 };
  const b2 = mid2.y - m2 * mid2.x;

  // Find the center of the circle
  const x = (b2 - b1) / (m1 - m2);
  const y = m1 * x + b1;
  const center = new Point(x, y);

  // Find the radius of the circle
  const radius = Math.sqrt((center.x - p1.x) ** 2 + (center.y - p1.y) ** 2);

  return { center, radius };
}

function isPointInCircle(point: Point, center: Point, radius: number) {
  // Calculate the distance between the point and the center of the circle
  const distance = Math.sqrt(
    (point.x - center.x) ** 2 + (point.y - center.y) ** 2
  );

  // Compare the distance with the radius of the circle
  return distance <= radius;
}

function violatesDelaunyCondition(point: Point, triangle: ITriangle) {
  // if the point is not inside the circle of the 3 triangle points the delauny condition is achieved
  const circumcircle = findCircle(triangle.i, triangle.j, triangle.k);

  return isPointInCircle(point, circumcircle.center, circumcircle.radius);
}

// Does this function really find all violated triangles?
function findViolatedTriangles(
  triangle: ITriangle,
  point: Point,
  triangleNeighbors: ITriangleNeighbors
) {
  const violatedTriangles: ITriangle[] = [];

  findViolatedNeighboursRecursion(
    triangle,
    point,
    violatedTriangles,
    triangleNeighbors
  );

  return violatedTriangles;
}

function findViolatedNeighboursRecursion(
  triangle: ITriangle,
  point: Point,
  violatedTriangles: ITriangle[],
  triangleNeighbors: ITriangleNeighbors
) {
  if (triangle.checked || triangle.removed) {
    return;
  }

  const isViolated = violatesDelaunyCondition(point, triangle);
  if (isViolated) {
    violatedTriangles.push(triangle);
  }

  triangle.checked = true;

  // code duplicates ... :)
  const neighbors = triangleNeighbors[triangle.id];
  if (neighbors.i_j) {
    findViolatedNeighboursRecursion(
      neighbors.i_j,
      point,
      violatedTriangles,
      triangleNeighbors
    );
  }

  if (neighbors?.j_k) {
    findViolatedNeighboursRecursion(
      neighbors.j_k,
      point,
      violatedTriangles,
      triangleNeighbors
    );
  }

  if (neighbors?.k_i) {
    findViolatedNeighboursRecursion(
      neighbors.k_i,
      point,
      violatedTriangles,
      triangleNeighbors
    );
  }

  return;
}

function removeTriangles(
  triangulation: ITriangle[],
  trianglesToRemove: ITriangle[]
) {
  return triangulation.filter((triangle) => {
    if (trianglesToRemove.find((t) => t.id === triangle.id)) {
      triangle.removed = true;
      return false;
    }
    return true;
  });
}

function getHullOfHole(
  violatedTriangles: ITriangle[],
  triangleNeighbors: ITriangleNeighbors,
  edgeNeighbors: IEdgeNeighbors
) {
  const innerHull: IHullEdge[] = [];
  console.warn("Violated Triangles", violatedTriangles);
  violatedTriangles.forEach((triangle) => {
    // check all neighbours of the violated triangles
    // if a neighbour is not violated it lies on the border of the hole
    // then add the edge with the neighbour triangle to the innerHull
    // when the edge has no neighbour it is the edge of the outer convex hull
    // then add the edge without a neighbour triangle
    const neighbors = triangleNeighbors[triangle.id];
    if (neighbors?.i_j) {
      const neighbour = neighbors.i_j;
      if (!violatedTriangles.find((t) => t.id === neighbour.id)) {
        // if (neighbour.removed) {
        //   console.log("Wrong Inner Hull Triangle", neighbour);
        //   throw new Error("A removed Tringle has been added to the innerHull");
        // }
        if (!neighbour.removed) {
          const edge = new Vector(triangle.i, triangle.j);
          console.warn("i_j: Add edge to inner hull", {
            edge,
            triangle,
            neighbour,
          });
          innerHull.push({ edge });
          edgeNeighbors[edge.id] = neighbour;
        }
      }
    } else {
      const edge = new Vector(triangle.i, triangle.j);
      innerHull.push({ edge });
    }

    if (neighbors?.j_k) {
      const neighbour = neighbors.j_k;
      if (!violatedTriangles.find((t) => t.id === neighbour.id)) {
        // if (neighbour.removed) {
        //   console.log("Wrong Inner Hull Triangle", neighbour);
        //   throw new Error("A removed Tringle has been added to the innerHull");
        // }
        if (!neighbour.removed) {
          const edge = new Vector(triangle.j, triangle.k);
          console.warn("j_k: Add edge to inner hull", {
            edge,
            triangle,
            neighbour,
          });
          innerHull.push({ edge });
          edgeNeighbors[edge.id] = neighbour;
        }
      }
    } else {
      const edge = new Vector(triangle.j, triangle.k);
      innerHull.push({ edge });
    }

    if (neighbors?.k_i) {
      const neighbour = neighbors.k_i;
      console.log("Neighbour KI:", {
        violatedTriangles,
        neighbour,
        isViolated: violatedTriangles.find((t) => t.id === triangle.id),
      });
      if (!violatedTriangles.find((t) => t.id === neighbour.id)) {
        // if (neighbour.removed) {
        //   console.log("Wrong Inner Hull Triangle", neighbour);
        //   throw new Error("A removed Tringle has been added to the innerHull");
        // }
        if (!neighbour.removed) {
          const edge = new Vector(triangle.k, triangle.i);
          console.warn("k_i: Add edge to inner hull", {
            edge,
            triangle,
            neighbour,
          });
          innerHull.push({ edge });
          edgeNeighbors[edge.id] = neighbour;
        }
      }
    } else {
      const edge = new Vector(triangle.k, triangle.i);
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
  const triangleNeighbors: ITriangleNeighbors = {};
  const edgeNeighbors: IEdgeNeighbors = {};

  convexHullVectors.forEach((edgeVector) => {
    convexHull.push({ edge: edgeVector });
  });

  // Get the points that lie on the Convex Hull
  const hullPoints = convexHull.map((hullEdge) => {
    return hullEdge.edge.a;
  });

  // compute the set of inner Points
  const innerPoints = points.filter((point) => {
    if (!hullPoints.find((p) => p.id === point.id)) return point;
  });

  // this algo needs inner points (we could add one random point in this case)
  if (innerPoints.length === 0) {
    return [];
  }

  // shuffle the Inner points
  // const shuffledInnerPoints = shuffle(innerPoints);
  const shuffledInnerPoints = innerPoints;

  // Compute init Triangulation D
  let triangulation = connect(
    shuffledInnerPoints[0],
    convexHull,
    [],
    triangleNeighbors,
    edgeNeighbors
  );

  console.log("Initial Triangulation", triangulation);

  for (let index = 1; index < shuffledInnerPoints.length; index++) {
    console.log("In Loop Iteration #", index);
    const point_r = shuffledInnerPoints[index];
    console.log("Point R", point_r);

    // find the triangle containing p_r
    const containingTriangleList = triangulation.filter((triangle) => {
      if (pointInTriangle(point_r, triangle)) {
        return triangle;
      }
    });

    if (containingTriangleList.length !== 1) {
      console.error("Containing Triangle List", {
        triangulation,
        point_r,
        containingTriangleList,
      });
      // throw new Error(
      //   " Containing Triangle List should have exactly 1 Triangle"
      // );
    }

    const containingTriangle = containingTriangleList[0];
    console.log("Containing Triangle:", containingTriangle);

    // find all triangles which delauny is violated
    const violatedTriangles = findViolatedTriangles(
      containingTriangle,
      point_r,
      triangleNeighbors
    );

    console.log("Violated Triangles", violatedTriangles);

    console.log("Triangulation before removal:", triangulation);
    const cleanedTriangulation = removeTriangles(
      triangulation,
      violatedTriangles
    );
    console.log("Triangulation after removal:", cleanedTriangulation);

    let hole = [...violatedTriangles];
    if (hole.length === 0) {
      console.warn("No violated Triangles found ...?");
      hole = [containingTriangle];
    }
    console.warn("Hole", hole);

    const innerHull = getHullOfHole(hole, triangleNeighbors, edgeNeighbors);

    // console.log("Inner Hull", innerHull);
    console.warn("Inner Hull", innerHull);
    const newTriangulation = connect(
      point_r,
      innerHull,
      cleanedTriangulation,
      triangleNeighbors,
      edgeNeighbors
    );

    newTriangulation.forEach((triangle) => {
      triangle.checked = false;
    });

    // console.log(
    //   "Triangulation after Iteration #",
    //   index,
    //   " = ",
    //   newTriangulation
    // );
    triangulation = [...newTriangulation];

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

  // console.log("Final Triangulation", triangulation);

  return triangulation;
}

export { delaunyTriangulation };
