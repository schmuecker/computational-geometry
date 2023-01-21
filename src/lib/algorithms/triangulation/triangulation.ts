import { PriorityQueue, ICompare } from "@datastructures-js/priority-queue";
import { DoublyLinkedList } from "@datastructures-js/linked-list";
import { klona } from "klona";

import { Point, Vector } from "../../geometry";
import { findAngle } from "../../geometry/findAngle";
import { checkClockwiseTurn, ORIENTATION, radToDegrees } from "../../helper";

type IEvent = {
  point: Point;
  type: "start" | "end" | "split" | "merge" | "regular";
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
  return undefined;
}

function onStartEvent(event: IEvent) {
  // Add 𝑒 𝑖with helper( 𝑒 𝑖):= 𝑣 𝑖to tree;
  return undefined;
}

function onEndEvent(event: IEvent) {
  // if (helper( 𝑒 𝑖−1) is a merge vertex) then
  // {
  //    Add diagonal from 𝑣 𝑖 to helper( 𝑒 𝑖−1 ) to doubly linked list;
  // }
  // Remove 𝑒 𝑖−1 from tree;
  return undefined;
}

function onSplitEvent(event: IEvent) {
  // Search in tree for the edge 𝑒 𝑗 left of 𝑣 𝑖;
  // Add diagonal from 𝑣 𝑖 to helper( 𝑒 𝑗 ) to D;
  // helper( 𝑒 𝑗 ):= 𝑣 𝑖;
  // Add 𝑒 𝑖 with helper( 𝑒 𝑖):= 𝑣 𝑖to T;
  return undefined;
}

function onMergeEvent(event: IEvent) {
  // if (helper( 𝑒 𝑖−1 ) is a merge vertex) then {
  //   Add diagonal from 𝑣 𝑖 to helper( 𝑒 𝑖−1 ) to doubly linked list;
  // }
  // Remove 𝑒 𝑖−1 from tree;
  // Search in tree for the edge 𝑒 𝑗 left of 𝑣 𝑖 ;
  // if (helper( 𝑒 𝑗 ) is a merge vertex) then {
  //   Add diagonal from 𝑣 𝑖 to helper( 𝑒 𝑗 ) to doubly linked list;
  // }
  //  helper( 𝑒 𝑗 ):= 𝑣 𝑖 ;
  return undefined;
}

function onRegularEvent(event: IEvent) {
  // if (the interior of P is right of 𝑣 𝑖) then {
  //    if (helper( 𝑒 𝑖−1) is a merge vertex) then {
  //      Add diagonal from 𝑣 𝑖 to helper( 𝑒 𝑖−1 ) to doubly linked list;
  //    }
  //   Remove 𝑒 𝑖−1 from tree;
  //   Add 𝑒 𝑖 with helper( 𝑒 𝑖):= 𝑣 𝑖to tree;
  // } else {
  //  Search in tree for the edge 𝑒 𝑗 left of 𝑣 𝑖;
  //  if (helper( 𝑒 𝑗 ) is a merge vertex) then {
  //    Add diagonal from 𝑣 𝑖 to helper( 𝑒 𝑗 ) to doubly linked list;
  //  }
  //  helper( 𝑒 𝑗 ):= 𝑣 𝑖 ;
  // }

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
      onStartEvent(event);
    } else if (event.type === "end") {
      onEndEvent(event);
    } else if (event.type === "split") {
      onSplitEvent(event);
    } else if (event.type === "merge") {
      onMergeEvent(event);
    } else if (event.type === "regular") {
      onRegularEvent(event);
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
  return undefined;
}
