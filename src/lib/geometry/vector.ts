import { nanoid } from "nanoid";
import { Point } from "./point";

class Vector {
  readonly id: string;
  a: Point;
  b: Point;

  v_x: number;
  v_y: number;

  constructor(a: Point, b: Point) {
    this.id = nanoid();
    this.a = a;
    this.b = b;

    this.v_x = b.x - a.x;
    this.v_y = b.y - a.y;
  }

  cross(vectorB: Vector) {
    return this.v_x * vectorB.v_y - vectorB.v_x * this.v_y;
  }
}

export { Vector };
