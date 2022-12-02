import { Point } from "../../geometry";

interface newtonsMethodArgs {
  fn: (x: number) => number;
  startX: number;
  damping: boolean;
}

export interface newtonsMethodResult {
  pointlist: Point[];
}

function newtonsMethod({ fn, startX, damping }: newtonsMethodArgs): number[] {
  return [0, 1, 2, 3];
}

export { newtonsMethod };
