interface newtonsMethodArgs {
  fn: (x: number) => number;
  dfn: (x: number) => number;
  startX: number;
  maxIter: number;
  accuracy: number;
  damping: boolean;
}

function newtonsMethod({
  fn,
  dfn,
  startX,
  maxIter,
  accuracy,
  damping,
}: newtonsMethodArgs): number[] {
  const approxRootList = [];

  let x = startX;

  for (let i = 0; i < maxIter; i++) {
    // intuitive approach
    // xi+1 = x + si
    // si = -f(x) / df(x)

    // const y = fn(x);
    // const m = dfn(x);
    // const c = y - m * x;

    // // 0 = mx + c
    // // -c = mx
    // // -c/m = x
    // const approxRoot = -c / m;

    const si = -(fn(x) / dfn(x));

    // Damping
    // lambda = max(1, 1/2, 1/3, 1/4, …. lambda_min) so, dass
    let lambda = 1;

    if (damping) {
      const lambda_list = [1, 1 / 2, 1 / 4, 1 / 8, 1 / 16];

      for (let index = 0; index < lambda_list.length; index++) {
        lambda = lambda_list[index];

        // check the condition ( break for the first lambda that fulfills condition to get the max possible lambda)
        // f(xi)² > f(xi + lambda * si)²
        if (Math.pow(fn(x), 2) > Math.pow(fn(x + lambda * si), 2)) {
          break;
        }
      }
    }

    const approxRoot = x + lambda * si;

    approxRootList.push(approxRoot);

    // quit loop if accuracy is achieved
    if (Math.abs(fn(approxRoot)) < accuracy) {
      break;
    }
    x = approxRoot;
  }
  return approxRootList;
}

export { newtonsMethod };
