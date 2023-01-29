import Konva from "konva";
import { Text, Stage, Layer, Circle, Line } from "react-konva";

import { Point, Vector } from "../../../lib/geometry";

interface CanvasPointProps {
  point: Point;
  onDelete: (id: Point["id"]) => void;
}

function CanvasPoint({ point, onDelete }: CanvasPointProps) {
  const { x, y } = point;
  return (
    <>
      <Circle
        width={16}
        height={16}
        x={x}
        y={y}
        fill="white"
        onContextMenu={() => onDelete(point.id)}
      />
      <Text
        text={`${Math.floor(x)}, ${Math.floor(y)}`}
        fill="white"
        x={x - 25}
        y={y - 25}
      />
    </>
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
  points: Point[];
  vectors: Vector[];
  onAddPoint: (point: Point) => void;
  onDeletePoint: (id: Point["id"]) => void;
}

function DelaunayCanvas({
  points,
  vectors,
  onAddPoint,
  onDeletePoint,
}: CanvasProps) {
  const handleCanvasClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const isRightClick = e.evt.button === 2;
    if (isRightClick) return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;

    const { x, y } = pointerPosition;

    onAddPoint(new Point(x, y));
  };

  const handleDelete = (id: Point["id"]) => {
    onDeletePoint(id);
  };

  return (
    <Stage
      className="overflow-hidden rounded-xl bg-ebony-900"
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
            <CanvasPoint key={point.id} point={point} onDelete={handleDelete} />
          );
        })}
      </Layer>
    </Stage>
  );
}

export default DelaunayCanvas;
