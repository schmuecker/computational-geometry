import { Point, Vector } from "../../geometry";

enum EVENTS {
  START,
  END,
  VERTICAL,
}

interface HorizontalEvent {
  id: Vector["id"];
  x: Point["x"];
  y: Point["y"];
  type: EVENTS.START | EVENTS.END;
}

interface VerticalEvent {
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
  segments: Vector["id"][];
}

/* ALGORITHM */

function isoSweep(segments: Vector[]): Intersection[] {
  console.log({ segments });

  /* Put start points left of end points */
  const parsedSegments = segments.map((segment) => {
    const shouldSwap = segment.b.x < segment.a.x;
    let parsedVector = segment;
    if (shouldSwap) {
      parsedVector = new Vector(segment.b, segment.a);
    }
    return parsedVector;
  });

  /* Sort segments in x direction */
  /* TODO: I think we don't need this */
  parsedSegments.sort((segA, segB) => {
    if (segA.a.x < segB.a.x) {
      return -1;
    }
    if (segB.a.x < segA.a.x) {
      return 1;
    }
    if (segB.a.y < segA.a.y) {
      return 1;
    }
    return 0;
  });

  console.log({ parsedSegments });

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

  console.log({ events });

  /* Iterate over events */
  let activeSegments: HorizontalEvent[] = [];
  let intersections: Intersection[] = [];
  events.forEach((event) => {
    if (event.type === EVENTS.START) {
      /* Start event */
      activeSegments.push(event);
    } else if (event.type === EVENTS.END) {
      /* End event */
      activeSegments = activeSegments.filter((segment) => {
        return segment.id !== event.id;
      });
    } else if (event.type === EVENTS.VERTICAL) {
      /* Vertical event */
      const intersectingSegments = activeSegments.filter(
        (horizontalSegment) => {
          const { y } = horizontalSegment;
          if (y >= event.y1 && y <= event.y2) {
            return true;
          }
          return false;
        }
      );
      intersectingSegments.forEach((segment) => {
        const { x } = event;
        const { y } = segment;
        const segments = [event.id, segment.id];
        intersections.push({ x, y, segments });
      });
    }
  });

  console.log("Done. Found intersections", intersections);
  return intersections;
}

export { isoSweep };
