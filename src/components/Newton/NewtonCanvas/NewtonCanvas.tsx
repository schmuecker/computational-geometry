import React, { useEffect, useState } from "react";
import { newtonsMethod } from "../../../lib/algorithms/newtons-method/newtonsMethod";
import {
  Mafs,
  CartesianCoordinates,
  FunctionGraph,
  useMovablePoint,
  Point,
  Line,
  SegmentProps,
  Theme,
  ThroughPointsProps,
} from "mafs";

interface NewtonCanvasProps {
  mathFunction: (x: number) => number;
  derivitive: (x: number) => number;
  accuracy: number;
  maxIter: number;
}

function NewtonCanvas({
  mathFunction,
  derivitive,
  accuracy,
  maxIter,
}: NewtonCanvasProps) {
  const [approxRoots, setApproxRoots] = useState<number[]>([]);
  useEffect(() => {
    setApproxRoots([]);
    startingPoint.setPoint([0, 0]);
  }, [mathFunction]);

  const startingPoint = useMovablePoint([0, 0], {
    constrain: ([x, _y]) => {
      if (x != 0) {
        setApproxRoots(
          newtonsMethod({
            fn: mathFunction,
            dfn: derivitive,
            startX: x,
            maxIter: maxIter,
            accuracy: accuracy,
            damping: false,
          })
        );
      }
      //return [x, mathFunction(x)];
      return [x, 0];
    },
    color: Theme.foreground,
  });

  return (
    <div className="relative">
      <Mafs yAxisExtent={[-15, 15]} xAxisExtent={[-10, 10]}>
        <CartesianCoordinates />
        <FunctionGraph.OfX y={(x) => mathFunction(x)} weight={4} />
        {approxRoots[0] ? (
          <>
            <CustomSegment
              point1={startingPoint.point}
              point2={[
                startingPoint.point[0],
                mathFunction(startingPoint.point[0]),
              ]}
            />
            <Point
              x={startingPoint.point[0]}
              y={mathFunction(startingPoint.point[0])}
              color={Theme.red}
            />
            <CustomSegment
              point1={[
                startingPoint.point[0],
                mathFunction(startingPoint.point[0]),
              ]}
              point2={[approxRoots[0], 0]}
            />
            <CustomTangent
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
          const elementList = [];

          if (elements[index + 1] != null) {
            elementList.push(
              <CustomSegment
                key={"tangent" + index}
                point1={[approxRoot, mathFunction(approxRoot)]}
                point2={[elements[index + 1], 0]}
              />,
              <CustomTangent
                key={"tangentFade" + index}
                point1={[approxRoot, mathFunction(approxRoot)]}
                point2={[elements[index + 1], 0]}
              />,
              <CustomSegment
                key={"Line" + index}
                point1={[approxRoot, 0]}
                point2={[approxRoot, mathFunction(approxRoot)]}
              />,
              <Point
                key={"Point" + index}
                x={approxRoot}
                y={mathFunction(approxRoot)}
                color={Theme.red}
              />,
              <Point
                key={"approx" + index}
                x={approxRoot}
                y={0}
                color={Theme.red}
              />
            );
          } else {
            elementList.push(
              <Point
                key={"root" + index}
                x={approxRoot}
                y={0}
                color={Theme.green}
              />
            );
          }
          return elementList;
        })}
        {startingPoint.element}
      </Mafs>
      <div className="absolute top-1 right-1 rounded bg-slate-50 px-2">
        <div>
          Root: {"("}
          {approxRoots[0]
            ? approxRoots.pop()?.toFixed(2)
            : startingPoint.point[0].toFixed(2)}
          {",0)"}
        </div>
        <div>Steps: {approxRoots.length}</div>
      </div>
    </div>
  );
}

const CustomSegment = ({ point1, point2 }: SegmentProps) => {
  return (
    <Line.Segment
      point1={point1}
      point2={point2}
      color={Theme.red}
      weight={2}
    />
  );
};
const CustomTangent = ({ point1, point2 }: ThroughPointsProps) => {
  return (
    <Line.ThroughPoints
      point1={point1}
      point2={point2}
      color={Theme.red}
      opacity={0.5}
      weight={1}
    />
  );
};

export default NewtonCanvas;
