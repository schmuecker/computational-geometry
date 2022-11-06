import Konva from "konva";
import React, { useState } from "react";
import { Stage, Layer, Rect, Text, Circle, Line } from "react-konva";
import { nanoid } from "nanoid";
import { Point, Vector } from "../../lib/geometry";
import { grahamScan } from "../../lib/algorithms/graham";

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

function ConvexHull() {
  const [points, setPoints] = useState<Point[]>([]);

  const vectors = grahamScan(points);

  const handleClick = (e) => {
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    const { x, y } = pointerPosition;

    const newPoint = new Point(x, y);
    const newPoints = [...points, newPoint];
    setPoints(newPoints);
  };

  // Todo. set origin of coordinate system to bottom left
  return (
    <Stage
      className="bg-slate-800 rounded-xl"
      width={Math.max(800, window.innerWidth * 0.8)}
      height={Math.max(600, window.innerHeight * 0.8)}
      onClick={handleClick}
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
  );
}

export default ConvexHull;
