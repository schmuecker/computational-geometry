import { DoublyLinkedList } from "@datastructures-js/linked-list";
import { Point, Vector } from "../../../geometry";

export type IVertex = {
  point: Point;
  type: "start" | "end" | "split" | "merge" | "regular";
};

export type IEdge = {
  vector: Vector;
  index: number;
};

export type IEdgeList = DoublyLinkedList<IEdge>;

export type ITreeNode = {
  key: number;
  edge: IEdge;
  helper: IVertex;
};
