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
} from "mafs";

interface NewtonCanvasProps {
  mathFunction: (x: number) => number;
  derivitive: (x: number) => number;
  accuracy: number;
}

function NewtonCanvas({
  mathFunction,
  derivitive,
  accuracy,
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
            maxIter: 10,
            accuracy: accuracy,
            damping: false,
          })
        );
      }
      //return [x, mathFunction(x)];
      return [x, 0];
    },
  });

  return (
    <Mafs yAxisExtent={[-15, 15]} xAxisExtent={[-15, 15]}>
      <CartesianCoordinates subdivisions={4} />
      <FunctionGraph.OfX y={(x) => mathFunction(x)} />
      {startingPoint.element}

      {approxRoots[0] ? (
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
          <CustomLine
            point1={[
              startingPoint.point[0],
              mathFunction(startingPoint.point[0]),
            ]}
            point2={[approxRoots[0], 0]}
          />
        </>
      ) : (
        <Point
          x={startingPoint.point[0]}
          y={startingPoint.point[1]}
          color={Theme.pink}
        />
      )}
      {approxRoots.map((approxRoot, index, elements) => {
        const elementList = [
          <Point key={index + "1"} x={approxRoot} y={0} color={Theme.pink} />,
          <CustomLine
            key={index + "2"}
            point1={[approxRoot, 0]}
            point2={[approxRoot, mathFunction(approxRoot)]}
          />,
          <Point
            key={index + "3"}
            x={approxRoot}
            y={mathFunction(approxRoot)}
            color={Theme.pink}
          />,
        ];

        if (elements[index + 1] != null) {
          elementList.push(
            <CustomLine
              key={index + "4"}
              point1={[approxRoot, mathFunction(approxRoot)]}
              point2={[elements[index + 1], 0]}
            />
            // Tangenten anstatt von Verbindunslinien
            // <Line.ThroughPoints
            //   point1={[approxRoot, mathFunction(approxRoot)]}
            //   point2={[elements[index + 1], 0]}
            //   color={Theme.pink}
            //   weight={1}
            // />
          );
        }

        return elementList;
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
