import { Point } from "../../geometry";

interface newtonsMethodArgs {
  fn: (x: number) => number;
  dfn: (x: number) => number;
  startX: number;
  maxIter: number;
  damping: boolean;
}

function newtonsMethod({
  fn,
  dfn,
  startX,
  maxIter,
  damping,
}: newtonsMethodArgs): number[] {
  const approxRootList = [];

  let x = startX;

  for (let i = 0; i < maxIter; i++) {
    const y = fn(x);
    const m = dfn(x);
    const c = y - m * x;

    // 0 = mx + c
    // -c = mx
    // -c/m = x
    const approxRoot = -c / m;
    approxRootList.push(approxRoot);
    x = approxRoot;
  }
  return approxRootList;
}

export { newtonsMethod };
