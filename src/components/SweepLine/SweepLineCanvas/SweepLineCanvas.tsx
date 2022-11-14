import Konva from "konva";
import React, { useEffect, useState } from "react";
import { Stage, Layer, Circle, Line } from "react-konva";
import useKeyPress from "../../../hooks/useKeyPress";
import onKeyPressed from "../../../hooks/useOnKeyPressed";
import {
  EVENTS,
  HorizontalEvent,
  IsoSweepResult,
} from "../../../lib/algorithms/sweep-line/isoSweep";

import { Point, Vector } from "../../../lib/geometry";
import { isVectorVertical } from "../../../lib/helper";

interface CanvasPointProps {
  point: Point;
  fill?: string;
  width?: number;
  height?: number;
  onDelete?: (id: Point["id"]) => void;
}

function CanvasPoint({
  point,
  fill,
  width,
  height,
  onDelete,
}: CanvasPointProps) {
  const { x, y } = point;
  return (
    <Circle
      width={width || 16}
      height={height || 16}
      x={x}
      y={y}
      fill={fill || "white"}
      onContextMenu={() => onDelete && onDelete(point.id)}
    />
  );
}

interface CanvasVectorProps {
  vector: Vector;
  stroke?: string | CanvasGradient;
}

function CanvasVector({ vector, stroke }: CanvasVectorProps) {
  const { a, b } = vector;
  const points = [a.x, a.y, b.x, b.y];
  return <Line points={points} stroke={stroke || "white"} strokeWidth={3} />;
}

interface SweepLineCanvasProps {
  events: IsoSweepResult["events"];
  intersections: IsoSweepResult["intersections"];
  segments: Vector[];
  onAddSegment: (segment: Vector) => void;
}

function SweepLineCanvas({
  events,
  intersections,
  segments,
  onAddSegment,
}: SweepLineCanvasProps) {
  const [step, setStep] = useState<number>(0);
  const [firstPoint, setFirstPoint] = useState<Point | undefined>(undefined);

  const sweepX = events[step]?.x;
  const visibleEvents = events.filter((event, index) => {
    const isHorizontal =
      event.type === EVENTS.START || event.type === EVENTS.END;
    return index <= step && isHorizontal;
  });
  const visibleIntersections = intersections.filter((intersection) => {
    return intersection.x <= sweepX;
  });

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
      const isHorizontal = Math.abs(diff.v_x) > Math.abs(diff.v_y);
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

  return (
    <div>
      <div className="flex">
        <button
          onClick={() => {
            step > 0 && setStep((s) => s - 1);
          }}
        >
          Previous Step
        </button>
        {step}
        <button
          onClick={() => {
            step < events.length - 1 && setStep((s) => s + 1);
          }}
        >
          Next Step
        </button>
      </div>
      <Stage
        className="overflow-hidden rounded-xl bg-ebony-900"
        width={window.innerWidth}
        height={window.innerHeight * 0.6}
        onClick={handleCanvasClick}
        onContextMenu={(e) => e.evt.preventDefault()}
      >
        <Layer>
          {/* Sweep Line */}
          {sweepX && (
            <CanvasVector
              stroke={"#576180"}
              vector={
                new Vector(
                  new Point(sweepX, 0),
                  new Point(sweepX, window.innerHeight)
                )
              }
            />
          )}
          {/* Segments + Vertical segment points */}
          {segments.map((segment) => {
            const points = [];
            const isVertical = isVectorVertical(segment);
            if (isVertical) {
              const startPoint = new Point(segment.a.x, segment.a.y);
              const endPoint = new Point(segment.b.x, segment.b.y);
              points.push(startPoint);
              points.push(endPoint);
            }
            return (
              <React.Fragment key={segment.id}>
                <CanvasVector
                  vector={segment}
                  stroke={isVertical ? "#ea580c" : "#ADBCE7"}
                />
                {points.map((point) => {
                  return (
                    <CanvasPoint
                      key={point.id}
                      point={point}
                      width={10}
                      height={10}
                      fill="#933A0C"
                    />
                  );
                })}
              </React.Fragment>
            );
          })}
          {/* Horizontal events */}
          {visibleEvents.map((event) => {
            const { type } = event;
            if (event.type === EVENTS.VERTICAL) {
              return null;
            }
            const { id, x, y } = event;
            return (
              <CanvasPoint
                key={`${id}-${type}`}
                point={new Point(x, y)}
                width={10}
                height={10}
                fill="#626E92"
              />
            );
          })}
          {/* Intersections */}
          {visibleIntersections.map((intersection) => {
            const { x, y, eventId } = intersection;
            const key = `${x}-${y}-${eventId}`;
            return <CanvasPoint key={key} point={new Point(x, y)} />;
          })}
          {/* First click point */}
          {firstPoint && (
            <CanvasPoint
              point={firstPoint}
              width={10}
              height={10}
              onDelete={handleDeletePoint}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}

export default SweepLineCanvas;
