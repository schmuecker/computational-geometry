import React, { useState } from "react";
import Konva from "konva";
import { Stage, Layer, Circle, Line } from "react-konva";

import { Point, Vector } from "../../lib/geometry";
import { grahamScan, grahamScan2, jarvisMarch } from "../../lib/algorithms";
import { RadioGroup, Option } from "../RadioGroup/RadioGroup";
import { ResetButton } from "../Button/ResetButton";

interface CanvasPointProps {
  point: Point;
  onDelete: (id: Point["id"]) => void;
}

function CanvasPoint({ point, onDelete }: CanvasPointProps) {
  const { x, y, id } = point;
  return (
    <Circle
      width={16}
      height={16}
      x={x}
      y={y}
      fill="white"
      onContextMenu={() => onDelete(point.id)}
    />
  );
}

interface CanvasVectorProps {
  vector: Vector;
}

function CanvasVector({ vector }: CanvasVectorProps) {
  const { a, b } = vector;
  const points = [a.x, a.y, b.x, b.y];
  return <Line points={points} stroke="#f97316" strokeWidth={3} />;
}

const algorithms = [
  { id: "graham", label: "Graham Scan" },
  { id: "graham2", label: "Graham Scan 2" },
  { id: "jarvis", label: "Jarvis March" },
];

function ConvexHull() {
  const [points, setPoints] = useState<Point[]>([]);
  const [algo, setAlgo] = useState<Option["id"]>(() => algorithms[0].id);

  let vectors: Vector[] = [];
  if (algo === "graham") {
    vectors = grahamScan(points);
  }
  if (algo === "graham2") {
    vectors = grahamScan2(points);
  }
  if (algo === "jarvis") {
    vectors = jarvisMarch(points);
  }

  const handleCanvasClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const isRightClick = e.evt.button === 2;
    if (isRightClick) return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;

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

  const handleDelete = (id: Point["id"]) => {
    const newPoints = points.filter((point) => point.id !== id);
    setPoints(newPoints);
  };

  const handleAlgoChange = (id: Option["id"]) => {
    setAlgo(id);
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
        width={window.innerWidth}
        height={window.innerHeight * 0.6}
        onClick={handleCanvasClick}
        onContextMenu={(e) => e.evt.preventDefault()}
      >
        <Layer>
          {vectors.map((vector) => {
            return <CanvasVector key={vector.id} vector={vector} />;
          })}
          {points.map((point) => {
            return (
              <CanvasPoint
                key={point.id}
                point={point}
                onDelete={handleDelete}
              />
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}

export default ConvexHull;
