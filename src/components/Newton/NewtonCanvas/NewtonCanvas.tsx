import React, { useState } from "react";
import {
  Mafs,
  CartesianCoordinates,
  FunctionGraph,
  useMovablePoint,
} from "mafs";

interface NewtonCanvasProps {
  mathFunction: (x: number) => number;
}

function NewtonCanvas({ mathFunction }: NewtonCanvasProps) {
  const startingPoint = useMovablePoint([0, mathFunction(0)], {
    constrain: ([x, _y]) => {
      return [x, mathFunction(x)];
    },
  });

  return (
    <Mafs>
      <CartesianCoordinates subdivisions={4} />
      <FunctionGraph.OfX y={(x) => mathFunction(x)} />
      {startingPoint.element}
    </Mafs>
  );
}

export default NewtonCanvas;
