import Konva from "konva";
import { useEffect, useState } from "react";
import { Stage, Layer, Circle, Line } from "react-konva";
import useKeyPress from "../../../hooks/useKeyPress";
import onKeyPressed from "../../../hooks/useOnKeyPressed";

import { Point, Vector } from "../../../lib/geometry";

interface CanvasPointProps {
  point: Point;
  onDelete: (id: Point["id"]) => void;
}

function CanvasPoint({ point, onDelete }: CanvasPointProps) {
  const { x, y } = point;
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
  return <Line points={points} stroke="#ea580c" strokeWidth={3} />;
}

interface CanvasProps {
  segments: Vector[];
  onAddSegment: (segment: Vector) => void;
}

function SweepLineCanvas({ segments, onAddSegment }: CanvasProps) {
  const [firstPoint, setFirstPoint] = useState<Point | undefined>(undefined);

  onKeyPressed("Escape", () => setFirstPoint(undefined));

  const handleCanvasClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const isRightClick = e.evt.button === 2;
    if (isRightClick) return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;

    const { x, y } = pointerPosition;

    /* If first point was already set, add segment */
    if (firstPoint) {
      const diff = new Vector(firstPoint, new Point(x, y));
      /* Only allow horizontal or vertical segments */
      const isHorizontal = diff.v_x > diff.v_y;
      const secondX = isHorizontal ? x : firstPoint.x;
      const secondY = isHorizontal ? firstPoint.y : y;
      const secondPoint = new Point(secondX, secondY);
      const newSegment = new Vector(firstPoint, secondPoint);
      onAddSegment(newSegment);
      setFirstPoint(undefined);
      return;
    }

    /* Otherwise set first point */
    setFirstPoint(new Point(x, y));
  };

  const handleDeletePoint = () => {
    setFirstPoint(undefined);
  };

  // const handleDelete = (id: Point["id"]) => {
  //   onDeletePoint(id);
  // };

  return (
    <Stage
      className="overflow-hidden rounded-xl bg-ebony-900"
      width={window.innerWidth}
      height={window.innerHeight * 0.6}
      onClick={handleCanvasClick}
      onContextMenu={(e) => e.evt.preventDefault()}
    >
      <Layer>
        {segments.map((segment) => {
          return <CanvasVector key={segment.id} vector={segment} />;
        })}
        {firstPoint && (
          <CanvasPoint point={firstPoint} onDelete={handleDeletePoint} />
        )}
      </Layer>
    </Stage>
  );
}

export default SweepLineCanvas;
