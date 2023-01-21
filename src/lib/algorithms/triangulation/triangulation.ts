import {
  PriorityQueue,
  MinPriorityQueue,
  MaxPriorityQueue,
  ICompare,
  IGetCompareValue,
} from "@datastructures-js/priority-queue";
import { klona } from "klona";

import { Point } from "../../geometry";

type IPolygon = { points: Point[] };
type IEvent = {
  point: Point;
  type: "start" | "end" | "split" | "merge" | "regular";
};

function createPriorityQueue(vertices: Point[]) {
  const comparePoints: ICompare<Point> = (a: Point, b: Point) => {
    if (a.y > b.y) {
      return 1;
    } else if (a.y < b.y) {
      return -1;
    }
    return 0;
  };

  const pq = PriorityQueue.fromArray<Point>(vertices, comparePoints);
  return pq;
}

function createVertexEvents(vertices: Point[]) {
  return undefined;
}

function createDoublyLinkedList(vertices: Point[]) {
  return undefined;
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

function partitionIntoMonotonePolygons(polygon: IPolygon) {
  // Create data structures
  const vertices = klona(polygon.points);
  const events = createVertexEvents(vertices);
  const pq = createPriorityQueue(vertices);
  const edges = createDoublyLinkedList(vertices);
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

export function triangulatePolygon(polygon: IPolygon) {
  const monotonePolygons = partitionIntoMonotonePolygons(polygon);
  return undefined;
}
