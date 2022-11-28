import { Point, Vector } from "../../geometry";
import AVLTree from "avl";

export enum EVENTS {
  START,
  END,
  VERTICAL,
}

export interface HorizontalEvent {
  id: Vector["id"];
  x: Point["x"];
  y: Point["y"];
  type: EVENTS.START | EVENTS.END;
}

export interface VerticalEvent {
  id: Vector["id"];
  x: Point["x"];
  y1: Point["y"];
  y2: Point["y"];
  type: EVENTS.VERTICAL;
}

type Event = HorizontalEvent | VerticalEvent;

interface Intersection {
  x: Point["x"];
  y: Point["y"];
  eventId: Event["id"];
}

export interface IsoSweepResult {
  intersections: Intersection[];
  events: Event[];
}

function isoSweep(segments: Vector[]): IsoSweepResult {
  /* Put start points left of end points */
  const parsedSegments = segments.map((segment) => {
    const shouldSwap = segment.b.x < segment.a.x || segment.b.y < segment.a.y;
    let parsedVector = segment;
    if (shouldSwap) {
      parsedVector = new Vector(segment.b, segment.a);
    }
    return parsedVector;
  });

  /* Create event list */
  const events: Event[] = [];
  parsedSegments.forEach((segment) => {
    /* Vertical segment */
    if (segment.a.x === segment.b.x) {
      const verticalEvent: VerticalEvent = {
        id: segment.id,
        x: segment.a.x,
        y1: segment.a.y,
        y2: segment.b.y,
        type: EVENTS.VERTICAL,
      };
      events.push(verticalEvent);
      return;
    }

    /* Horizontal segment */
    const start = segment.a;
    const startEvent: HorizontalEvent = {
      id: segment.id,
      x: start.x,
      y: start.y,
      type: EVENTS.START,
    };
    events.push(startEvent);
    const end = segment.b;
    const endEvent: HorizontalEvent = {
      id: segment.id,
      x: end.x,
      y: end.y,
      type: EVENTS.END,
    };
    events.push(endEvent);
  });

  /* Sort events in x direction */
  events.sort((eventA, eventB) => {
    if (eventA.x < eventB.x) {
      return -1;
    }
    if (eventB.x < eventA.x) {
      return 1;
    }
    return 0;
  });

  /* Iterate over events */
  const activeSegments = new AVLTree();
  const intersections: Intersection[] = [];
  events.forEach((event) => {
    if (event.type === EVENTS.START) {
      /* Start event */
      activeSegments.insert(event.y, event);
    } else if (event.type === EVENTS.END) {
      /* End event */
      activeSegments.remove(event.y);
    } else if (event.type === EVENTS.VERTICAL) {
      /* Vertical event */
      activeSegments.range(event.y1, event.y2, (node) => {
        const data = node?.data as HorizontalEvent;
        if (!data) {
          return;
        }
        intersections.push({
          eventId: event.id,
          x: event.x,
          y: data.y,
        });
      });
    }
  });

  return { events, intersections };
}

export { isoSweep };
