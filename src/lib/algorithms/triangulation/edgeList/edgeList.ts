import {
  DoublyLinkedList,
  DoublyLinkedListNode,
} from "@datastructures-js/linked-list";
import { Point, Vector } from "../../../geometry";
import { IEdge, IEdgeList, IVertex } from "../types/triangulationTypes";

export class EdgeList {
  edges: IEdgeList;

  constructor(vertices: Point[]) {
    this.edges = this.init(vertices);
  }

  init(vertices: Point[]) {
    const edgeList = new DoublyLinkedList<IEdge>();
    vertices.forEach((vertex, index) => {
      const nextVertex = vertices[(index + 1) % vertices.length];
      const vector = new Vector(vertex, nextVertex);
      edgeList.insertLast({ vector, index });
    });
    return edgeList;
  }

  getEdges() {
    return this.edges;
  }

  getEdgesArray() {
    return this.edges.toArray();
  }

  getEdgeOfVertex(vertex: IVertex) {
    const e_i = this.edges.find((edge) => {
      return edge.getValue().vector.a.equals(vertex.point);
    });
    return e_i;
  }

  getPrevEdgeOfEdge(edge: DoublyLinkedListNode<IEdge>) {
    return edge.hasPrev() ? edge.getPrev() : this.edges.tail();
  }
}
