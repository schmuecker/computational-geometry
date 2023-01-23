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

  distanceTo(point: Point) {
    return Math.sqrt(
      Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2)
    );
  }

  toString() {
    return `(${Math.floor(this.x)}, y: ${Math.floor(this.y)})`;
  }
}

export { Point };
