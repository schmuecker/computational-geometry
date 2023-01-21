import { nanoid } from "nanoid";

class Point {
  readonly id: string;
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.id = nanoid();
    this.x = x;
    this.y = y;
  }

  equals(point: Point) {
    return this.x === point.x && this.y === point.y;
  }

  toString() {
    return `(${this.x}, y: ${this.y})`;
  }
}

export { Point };
