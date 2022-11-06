import { nanoid } from "nanoid";
import { Point } from "./point";

class Vector {
  readonly id: string;
  a: Point;
  b: Point;

  constructor(a: Point, b: Point) {
    this.id = nanoid();
    this.a = a;
    this.b = b;
  }
}

export { Vector };
