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
}

export { Point };
