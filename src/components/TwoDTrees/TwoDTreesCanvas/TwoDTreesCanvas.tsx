import Konva from "konva";
import { useState } from "react";
import { Stage, Layer, Circle, Line, Group, Rect } from "react-konva";
import { IKnot } from "../../../lib/algorithms/two-d-tree/twoDTree";
import { Point, Vector } from "../../../lib/geometry";

interface CanvasPointProps {
  point: Point;
  onDelete: (id: Point["id"]) => void;
  onHoverPoint: (point?: Point) => void;
  fill?: string;
}

function CanvasPoint({
  point,
  onDelete,
  onHoverPoint,
  fill = "white",
}: CanvasPointProps) {
  const { x, y } = point;
  return (
    <Circle
      onMouseOver={() => onHoverPoint(point)}
      onMouseOut={() => onHoverPoint()}
      width={16}
      height={16}
      x={x}
      y={y}
      fill={fill}
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
  points: Point[];
  vectors: Vector[];
  searchRect: any;
  onSearchRectChange: any;
  onAddPoint: (point: Point) => void;
  onDeletePoint: (id: Point["id"]) => void;
  onHoverPoint: (point?: Point) => void;
  markedPoint: Point | undefined;
  searchResult: { output: IKnot[]; visited: IKnot[] };
}

function TwoDTreesCanvas({
  points,
  vectors,
  searchRect,
  onSearchRectChange,
  onAddPoint,
  onDeletePoint,
  onHoverPoint,
  markedPoint,
  searchResult,
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

  const handleMouseDown = (event) => {
    if (!searchRect) {
      const { x, y } = event.target.getStage().getPointerPosition();
      onSearchRectChange({ x, y, width: 0, height: 0, key: "0" });
    }
  };

  const handleMouseUp = (event) => {
    onSearchRectChange(undefined);
  };

  const handleMouseMove = (event) => {
    if (searchRect) {
      const sx = searchRect.x;
      const sy = searchRect.y;
      const { x, y } = event.target.getStage().getPointerPosition();
      onSearchRectChange({
        x: sx,
        y: sy,
        width: x - sx,
        height: y - sy,
      });
    }
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
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
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
              onHoverPoint={onHoverPoint}
            />
          );
        })}
        {searchResult.visited.map((knot) => {
          const point = knot.model;
          return (
            <CanvasPoint
              key={point.id}
              point={point}
              onDelete={handleDelete}
              onHoverPoint={onHoverPoint}
              fill={"red"}
            />
          );
        })}
        {searchResult.output.map((knot) => {
          const point = knot.model;
          return (
            <CanvasPoint
              key={point.id}
              point={point}
              onDelete={handleDelete}
              onHoverPoint={onHoverPoint}
              fill={"yellow"}
            />
          );
        })}
        {searchRect && (
          <Rect
            x={searchRect.x}
            y={searchRect.y}
            width={searchRect.width}
            height={searchRect.height}
            fill="transparent"
            stroke="yellow"
          />
        )}
        {markedPoint && (
          <CanvasPoint
            point={markedPoint}
            onDelete={handleDelete}
            fill={"yellow"}
            onHoverPoint={onHoverPoint}
          />
        )}
      </Layer>
    </Stage>
  );
}

export default TwoDTreesCanvas;
