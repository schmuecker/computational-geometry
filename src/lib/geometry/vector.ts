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

  dot(vectorB: Vector) {
    return this.v_x * vectorB.v_x + this.v_y * vectorB.v_y;
  }

  equals(vectorB: Vector) {
    return (
      (this.a.x === vectorB.a.x &&
        this.a.y === vectorB.a.y &&
        this.b.x === vectorB.b.x &&
        this.b.y === vectorB.b.y) ||
      (this.a.x === vectorB.b.x &&
        this.a.y === vectorB.b.y &&
        this.b.x === vectorB.a.x &&
        this.b.y === vectorB.a.y)
    );
  }
}

export { Vector };
