import React, { useState } from "react";
import { newtonsMethod } from "../../../lib/algorithms/newtons-method/newtonsMethod";
import {
  Mafs,
  CartesianCoordinates,
  FunctionGraph,
  useMovablePoint,
  Point,
  Line,
  Vector2,
  SegmentProps,
  Theme,
} from "mafs";

interface NewtonCanvasProps {
  mathFunction: (x: number) => number;
  derivitive: (x: number) => number;
}

function NewtonCanvas({ mathFunction, derivitive }: NewtonCanvasProps) {
  const [approxRoots, setApproxRoots] = useState<number[]>([]);

  const startingPoint = useMovablePoint([0, mathFunction(0)], {
    constrain: ([x, _y]) => {
      setApproxRoots(
        newtonsMethod({
          fn: mathFunction,
          dfn: derivitive,
          startX: x,
          maxIter: 10,
          damping: false,
        })
      );
      //return [x, mathFunction(x)];
      return [x, 0];
    },
  });

  return (
    <Mafs yAxisExtent={[-2, 10]} xAxisExtent={[-15, 15]}>
      <CartesianCoordinates subdivisions={4} />
      <FunctionGraph.OfX y={(x) => mathFunction(x)} />
      {startingPoint.element}
      {approxRoots ? (
        <>
          <CustomLine
            point1={startingPoint.point}
            point2={[
              startingPoint.point[0],
              mathFunction(startingPoint.point[0]),
            ]}
          />
          <Point
            x={startingPoint.point[0]}
            y={mathFunction(startingPoint.point[0])}
            color={Theme.pink}
          />
          ;
          <CustomLine
            point1={[
              startingPoint.point[0],
              mathFunction(startingPoint.point[0]),
            ]}
            point2={[approxRoots[0], 0]}
          />
        </>
      ) : (
        ""
      )}
      {approxRoots.map((approxRoot, index, elements) => {
        return (
          <>
            <Point key={approxRoot} x={approxRoot} y={0} color={Theme.pink} />;
            <CustomLine
              point1={[approxRoot, 0]}
              point2={[approxRoot, mathFunction(approxRoot)]}
            />
            <Point
              x={approxRoot}
              y={mathFunction(approxRoot)}
              color={Theme.pink}
            />
            ;
            {elements[index + 1] ? (
              <CustomLine
                point1={[approxRoot, mathFunction(approxRoot)]}
                point2={[elements[index + 1], 0]}
              />
            ) : (
              // <Line.ThroughPoints
              //   point1={[approxRoot, mathFunction(approxRoot)]}
              //   point2={[elements[index + 1], 0]}
              //   color={Theme.pink}
              //   weight={1}
              // />
              ""
            )}
          </>
        );
      })}
    </Mafs>
  );
}

const CustomLine = ({ point1, point2 }: SegmentProps) => {
  return (
    <Line.Segment
      point1={point1}
      point2={point2}
      color={Theme.pink}
      weight={1}
    />
  );
};

export default NewtonCanvas;
