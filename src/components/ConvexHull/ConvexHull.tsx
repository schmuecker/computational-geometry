import React, { useState } from "react";
import { Stage, Layer, Circle, Line } from "react-konva";

import { Point, Vector } from "../../lib/geometry";
import { grahamScan, jarvisMarch } from "../../lib/algorithms";
import { RadioGroup, Option } from "../RadioGroup/RadioGroup";
import { ResetButton } from "../Button/ResetButton";

interface CanvasPointProps {
  point: Point;
}

function CanvasPoint({ point }: CanvasPointProps) {
  const { x, y } = point;
  return <Circle width={20} height={20} x={x} y={y} fill="white" />;
}

interface CanvasVectorProps {
  vector: Vector;
}

function CanvasVector({ vector }: CanvasVectorProps) {
  const { a, b } = vector;
  const points = [a.x, a.y, b.x, b.y];
  return <Line points={points} stroke="red" strokeWidth={3} />;
}

const algorithms = [
  { id: "graham", label: "Graham Scan" },
  { id: "jarvis", label: "Jarvis March" },
];

function ConvexHull() {
  const [points, setPoints] = useState<Point[]>([]);
  const [algo, setAlgo] = useState<Option["id"]>(() => algorithms[0].id);

  let vectors: Vector[] = [];
  if (algo === "graham") {
    vectors = grahamScan(points);
  }
  if (algo === "jarvis") {
    vectors = jarvisMarch(points);
  }

  const handleCanvasClick = (e) => {
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    const { x, y } = pointerPosition;

    const newPoint = new Point(x, y);
    const fitleredPoints = points.filter((point) => {
      if (point.x == newPoint.x && point.y == newPoint.y) {
        return false;
      }
      return true;
    });

    const newPoints = [...fitleredPoints, newPoint];
    setPoints(newPoints);
  };

  const handleAlgoChange = (id: Option["id"]) => {
    setAlgo(id);
    // handleReset();
  };

  const handleReset = () => {
    setPoints([]);
  };

  // Todo. set origin of coordinate system to bottom left
  return (
    <div>
      <div className="my-8 flex w-full justify-between items-end">
        <RadioGroup
          title="Algorithm"
          subtitle="Choose the algorithm you prefer"
          options={algorithms}
          checkedOption={algo}
          onChange={handleAlgoChange}
        />
        <div>
        <ResetButton onClick={handleReset} />
        </div>
      </div>
      <Stage
        className="bg-slate-800 rounded-xl overflow-hidden"
        width={Math.min(800, window.innerWidth * 0.8)}
        height={Math.min(600, window.innerHeight * 0.8)}
        onClick={handleCanvasClick}
      >
        <Layer>
          {vectors.map((vector) => {
            return <CanvasVector key={vector.id} vector={vector} />;
          })}
          {points.map((point) => {
            return <CanvasPoint key={point.id} point={point} />;
          })}
        </Layer>
      </Stage>
    </div>
  );
}

export default ConvexHull;
