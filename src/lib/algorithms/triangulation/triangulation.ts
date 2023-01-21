import { PriorityQueue, ICompare } from "@datastructures-js/priority-queue";
import { DoublyLinkedList } from "@datastructures-js/linked-list";
import {
  BinarySearchTree,
  BinarySearchTreeNode,
} from "@datastructures-js/binary-search-tree";
import { klona } from "klona";

import { Point, Vector } from "../../geometry";
import { findAngle } from "../../geometry/findAngle";
import { checkClockwiseTurn, ORIENTATION } from "../../helper";

type IEvent = {
  point: Point;
  type: "start" | "end" | "split" | "merge" | "regular";
};

type ITreeNode = {
  // key: Point["x"];
  edge: Vector;
  helper: IEvent;
};

function createEdgeList(vertices: Point[]) {
  const edgeList = new DoublyLinkedList<Vector>();
  vertices.forEach((vertex, index) => {
    const nextVertex = vertices[(index + 1) % vertices.length];
    const edge = new Vector(vertex, nextVertex);
    edgeList.insertLast(edge);
  });
  return edgeList;
}

function createPriorityQueue(events: IEvent[]) {
  const compareEvents: ICompare<IEvent> = (a: IEvent, b: IEvent) => {
    if (a.point.y > b.point.y) {
      return 1;
    }
    return -1;
  };
  const pq = PriorityQueue.fromArray<IEvent>(events, compareEvents);
  return pq;
}

function createVertexEvents(edgeList: DoublyLinkedList<Vector>): IEvent[] {
  const events: IEvent[] = [];
  edgeList.forEach((edge) => {
    const prevEdge = edge.hasPrev() ? edge.getPrev() : edgeList.tail();
    const u = prevEdge.getValue().a;
    const v = edge.getValue().a;
    const w = edge.getValue().b;

    const orientation = checkClockwiseTurn(u, v, w);
    const invertAngle = orientation === ORIENTATION.CW;
    const rawAngle = findAngle(u, v, w);
    const innerAngle = invertAngle ? 2 * Math.PI - rawAngle : rawAngle;

    const vAboveNeighbors = u.y >= v.y && w.y >= v.y;
    const vBelowNeighbors = u.y < v.y && w.y < v.y;
    const angleGreaterThan180 = innerAngle > Math.PI;
    const angleLessThan180 = innerAngle < Math.PI;

    let eventType: IEvent["type"] = "regular";

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
    if (a.edge.equals(b.edge)) {
      return 0;
    }
    if (a.edge.a.x > b.edge.a.x) {
      return 1;
    } else if (a.edge.a.x < b.edge.a.x) {
      return -1;
    } else {
      return 0;
    }
  };
  const tree = new BinarySearchTree<ITreeNode>(compareFn);
  return tree;
}

function handleStartEvent(
  event: IEvent,
  tree: BinarySearchTree<ITreeNode>,
  edgeList: DoublyLinkedList<Vector>
) {
  // Add 𝑒_𝑖 with helper(𝑒_𝑖):= 𝑣_𝑖 to tree;
  const v_i = event;
  const e_i = edgeList
    .find((edge) => {
      return edge.getValue().b.equals(v_i.point);
    })
    .getValue();
  const helper_e_i = v_i;
  console.log("Start: insert into tree", {
    // key: e_i.a.x,
    edge: e_i,
    helper: helper_e_i,
  });
  tree.insert({
    // key: e_i.a.x,
    edge: e_i,
    helper: helper_e_i,
  });
  console.log("Insert: Tree count", tree.count());
  return undefined;
}

function handleSplitEvent(
  event: IEvent,
  tree: BinarySearchTree<ITreeNode>,
  edgeList: DoublyLinkedList<Vector>
) {
  // Search in tree for the edge 𝑒 𝑗 left of 𝑣 𝑖;
  const v_i = event;
  let e_j: BinarySearchTreeNode<ITreeNode>;
  const searchFn = (node: BinarySearchTreeNode<ITreeNode>) => {
    const edge = node.getValue().edge;
    if (edge.a.x < v_i.point.x && edge.b.x < v_i.point.x) {
      if (
        (edge.a.y < v_i.point.y && edge.b.y > v_i.point.y) ||
        (edge.b.y < v_i.point.y && edge.a.y > v_i.point.y)
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
    throw new Error("Could not find edge left of vertex");
  }

  // Add diagonal from 𝑣_𝑖 to helper( 𝑒_𝑗 ) to D;
  const helper_e_j = e_j.getValue().helper;
  const diagonal = new Vector(v_i.point, helper_e_j.point);
  edgeList.insertLast(diagonal);

  // helper( 𝑒_𝑗 ):= 𝑣_𝑖;
  e_j.setValue({ ...e_j.getValue(), helper: v_i });

  // Add 𝑒_𝑖 with helper( 𝑒_𝑖 ):= 𝑣_𝑖 to T;
  const e_i = edgeList
    .find((edge) => {
      return edge.getValue().b.equals(v_i.point);
    })
    .getValue();
  const helper_e_i = v_i;
  tree.insert({
    // key: e_i.a.x,
    edge: e_i,
    helper: helper_e_i,
  });
  console.log("Insert: Tree count", tree.count());
  return undefined;
}

function handleEndEvent(
  event: IEvent,
  tree: BinarySearchTree<ITreeNode>,
  edgeList: DoublyLinkedList<Vector>
) {
  // if (helper( 𝑒_𝑖−1 ) is a merge vertex) then
  const v_i = event;
  const e_i = edgeList.find((edge) => {
    return edge.getValue().b.equals(v_i.point);
  });
  const e_i_minus_1 = e_i.hasPrev() ? e_i.getPrev() : edgeList.tail();
  let helper_e_i_minus_1: ITreeNode["helper"];
  const searchFn = (node: BinarySearchTreeNode<ITreeNode>) => {
    const edge = node.getValue().edge;
    if (edge.equals(e_i_minus_1.getValue())) {
      helper_e_i_minus_1 = node.getValue().helper;
    }
  };
  const abortFn = () => {
    return Boolean(helper_e_i_minus_1);
  };
  tree.traversePreOrder(searchFn, abortFn);
  console.log("end event: helper(e_i-1)", helper_e_i_minus_1);
  if (helper_e_i_minus_1 && helper_e_i_minus_1.type === "merge") {
    // Add diagonal from 𝑣_𝑖 to helper( 𝑒_𝑖−1 ) to edge list;
    const diagonal = new Vector(v_i.point, helper_e_i_minus_1.point);
    edgeList.insertLast(diagonal);
  }
  // Remove 𝑒_𝑖−1 from tree;
  tree.remove({
    edge: e_i_minus_1.getValue(),
    helper: helper_e_i_minus_1,
  });
  console.log("Removed. Tree count", tree.count());
  return undefined;
}

function handleMergeEvent(
  event: IEvent,
  tree: BinarySearchTree<ITreeNode>,
  edgeList: DoublyLinkedList<Vector>
) {
  // if (helper( 𝑒_𝑖−1 ) is a merge vertex) then {
  const v_i = event;
  const e_i = edgeList.find((edge) => {
    return edge.getValue().b.equals(v_i.point);
  });
  const e_i_minus_1 = e_i.hasPrev() ? e_i.getPrev() : edgeList.tail();
  console.log("merge", { v_i, e_i, e_i_minus_1 });
  let helper_e_i_minus_1: ITreeNode["helper"];
  const searchFn1 = (node: BinarySearchTreeNode<ITreeNode>) => {
    const edge = node.getValue().edge;
    if (edge.equals(e_i_minus_1.getValue())) {
      helper_e_i_minus_1 = node.getValue().helper;
    }
  };
  const abortFn1 = () => {
    return Boolean(helper_e_i_minus_1);
  };
  tree.traversePreOrder(searchFn1, abortFn1);
  console.log("found helper_e_i_minus_1", { helper_e_i_minus_1 });
  if (helper_e_i_minus_1) {
    if (helper_e_i_minus_1.type === "merge") {
      // Add diagonal from 𝑣_𝑖 to helper( 𝑒_𝑖−1 ) to edge list;
      const diagonal = new Vector(v_i.point, helper_e_i_minus_1.point);
      edgeList.insertLast(diagonal);
    }
    // Remove 𝑒_𝑖−1 from tree;
    tree.remove({
      edge: e_i_minus_1.getValue(),
      helper: helper_e_i_minus_1,
    });
    console.log("Removed. Tree count", tree.count());
  }

  // Search in tree for the edge 𝑒_𝑗 left of 𝑣_𝑖 ;
  let e_j: BinarySearchTreeNode<ITreeNode>;
  const searchFn2 = (node: BinarySearchTreeNode<ITreeNode>) => {
    const edge = node.getValue().edge;
    console.log("Merge: search", edge);
    console.log("Insert: Tree count", tree.count());
    if (edge.a.x < v_i.point.x && edge.b.x < v_i.point.x) {
      console.log("Merge: edge is left of v_i");
      if (
        (edge.a.y < v_i.point.y && edge.b.y > v_i.point.y) ||
        (edge.a.y > v_i.point.y && edge.b.y < v_i.point.y)
      ) {
        console.log("Merge: v_i is between edge points");
        e_j = node;
      }
    }
  };
  const abortFn2 = () => {
    return Boolean(e_j);
  };
  tree.traversePreOrder(searchFn2);
  if (!e_j) {
    console.error("Merge Event: Could not find e_j");
    return;
  }
  // if (helper( 𝑒_𝑗 ) is a merge vertex) then
  if (e_j.getValue().helper.type === "merge") {
    // Add diagonal from 𝑣_𝑖 to helper( 𝑒_𝑗 ) to edge list;
    const helper_e_j = e_j.getValue().helper;
    const diagonal = new Vector(v_i.point, helper_e_j.point);
    edgeList.insertLast(diagonal);
  }
  // helper( 𝑒_𝑗 ):= 𝑣_𝑖;
  e_j.setValue({ ...e_j.getValue(), helper: v_i });

  return undefined;
}

function handleRegularEvent(
  event: IEvent,
  tree: BinarySearchTree<ITreeNode>,
  edgeList: DoublyLinkedList<Vector>
) {
  const v_i = event;
  const e_i = edgeList.find((edge) => {
    return edge.getValue().b.equals(v_i.point);
  });
  console.log("regular event", { v_i, e_i });
  // if (the interior of P is right of 𝑣_𝑖) then {
  if (e_i.getValue().a.x > v_i.point.x) {
    console.log("Interior is right of v_i");
    const e_i_minus_1 = e_i.hasPrev() ? e_i.getPrev() : edgeList.tail();
    let helper_e_i_minus_1: ITreeNode["helper"];
    const searchFn1 = (node: BinarySearchTreeNode<ITreeNode>) => {
      if (!node) return;
      const edge = node.getValue().edge;
      if (edge.equals(e_i_minus_1.getValue())) {
        helper_e_i_minus_1 = node.getValue().helper;
      }
    };
    const abortFn1 = () => {
      return Boolean(helper_e_i_minus_1);
    };
    tree.traversePreOrder(searchFn1, abortFn1);

    // if (helper( 𝑒_𝑖−1 ) is a merge vertex) then {
    if (helper_e_i_minus_1 && helper_e_i_minus_1.type === "merge") {
      // Add diagonal from 𝑣_𝑖 to helper( 𝑒_𝑖−1 ) to edge list;
      const diagonal = new Vector(v_i.point, helper_e_i_minus_1.point);
      edgeList.insertLast(diagonal);
    }
    // Remove 𝑒_𝑖−1 from tree;
    tree.remove({
      edge: e_i_minus_1.getValue(),
      helper: helper_e_i_minus_1,
    });
    console.log("Removed. Tree count", tree.count());

    //   Add 𝑒_i with helper( 𝑒_𝑖 ):= 𝑣_𝑖 to tree;
    const helper_e_i = v_i;
    tree.insert({
      // key: e_i.a.x,
      edge: e_i.getValue(),
      helper: helper_e_i,
    });
    console.log("Insert: Tree count", tree.count());
  } else {
    // Search in tree for the edge 𝑒_𝑗 left of 𝑣_𝑖 ;
    let e_j: BinarySearchTreeNode<ITreeNode>;
    const searchFn2 = (node: BinarySearchTreeNode<ITreeNode>) => {
      const edge = node.getValue().edge;
      console.log("Search for ");
      if (edge.a.x < v_i.point.x && edge.b.x < v_i.point.x) {
        if (
          (edge.a.y < v_i.point.y && edge.b.y > v_i.point.y) ||
          (edge.b.y < v_i.point.y && edge.a.y > v_i.point.y)
        ) {
          e_j = node;
        }
      }
    };
    const abortFn2 = () => {
      return Boolean(e_j);
    };
    tree.traversePreOrder(searchFn2, abortFn2);
    if (!e_j) {
      return;
    }

    // if (helper( 𝑒_𝑗 ) is a merge vertex) then
    if (e_j.getValue().helper.type === "merge") {
      // Add diagonal from 𝑣_𝑖 to helper( 𝑒_𝑗 ) to edge list;
      const helper_e_j = e_j.getValue().helper;
      const diagonal = new Vector(v_i.point, helper_e_j.point);
      edgeList.insertLast(diagonal);
    }
    // helper( 𝑒_𝑗 ):= 𝑣_𝑖;
    e_j.setValue({ ...e_j.getValue(), helper: v_i });
  }

  return undefined;
}

function partitionIntoMonotonePolygons(
  vertices: Point[],
  edgeList: DoublyLinkedList<Vector>
) {
  // Create data structures
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
      handleSplitEvent(event, tree, edgeList);
    } else if (event.type === "end") {
      console.log('Processing "end" event: ', event);
      handleEndEvent(event, tree, edgeList);
    } else if (event.type === "merge") {
      console.log('Processing "merge" event: ', event);
      handleMergeEvent(event, tree, edgeList);
    } else if (event.type === "regular") {
      console.log('Processing "regular" event: ', event);
      handleRegularEvent(event, tree, edgeList);
    }
  }
  console.log("Finished.");
  return undefined;
}

export function triangulatePolygon(points: Point[]) {
  if (points.length < 3) {
    return undefined;
  }
  const vertices = klona(points);
  const edgeList = createEdgeList(vertices);
  const monotonePolygons = partitionIntoMonotonePolygons(vertices, edgeList);
  console.log("Edge list:");
  console.table(
    edgeList.toArray().map((edge) => {
      return { a: edge.a.toString(), b: edge.b.toString() };
    })
  );
  return undefined;
}
