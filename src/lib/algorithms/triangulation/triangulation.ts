import { PriorityQueue, ICompare } from "@datastructures-js/priority-queue";
import { DoublyLinkedList } from "@datastructures-js/linked-list";
import {
  BinarySearchTree,
  BinarySearchTreeNode,
} from "@datastructures-js/binary-search-tree";
import { klona } from "klona";

import { Point, Vector } from "../../geometry";
import { findAngle } from "../../geometry/findAngle";
import { checkClockwiseTurn, ORIENTATION, radToDegrees } from "../../helper";

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

    console.log({
      u: u.toString(),
      v: v.toString(),
      w: w.toString(),
      angle: radToDegrees(innerAngle),
    });

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
  tree.insert({
    // key: e_i.a.x,
    edge: e_i,
    helper: helper_e_i,
  });
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
  const e_i_minus_1 = e_i.getPrev();
  let helper_e_i_minus_1: ITreeNode["helper"];
  const searchFn = (node: BinarySearchTreeNode<ITreeNode>) => {
    const edge = node.getValue().edge;
    if (edge.equals(e_i_minus_1.getValue())) {
      helper_e_i_minus_1 = node.getValue().helper;
    }
  };
  const abortFn = () => {
    return Boolean(e_i_minus_1);
  };
  tree.traversePreOrder(searchFn, abortFn);
  if (!helper_e_i_minus_1) {
    throw new Error("Could not find helper(e_i-1)");
  }

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
  const e_i_minus_1 = e_i.getPrev();
  let helper_e_i_minus_1: ITreeNode["helper"];
  const searchFn1 = (node: BinarySearchTreeNode<ITreeNode>) => {
    const edge = node.getValue().edge;
    if (edge.equals(e_i_minus_1.getValue())) {
      helper_e_i_minus_1 = node.getValue().helper;
    }
  };
  const abortFn1 = () => {
    return Boolean(e_i_minus_1);
  };
  tree.traversePreOrder(searchFn1, abortFn1);
  if (!helper_e_i_minus_1) {
    throw new Error("Could not find helper(e_i-1)");
  }

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

  // Search in tree for the edge 𝑒_𝑗 left of 𝑣_𝑖 ;
  let e_j: BinarySearchTreeNode<ITreeNode>;
  const searchFn2 = (node: BinarySearchTreeNode<ITreeNode>) => {
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
  const abortFn2 = () => {
    return Boolean(e_j);
  };
  tree.traversePreOrder(searchFn2, abortFn2);
  if (!e_j) {
    throw new Error("Could not find edge left of vertex");
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
  // if (the interior of P is right of 𝑣_𝑖) then {
  if (e_i.getValue().a.x < v_i.point.x) {
    const e_i_minus_1 = e_i.getPrev();
    let helper_e_i_minus_1: ITreeNode["helper"];
    const searchFn1 = (node: BinarySearchTreeNode<ITreeNode>) => {
      const edge = node.getValue().edge;
      if (edge.equals(e_i_minus_1.getValue())) {
        helper_e_i_minus_1 = node.getValue().helper;
      }
    };
    const abortFn1 = () => {
      return Boolean(e_i_minus_1);
    };
    tree.traversePreOrder(searchFn1, abortFn1);
    if (!helper_e_i_minus_1) {
      throw new Error("Could not find helper(e_i-1)");
    }

    // if (helper( 𝑒_𝑖−1 ) is a merge vertex) then {
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

    //   Add 𝑒_i with helper( 𝑒_𝑖 ):= 𝑣_𝑖 to tree;
    const helper_e_i = v_i;
    tree.insert({
      // key: e_i.a.x,
      edge: e_i.getValue(),
      helper: helper_e_i,
    });
  } else {
    // Search in tree for the edge 𝑒_𝑗 left of 𝑣_𝑖 ;
    let e_j: BinarySearchTreeNode<ITreeNode>;
    const searchFn2 = (node: BinarySearchTreeNode<ITreeNode>) => {
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
    const abortFn2 = () => {
      return Boolean(e_j);
    };
    tree.traversePreOrder(searchFn2, abortFn2);
    if (!e_j) {
      throw new Error("Could not find edge left of vertex");
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
      handleStartEvent(event, tree, edgeList);
    } else if (event.type === "split") {
      handleSplitEvent(event, tree, edgeList);
    } else if (event.type === "end") {
      handleEndEvent(event, tree, edgeList);
    } else if (event.type === "merge") {
      handleMergeEvent(event, tree, edgeList);
    } else if (event.type === "regular") {
      handleRegularEvent(event, tree, edgeList);
    }
  }

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
