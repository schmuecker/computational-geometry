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

type IFoundNode = BinarySearchTreeNode<ITreeNode> | undefined;

function getEdgeLeftOfVertex(
  vertex: IVertex,
  tree: BinarySearchTree<ITreeNode>
): IFoundNode {
  let e_j: IFoundNode = undefined;
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
        e_j = node;
      }
    }
  };
  const abortFn = () => {
    return Boolean(e_j);
  };
  tree.traversePreOrder(searchFn, abortFn);
  if (!e_j) {
    throw Error("No edge found left of vertex");
  }
  return e_j;
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
  const diagonals = partition(vertices, edgeList);
  return diagonals;
}
