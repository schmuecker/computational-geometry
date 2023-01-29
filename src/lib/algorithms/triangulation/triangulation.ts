import { PriorityQueue, ICompare } from "@datastructures-js/priority-queue";
import {
  BinarySearchTree,
  BinarySearchTreeNode,
} from "@datastructures-js/binary-search-tree";
import { klona } from "klona";

import { Point, Vector } from "../../geometry";
import { findAngle } from "../../geometry/findAngle";
import { checkClockwiseTurn, ORIENTATION } from "../../helper";
import { EdgeList } from "./edgeList/edgeList";
import { IEdgeList } from "./types/triangulationTypes";

type IVertex = {
  point: Point;
  type: "start" | "end" | "split" | "merge" | "regular";
};

type IEdge = {
  vector: Vector;
  index: number;
};

type ITreeNode = {
  key: number;
  edge: IEdge;
  helper: IVertex;
};

function createPriorityQueue(events: IVertex[]) {
  const compareEvents: ICompare<IVertex> = (a: IVertex, b: IVertex) => {
    if (a.point.y > b.point.y) {
      return 1;
    }
    return -1;
  };
  const pq = PriorityQueue.fromArray<IVertex>(events, compareEvents);
  return pq;
}

function createVertexEvents(edgeList: EdgeList): IVertex[] {
  const events: IVertex[] = [];
  edgeList.getEdges().forEach((edge) => {
    // Circular linked list
    const prevEdge = edgeList.getPrevEdgeOfEdge(edge);
    const u = prevEdge.getValue().vector.a;
    const v = edge.getValue().vector.a;
    const w = edge.getValue().vector.b;

    // Calculate inner angle
    const orientation = checkClockwiseTurn(u, v, w);
    const invertAngle = orientation === ORIENTATION.CCW;
    const rawAngle = findAngle(u, v, w);
    const innerAngle = invertAngle ? 2 * Math.PI - rawAngle : rawAngle;

    const vAboveNeighbors = u.y >= v.y && w.y >= v.y;
    const vBelowNeighbors = u.y < v.y && w.y < v.y;
    const angleGreaterThan180 = innerAngle > Math.PI;
    const angleLessThan180 = innerAngle < Math.PI;

    let eventType: IVertex["type"] = "regular";

    if (vAboveNeighbors && angleLessThan180) {
      eventType = "start";
    } else if (vAboveNeighbors && angleGreaterThan180) {
      eventType = "split";
    } else if (vBelowNeighbors && angleLessThan180) {
      eventType = "end";
    } else if (vBelowNeighbors && angleGreaterThan180) {
      eventType = "merge";
    }

    events.push({ type: eventType, point: v });
  });
  return events;
}

function createSearchTree() {
  const compareFn = (a: ITreeNode, b: ITreeNode) => {
    console.log("compare", a.key, b.key);
    // Equal keys
    if (a.key === b.key) {
      return 0;
    }
    // Different keys when searching for key
    if (a.key !== b.key && (!a?.edge || !b?.edge)) {
      if (a.key > b.key) {
        return 1;
      } else {
        return -1;
      }
    }
    // Equal coordinates
    if (a.edge.vector.equals(b.edge.vector)) {
      return 0;
    }
    // a is right of b
    if (a.edge.vector.a.x > b.edge.vector.a.x) {
      return 1;
      // a is left of b
    } else if (a.edge.vector.a.x < b.edge.vector.a.x) {
      return -1;
    } else {
      return 0;
    }
  };
  const tree = new BinarySearchTree<ITreeNode>(compareFn, { key: "key" });
  return tree;
}

function findInTree(key: number, tree: BinarySearchTree<ITreeNode>) {
  let resultNode: IFoundNode = undefined;
  const searchFn = (node: BinarySearchTreeNode<ITreeNode>) => {
    if (node.getValue().key === key) {
      resultNode = node;
    }
  };
  const abortFn = () => {
    return Boolean(resultNode);
  };
  tree.traversePreOrder(searchFn, abortFn);
  if (!resultNode) {
    throw Error(`Could not find node with key ${key}"`);
  }
  return resultNode;
}

type IFoundNode = BinarySearchTreeNode<ITreeNode>;

function getEdgeLeftOfVertex(
  vertex: IVertex,
  tree: BinarySearchTree<ITreeNode>
): IFoundNode {
  const e_j_candidates: IFoundNode[] = [];
  const searchFn = (node: BinarySearchTreeNode<ITreeNode>) => {
    const edge = node.getValue().edge;
    console.log("search for", vertex.point);
    console.log({ edge });
    const u = edge.vector.a;
    const v = vertex.point;
    const w = edge.vector.b;
    const isPointLeftOfEdge = checkClockwiseTurn(u, v, w) === ORIENTATION.CCW;
    if (isPointLeftOfEdge) {
      if (
        edge.vector.a.y < vertex.point.y &&
        edge.vector.b.y > vertex.point.y
      ) {
        e_j_candidates.push(node);
      }
    }
  };
  tree.traversePreOrder(searchFn);
  if (e_j_candidates.length === 0) {
    throw Error("No edge found left of vertex");
  }
  const e_j_distance = e_j_candidates.map((e_j) => {
    const vector = e_j?.getValue().edge.vector;

    const deltaY = vector.b.y - vector.a.y;
    const deltaX = vector.b.x - vector.a.x;
    const slope = deltaY / deltaX;
    const yIntercept = vector.a.y - slope * vector.a.x;

    const formula = (y: number) => (y - yIntercept) / slope;
    const intersection = new Point(formula(vertex.point.y), vertex.point.y);
    const distance = vertex.point.distanceTo(intersection);
    return { distance, node: e_j };
  });

  const closestCandidate = e_j_distance.reduce((prev, current) => {
    return prev.distance < current.distance ? prev : current;
  });

  return closestCandidate["node"];
}

function handleStartEvent(
  event: IVertex,
  tree: BinarySearchTree<ITreeNode>,
  edgeList: EdgeList
) {
  // Add 𝑒_𝑖 with helper(𝑒_𝑖):= 𝑣_𝑖 to tree;
  const v_i = event;
  const e_i = edgeList.getEdgeOfVertex(v_i);
  const helper_e_i = v_i;
  console.log("Start: insert into tree", {
    key: e_i.getValue().index,
    edge: e_i.getValue(),
    helper: helper_e_i,
  });
  tree.insert({
    key: e_i.getValue().index,
    edge: e_i.getValue(),
    helper: helper_e_i,
  });
  console.log("Insert: Tree count", tree.count());
  return undefined;
}

function handleSplitEvent(
  event: IVertex,
  tree: BinarySearchTree<ITreeNode>,
  edgeList: EdgeList,
  diagonalsList: Vector[]
) {
  // Search in tree for the edge 𝑒 𝑗 left of 𝑣 𝑖;
  const v_i = event;
  const e_i = edgeList.getEdgeOfVertex(v_i);
  const e_j = getEdgeLeftOfVertex(v_i, tree);
  if (!e_j) {
    throw new Error("Split vertex: Could not find edge left of vertex");
  }

  // Add diagonal from 𝑣_𝑖 to helper( 𝑒_𝑗 ) to D;
  const helper_e_j = e_j.getValue().helper;
  const diagonal = new Vector(v_i.point, helper_e_j.point);
  diagonalsList.push(diagonal);

  // helper( 𝑒_𝑗 ):= 𝑣_𝑖;
  e_j.setValue({ ...e_j.getValue(), helper: v_i });

  // Add 𝑒_𝑖 with helper( 𝑒_𝑖 ):= 𝑣_𝑖 to T;
  const helper_e_i = v_i;
  console.log("Split: insert into tree", {
    key: e_i.getValue().index,
    edge: e_i.getValue(),
    helper: helper_e_i,
  });
  tree.insert({
    key: e_i.getValue().index,
    edge: e_i.getValue(),
    helper: helper_e_i,
  });

  return undefined;
}

function handleEndEvent(
  event: IVertex,
  tree: BinarySearchTree<ITreeNode>,
  edgeList: EdgeList,
  diagonalsList: Vector[]
) {
  // if (helper( 𝑒_𝑖−1 ) is a merge vertex) then
  const v_i = event;
  const e_i = edgeList.getEdgeOfVertex(v_i);
  const e_i_minus_1 = edgeList.getPrevEdgeOfEdge(e_i);
  // const e_i_minus_1_node = tree.findKey(e_i_minus_1.getValue().index);
  const e_i_minus_1_node = findInTree(e_i_minus_1.getValue().index, tree);
  if (!e_i_minus_1_node) {
    throw new Error("End vertex: Could not find e_i_minus_1_node in tree");
  }

  const helper_e_i_minus_1 = e_i_minus_1_node.getValue().helper;
  if (helper_e_i_minus_1.type === "merge") {
    // Add diagonal from 𝑣_𝑖 to helper( 𝑒_𝑖−1 ) to edge list;
    const diagonal = new Vector(v_i.point, helper_e_i_minus_1.point);
    diagonalsList.push(diagonal);
  }
  // Remove 𝑒_𝑖−1 from tree;
  tree.remove({
    key: e_i_minus_1.getValue().index,
    edge: e_i_minus_1.getValue(),
    helper: helper_e_i_minus_1,
  });

  return undefined;
}

function handleMergeEvent(
  event: IVertex,
  tree: BinarySearchTree<ITreeNode>,
  edgeList: EdgeList,
  diagonalsList: Vector[]
) {
  // if (helper( 𝑒_𝑖−1 ) is a merge vertex) then {
  const v_i = event;
  const e_i = edgeList.getEdgeOfVertex(v_i);
  const e_i_minus_1 = edgeList.getPrevEdgeOfEdge(e_i);

  // const e_i_minus_1_node = tree.findKey(e_i_minus_1.getValue().index);
  const e_i_minus_1_node = findInTree(e_i_minus_1.getValue().index, tree);
  if (!e_i_minus_1_node) {
    throw new Error("Merge vertex: Could not find e_i_minus_1_node in tree");
  }

  const helper_e_i_minus_1 = e_i_minus_1_node.getValue().helper;
  if (helper_e_i_minus_1.type === "merge") {
    // Add diagonal from 𝑣_𝑖 to helper( 𝑒_𝑖−1 ) to edge list;
    const diagonal = new Vector(v_i.point, helper_e_i_minus_1.point);
    // Add Diagonals to extra List
    diagonalsList.push(diagonal);
  }
  // Remove 𝑒_𝑖−1 from tree;
  tree.remove(e_i_minus_1_node.getValue());
  // Search in tree for the edge 𝑒_𝑗 left of 𝑣_𝑖 ;
  const e_j = getEdgeLeftOfVertex(v_i, tree);

  if (!e_j) {
    throw Error("Merge Event: Could not find e_j");
  }
  // if (helper( 𝑒_𝑗 ) is a merge vertex) then
  if (e_j.getValue().helper.type === "merge") {
    // Add diagonal from 𝑣_𝑖 to helper( 𝑒_𝑗 ) to edge list;
    const helper_e_j = e_j.getValue().helper;
    const diagonal = new Vector(v_i.point, helper_e_j.point);
    diagonalsList.push(diagonal);
  }
  // helper( 𝑒_𝑗 ):= 𝑣_𝑖;
  e_j.setValue({ ...e_j.getValue(), helper: v_i });

  return undefined;
}

function handleRegularEvent(
  event: IVertex,
  tree: BinarySearchTree<ITreeNode>,
  edgeList: EdgeList,
  diagonalsList: Vector[]
) {
  const v_i = event;
  const e_i = edgeList.getEdgeOfVertex(v_i);

  // if (the interior of P is right of 𝑣_𝑖) then {
  if (e_i.getValue().vector.a.y < e_i.getValue().vector.b.y) {
    const e_i_minus_1 = edgeList.getPrevEdgeOfEdge(e_i);
    // const e_i_minus_1_node = tree.findKey(e_i_minus_1.getValue().index);
    const e_i_minus_1_node = findInTree(e_i_minus_1.getValue().index, tree);
    if (!e_i_minus_1_node) {
      throw new Error(
        "Regular vertex: Could not find e_i_minus_1_node in tree"
      );
    }
    const helper_e_i_minus_1 = e_i_minus_1_node.getValue().helper;

    // if (helper( 𝑒_𝑖−1 ) is a merge vertex) then {
    if (helper_e_i_minus_1.type === "merge") {
      // Add diagonal from 𝑣_𝑖 to helper( 𝑒_𝑖−1 ) to edge list;
      const diagonal = new Vector(v_i.point, helper_e_i_minus_1.point);
      diagonalsList.push(diagonal);
    }
    // Remove 𝑒_𝑖−1 from tree;
    tree.remove(e_i_minus_1_node.getValue());

    // Add 𝑒_i with helper( 𝑒_𝑖 ):= 𝑣_𝑖 to tree;
    const helper_e_i = v_i;
    tree.insert({
      key: e_i.getValue().index,
      edge: e_i.getValue(),
      helper: helper_e_i,
    });
  } else {
    // Search in tree for the edge 𝑒_𝑗 left of 𝑣_𝑖 ;
    const e_j = getEdgeLeftOfVertex(v_i, tree);
    if (!e_j) {
      throw Error("Merge Event: Could not find e_j");
    }

    // if (helper( 𝑒_𝑗 ) is a merge vertex) then
    if (e_j.getValue().helper.type === "merge") {
      // Add diagonal from 𝑣_𝑖 to helper( 𝑒_𝑗 ) to edge list;
      const helper_e_j = e_j.getValue().helper;
      const diagonal = new Vector(v_i.point, helper_e_j.point);
      diagonalsList.push(diagonal);
    }
    // helper( 𝑒_𝑗 ):= 𝑣_𝑖;
    e_j.setValue({ ...e_j.getValue(), helper: v_i });
  }

  return undefined;
}

function partition(vertices: Point[], edgeList: EdgeList) {
  // Create data structures
  const diagonalsList: Vector[] = [];
  const events = createVertexEvents(edgeList);
  console.log("Events: ");
  console.table(
    events.map((event) => ({
      type: event.type,
      point: `${event.point.x}, ${event.point.y}`,
    }))
  );
  const pq = createPriorityQueue(events);
  console.log("Priority Queue: ");
  console.table(
    pq.toArray().map((event) => ({
      type: event.type,
      point: `${event.point.x}, ${event.point.y}`,
    }))
  );
  const tree = createSearchTree();

  // Process vertices and their events
  while (pq.size() > 0) {
    const event = pq.dequeue();
    // Process event based on type
    if (event.type === "start") {
      console.log('Processing "start" event: ', event);
      handleStartEvent(event, tree, edgeList);
    } else if (event.type === "split") {
      console.log('Processing "split" event: ', event);
      handleSplitEvent(event, tree, edgeList, diagonalsList);
    } else if (event.type === "end") {
      console.log('Processing "end" event: ', event);
      handleEndEvent(event, tree, edgeList, diagonalsList);
    } else if (event.type === "merge") {
      console.log('Processing "merge" event: ', event);
      handleMergeEvent(event, tree, edgeList, diagonalsList);
    } else if (event.type === "regular") {
      console.log('Processing "regular" event: ', event);
      handleRegularEvent(event, tree, edgeList, diagonalsList);
    }
  }
  console.log("Finished.");
  return diagonalsList;
}

type IVertexWithSide = { point: Point; side: "left" | "right" };

function triangulateMonotone(edgeList: IEdgeList) {
  const diagonals: Vector[] = [];
  // Sort vertices top to bottom 𝑢_1, … , 𝑢_𝑛;
  const vertices: IVertexWithSide[] = edgeList
    .toArray()
    .map((edge) => {
      const point = edge.vector.a;
      const side: IVertexWithSide["side"] =
        edge.vector.a.y < edge.vector.b.y ? "left" : "right";
      return { point, side };
    })
    .sort((a, b) => a.point.y - b.point.y);

  // Initialize empty stack S; S.push( 𝑢_1 ); S.push( 𝑢_2 );
  const stack = [];
  stack.push(vertices[0]);
  stack.push(vertices[1]);

  console.log(stack.map((item) => item?.point.toString()));

  for (let j = 2; j < vertices.length - 1; j++) {
    console.log("j", j);
    const u_j = vertices[j];
    const s_top = stack[stack.length - 1];
    // if ( 𝑢_𝑗 and S.top() are on different sides) then {
    if (u_j.side !== s_top?.side) {
      // Pop all vertices from S and add their diagonals to 𝑢_𝑗 to D, except for the last one;
      while (stack.length > 1) {
        const vertex = stack.pop();
        if (!vertex) {
          return;
        }
        const diagonal = new Vector(vertex.point, u_j.point);
        diagonals.push(diagonal);
      }
      stack.pop();
      // S.push( 𝑢_𝑗−1 ); S.push( 𝑢_𝑗 );
      stack.push(vertices[j - 1]);
      stack.push(u_j);
    } else {
      // Pop one vertex from S;
      const firstVertex = stack.pop();
      // Pop the other vertices from S and add their diagonals to 𝑢_𝑗 to D, as long as this diagonal lies inside 𝑃;
      while (stack.length > 0) {
        const vertex = stack.pop();
        if (!vertex) {
          return;
        }
        // Check if diagonal is inside polygon
        const e_j = edgeList
          .find((edge) => {
            return edge.getValue().vector.a === u_j.point;
          })
          .getValue().vector;
        const e_j_minus_1 = edgeList
          .find((edge) => {
            return edge.getValue().vector.b === vertex.point;
          })
          .getValue()
          .vector.invert();
        const angleToPrevEdge = e_j.angle(e_j_minus_1);
        const diagonal = new Vector(vertex.point, u_j.point);
        const angleToDiagonal = e_j.angle(diagonal);
        const isDiagonalInsideOfPolygon = angleToDiagonal > angleToPrevEdge;
        if (isDiagonalInsideOfPolygon) {
          diagonals.push(diagonal);
        }
      }
      // Push the last popped vertex back; S.push( 𝑢_𝑗 );
      stack.push(firstVertex);
      stack.push(u_j);
    }
    console.log(stack.map((item) => item?.point.toString()));
  }

  // Pop all vertices from S and add their diagonals to 𝑢_𝑛 to D, except for the first and last one;
  // Remove first item from stack
  stack.pop();
  while (stack.length > 1) {
    const vertex = stack.pop();
    if (!vertex) {
      return;
    }
    const u_n = vertices[vertices.length - 1];
    const diagonal = new Vector(vertex.point, u_n.point);
    diagonals.push(diagonal);
  }
  return diagonals;
}

export function triangulatePolygon(points: Point[]) {
  if (points.length < 3) {
    return undefined;
  }
  const vertices = klona(points);
  const edgeList = new EdgeList(vertices);

  console.log("Edge list:");
  console.table(
    edgeList.getEdgesArray().map((edge) => {
      return { a: edge.vector.a.toString(), b: edge.vector.b.toString() };
    })
  );
  // const diagonals = partition(vertices, edgeList);
  const diagonals = triangulateMonotone(edgeList.getEdges());

  return diagonals;
}
